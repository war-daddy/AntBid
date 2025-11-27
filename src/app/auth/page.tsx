/* Simple login/signup page using the auth APIs */
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      email: formData.get('email'),
      password: formData.get('password')
    };
    if (mode === 'signup') {
      body.name = formData.get('name');
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Something went wrong');
      } else {
        router.push('/products');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {mode === 'login' ? 'Welcome back' : 'Create your AntBid account'}
        </h1>
        <p className="text-sm text-slate-300">
          {mode === 'login'
            ? 'Login to start bidding or manage your listings.'
            : 'Sign up to list products and bid on other items.'}
        </p>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex gap-2 rounded-full bg-slate-900 p-1 text-xs">
          <button
            type="button"
            className={`flex-1 rounded-full py-1.5 ${
              mode === 'login' ? 'bg-slate-800 text-slate-50' : 'text-slate-400'
            }`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full py-1.5 ${
              mode === 'signup' ? 'bg-slate-800 text-slate-50' : 'text-slate-400'
            }`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1 text-sm">
              <label htmlFor="name" className="text-slate-200">
                Name
              </label>
              <input id="name" name="name" className="input" required />
            </div>
          )}
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              required
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="password" className="text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}


