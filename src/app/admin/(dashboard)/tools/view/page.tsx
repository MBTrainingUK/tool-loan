'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getToolById, getLoansForTool } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import type { Loan, Tool } from '@/lib/types';

function ToolDetailContent() {
  const id = useSearchParams().get('id') ?? '';
  const [tool, setTool] = useState<Tool | null | undefined>(undefined);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (!id) return;
    getToolById(id).then(async (found) => {
      setTool(found);
      if (found) setLoans(await getLoansForTool(id));
    });
  }, [id]);

  if (tool === undefined) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (tool === null) return <p className="text-gray-500">Tool not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
        <StatusBadge status={tool.status} />
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-2 mb-6 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Category</p>
            <p className="text-gray-900 font-medium">{tool.category ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400">Serial Number</p>
            <p className="text-gray-900 font-medium">{tool.serialNumber ?? '—'}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-400">Description</p>
          <p className="text-gray-900">{tool.description}</p>
        </div>
      </div>

      <h2 className="font-semibold text-gray-900 mb-3">Loan History</h2>
      {loans.length === 0 ? (
        <p className="text-gray-500 text-sm">No loans recorded for this tool yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              href={`/admin/loans/view?id=${loan.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{loan.companyName}</p>
                <p className="text-sm text-gray-500">{loan.loanedAt} &rarr; {loan.returnedAt ?? loan.dueDate}</p>
              </div>
              <StatusBadge status={loan.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ToolDetailPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
      <ToolDetailContent />
    </Suspense>
  );
}
