'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getRequestById, getLoanByRequestId, getTools } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestActions } from '@/components/RequestActions';
import type { Loan, LoanRequest, Tool } from '@/lib/types';

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p className="text-gray-900 font-medium">{value || '—'}</p>
    </div>
  );
}

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
        <h2 className="font-semibold text-gray-900 text-sm">Borrower Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Name" value={request.retailerName} />
          <Field label="Company" value={request.companyName} />
          <Field label="Email" value={request.email} />
          <Field label="Phone" value={request.phone} />
          <Field label="Department/Team" value={request.department} />
        </div>

        <h2 className="font-semibold text-gray-900 text-sm pt-2 border-t">Vehicle Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Registration" value={request.vehicleRegistration} />
          <Field label="Model" value={request.vehicleModel} />
          <Field label="VIN Number" value={request.vinNumber} />
          <Field label="Mileage" value={request.mileage} />
        </div>

        <h2 className="font-semibold text-gray-900 text-sm pt-2 border-t">Job Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Type of Job/Repair" value={request.jobType} />
          <Field label="Work Order / Job Number" value={request.jobNumber} />
          <Field label="WIS Tool Reference" value={request.wisToolReference} />
        </div>

        <h2 className="font-semibold text-gray-900 text-sm pt-2 border-t">Tool Required</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Tool Part No." value={request.toolPartNumber} />
          <Field label="Needed From" value={request.neededFrom} />
          <Field label="Needed Until" value={request.neededUntil} />
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
        <p className="text-sm text-gray-400 pt-2 border-t">
          Terms &amp; conditions: <span className="text-gray-900 font-medium">{request.acceptedTerms ? 'Accepted' : 'Not accepted'}</span>
        </p>
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
