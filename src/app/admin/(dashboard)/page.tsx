'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPendingRequests, getActiveLoans, isOverdue } from '@/lib/firestore';
import type { Loan, LoanRequest } from '@/lib/types';

export default function DashboardPage() {
  const [pendingRequests, setPendingRequests] = useState<LoanRequest[]>([]);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPendingRequests(), getActiveLoans()]).then(([requests, loans]) => {
      setPendingRequests(requests);
      setActiveLoans(loans);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  const overdueLoans = activeLoans.filter(isOverdue);

  const stats = [
    { label: 'Pending Requests', value: pendingRequests.length, href: '/admin/requests' },
    { label: 'Active Loans', value: activeLoans.length, href: '/admin/loans' },
    { label: 'Overdue', value: overdueLoans.length, href: '/admin/loans' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.label === 'Overdue' && stat.value > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {overdueLoans.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Overdue Loans</h2>
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {overdueLoans.map((loan) => (
              <Link
                key={loan.id}
                href={`/admin/loans/view?id=${loan.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{loan.toolName}</p>
                  <p className="text-sm text-gray-500">{loan.companyName} &middot; was due {loan.dueDate}</p>
                </div>
                <span className="text-sm font-medium text-red-600">Overdue</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Pending Requests</h2>
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {pendingRequests.map((request) => (
              <Link
                key={request.id}
                href={`/admin/requests/view?id=${request.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{request.toolDescription}</p>
                  <p className="text-sm text-gray-500">{request.companyName} &middot; needed from {request.neededFrom}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
