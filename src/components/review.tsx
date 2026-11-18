'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Copy, MessageSquareText, X } from 'lucide-react';
import {
  FEEDBACK_QUESTIONS,
  REVIEWER_ROLES,
  REVIEWER_TRACKS,
  TRACK_LABELS,
  type FeedbackQuestion,
  type ReviewerTrack,
} from '@/lib/reviewers';

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as { message?: string; link?: string; emailed?: boolean };
}
const errorText = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

/* ------------------------------------------------------------------ */
/* Coming-soon page: ask to become a reviewer                          */
/* ------------------------------------------------------------------ */

export function ReviewerRequestForm() {
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'done' | 'error'; msg?: string }>({
    kind: 'idle',
  });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: 'busy' });
    try {
      const data = await post('/api/reviewers/request', {
        name: f.get('name'),
        email: f.get('email'),
        role: f.get('role'),
        note: f.get('note') || '',
        company: f.get('company'),
      });
      setState({ kind: 'done', msg: data.message });
    } catch (err) {
      setState({ kind: 'error', msg: errorText(err) });
    }
  }
  if (state.kind === 'done')
    return (
      <div className="success-message" role="status">
        {state.msg}
      </div>
    );
  return (
    <form className="review-request" onSubmit={submit} noValidate>
      <div className="review-request-grid">
        <label className="field">
          <span>Name</span>
          <input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      <label className="field">
        <span>Which describes you best?</span>
        <select name="role" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {REVIEWER_ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>
          Anything you’d like to tell us? <em className="optional">Optional</em>
        </span>
        <textarea
          name="note"
          maxLength={1000}
          placeholder="e.g. Second-year MLS student; especially interested in electrolytes."
        />
      </label>
      <div className="subscribe-trap" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="subscribe-consent">
        We’ll use these details only to run the review programme. See our{' '}
        <Link className="text-link" href="/privacy">
          privacy page
        </Link>
        .
      </p>
      {state.kind === 'error' && (
        <div className="error-message" role="alert">
          {state.msg}
        </div>
      )}
      <button className="button" disabled={state.kind === 'busy'}>
        {state.kind === 'busy' ? 'Sending…' : 'Ask to review'}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Every page, for reviewers: the guided feedback form                 */
/* ------------------------------------------------------------------ */

type Answers = Record<string, string | number>;

export function FeedbackButton({ track }: { track: ReviewerTrack }) {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'done' | 'error'; msg?: string }>({
    kind: 'idle',
  });
  // A new page starts a fresh form.
  useEffect(() => {
    setAnswers({});
    setState({ kind: 'idle' });
  }, [path]);
  if (path.startsWith('/admin')) return null;
  const questions = FEEDBACK_QUESTIONS[track];
  const set = (k: string, v: string | number) => setAnswers((a) => ({ ...a, [k]: v }));
  const open = () => {
    if (state.kind === 'done') {
      setAnswers({});
      setState({ kind: 'idle' });
    }
    dialog.current?.showModal();
  };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: 'busy' });
    try {
      await post('/api/feedback', { path, answers });
      setState({ kind: 'done' });
    } catch (err) {
      setState({ kind: 'error', msg: errorText(err) });
    }
  }
  const legend = (n: number, label: string) => (
    <>
      <span className="fb-num">{n}</span>
      {label}
    </>
  );
  const render = (q: FeedbackQuestion, i: number) => {
    const n = i + 1;
    if (q.type === 'text')
      return (
        <label className="field fb-q" key={q.id}>
          <span className="fb-legend">{legend(n, q.label)}</span>
          <textarea
            value={answers[q.id] ?? ''}
            onChange={(e) => set(q.id, e.target.value)}
            maxLength={2000}
            placeholder={q.placeholder}
          />
        </label>
      );
    if (q.type === 'scale')
      return (
        <fieldset className="fb-q" key={q.id}>
          <legend>{legend(n, q.label)}</legend>
          <div className="fb-scale">
            {[1, 2, 3, 4, 5].map((v) => (
              <label key={v} className={answers[q.id] === v ? 'on' : ''}>
                <input
                  type="radio"
                  name={q.id}
                  value={v}
                  checked={answers[q.id] === v}
                  onChange={() => set(q.id, v)}
                />
                {v}
              </label>
            ))}
          </div>
          <div className="fb-scale-ends" aria-hidden>
            <span>{q.low}</span>
            <span>{q.high}</span>
          </div>
        </fieldset>
      );
    return (
      <fieldset className="fb-q" key={q.id}>
        <legend>{legend(n, q.label)}</legend>
        <div className="fb-options">
          {q.options.map((o) => (
            <label key={o} className={answers[q.id] === o ? 'on' : ''}>
              <input
                type="radio"
                name={q.id}
                value={o}
                checked={answers[q.id] === o}
                onChange={() => set(q.id, o)}
              />
              {o}
            </label>
          ))}
        </div>
        {q.detail && answers[q.id] === q.detail.when && (
          <label className="field fb-detail">
            <span>{q.detail.label}</span>
            <textarea
              value={answers[`${q.id}Detail`] ?? ''}
              onChange={(e) => set(`${q.id}Detail`, e.target.value)}
              maxLength={2000}
              placeholder={q.detail.placeholder}
              required
            />
          </label>
        )}
      </fieldset>
    );
  };
  return (
    <>
      <button type="button" className="fb-launch" onClick={open}>
        <MessageSquareText size={18} aria-hidden />
        Feedback
      </button>
      <dialog ref={dialog} className="fb-dialog" aria-labelledby="fb-title">
        <div className="fb-head">
          <div>
            <h2 id="fb-title">
              {track === 'expert' ? 'Expert review of this page' : 'Feedback on this page'}
            </h2>
            <p>
              {questions.length} short questions. Answer any you like; every answer helps.
              <br />
              <code>{path}</code>
            </p>
          </div>
          <button
            type="button"
            className="fb-close"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {state.kind === 'done' ? (
          <div className="fb-done" role="status">
            <Check size={28} aria-hidden />
            <h3>Thank you</h3>
            <p>Your feedback is saved. Keep reading, and use the button again on any other page.</p>
            <button type="button" className="button" onClick={() => dialog.current?.close()}>
              Back to the page
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="fb-form">
            {questions.map(render)}
            {state.kind === 'error' && (
              <div className="error-message" role="alert">
                {state.msg}
              </div>
            )}
            <div className="fb-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => dialog.current?.close()}
              >
                Cancel
              </button>
              <button className="button" disabled={state.kind === 'busy'}>
                {state.kind === 'busy' ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

function LinkBox({ link, emailed }: { link: string; emailed?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="invite-link" role="status">
      <p>
        {emailed ? 'Invite emailed. ' : ''}This link is shown only once. Copy it now; you can make a
        new one later (which stops the old one working).
      </p>
      <div className="invite-link-row">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Invite link"
        />
        <button
          type="button"
          className="button button-small"
          onClick={async () => {
            await navigator.clipboard.writeText(link);
            setCopied(true);
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export function AddReviewerForm({ canEmail }: { canEmail: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ link: string; emailed?: boolean } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const data = await post('/api/admin/reviewers', {
        action: 'add',
        name: f.get('name'),
        email: f.get('email'),
        role: f.get('role'),
        track: f.get('track'),
        send: f.get('send') === 'on',
      });
      setResult({ link: data.link!, emailed: data.emailed });
      form.reset();
      router.refresh();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="admin-reviewer-add" onSubmit={submit}>
      <h3>Invite someone directly</h3>
      <div className="filters">
        <label className="field">
          <span>Name</span>
          <input name="name" required maxLength={100} />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required maxLength={254} />
        </label>
        <label className="field">
          <span>Track</span>
          <select name="track" defaultValue="expert">
            {REVIEWER_TRACKS.map((t) => (
              <option key={t} value={t}>
                {TRACK_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Role</span>
          <select name="role" defaultValue={REVIEWER_ROLES[1]}>
            {REVIEWER_ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="check">
        <input type="checkbox" name="send" defaultChecked={canEmail} disabled={!canEmail} /> Email
        the invite {canEmail ? '' : '(email isn’t configured, so copy the link instead)'}
      </label>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      <button className="button" disabled={busy}>
        {busy ? 'Working…' : 'Add and create link'}
      </button>
      {result && <LinkBox {...result} />}
    </form>
  );
}

export function ReviewerActions({
  id,
  status,
  track,
  canEmail,
}: {
  id: string;
  status: string;
  track: string;
  canEmail: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ link: string; emailed?: boolean } | null>(null);
  async function act(action: string, send = false, extra: Record<string, string> = {}) {
    if (
      action === 'delete' &&
      !confirm('Delete this reviewer? Their feedback is kept without a name.')
    )
      return;
    setBusy(true);
    setError('');
    try {
      const data = await post('/api/admin/reviewers', { action, id, send, ...extra });
      if (data.link) setResult({ link: data.link, emailed: data.emailed });
      router.refresh();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  const live = status === 'INVITED' || status === 'ACTIVE';
  return (
    <div className="reviewer-actions">
      <div className="reviewer-actions-row">
        {canEmail && (
          <button
            className="button button-small"
            disabled={busy}
            onClick={() => act('invite', true)}
          >
            {live ? 'Email a new link' : 'Approve and email'}
          </button>
        )}
        <button
          className={`button button-small ${canEmail ? 'button-outline' : ''}`}
          disabled={busy}
          onClick={() => act('invite')}
        >
          {live ? 'New link' : 'Approve, copy link'}
        </button>
        {live && (
          <button
            className="button button-small button-danger"
            disabled={busy}
            onClick={() => act('revoke')}
          >
            Revoke
          </button>
        )}
        {status === 'REQUESTED' && (
          <button
            className="button button-small button-outline"
            disabled={busy}
            onClick={() => act('decline')}
          >
            Decline
          </button>
        )}
        {!live && (
          <button
            className="button button-small button-outline"
            disabled={busy}
            onClick={() => act('delete')}
          >
            Delete
          </button>
        )}
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {result && <LinkBox {...result} />}
    </div>
  );
}

export function ResolveToggle({ id, resolved }: { id: string; resolved: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={resolved}
        disabled={busy}
        onChange={async (e) => {
          setBusy(true);
          try {
            await post('/api/admin/feedback', { id, resolved: e.target.checked });
            router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      />{' '}
      Dealt with
    </label>
  );
}
