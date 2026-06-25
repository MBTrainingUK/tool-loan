'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTools } from '@/lib/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import type { Tool } from '@/lib/types';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[] | null>(null);

  useEffect(() => {
    getTools().then(setTools);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tools</h1>
      {tools === null ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : tools.length === 0 ? (
        <p className="text-gray-500">No tools yet — tools are added automatically when a request is approved.</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/admin/tools/view?id=${tool.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{tool.name}</p>
                <p className="text-sm text-gray-500">{tool.category ?? tool.description}</p>
              </div>
              <StatusBadge status={tool.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
