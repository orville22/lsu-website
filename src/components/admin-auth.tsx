'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-panel">
      <LockKeyhole size={26} color="var(--action)" />
      <p className="eyebrow" style={{ marginTop: 20 }}>
        Editorial workspace
      </p>
      <h1>Administrator sign-in</h1>
      <p>Manage the question bank, lessons and scientific review workflow.</p>
      <form onSubmit={login}>
        <label className="field">
          <span>Username</span>
          <input name="username" autoComplete="username" required maxLength={100} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={500}
          />
        </label>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <button className="button" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in securely'}
        </button>
      </form>
      <p>
        First setup: run <code>npm run admin:password</code> and configure the resulting hash in
        your local environment.
      </p>
    </div>
  );
}
export function AdminLogout() {
  const router = useRouter();
  const [error, setError] = useState('');
  return (
    <div>
      <button
        className="button button-outline button-small"
        onClick={async () => {
          try {
            const r = await fetch('/api/auth', { method: 'DELETE' });
            if (!r.ok) throw new Error('Sign-out failed.');
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Sign-out failed.');
          }
        }}
      >
        Sign out
      </button>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
