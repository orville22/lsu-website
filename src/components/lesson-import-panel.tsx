'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Summary = {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  depth: string;
  readingMinutes: number;
  objectives: number;
  takeaways: number;
  sections: string[];
  blocks: Record<string, number>;
  references: string[];
  existing: { status: string; version: number; title: string } | null;
};
type Preview = { summary: Summary; errors: string[]; warnings: string[] };

const blockLabels: Record<string, string> = {
  text: 'text sections',
  callout: 'callouts',
  table: 'tables',
  equation: 'equations',
  image: 'images',
  video: 'videos',
};

export function LessonImportPanel() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [publish, setPublish] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ url: string; status: string; title: string } | null>(null);

  function reset(text: string) {
    setMarkdown(text);
    setPreview(null);
    setDone(null);
    setError('');
    setReplace(false);
  }
  async function request(commit: boolean) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/lesson-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, commit, publish, reviewed, replace }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Import failed.');
      if (commit) {
        setDone({ url: data.url, status: data.status, title: data.summary.title });
        setPreview(null);
        setMarkdown('');
        setReviewed(false);
        setReplace(false);
        router.refresh();
      } else setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }
  const s = preview?.summary;
  const blocked = !preview || preview.errors.length > 0 || (!!s?.existing && !replace);
  return (
    <section className="import-panel" id="lesson-import">
      <h2>Import a lesson from Markdown</h2>
      <div className="admin-note">
        Paste a lesson exported from your master copy, or choose a <code>.md</code> file. Check the
        preview, then import it as a Draft or publish it. Re-importing a lesson with the same slug
        updates it in place, so its address doesn’t change.
      </div>
      <div className="form-actions">
        <a
          href="/lesson-import-template.md"
          download
          className="button button-outline button-small"
        >
          Download lesson template
        </a>
      </div>
      <label className="field">
        <span>Choose a Markdown file</span>
        <input
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 450_000) return setError('That file is too large for one lesson.');
            reset(await file.text());
          }}
        />
      </label>
      <label className="field">
        <span>Or paste the lesson</span>
        <textarea
          className="code"
          rows={14}
          value={markdown}
          onChange={(e) => reset(e.target.value)}
          placeholder={
            '---\ntitle: …\ncategory: electrolytes\nlength: short\n---\n\n## Learning objectives\n- …'
          }
        />
      </label>
      <label className="review-check">
        <input
          type="checkbox"
          checked={publish}
          onChange={(e) => {
            setPublish(e.target.checked);
            setPreview(null);
          }}
        />
        <span>Publish now instead of saving as a Draft.</span>
      </label>
      {publish && (
        <label className="review-check">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => {
              setReviewed(e.target.checked);
              setPreview(null);
            }}
          />
          <span>
            I have reviewed the scientific content and verified every cited source, and approve this
            version for publication.
          </span>
        </label>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="button button-outline"
          disabled={busy || !markdown.trim()}
          onClick={() => request(false)}
        >
          {busy && !preview ? 'Checking…' : 'Check & preview'}
        </button>
      </div>
      {error && (
        <div className="error-message" role="alert" style={{ whiteSpace: 'pre-wrap' }}>
          {error}
        </div>
      )}
      {done && (
        <div className="success-message" role="status">
          “{done.title}” imported as {done.status === 'PUBLISHED' ? 'published' : 'a draft'}.{' '}
          <Link className="text-link" href={done.url}>
            {done.status === 'PUBLISHED' ? 'View lesson' : 'Preview lesson'}
          </Link>
        </div>
      )}
      {preview && s && (
        <div className="panel import-preview">
          <h3>{s.title || 'Untitled lesson'}</h3>
          <p className="count-label">
            /{s.slug} · {s.category} · {s.difficulty.toLowerCase()} ·{' '}
            {s.depth === 'SHORT' ? 'short lesson' : 'full lesson'} · {s.readingMinutes} min read
          </p>
          <p>
            {s.objectives} objectives · {s.takeaways} takeaways ·{' '}
            {Object.entries(s.blocks)
              .map(([k, n]) => `${n} ${blockLabels[k] || k}`)
              .join(' · ')}{' '}
            · {s.references.length} references
          </p>
          {s.sections.length > 0 && (
            <>
              <p className="eyebrow">Sections</p>
              <ol>
                {s.sections.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ol>
            </>
          )}
          {s.references.length > 0 && (
            <>
              <p className="eyebrow">References</p>
              <ol className="reference-list">
                {s.references.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            </>
          )}
          {preview.errors.length > 0 && (
            <div className="error-message" role="alert">
              <strong>Fix before importing:</strong>
              <ul>
                {preview.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {preview.warnings.length > 0 && (
            <div className="admin-note">
              <strong>Check:</strong>
              <ul>
                {preview.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {s.existing && (
            <label className="review-check">
              <input
                type="checkbox"
                checked={replace}
                onChange={(e) => setReplace(e.target.checked)}
              />
              <span>
                Replace the existing lesson “{s.existing.title}” ({s.existing.status.toLowerCase()},
                version {s.existing.version}). Its address stays the same.
              </span>
            </label>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="button"
              disabled={busy || blocked}
              onClick={() => request(true)}
            >
              {busy ? 'Importing…' : publish ? 'Import and publish' : 'Import as Draft'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
