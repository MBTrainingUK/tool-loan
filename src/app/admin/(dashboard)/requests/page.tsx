'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRequests } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import type { LoanRequest } from '@/lib/types';

export default function RequestsPage() {
  const [requests, setRequests] = useState<LoanRequest[] | null>(null);

  useEffect(() => {
    getRequests().then(setRequests);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Loan Requests</h1>
      {requests === null ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/requests/view?id=${request.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{request.toolDescription}</p>
                <p className="text-sm text-gray-500">
                  {request.companyName} &middot; {request.retailerName} &middot; needed {request.neededFrom} to {request.neededUntil}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
