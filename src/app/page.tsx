'use client';

import { useActionState } from 'react';
import { submitRequest } from '@/lib/firestore';
import { sendRequestNotification } from '@/lib/email';

type FormState = { error?: string; success?: boolean } | undefined;

const COOLDOWN_MS = 60_000;
const LAST_SUBMITTED_KEY = 'toolLoan:lastSubmittedAt';

async function submitAction(_state: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: real users never see or fill this field. Bots that blindly fill
  // every input will trip it — pretend success without writing anything.
  if (String(formData.get('website') ?? '').trim()) {
    return { success: true };
  }

  const lastSubmittedAt = Number(window.localStorage.getItem(LAST_SUBMITTED_KEY) ?? 0);
  if (Date.now() - lastSubmittedAt < COOLDOWN_MS) {
    return { error: 'Please wait a moment before submitting another request.' };
  }

  const retailerName = String(formData.get('retailerName') ?? '').trim();
  const companyName = String(formData.get('companyName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const department = String(formData.get('department') ?? '').trim();
  const vinNumber = String(formData.get('vinNumber') ?? '').trim();
  const vehicleModel = String(formData.get('vehicleModel') ?? '').trim();
  const mileage = String(formData.get('mileage') ?? '').trim();
  const jobType = String(formData.get('jobType') ?? '').trim();
  const jobNumber = String(formData.get('jobNumber') ?? '').trim();
  const wisToolReference = String(formData.get('wisToolReference') ?? '').trim();
  const toolPartNumber = String(formData.get('toolPartNumber') ?? '').trim();
  const toolDescription = String(formData.get('toolDescription') ?? '').trim();
  const neededFrom = String(formData.get('neededFrom') ?? '').trim();
  const neededUntil = String(formData.get('neededUntil') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const acceptedTerms = formData.get('acceptedTerms') === 'on';

  if (
    !retailerName || !companyName || !email || !phone ||
    !vinNumber || !vehicleModel || !jobType ||
    !toolPartNumber || !toolDescription || !neededFrom || !neededUntil
  ) {
    return { error: 'Please fill in all required fields.' };
  }
  if (!acceptedTerms) {
    return { error: 'Please accept the terms and conditions before submitting.' };
  }

  const requestInput = {
    retailerName,
    companyName,
    email,
    phone,
    department: department || undefined,
    vinNumber,
    vehicleModel,
    mileage: mileage || undefined,
    jobType,
    jobNumber: jobNumber || undefined,
    wisToolReference: wisToolReference || undefined,
    toolPartNumber,
    toolDescription,
    neededFrom,
    neededUntil,
    notes: notes || undefined,
    acceptedTerms,
  };

  try {
    await submitRequest(requestInput);
    window.localStorage.setItem(LAST_SUBMITTED_KEY, String(Date.now()));
    // The request is already saved at this point — a notification failure
    // shouldn't stop the retailer from seeing a successful submission.
    sendRequestNotification(requestInput).catch((err) =>
      console.error('Failed to send notification email:', err)
    );
    return { success: true };
  } catch {
    return { error: 'Something went wrong. Please try again or call us directly.' };
  }
}

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

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
          {/* Honeypot — hidden from real users, catches bots that fill every field */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Your Name *</label>
                <input type="text" name="retailerName" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Company Name *</label>
                <input type="text" name="companyName" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" name="email" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input type="tel" name="phone" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department/Team <span className="text-gray-400">(optional)</span></label>
                <input type="text" name="department" className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Vehicle Model *</label>
                <input type="text" name="vehicleModel" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>VIN Number *</label>
                <input type="text" name="vinNumber" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mileage <span className="text-gray-400">(optional)</span></label>
                <input type="text" name="mileage" className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Type of Job/Repair *</label>
                <input type="text" name="jobType" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Work Order / Job Number <span className="text-gray-400">(optional)</span></label>
                <input type="text" name="jobNumber" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WIS Tool Reference <span className="text-gray-400">(optional)</span></label>
                <input type="text" name="wisToolReference" className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Tool Required</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Tool Part No. *</label>
                <input type="text" name="toolPartNumber" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tool Description *</label>
                <textarea name="toolDescription" required rows={3} placeholder="e.g. Engine timing kit for the M270 engine, or brake bleeding kit..." className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Needed From *</label>
                  <input type="date" name="neededFrom" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Needed Until *</label>
                  <input type="date" name="neededUntil" required className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Additional Notes <span className="text-gray-400">(optional)</span></label>
                <textarea name="notes" rows={2} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Terms & Conditions</h2>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
              <p>
                The parties named above, accept full responsibility for any damage or loss to the above tool(s)
                while on loan, and that any damaged or missing parts will be replaced at the retailer&apos;s expense.
              </p>
              <p>
                Should the tool(s) not be returned by the agreed date or, if the tools are in an unserviceable
                condition, the above named retailer also agrees to accept any costs incurred as a result of the
                cancellation of any training events that are reliant upon the use of the tool(s).
              </p>
              <p>
                Collection and return delivery are the responsibility of the borrowing retailer and must NOT be via
                parts logistics
              </p>
              <p>
                Returned tools must be signed in by a member of Mercedes-Benz Passenger car Technical Training. This
                does not include reception staff or the apprentice academy team.
              </p>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" name="acceptedTerms" required className="mt-1" />
              <span>I have read and accept the terms and conditions above. *</span>
            </label>
          </div>

          <div className="text-xs text-gray-500 bg-gray-100 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-gray-600">Privacy Notice</p>
            <p>
              We collect the information you provide on this form to process and manage your tool loan request,
              including approving requests, tracking the loan, and contacting you about it. It is processed by
              Mercedes-Benz Passenger Car Technical Training on the basis of our legitimate business interest in
              managing tool loans.
            </p>
            <p>
              This information is stored using Google Firebase, and a request notification is sent via a third-party
              email delivery service; both act as data processors on our behalf. We retain this information for as
              long as necessary to manage the loan and for our legitimate business records.
            </p>
            <p>
              You have the right to ask for access to, correction of, or deletion of your information. To exercise
              these rights, contact{' '}
              <a href="mailto:jason.richards@mercedes-benz.com" className="underline">
                jason.richards@mercedes-benz.com
              </a>
              .
            </p>
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
