import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Loan, LoanRequest, Tool, ToolCondition } from '@/lib/types';

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (result[key] === undefined) delete result[key];
  }
  return result;
}

function withId<T>(snap: { id: string; data: () => unknown }): T {
  return { id: snap.id, ...(snap.data() as object) } as T;
}

function byCreatedAtDesc(a: { createdAt: string }, b: { createdAt: string }) {
  return b.createdAt.localeCompare(a.createdAt);
}

// ----- Requests -----

export async function submitRequest(
  input: Omit<LoanRequest, 'id' | 'status' | 'createdAt' | 'toolId' | 'toolName'>
) {
  const request: Omit<LoanRequest, 'id'> = {
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await addDoc(collection(db, 'requests'), stripUndefined(request));
}

export async function getRequests(): Promise<LoanRequest[]> {
  const snap = await getDocs(collection(db, 'requests'));
  return snap.docs.map((d) => withId<LoanRequest>(d)).sort(byCreatedAtDesc);
}

export async function getPendingRequests(): Promise<LoanRequest[]> {
  const requests = await getRequests();
  return requests.filter((r) => r.status === 'pending');
}

export async function getRequestById(id: string): Promise<LoanRequest | null> {
  const snap = await getDoc(doc(db, 'requests', id));
  return snap.exists() ? withId<LoanRequest>(snap) : null;
}

export async function rejectRequest(requestId: string, notes: string) {
  await writeBatch(db)
    .update(doc(db, 'requests', requestId), stripUndefined({ status: 'rejected', notes: notes || undefined }))
    .commit();
}

export async function approveRequest(input: {
  requestId: string;
  existingToolId?: string;
  toolName?: string;
  toolDescriptionField?: string;
  serialNumber?: string;
  category?: string;
  dueDate: string;
  conditionOnLoan: ToolCondition;
}): Promise<string> {
  const request = await getRequestById(input.requestId);
  if (!request) throw new Error('Request not found.');

  const batch = writeBatch(db);
  let toolId = input.existingToolId;
  let toolName = input.toolName ?? '';

  if (toolId) {
    const toolRef = doc(db, 'tools', toolId);
    const toolSnap = await getDoc(toolRef);
    if (!toolSnap.exists()) throw new Error('Selected tool no longer exists.');
    toolName = (toolSnap.data() as Tool).name;
    batch.update(toolRef, { status: 'on_loan' });
  } else {
    if (!input.toolName) throw new Error('Enter a tool name or select an existing tool.');
    const toolRef = doc(collection(db, 'tools'));
    toolId = toolRef.id;
    const newTool: Omit<Tool, 'id'> = {
      name: input.toolName,
      description: input.toolDescriptionField || request.toolDescription,
      serialNumber: input.serialNumber || undefined,
      category: input.category || undefined,
      status: 'on_loan',
      createdAt: new Date().toISOString(),
    };
    batch.set(toolRef, stripUndefined(newTool));
  }

  const loanRef = doc(collection(db, 'loans'));
  const loan: Omit<Loan, 'id'> = {
    toolId,
    toolName,
    retailerName: request.retailerName,
    companyName: request.companyName,
    email: request.email,
    phone: request.phone,
    loanedAt: new Date().toISOString().slice(0, 10),
    dueDate: input.dueDate,
    conditionOnLoan: input.conditionOnLoan,
    status: 'active',
    requestId: input.requestId,
  };
  batch.set(loanRef, stripUndefined(loan));

  batch.update(doc(db, 'requests', input.requestId), { status: 'approved', toolId, toolName });

  await batch.commit();
  return loanRef.id;
}

// ----- Loans -----

export async function getLoans(): Promise<Loan[]> {
  const snap = await getDocs(collection(db, 'loans'));
  return snap.docs.map((d) => withId<Loan>(d)).sort((a, b) => b.loanedAt.localeCompare(a.loanedAt));
}

export async function getActiveLoans(): Promise<Loan[]> {
  const loans = await getLoans();
  return loans.filter((l) => l.status === 'active');
}

export async function getLoanById(id: string): Promise<Loan | null> {
  const snap = await getDoc(doc(db, 'loans', id));
  return snap.exists() ? withId<Loan>(snap) : null;
}

export async function getLoanByRequestId(requestId: string): Promise<Loan | null> {
  const loans = await getLoans();
  return loans.find((l) => l.requestId === requestId) ?? null;
}

export async function getLoansForTool(toolId: string): Promise<Loan[]> {
  const loans = await getLoans();
  return loans.filter((l) => l.toolId === toolId);
}

export function isOverdue(loan: Loan): boolean {
  return loan.status === 'active' && new Date(loan.dueDate).getTime() < Date.now();
}

export async function recordReturn(input: {
  loanId: string;
  conditionOnReturn: ToolCondition;
  returnNotes?: string;
}) {
  const loan = await getLoanById(input.loanId);
  if (!loan) throw new Error('Loan not found.');

  const batch = writeBatch(db);
  batch.update(
    doc(db, 'loans', input.loanId),
    stripUndefined({
      returnedAt: new Date().toISOString().slice(0, 10),
      conditionOnReturn: input.conditionOnReturn,
      returnNotes: input.returnNotes || undefined,
      status: 'returned',
    })
  );
  batch.update(doc(db, 'tools', loan.toolId), {
    status: input.conditionOnReturn === 'poor' ? 'maintenance' : 'available',
  });
  await batch.commit();
}

// ----- Tools -----

export async function getTools(): Promise<Tool[]> {
  const snap = await getDocs(collection(db, 'tools'));
  return snap.docs.map((d) => withId<Tool>(d)).sort(byCreatedAtDesc);
}

export async function getToolById(id: string): Promise<Tool | null> {
  const snap = await getDoc(doc(db, 'tools', id));
  return snap.exists() ? withId<Tool>(snap) : null;
}
