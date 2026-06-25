'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

type FormState = { error?: string } | undefined;

export default function AdminLoginPage() {
  const router = useRouter();

  async function loginAction(_state: FormState, formData: FormData): Promise<FormState> {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      return { error: 'Enter your email and password.' };
    }

    try {
      await login(email, password);
      router.push('/admin');
      return undefined;
    } catch {
      return { error: 'Incorrect email or password.' };
    }
  }

  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form action={formAction} className="bg-white rounded-2xl shadow p-8 max-w-sm w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">Admin Login</h1>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {pending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
