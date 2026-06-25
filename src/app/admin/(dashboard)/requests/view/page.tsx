'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getRequestById, getLoanByRequestId, getTools } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestActions } from '@/components/RequestActions';
import type { Loan, LoanRequest, Tool } from '@/lib/types';

function RequestDetailContent() {
  const id = useSearchParams().get('id') ?? '';
  const [request, setRequest] = useState<LoanRequest | null | undefined>(undefined);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loan, setLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (!id) return;
    getRequestById(id).then(async (found) => {
      setRequest(found);
      if (!found) return;
      if (found.status === 'pending') {
        setTools(await getTools());
      } else if (found.status === 'approved') {
        setLoan(await getLoanByRequestId(id));
      }
    });
  }, [id]);

  if (request === undefined) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (request === null) return <p className="text-gray-500">Request not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
        <StatusBadge status={request.status} />
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-gray-900 font-medium">{request.retailerName}</p>
          </div>
          <div>
            <p className="text-gray-400">Company</p>
            <p className="text-gray-900 font-medium">{request.companyName}</p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-gray-900 font-medium">{request.email}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="text-gray-900 font-medium">{request.phone}</p>
          </div>
          <div>
            <p className="text-gray-400">Needed From</p>
            <p className="text-gray-900 font-medium">{request.neededFrom}</p>
          </div>
          <div>
            <p className="text-gray-400">Needed Until</p>
            <p className="text-gray-900 font-medium">{request.neededUntil}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Tool Description</p>
          <p className="text-gray-900">{request.toolDescription}</p>
        </div>
        {request.notes && (
          <div>
            <p className="text-gray-400 text-sm">Notes</p>
            <p className="text-gray-900">{request.notes}</p>
          </div>
        )}
      </div>

      {request.status === 'pending' && <RequestActions request={request} tools={tools} />}

      {request.status === 'approved' && loan && (
        <Link href={`/admin/loans/view?id=${loan.id}`} className="text-blue-600 hover:underline text-sm font-medium">
          View loan &rarr;
        </Link>
      )}
    </div>
  );
}

export default function RequestDetailPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
      <RequestDetailContent />
    </Suspense>
  );
}
