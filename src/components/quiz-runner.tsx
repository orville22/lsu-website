'use client';
import Link from 'next/link';
import { readDraft, writeDraft, clearDraft } from '@/lib/browser-storage';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, X, RotateCcw } from 'lucide-react';
import type { Answers, SnapshotQuestion, QuizResult } from '@/lib/quiz';
import { DraftNotice } from './ui';
import { MascotArtwork } from './brand/mascot-artwork';
type PublicQuestion = {
  id: string;
  text: string;
  categoryName: string;
  difficulty: string;
  options: { id: string; text: string }[];
};
export type AttemptView = {
  id: string;
  isDemo: boolean;
  submitted: boolean;
  questions: PublicQuestion[] | SnapshotQuestion[];
  answers: unknown;
  result: unknown;
  createdAt: Date | string;
};
export function QuizRunner({ initial }: { initial: AttemptView }) {
  const [attempt, setAttempt] = useState(initial);
  const [answers, setAnswers] = useState<Answers>(initial.answers as Answers);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('All changes saved');
  const [confirm, setConfirm] = useState(false);
  const queue = useRef(Promise.resolve());
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const pending = useRef(0);
  const answerRef = useRef(answers);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const storageKey = `lsu-attempt-${initial.id}`;
  useEffect(() => {
    if (initial.submitted) {
      clearDraft(storageKey);
      return;
    }
    const raw = readDraft(storageKey);
    if (raw) {
      try {
        const draft = JSON.parse(raw) as Answers;
        const valid = Object.fromEntries(
          Object.entries(draft).filter(([id, v]) =>
            initial.questions.some((q) => q.id === id && q.options.some((o) => o.id === v)),
          ),
        );
        setAnswers(valid);
        answerRef.current = valid;
        enqueue(valid);
      } catch {
        clearDraft(storageKey);
      }
    }
  }, []);
  useEffect(() => {
    if (!confirm) return;
    const previous = document.activeElement as HTMLElement | null;
    cancel.current?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirm(false);
      if (e.key === 'Tab') {
        const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('keydown', handle);
      previous?.focus();
    };
  }, [confirm]);
  async function persist(next: Answers, submit = false) {
    const r = await fetch(`/api/attempts/${attempt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: next, submit }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    return data as AttemptView;
  }
  function enqueue(next: Answers) {
    pending.current++;
    setSaved('Saving…');
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        try {
          const data = await persist(next);
          if (data.submitted) {
            setAttempt(data);
            clearDraft(storageKey);
          }
          setError('');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not save.');
        } finally {
          pending.current--;
          if (!pending.current) setSaved('Changes stored in this browser');
        }
      });
  }
  function choose(id: string, value: string) {
    const next = { ...answerRef.current, [id]: value };
    answerRef.current = next;
    setAnswers(next);
    writeDraft(storageKey, JSON.stringify(next));
    enqueue(next);
  }
  async function submit() {
    setConfirm(false);
    setBusy(true);
    setError('');
    try {
      await queue.current;
      const data = await persist(answerRef.current, true);
      setAttempt(data);
      setAnswers(data.answers as Answers);
      clearDraft(storageKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit.');
    } finally {
      setBusy(false);
    }
  }
  function navigate(next: number) {
    setIndex(next);
    requestAnimationFrame(() => questionHeading.current?.focus());
  }
  if (attempt.submitted) return <QuizResults attempt={attempt} />;
  const q = attempt.questions[index];
  const answered = Object.keys(answers).length;
  return (
    <div className="quiz-shell">
      {attempt.isDemo && <DraftNotice />}
      <div className="quiz-toolbar">
        <Link href="/practice" className="text-link">
          <ArrowLeft size={13} /> Quiz hub
        </Link>
        <span>{saved}</span>
      </div>
      <div className="quiz-toolbar">
        <span>
          QUESTION {index + 1} OF {attempt.questions.length}
        </span>
        <span>
          {answered} answered · {attempt.questions.length - answered} remaining
        </span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-label="Questions answered"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={attempt.questions.length}
      >
        <span style={{ width: `${(answered / attempt.questions.length) * 100}%` }} />
      </div>
      {attempt.questions.length < 20 && (
        <p className="content-note">
          Shorter quiz: {attempt.questions.length} eligible questions matched your filters.
        </p>
      )}
      {error && (
        <div className="error-message" role="alert">
          {error} Your local answers are preserved.{' '}
          <button className="text-link" onClick={() => enqueue(answerRef.current)}>
            Retry save
          </button>
        </div>
      )}
      <div className="question-panel">
        <p className="eyebrow">
          {q.categoryName} · {q.difficulty.toLowerCase()}
        </p>
        <h1 ref={questionHeading} tabIndex={-1} id="question-text">
          {q.text}
        </h1>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} aria-labelledby="question-text">
          <legend className="sr-only">Select the single best answer</legend>
          {q.options.map((o, i) => (
            <label
              key={o.id}
              className={`answer-option ${answers[q.id] === o.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={answers[q.id] === o.id}
                disabled={busy}
                onChange={() => choose(q.id, o.id)}
              />
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <div className="quiz-controls">
        <button
          className="button button-outline"
          disabled={index === 0 || busy}
          onClick={() => navigate(index - 1)}
        >
          <ArrowLeft size={16} /> Previous
        </button>
        <span className="small-label">Single best answer</span>
        <button
          className="button"
          disabled={index === attempt.questions.length - 1 || busy}
          onClick={() => navigate(index + 1)}
        >
          Next <ArrowRight size={16} />
        </button>
      </div>
      <nav className="question-nav" aria-label="Question navigation">
        {attempt.questions.map((q, i) => (
          <button
            key={q.id}
            disabled={busy}
            className={`${answers[q.id] ? 'answered' : ''} ${index === i ? 'current' : ''}`}
            aria-label={`Question ${i + 1}${answers[q.id] ? ', answered' : ', unanswered'}`}
            aria-current={index === i ? 'step' : undefined}
            onClick={() => navigate(i)}
          >
            {i + 1}
          </button>
        ))}
      </nav>
      <div className="quiz-bottom">
        <p>
          Change any answer before submitting.
          <br />
          Explanations appear after your quiz is submitted.
        </p>
        <button
          className="button"
          disabled={busy}
          onClick={() => (answered < attempt.questions.length ? setConfirm(true) : submit())}
        >
          {busy ? 'Submitting…' : 'Submit quiz'} <Check size={16} />
        </button>
      </div>
      {confirm && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirm(false);
          }}
        >
          <div
            className="modal"
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <h2 id="confirm-title">A few questions are unanswered.</h2>
            <p id="confirm-description">
              You have {attempt.questions.length - answered} unanswered question
              {attempt.questions.length - answered === 1 ? '' : 's'}. They will count as incorrect.
              Submit now or return to your quiz.
            </p>
            <div className="modal-actions">
              <button
                ref={cancel}
                className="button button-outline"
                onClick={() => setConfirm(false)}
              >
                Keep practising
              </button>
              <button className="button" onClick={submit}>
                Submit anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function QuizResults({ attempt }: { attempt: AttemptView }) {
  const result = attempt.result as QuizResult;
  const questions = attempt.questions as SnapshotQuestion[];
  const answers = attempt.answers as Answers;
  return (
    <div className="quiz-shell">
      {attempt.isDemo && <DraftNotice />}
      <Link href="/practice" className="text-link">
        <ArrowLeft size={13} /> Quiz hub
      </Link>
      <div className="page-intro">
        <p className="eyebrow">Keep the learning going</p>
        <h1>Your practice, unpacked.</h1>
        <MascotArtwork moment="feedback" />
        <p className="lead">
          Look beyond the score. Revisit the reasoning and explore the concepts behind each
          question.
        </p>
      </div>
      <div className="score-banner">
        <div className="score-circle">{result.percentage}%</div>
        <div>
          <h2>
            {result.correct} of {result.total} correct
          </h2>
          <p>
            {result.answered} answered · {result.total - result.answered} unanswered
            <br />
            {attempt.isDemo
              ? 'Demonstration score using unreviewed draft questions.'
              : 'Your attempt has been submitted and saved.'}
          </p>
        </div>
      </div>
      <h2 style={{ fontSize: 'var(--text-subheading)' }}>Your topics at a glance</h2>
      <div className="category-performance">
        {Object.entries(result.categories).map(([name, c]) => (
          <div key={name}>
            <span>{name}</span>
            <div className="progress-bar">
              <span style={{ width: `${(c.correct / c.total) * 100}%` }} />
            </div>
            <span>
              {c.correct} / {c.total}
            </span>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <h2 style={{ fontSize: 'var(--text-section)' }}>The science behind your answers.</h2>
        <Link href="/practice" className="text-link">
          Practise again <RotateCcw size={14} />
        </Link>
      </div>
      {questions.map((q, i) => {
        const selected = q.options.find((o) => o.id === answers[q.id]);
        return (
          <article className="review-card" key={q.id}>
            <span className={`result-label ${selected?.isCorrect ? 'correct' : 'incorrect'}`}>
              {selected?.isCorrect ? <Check size={13} /> : <X size={13} />} QUESTION {i + 1} ·{' '}
              {selected ? (selected.isCorrect ? 'CORRECT' : 'INCORRECT') : 'UNANSWERED'}
            </span>
            <h3>{q.text}</h3>
            {q.options.map((o) => (
              <div
                className={`review-option ${o.isCorrect ? 'correct' : o.id === selected?.id ? 'incorrect' : ''}`}
                key={o.id}
              >
                <span>{o.text}</span>
                <small>
                  {o.isCorrect ? 'Correct answer' : ''}
                  {o.id === selected?.id ? ' · Your answer' : ''}
                </small>
              </div>
            ))}
            <div className="review-explanation">
              <h4>Understand the concept</h4>
              <p>{q.explanation}</p>
              {selected?.explanation && <p>{selected.explanation}</p>}
            </div>
            {q.lessons.map((l) => (
              <p key={l.url}>
                <Link className="text-link" href={l.url}>
                  Review this concept: {l.title} <ArrowUpRight size={14} />
                </Link>
              </p>
            ))}
            {q.references.length > 0 && (
              <div className="references">
                {q.references.map((r) => (
                  <p key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.title}
                    </a>
                  </p>
                ))}
              </div>
            )}
          </article>
        );
      })}
      <Link href="/practice" className="button">
        Start another quiz <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
