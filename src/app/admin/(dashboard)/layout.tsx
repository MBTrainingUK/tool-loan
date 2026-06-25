'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, logout } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/requests', label: 'Requests' },
  { href: '/admin/loans', label: 'Loans' },
  { href: '/admin/tools', label: 'Tools' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <nav className="flex gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/admin/login');
            }}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
