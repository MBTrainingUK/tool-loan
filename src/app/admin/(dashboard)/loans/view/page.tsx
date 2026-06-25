'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLoanById, isOverdue } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import { ReturnLoanForm } from '@/components/ReturnLoanForm';
import type { Loan } from '@/lib/types';

function LoanDetailContent() {
  const id = useSearchParams().get('id') ?? '';
  const [loan, setLoan] = useState<Loan | null | undefined>(undefined);

  const refresh = useCallback(() => {
    if (id) getLoanById(id).then(setLoan);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loan === undefined) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (loan === null) return <p className="text-gray-500">Loan not found.</p>;

  const overdue = isOverdue(loan);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{loan.toolName}</h1>
        <StatusBadge status={overdue ? 'overdue' : loan.status} />
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Borrower</p>
            <p className="text-gray-900 font-medium">{loan.retailerName}</p>
          </div>
          <div>
            <p className="text-gray-400">Company</p>
            <p className="text-gray-900 font-medium">{loan.companyName}</p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-gray-900 font-medium">{loan.email}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="text-gray-900 font-medium">{loan.phone}</p>
          </div>
          <div>
            <p className="text-gray-400">Loaned At</p>
            <p className="text-gray-900 font-medium">{loan.loanedAt}</p>
          </div>
          <div>
            <p className="text-gray-400">Due Date</p>
            <p className="text-gray-900 font-medium">{loan.dueDate}</p>
          </div>
          <div>
            <p className="text-gray-400">Condition on Loan</p>
            <p className="text-gray-900 font-medium">{loan.conditionOnLoan}</p>
          </div>
        </div>
        <Link href={`/admin/tools/view?id=${loan.toolId}`} className="text-blue-600 hover:underline text-sm font-medium inline-block">
          View tool &rarr;
        </Link>
      </div>

      {loan.status === 'active' ? (
        <ReturnLoanForm loanId={loan.id} onReturned={refresh} />
      ) : (
        <div className="bg-white rounded-xl shadow p-6 space-y-2">
          <h2 className="font-semibold text-gray-900">Returned</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Returned At</p>
              <p className="text-gray-900 font-medium">{loan.returnedAt}</p>
            </div>
            <div>
              <p className="text-gray-400">Condition on Return</p>
              <p className="text-gray-900 font-medium">{loan.conditionOnReturn}</p>
            </div>
          </div>
          {loan.returnNotes && (
            <div>
              <p className="text-gray-400 text-sm">Notes</p>
              <p className="text-gray-900">{loan.returnNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoanDetailPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
      <LoanDetailContent />
    </Suspense>
  );
}
