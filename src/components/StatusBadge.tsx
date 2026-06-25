const COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-blue-100 text-blue-800',
  returned: 'bg-gray-100 text-gray-700',
  overdue: 'bg-red-100 text-red-800',
  available: 'bg-green-100 text-green-800',
  on_loan: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-orange-100 text-orange-800',
  new: 'bg-green-100 text-green-800',
  good: 'bg-green-100 text-green-800',
  fair: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
