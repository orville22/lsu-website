'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

type State = {
  kind: 'idle' | 'busy' | 'done' | 'error';
  message?: string;
  /** The link can't work; offer a fresh sign-up instead of a retry. */
  final?: boolean;
};

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data } as {
    ok: boolean;
    data: { error?: string; status?: string; message?: string };
  };
}

export function SubscribeForm({ source, consentText }: { source: string; consentText: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ kind: 'busy' });
    try {
      const { ok, data } = await post('/api/subscribe', {
        email: form.get('email'),
        company: form.get('company'),
        source,
      });
      if (!ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState({ kind: 'done', message: data.message });
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  }
  if (state.kind === 'done')
    return (
      <div className="subscribe-done" role="status">
        <Mail size={20} aria-hidden />
        <div>
          <strong>Almost there.</strong>
          <p>
            {state.message} It can take a minute to arrive; check your spam folder if you don’t see
            it.
          </p>
        </div>
      </div>
    );
  return (
    <form className="subscribe-form" onSubmit={submit} noValidate>
      <div className="subscribe-row">
        <label className="field">
          <span className="sr-only">Email address</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={254}
          />
        </label>
        <button className="button" disabled={state.kind === 'busy'}>
          {state.kind === 'busy' ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      {/* Honeypot, hidden from people and assistive technology. */}
      <div className="subscribe-trap" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="subscribe-consent">
        {consentText} We’ll send a confirmation email first. See our{' '}
        <Link className="text-link" href="/privacy">
          privacy page
        </Link>
        .
      </p>
      {state.kind === 'error' && (
        <div className="error-message" role="alert">
          {state.message}
        </div>
      )}
    </form>
  );
}

const confirmMessages: Record<string, string> = {
  confirmed: 'You’re subscribed. We’ll email you when new lessons are published.',
  'already-confirmed': 'This address is already confirmed. You’re all set.',
  expired: 'This confirmation link has expired. Sign up again and we’ll send a fresh one.',
  invalid:
    'This confirmation link isn’t valid. It may have been used already or copied incompletely.',
};

export function ConfirmAction({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  async function confirm() {
    setState({ kind: 'busy' });
    try {
      const { data } = await post('/api/subscribe/confirm', { token });
      const message = data.status ? confirmMessages[data.status] : data.error;
      const success = data.status === 'confirmed' || data.status === 'already-confirmed';
      setState({
        kind: success ? 'done' : 'error',
        message: message || confirmMessages.invalid,
        final: data.status === 'expired' || data.status === 'invalid',
      });
    } catch {
      setState({ kind: 'error', message: 'Something went wrong. Please try again.' });
    }
  }
  if (state.kind === 'done')
    return (
      <>
        <div className="success-message" role="status">
          {state.message}
        </div>
        <Link className="button" href="/learn">
          Browse the lessons
        </Link>
      </>
    );
  if (state.kind === 'error' && state.final)
    return (
      <>
        <div className="error-message" role="alert">
          {state.message}
        </div>
        <Link className="button" href="/#subscribe">
          Sign up again
        </Link>
      </>
    );
  return (
    <>
      {state.kind === 'error' && (
        <div className="error-message" role="alert">
          {state.message}
        </div>
      )}
      <button className="button" onClick={confirm} disabled={state.kind === 'busy'}>
        {state.kind === 'busy' ? 'Confirming…' : 'Confirm my subscription'}
      </button>
    </>
  );
}

export function UnsubscribeAction({ s, t }: { s: string; t: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  async function leave() {
    setState({ kind: 'busy' });
    try {
      const { ok, data } = await post('/api/subscribe/unsubscribe', { s, t });
      if (!ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState({
        kind: 'done',
        message: 'You’re unsubscribed. You won’t get any more emails from us.',
      });
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  }
  if (state.kind === 'done')
    return (
      <div className="success-message" role="status">
        {state.message}
      </div>
    );
  return (
    <>
      {state.kind === 'error' && (
        <div className="error-message" role="alert">
          {state.message}
        </div>
      )}
      <button className="button" onClick={leave} disabled={state.kind === 'busy'}>
        {state.kind === 'busy' ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
    </>
  );
}
