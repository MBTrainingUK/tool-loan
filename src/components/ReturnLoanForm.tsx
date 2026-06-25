'use client';

import { useActionState } from 'react';
import { recordReturn } from '@/lib/firestore';
import type { ToolCondition } from '@/lib/types';

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

type FormState = { error?: string } | undefined;

export function ReturnLoanForm({ loanId, onReturned }: { loanId: string; onReturned: () => void }) {
  async function action(_state: FormState, formData: FormData): Promise<FormState> {
    const conditionOnReturn = String(formData.get('conditionOnReturn') ?? '') as ToolCondition;
    const returnNotes = String(formData.get('returnNotes') ?? '').trim();

    if (!conditionOnReturn) return { error: 'Select the condition the tool came back in.' };

    try {
      await recordReturn({ loanId, conditionOnReturn, returnNotes: returnNotes || undefined });
      onReturned();
      return undefined;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Something went wrong.' };
    }
  }

  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Record Return</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Condition on Return *</label>
        <select name="conditionOnReturn" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select condition...
          </option>
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
        <textarea name="returnNotes" rows={3} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {pending ? 'Saving...' : 'Record Return'}
      </button>
    </form>
  );
}
