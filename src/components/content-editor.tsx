'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Block } from '@/lib/validation';
import { interactiveKeys, type InteractiveKey } from '@/lib/interactive-keys';
type Category = { id: string; name: string };
type LinkedLesson = { id: string; title: string };
type EditorInitial = {
  id?: string;
  version?: number;
  text?: string;
  title?: string;
  description?: string;
  slug?: string;
  subtopic?: string;
  categoryId?: string;
  difficulty?: string;
  status?: string;
  author?: string;
  references?: unknown;
  explanation?: string;
  tags?: string[];
  options?: { text: string; isCorrect: boolean; explanation?: string }[];
  lessonIds?: string[];
  readingMinutes?: number;
  depth?: string;
  listAsUpcoming?: boolean;
  objectives?: string[];
  takeaways?: string[];
  blocks?: unknown;
};
type RefDraft = { citation: string; doi: string; pmid: string; url: string };
const blankRef: RefDraft = { citation: '', doi: '', pmid: '', url: '' };
function toRefDrafts(raw: unknown): RefDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: Record<string, unknown>) => ({
    citation: String(r.citation ?? r.title ?? ''),
    doi: String(r.doi ?? ''),
    pmid: String(r.pmid ?? ''),
    url: String(r.url ?? ''),
  }));
}
const formattingHelp =
  'Formatting: one paragraph per line · "- " bullets · "1. " numbered list · **bold** · *italic* · H~2~O · Na^+^ · cite references as [1], [1,3] or [2–4] · links as [text](https://…)';
const emptyBlocks: Block[] = [
  { id: 'principle', type: 'text', heading: 'The principle', text: '' },
];
export function ContentEditor({
  kind,
  initial = {},
  categories,
  lessons,
}: {
  kind: 'questions' | 'lessons';
  initial?: EditorInitial;
  categories: Category[];
  lessons: LinkedLesson[];
}) {
  const router = useRouter();
  const isQuestion = kind === 'questions';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>((initial.blocks || emptyBlocks) as Block[]);
  const [options, setOptions] = useState(
    initial.options ||
      Array.from({ length: 4 }, (_, i) => ({ text: '', isCorrect: i === 0, explanation: '' })),
  );
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [refs, setRefs] = useState<RefDraft[]>(toRefDrafts(initial.references));
  function changeRef(index: number, patch: Partial<RefDraft>) {
    setRefs(refs.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  const [status, setStatus] = useState(initial.status || 'DRAFT');
  function changeBlock(index: number, patch: Record<string, unknown>) {
    setBlocks(blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as Block) : b)));
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const base = {
        id: initial.id,
        version: initial.version,
        categoryId: f.get('categoryId'),
        subtopic: f.get('subtopic'),
        difficulty: f.get('difficulty'),
        status,
        author: f.get('author'),
        // Empty optional fields are dropped by server validation.
        references: refs.filter((r) => r.citation.trim() || r.doi.trim() || r.url.trim()),
        reviewed: f.get('reviewed') === 'on',
      };
      const body = isQuestion
        ? {
            ...base,
            text: f.get('text'),
            explanation: f.get('explanation'),
            tags: String(f.get('tags') || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            options,
            lessonIds: f.getAll('lessonIds'),
          }
        : {
            ...base,
            title: f.get('title'),
            slug: f.get('slug'),
            description: f.get('description'),
            readingMinutes: Number(f.get('readingMinutes')),
            depth: f.get('depth'),
            listAsUpcoming: f.get('listAsUpcoming') === 'on',
            objectives: String(f.get('objectives') || '')
              .split('\n')
              .filter(Boolean),
            takeaways: String(f.get('takeaways') || '')
              .split('\n')
              .filter(Boolean),
            blocks,
          };
      const r = await fetch(`/api/admin/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(
          data.issues
            ? data.issues
                .map(
                  (i: { path?: string[]; message: string }) =>
                    `${i.path?.join('.') || 'Form'}: ${i.message}`,
                )
                .join('\n')
            : data.error,
        );
      router.push(`/admin?tab=${kind}&saved=true`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/${kind}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: initial.id, version: initial.version, confirmation: 'DELETE' }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      router.push(`/admin?tab=${kind}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete.');
      setBusy(false);
    }
    setDeleteConfirm(false);
  }
  return (
    <form className="editor-form" onSubmit={save}>
      <div className="admin-note">
        Draft → In Review → Published → Archived. Publishing requires explicit scientific review and
        a verified reference. Every save creates an audit entry.
      </div>
      <div className="form-grid">
        {isQuestion ? (
          <label className="field full-width">
            <span>Question text</span>
            <textarea name="text" required minLength={10} defaultValue={initial.text} />
          </label>
        ) : (
          <>
            <label className="field full-width">
              <span>Lesson title</span>
              <input name="title" required minLength={5} defaultValue={initial.title} />
            </label>
            <label className="field">
              <span>URL slug</span>
              <input
                name="slug"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
                defaultValue={initial.slug}
                placeholder="sodium-homeostasis"
              />
            </label>
            <label className="field">
              <span>Reading time (minutes)</span>
              <input
                type="number"
                name="readingMinutes"
                min={1}
                max={180}
                defaultValue={initial.readingMinutes || 5}
                required
              />
            </label>
            <label className="field">
              <span>Lesson length</span>
              <select name="depth" defaultValue={initial.depth || 'SHORT'}>
                <option value="SHORT">Short lesson (full version in development)</option>
                <option value="FULL">Full lesson</option>
              </select>
            </label>
            <label className="field review-check" style={{ alignSelf: 'end' }}>
              <input
                type="checkbox"
                name="listAsUpcoming"
                defaultChecked={initial.listAsUpcoming}
              />
              <span>
                While unpublished, list this title publicly under “Coming next” (title only, not
                linked).
              </span>
            </label>
            <label className="field full-width">
              <span>Description</span>
              <textarea
                name="description"
                required
                minLength={10}
                defaultValue={initial.description}
              />
            </label>
          </>
        )}
        <label className="field">
          <span>Category</span>
          <select name="categoryId" required defaultValue={initial.categoryId || categories[0]?.id}>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Subtopic</span>
          <input name="subtopic" maxLength={200} defaultValue={initial.subtopic} />
        </label>
        <label className="field">
          <span>Difficulty</span>
          <select name="difficulty" defaultValue={initial.difficulty || 'BEGINNER'}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
        <label className="field">
          <span>Publication status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <label className="field">
          <span>Author</span>
          <input name="author" required defaultValue={initial.author} maxLength={200} />
        </label>
        {isQuestion && (
          <label className="field">
            <span>Tags (comma separated)</span>
            <input name="tags" defaultValue={initial.tags?.join(', ')} />
          </label>
        )}
      </div>
      {isQuestion ? (
        <>
          <h2>Answer options</h2>
          <p className="count-label">
            Select exactly one correct answer. At least four distinct options are required.
          </p>
          {options.map((option, i) => (
            <div className="option-editor" key={i}>
              <input
                type="radio"
                name="correctOption"
                aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}
                checked={option.isCorrect}
                onChange={() => setOptions(options.map((o, j) => ({ ...o, isCorrect: j === i })))}
              />
              <div>
                <label className="field">
                  <span>Option {String.fromCharCode(65 + i)}</span>
                  <input
                    required
                    value={option.text}
                    onChange={(e) =>
                      setOptions(
                        options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span>Optional feedback for this option</span>
                  <input
                    value={option.explanation || ''}
                    onChange={(e) =>
                      setOptions(
                        options.map((o, j) =>
                          j === i ? { ...o, explanation: e.target.value } : o,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          ))}
          <div className="form-actions">
            <button
              type="button"
              className="button button-outline button-small"
              disabled={options.length >= 10}
              onClick={() =>
                setOptions([...options, { text: '', isCorrect: false, explanation: '' }])
              }
            >
              Add option
            </button>
            {options.length > 4 && (
              <button
                type="button"
                className="text-link"
                onClick={() => setOptions(options.slice(0, -1))}
              >
                Remove last option
              </button>
            )}
            <button type="button" className="text-link" onClick={() => setPreview(!preview)}>
              {preview ? 'Hide' : 'Preview'} options
            </button>
          </div>
          {preview && (
            <div className="panel">
              {options.map((o, i) => (
                <p key={i} style={{ color: o.isCorrect ? 'var(--success)' : undefined }}>
                  {String.fromCharCode(65 + i)}. {o.text} {o.isCorrect ? '✓ Correct answer' : ''}
                </p>
              ))}
            </div>
          )}
          <label className="field">
            <span>Detailed scientific explanation</span>
            <textarea
              name="explanation"
              required
              minLength={20}
              defaultValue={initial.explanation}
            />
          </label>
          <h2>Linked lessons</h2>
          <div className="checkbox-list">
            {lessons.map((l) => (
              <label key={l.id}>
                <input
                  type="checkbox"
                  name="lessonIds"
                  value={l.id}
                  defaultChecked={initial.lessonIds?.includes(l.id)}
                />
                {l.title}
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <label className="field">
            <span>Learning objectives (one per line)</span>
            <textarea name="objectives" required defaultValue={initial.objectives?.join('\n')} />
          </label>
          <h2>Lesson content</h2>
          <p className="count-label">
            Content is rendered safely from structured blocks. Section IDs create anchor links.
          </p>
          <p className="count-label">{formattingHelp}</p>
          {blocks.map((block, i) => (
            <div className="panel" key={i} style={{ marginBottom: 20 }}>
              <div className="form-grid">
                <label className="field">
                  <span>Section ID</span>
                  <input
                    value={block.id}
                    onChange={(e) => changeBlock(i, { id: e.target.value })}
                    required
                    pattern="[a-z0-9-]+"
                  />
                </label>
                <label className="field">
                  <span>Block type</span>
                  <input value={block.type} readOnly />
                </label>
                {(block.type === 'text' || block.type === 'callout') && (
                  <>
                    <label className="field full-width">
                      <span>Heading</span>
                      <input
                        value={block.heading}
                        onChange={(e) => changeBlock(i, { heading: e.target.value })}
                      />
                    </label>
                    <label className="field full-width">
                      <span>Text (see formatting guide above)</span>
                      <textarea
                        value={block.text}
                        onChange={(e) => changeBlock(i, { text: e.target.value })}
                      />
                    </label>
                  </>
                )}
                {block.type === 'equation' && (
                  <label className="field full-width">
                    <span>Equation in LaTeX</span>
                    <input
                      value={block.latex}
                      onChange={(e) => changeBlock(i, { latex: e.target.value })}
                    />
                  </label>
                )}
                {block.type === 'image' && (
                  <>
                    <label className="field full-width">
                      <span>Hosted image URL (https)</span>
                      <input
                        type="url"
                        value={block.url}
                        onChange={(e) => changeBlock(i, { url: e.target.value })}
                      />
                    </label>
                    <label className="field full-width">
                      <span>Accessible image description</span>
                      <input
                        value={block.alt}
                        onChange={(e) => changeBlock(i, { alt: e.target.value })}
                      />
                    </label>
                    <label className="field full-width">
                      <span>Caption</span>
                      <input
                        value={block.caption}
                        onChange={(e) => changeBlock(i, { caption: e.target.value })}
                      />
                    </label>
                  </>
                )}
                {block.type === 'video' && (
                  <>
                    <label className="field">
                      <span>YouTube video ID (11 characters)</span>
                      <input
                        value={block.youtubeId}
                        onChange={(e) => changeBlock(i, { youtubeId: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Video title</span>
                      <input
                        value={block.title}
                        onChange={(e) => changeBlock(i, { title: e.target.value })}
                      />
                    </label>
                  </>
                )}
                {block.type === 'interactive' && (
                  <>
                    <label className="field">
                      <span>Illustration or interactive</span>
                      <select
                        value={block.name}
                        onChange={(e) => changeBlock(i, { name: e.target.value as InteractiveKey })}
                      >
                        {interactiveKeys.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Caption</span>
                      <input
                        value={block.caption}
                        onChange={(e) => changeBlock(i, { caption: e.target.value })}
                      />
                    </label>
                  </>
                )}
                {block.type === 'table' && (
                  <>
                    <label className="field full-width">
                      <span>Table caption</span>
                      <input
                        value={block.caption}
                        onChange={(e) => changeBlock(i, { caption: e.target.value })}
                      />
                    </label>
                    <label className="field full-width">
                      <span>Column headings (separated by |)</span>
                      <input
                        value={block.headers.join('|')}
                        onChange={(e) => changeBlock(i, { headers: e.target.value.split('|') })}
                      />
                    </label>
                    <label className="field full-width">
                      <span>Rows (one per line; cells separated by |)</span>
                      <textarea
                        value={block.rows.map((r) => r.join('|')).join('\n')}
                        onChange={(e) =>
                          changeBlock(i, {
                            rows: e.target.value.split('\n').map((r) => r.split('|')),
                          })
                        }
                      />
                    </label>
                  </>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="text-link"
                  disabled={i === 0}
                  onClick={() => {
                    const copy = [...blocks];
                    [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                    setBlocks(copy);
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}
                >
                  Remove block
                </button>
              </div>
            </div>
          ))}
          <label className="field">
            <span>Add a content block</span>
            <select
              value=""
              onChange={(e) => {
                const id = `section-${Date.now()}`;
                const t = e.target.value;
                if (t === 'text' || t === 'callout')
                  setBlocks([...blocks, { id, type: t, heading: '', text: '' }]);
                if (t === 'equation') setBlocks([...blocks, { id, type: 'equation', latex: '' }]);
                if (t === 'image')
                  setBlocks([...blocks, { id, type: 'image', url: '', alt: '', caption: '' }]);
                if (t === 'video')
                  setBlocks([...blocks, { id, type: 'video', youtubeId: '', title: '' }]);
                if (t === 'interactive')
                  setBlocks([
                    ...blocks,
                    { id, type: 'interactive', name: interactiveKeys[0], caption: '' },
                  ]);
                if (t === 'table')
                  setBlocks([
                    ...blocks,
                    {
                      id,
                      type: 'table',
                      caption: '',
                      headers: ['Test', 'Result', 'Unit'],
                      rows: [['', '', '']],
                    },
                  ]);
              }}
            >
              <option value="">Choose a block…</option>
              <option value="text">Text section</option>
              <option value="callout">Learning callout</option>
              <option value="equation">Equation</option>
              <option value="table">Data table</option>
              <option value="image">Image or diagram</option>
              <option value="video">YouTube video</option>
              <option value="interactive">Illustration or interactive</option>
            </select>
          </label>
          <label className="field">
            <span>Key takeaways (one per line)</span>
            <textarea name="takeaways" required defaultValue={initial.takeaways?.join('\n')} />
          </label>
        </>
      )}
      <h2>References</h2>
      <p className="count-label">
        Numbered in this order. Enter each citation in Vancouver style; DOI, PMID and URL become
        links.{' '}
        {isQuestion
          ? ''
          : 'Cite them in the text as [1], [2] … — publishing checks every citation has a matching reference.'}
      </p>
      {refs.map((r, i) => (
        <div className="panel reference-editor" key={i} style={{ marginBottom: 16 }}>
          <label className="field full-width">
            <span>[{i + 1}] Citation (Vancouver)</span>
            <textarea
              value={r.citation}
              rows={2}
              placeholder="Author AA, Author BB. Title of article. Journal Abbrev. 2020;66(1):12-20."
              onChange={(e) => changeRef(i, { citation: e.target.value })}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>DOI</span>
              <input
                value={r.doi}
                placeholder="10.1093/clinchem/…"
                onChange={(e) => changeRef(i, { doi: e.target.value })}
              />
            </label>
            <label className="field">
              <span>PMID</span>
              <input
                value={r.pmid}
                inputMode="numeric"
                onChange={(e) => changeRef(i, { pmid: e.target.value })}
              />
            </label>
            <label className="field full-width">
              <span>URL (stable link, if no DOI)</span>
              <input
                type="url"
                value={r.url}
                onChange={(e) => changeRef(i, { url: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="text-link"
              disabled={i === 0}
              onClick={() => {
                const copy = [...refs];
                [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                setRefs(copy);
              }}
            >
              Move up
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => setRefs(refs.filter((_, j) => j !== i))}
            >
              Remove reference
            </button>
          </div>
        </div>
      ))}
      <div className="form-actions">
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => setRefs([...refs, { ...blankRef }])}
        >
          Add reference
        </button>
      </div>
      <label className="review-check">
        <input type="checkbox" name="reviewed" required={status === 'PUBLISHED'} />
        <span>
          I have reviewed the scientific content, answer key and cited sources, and approve this
          version for publication. Review metadata is recorded for this save.
        </span>
      </label>
      {error && (
        <div className="error-message" role="alert" style={{ whiteSpace: 'pre-wrap' }}>
          {error}
        </div>
      )}
      <div className="form-actions">
        <button className="button" disabled={busy}>
          {busy ? 'Saving…' : `Save ${status.toLowerCase().replace('_', ' ')}`}
        </button>
        <Link className="button button-outline" href={`/admin?tab=${kind}`}>
          Cancel
        </Link>
        {initial.id && (
          <button
            className="button button-danger"
            type="button"
            disabled={busy}
            onClick={() => setDeleteConfirm(true)}
          >
            Delete {isQuestion ? 'question' : 'lesson'}
          </button>
        )}
      </div>
      {deleteConfirm && (
        <div className="admin-note" role="alert">
          <strong>Permanently delete this {isQuestion ? 'question' : 'lesson'}?</strong>
          <p>Existing quiz snapshots are preserved. This content will be removed from the bank.</p>
          <div className="form-actions">
            <button type="button" className="button button-danger" onClick={remove}>
              Confirm permanent deletion
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setDeleteConfirm(false)}
            >
              Keep content
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
