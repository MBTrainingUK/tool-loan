'use client';

import { useActionState } from 'react';
import { submitRequest } from '@/lib/firestore';
import { sendRequestNotification } from '@/lib/email';

type FormState = { error?: string; success?: boolean } | undefined;

async function submitAction(_state: FormState, formData: FormData): Promise<FormState> {
  const retailerName = String(formData.get('retailerName') ?? '').trim();
  const companyName = String(formData.get('companyName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const toolDescription = String(formData.get('toolDescription') ?? '').trim();
  const neededFrom = String(formData.get('neededFrom') ?? '').trim();
  const neededUntil = String(formData.get('neededUntil') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!retailerName || !companyName || !email || !phone || !toolDescription || !neededFrom || !neededUntil) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    await submitRequest({
      retailerName,
      companyName,
      email,
      phone,
      toolDescription,
      neededFrom,
      neededUntil,
      notes: notes || undefined,
    });
    // The request is already saved at this point — a notification failure
    // shouldn't stop the retailer from seeing a successful submission.
    sendRequestNotification({
      retailerName,
      companyName,
      email,
      phone,
      toolDescription,
      neededFrom,
      neededUntil,
      notes: notes || undefined,
    }).catch((err) => console.error('Failed to send notification email:', err));
    return { success: true };
  } catch {
    return { error: 'Something went wrong. Please try again or call us directly.' };
  }
}

export default function RequestPage() {
  const [state, formAction, pending] = useActionState(submitAction, undefined);

  if (state?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Received</h2>
          <p className="text-gray-500">Thanks, we&apos;ll review your request and be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tool Loan Request</h1>
          <p className="mt-2 text-gray-500">Fill in the form below and we&apos;ll get back to you to confirm availability.</p>
        </div>
        <form action={formAction} className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input type="text" name="retailerName" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input type="text" name="companyName" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="tel" name="phone" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Tool Required</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Describe the tool you need *</label>
                <textarea name="toolDescription" required rows={3} placeholder="e.g. Engine timing kit for BMW N20, or brake bleeding kit..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Needed From *</label>
                  <input type="date" name="neededFrom" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Needed Until *</label>
                  <input type="date" name="neededUntil" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes <span className="text-gray-400">(optional)</span></label>
                <textarea name="notes" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}
          <button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors">
            {pending ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
