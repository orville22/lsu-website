'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Flag, MessageSquareText, X } from 'lucide-react';
import type { ReviewerTrack } from '@/lib/reviewers';

type State = { kind: 'idle' | 'busy' | 'done' | 'error'; message?: string };

async function send(url: string, body: unknown, method = 'POST') {
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) throw new Error(String(data.error || 'Something went wrong. Please try again.'));
  return data;
}

const errorText = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

/* ------------------------------------------------------------------ */
/* Volunteer request form (public)                                     */
/* ------------------------------------------------------------------ */

export function ReviewerRequestForm({
  roles,
  consentText,
}: {
  roles: Record<string, string>;
  consentText: string;
}) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: 'busy' });
    try {
      const data = await send('/api/reviewers', {
        name: f.get('name'),
        email: f.get('email'),
        role: f.get('role'),
        country: f.get('country') || '',
        note: f.get('note') || '',
        creditConsent: f.get('creditConsent') === 'on',
        consent: f.get('consent') === 'on',
        company: f.get('company'),
      });
      setState({ kind: 'done', message: String(data.message) });
    } catch (err) {
      setState({ kind: 'error', message: errorText(err) });
    }
  }
  if (state.kind === 'done')
    return (
      <div className="subscribe-done" role="status">
        <MessageSquareText size={20} aria-hidden />
        <div>
          <strong>Request received.</strong>
          <p>{state.message}</p>
        </div>
      </div>
    );
  return (
    <form className="review-form" onSubmit={submit} noValidate>
      <div className="review-form-grid">
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
        <label className="field">
          <span>I am a…</span>
          <select name="role" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {Object.entries(roles).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>
            Country <small className="muted">(optional)</small>
          </span>
          <input name="country" autoComplete="country-name" maxLength={80} />
        </label>
      </div>
      <label className="field">
        <span>
          Anything you’d like us to know? <small className="muted">(optional)</small>
        </span>
        <textarea
          name="note"
          maxLength={1000}
          placeholder="For example, your lab area, what you’re studying, or topics you’d like to review."
        />
      </label>
      <div className="subscribe-trap" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="review-check-line">
        <input type="checkbox" name="creditConsent" />
        <span>You can thank me by name when reviewer acknowledgements go up on the site.</span>
      </label>
      <label className="review-check-line">
        <input type="checkbox" name="consent" required />
        <span>
          {consentText} See the{' '}
          <Link className="text-link" href="/privacy#reviewers">
            privacy page
          </Link>
          .
        </span>
      </label>
      <div className="form-actions">
        <button className="button" disabled={state.kind === 'busy'}>
          {state.kind === 'busy' ? 'Sending…' : 'Volunteer as a reviewer'}
        </button>
      </div>
      {state.kind === 'error' && (
        <div className="error-message" role="alert">
          {state.message}
        </div>
      )}
    </form>
  );
}

export function ReviewerSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="button button-outline button-small"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await send('/api/review/session', undefined, 'DELETE').catch(() => {});
        router.refresh();
        setBusy(false);
      }}
    >
      Sign out of reviewer access on this browser
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback panel (reviewers)                                          */
/* ------------------------------------------------------------------ */

const levels = {
  learner: [
    ['TOO_BASIC', 'Too basic'],
    ['ABOUT_RIGHT', 'About right'],
    ['TOO_ADVANCED', 'Too advanced'],
  ],
  expert: [
    ['TOO_BASIC', 'Too shallow'],
    ['ABOUT_RIGHT', 'About right'],
    ['TOO_ADVANCED', 'Too deep'],
  ],
} as const;

/**
 * The questions for each track. Shared answers go in the same fields, so learner
 * and expert feedback line up: clarity, level (depth for experts), accuracy,
 * illustrations, missing (bench risks for experts) and comment. Experts also
 * answer currency and references.
 */
type TextQ = { name: string; label: string };
const questions = {
  learner: {
    clarity: 'How clear was this page?',
    level: 'Is the level right for you?',
    text: [
      { name: 'accuracy', label: 'Is anything inaccurate or out of date?' },
      { name: 'illustrations', label: 'Did the illustrations help? Which one didn’t?' },
      { name: 'missing', label: 'What confused you, or what’s missing?' },
    ] as TextQ[],
    order: ['clarity', 'accuracy', 'level', 'illustrations', 'missing'],
  },
  expert: {
    clarity: 'How clear would this page be for a student?',
    level: 'Is the depth right for a laboratory science student or early-career scientist?',
    text: [
      { name: 'accuracy', label: 'Is anything inaccurate? Where, and what should it say?' },
      {
        name: 'currency',
        label: 'Is anything out of date against current guidelines, standards or practice?',
      },
      {
        name: 'references',
        label: 'Do the references support the claims they’re attached to? Which don’t?',
      },
      {
        name: 'illustrations',
        label: 'Do the illustrations help, and are they scientifically sound?',
      },
      {
        name: 'missing',
        label: 'What’s missing, or what could a learner misapply at the bench?',
      },
    ] as TextQ[],
    order: ['clarity', 'accuracy', 'currency', 'references', 'level', 'illustrations', 'missing'],
  },
} as const;

export function FeedbackWidget({
  name,
  track = 'learner',
}: {
  name: string | null;
  track?: ReviewerTrack;
}) {
  const q = questions[track];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [clarity, setClarity] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('input, textarea, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // A new page starts a fresh form.
  useEffect(() => {
    setState({ kind: 'idle' });
    setClarity(null);
    setLevel(null);
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setState({ kind: 'busy' });
    try {
      await send('/api/feedback', {
        kind: 'REVIEW',
        path: pathname,
        pageTitle: document.title.replace(/ \| Lab Science Unfiltered$/, '').slice(0, 200),
        clarity,
        level,
        accuracy: f.get('accuracy') || '',
        currency: f.get('currency') || '',
        references: f.get('references') || '',
        illustrations: f.get('illustrations') || '',
        missing: f.get('missing') || '',
        comment: f.get('comment') || '',
      });
      form.reset();
      setClarity(null);
      setLevel(null);
      setState({ kind: 'done' });
    } catch (err) {
      setState({ kind: 'error', message: errorText(err) });
    }
  }

  return (
    <>
      <button
        ref={trigger}
        className="feedback-trigger"
        aria-expanded={open}
        aria-controls="feedback-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <MessageSquareText size={18} aria-hidden /> Feedback
      </button>
      {open && (
        <div
          id="feedback-panel"
          ref={panel}
          className="feedback-panel"
          role="dialog"
          aria-labelledby="feedback-title"
        >
          <div className="feedback-head">
            <div>
              <p className="eyebrow">Reviewer feedback{name ? ` · ${name}` : ''}</p>
              <h2 id="feedback-title">About this page</h2>
            </div>
            <button
              className="feedback-close"
              aria-label="Close feedback"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={20} />
            </button>
          </div>
          {state.kind === 'done' ? (
            <div className="feedback-done" role="status">
              <strong>Thank you, that’s saved.</strong>
              <p>You can send more about this page at any time, or move on to another page.</p>
              <button
                className="button button-outline button-small"
                onClick={() => setState({ kind: 'idle' })}
              >
                Add more feedback
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="feedback-hint">
                {track === 'expert' ? 'Expert review. ' : ''}Answer as many or as few as you like.
              </p>
              {q.order.map((key, i) => {
                const n = `${i + 1}. `;
                if (key === 'clarity')
                  return (
                    <fieldset className="feedback-q" key={key}>
                      <legend>
                        {n}
                        {q.clarity}
                      </legend>
                      <div className="feedback-scale">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <label key={v} className={clarity === v ? 'selected' : ''}>
                            <input
                              type="radio"
                              name="clarity"
                              value={v}
                              checked={clarity === v}
                              onChange={() => setClarity(v)}
                            />
                            {v}
                          </label>
                        ))}
                      </div>
                      <div className="feedback-scale-labels" aria-hidden>
                        <span>Confusing</span>
                        <span>Very clear</span>
                      </div>
                    </fieldset>
                  );
                if (key === 'level')
                  return (
                    <fieldset className="feedback-q" key={key}>
                      <legend>
                        {n}
                        {q.level}
                      </legend>
                      <div className="feedback-chips">
                        {levels[track].map(([value, label]) => (
                          <label key={value} className={level === value ? 'selected' : ''}>
                            <input
                              type="radio"
                              name="level"
                              value={value}
                              checked={level === value}
                              onChange={() => setLevel(value)}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  );
                const t = q.text.find((x) => x.name === key)!;
                return (
                  <label className="field feedback-q" key={key}>
                    <span>
                      {n}
                      {t.label}
                    </span>
                    <textarea name={t.name} maxLength={4000} rows={2} />
                  </label>
                );
              })}
              <label className="field feedback-q">
                <span>Anything else?</span>
                <textarea name="comment" maxLength={4000} rows={2} />
              </label>
              {state.kind === 'error' && (
                <div className="error-message" role="alert">
                  {state.message}
                </div>
              )}
              <button className="button" disabled={state.kind === 'busy'}>
                {state.kind === 'busy' ? 'Sending…' : 'Send feedback'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Error report (anyone, lesson pages)                                 */
/* ------------------------------------------------------------------ */

export function ErrorReport() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: 'idle' });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: 'busy' });
    try {
      await send('/api/feedback', {
        kind: 'ERROR',
        path: pathname,
        pageTitle: document.title.replace(/ \| Lab Science Unfiltered$/, '').slice(0, 200),
        comment: f.get('comment') || '',
      });
      setState({ kind: 'done' });
    } catch (err) {
      setState({ kind: 'error', message: errorText(err) });
    }
  }
  if (state.kind === 'done')
    return (
      <p className="error-report-done" role="status">
        Thanks. Your report has been sent and will be checked against the references.
      </p>
    );
  if (!open)
    return (
      <button className="error-report-link" onClick={() => setOpen(true)}>
        <Flag size={15} aria-hidden /> Report an error on this page
      </button>
    );
  return (
    <form className="error-report" onSubmit={submit}>
      <label className="field">
        <span>What’s wrong, and where on the page?</span>
        <textarea name="comment" required minLength={5} maxLength={2000} autoFocus />
      </label>
      <p className="muted small">
        Reports are anonymous. Please don’t include personal or patient information.
      </p>
      {state.kind === 'error' && (
        <div className="error-message" role="alert">
          {state.message}
        </div>
      )}
      <div className="form-actions">
        <button className="button button-small" disabled={state.kind === 'busy'}>
          {state.kind === 'busy' ? 'Sending…' : 'Send report'}
        </button>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

const confirmText: Record<string, string> = {
  decline: 'Decline this request?',
  revoke: 'Revoke this reviewer’s access? Their link will stop working on every device.',
  delete: 'Delete this person’s details? Their feedback is kept without their name.',
  resend: 'Send a new link? The old link will stop working.',
};

export function AdminReviewerActions({
  id,
  actions,
  track,
}: {
  id: string;
  actions: ('approve' | 'resend' | 'decline' | 'revoke' | 'delete')[];
  /** When given, shows a button to switch the reviewer's question set. */
  track?: ReviewerTrack;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; link?: string } | null>(null);
  const labels = {
    approve: 'Approve and email link',
    resend: 'New link',
    decline: 'Decline',
    revoke: 'Revoke',
    delete: 'Delete',
  };
  async function run(action: keyof typeof labels | 'track') {
    if (action !== 'track' && confirmText[action] && !window.confirm(confirmText[action])) return;
    setBusy(true);
    setNote(null);
    try {
      const data = await send('/api/admin/reviewers', {
        id,
        action,
        ...(action === 'track' ? { track: track === 'expert' ? 'learner' : 'expert' } : {}),
      });
      // If the email failed, keep the link on screen (refreshing would move this row).
      if (data.link && !data.emailed)
        setNote({
          text: 'Approved, but the email couldn’t be sent. Copy this link and send it yourself, then select Done:',
          link: String(data.link),
        });
      else router.refresh();
    } catch (err) {
      setNote({ text: errorText(err) });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-row-actions">
      {actions.map((a) => (
        <button
          key={a}
          className={`button button-small ${a === 'approve' ? '' : a === 'delete' || a === 'revoke' ? 'button-danger' : 'button-outline'}`}
          disabled={busy}
          onClick={() => run(a)}
        >
          {labels[a]}
        </button>
      ))}
      {track && (
        <button
          className="button button-small button-outline"
          disabled={busy}
          onClick={() => run('track')}
        >
          {track === 'expert' ? 'Make learner' : 'Make expert'}
        </button>
      )}
      {note && (
        <p className="small" role="status">
          {note.text}
          {note.link && (
            <>
              <br />
              <input
                className="input"
                readOnly
                value={note.link}
                onFocus={(e) => e.target.select()}
              />
              <button
                className="button button-small"
                onClick={() => {
                  setNote(null);
                  router.refresh();
                }}
              >
                Done
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export function AdminFeedbackActions({ id, status }: { id: string; status: 'OPEN' | 'RESOLVED' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run(action: 'resolve' | 'reopen' | 'delete') {
    if (action === 'delete' && !window.confirm('Delete this feedback?')) return;
    setBusy(true);
    await send('/api/admin/feedback', { id, action }).catch((e) => window.alert(errorText(e)));
    router.refresh();
    setBusy(false);
  }
  return (
    <div className="admin-row-actions">
      <button
        className="button button-small button-outline"
        disabled={busy}
        onClick={() => run(status === 'OPEN' ? 'resolve' : 'reopen')}
      >
        {status === 'OPEN' ? 'Mark resolved' : 'Reopen'}
      </button>
      <button
        className="button button-small button-danger"
        disabled={busy}
        onClick={() => run('delete')}
      >
        Delete
      </button>
    </div>
  );
}
