'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLoans, isOverdue } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan } from '@/lib/types';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[] | null>(null);

  useEffect(() => {
    getLoans().then(setLoans);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Loans</h1>
      {loans === null ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : loans.length === 0 ? (
        <p className="text-gray-500">No loans yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {loans.map((loan) => {
            const overdue = isOverdue(loan);
            return (
              <Link
                key={loan.id}
                href={`/admin/loans/view?id=${loan.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{loan.toolName}</p>
                  <p className="text-sm text-gray-500">
                    {loan.companyName} &middot; due {loan.dueDate}
                  </p>
                </div>
                <StatusBadge status={overdue ? 'overdue' : loan.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
