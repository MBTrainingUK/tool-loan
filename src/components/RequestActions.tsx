'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveRequest, rejectRequest } from '@/lib/firestore';
import type { LoanRequest, Tool, ToolCondition } from '@/lib/types';

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

type ActionState = { error?: string } | undefined;

export function RequestActions({ request, tools }: { request: LoanRequest; tools: Tool[] }) {
  const router = useRouter();
  const availableTools = tools.filter((t) => t.status === 'available');
  const [useExistingTool, setUseExistingTool] = useState(availableTools.length > 0);

  async function approveAction(_state: ActionState, formData: FormData): Promise<ActionState> {
    const existingToolId = String(formData.get('existingToolId') ?? '').trim();
    const toolName = String(formData.get('toolName') ?? '').trim();
    const toolDescriptionField = String(formData.get('toolDescriptionField') ?? '').trim();
    const serialNumber = String(formData.get('serialNumber') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim();
    const dueDate = String(formData.get('dueDate') ?? '').trim();
    const conditionOnLoan = String(formData.get('conditionOnLoan') ?? 'good') as ToolCondition;

    if (!dueDate) return { error: 'Set a due date for the loan.' };
    if (!existingToolId && !toolName) return { error: 'Enter a tool name or select an existing tool.' };

    try {
      const loanId = await approveRequest({
        requestId: request.id,
        existingToolId: existingToolId || undefined,
        toolName: toolName || undefined,
        toolDescriptionField: toolDescriptionField || undefined,
        serialNumber: serialNumber || undefined,
        category: category || undefined,
        dueDate,
        conditionOnLoan,
      });
      router.push(`/admin/loans/view?id=${loanId}`);
      return undefined;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Something went wrong.' };
    }
  }

  async function rejectAction(_state: ActionState, formData: FormData): Promise<ActionState> {
    const notes = String(formData.get('notes') ?? '').trim();
    try {
      await rejectRequest(request.id, notes);
      router.push('/admin/requests');
      return undefined;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Something went wrong.' };
    }
  }

  const [approveState, approveFormAction, approvePending] = useActionState(approveAction, undefined);
  const [rejectState, rejectFormAction, rejectPending] = useActionState(rejectAction, undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form action={approveFormAction} className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Approve & Create Loan</h2>

        {availableTools.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useExistingTool}
              onChange={(e) => setUseExistingTool(e.target.checked)}
            />
            Use an existing tool
          </label>
        )}

        {useExistingTool && availableTools.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tool</label>
            <select name="existingToolId" required className={inputClass}>
              {availableTools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name *</label>
              <input name="toolName" required defaultValue={request.toolDescription} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input name="toolDescriptionField" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input name="serialNumber" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input name="category" className={inputClass} />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input type="date" name="dueDate" required defaultValue={request.neededUntil} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition on Loan</label>
          <select name="conditionOnLoan" defaultValue="good" className={inputClass}>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {approveState?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{approveState.error}</p>}
        <button
          type="submit"
          disabled={approvePending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {approvePending ? 'Approving...' : 'Approve & Create Loan'}
        </button>
      </form>

      <form action={rejectFormAction} className="bg-white rounded-xl shadow p-6 space-y-4 h-fit">
        <h2 className="font-semibold text-gray-900">Reject Request</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-gray-400">(optional)</span></label>
          <textarea name="notes" rows={3} className={inputClass} />
        </div>
        {rejectState?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{rejectState.error}</p>}
        <button
          type="submit"
          disabled={rejectPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {rejectPending ? 'Rejecting...' : 'Reject Request'}
        </button>
      </form>
    </div>
  );
}
