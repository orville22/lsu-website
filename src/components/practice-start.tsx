'use client';
import { useState } from 'react';
import { TopicArt } from './brand/topic-art';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Shuffle, SlidersHorizontal } from 'lucide-react';
type Category = { id: string; name: string; published: number; demo: number; subtopics: string[] };
export function PracticeStart({
  categories,
  initialCategory = '',
  initialDemo = false,
}: {
  categories: Category[];
  initialCategory?: string;
  initialDemo?: boolean;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [demo, setDemo] = useState(initialDemo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selected = categories.find((c) => c.id === category);
  const total = categories.reduce((n, c) => n + (demo ? c.demo : c.published), 0);
  async function start(topic: boolean) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo,
          ...(topic
            ? {
                categoryId: category || undefined,
                subtopic: subtopic || undefined,
                difficulty: difficulty || undefined,
              }
            : {}),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      router.push(`/practice/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start quiz.');
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-note">
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} /> Use
          draft demonstration questions
        </label>
        <p style={{ marginTop: 10 }}>
          {demo
            ? 'Demo mode uses AI-generated, unreviewed questions and is for testing the platform.'
            : 'Standard practice selects only reviewed, published questions.'}{' '}
          {total} question{total === 1 ? '' : 's'} available.
        </p>
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      <div className="quiz-hub-grid">
        <section className="panel practice-mode random-mode">
          <TopicArt kind="qc" className="practice-mode-art" />
          <Shuffle size={25} color="var(--action)" />
          <p className="eyebrow" style={{ marginTop: 20 }}>
            Follow your curiosity
          </p>
          <h2>Mix it up.</h2>
          <p>
            A fresh selection across clinical chemistry. Build breadth and discover the concepts
            worth another look.
          </p>
          <ul className="feature-list">
            <li>
              <Check size={14} /> Up to 20 unique questions
            </li>
            <li>
              <Check size={14} /> 40% beginner · 40% intermediate · 20% advanced
            </li>
            <li>
              <Check size={14} /> Topic coverage where the pool allows
            </li>
            <li>
              <Check size={14} /> Detailed explanations after submission
            </li>
          </ul>
          {total < 20 && (
            <p className="content-note">
              {total === 0
                ? 'The published question bank is awaiting editorial review. Enable the draft demo to test the experience.'
                : `This pool contains ${total} questions. Your quiz will be shorter than 20 questions.`}
            </p>
          )}
          <button className="button" disabled={busy} onClick={() => start(false)}>
            {busy ? 'Preparing…' : demo ? 'Start random demo' : 'Start random practice'}{' '}
            <ArrowUpRight size={17} />
          </button>
        </section>
        <section className="panel practice-mode topic-mode">
          <TopicArt kind="ions" className="practice-mode-art" />
          <SlidersHorizontal size={25} color="var(--action)" />
          <p className="eyebrow" style={{ marginTop: 20 }}>
            Focus your practice
          </p>
          <h2>Work on a topic.</h2>
          <p>Choose an area to revisit. Narrow it further by subtopic or difficulty.</p>
          <label className="field">
            <span>Clinical chemistry topic</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubtopic('');
              }}
            >
              <option value="">All topics</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({demo ? c.demo : c.published})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Subtopic</span>
            <select value={subtopic} onChange={(e) => setSubtopic(e.target.value)}>
              <option value="">All subtopics</option>
              {(selected?.subtopics || []).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Balanced mix</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          {selected && (
            <p className="content-note">
              {demo ? selected.demo : selected.published} questions before difficulty and subtopic
              filters. If fewer than 20 match, your quiz includes the available questions.
            </p>
          )}
          <button className="button button-outline" disabled={busy} onClick={() => start(true)}>
            Start topic {demo ? 'demo' : 'practice'} <ArrowUpRight size={17} />
          </button>
        </section>
      </div>
      <div className="admin-note">
        <strong>Designed for learning, at your pace.</strong> No timer or account required. Answers
        are saved to this browser’s anonymous session. Exam simulation is planned for a future
        release.
      </div>
    </>
  );
}
