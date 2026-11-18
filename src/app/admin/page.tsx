import Link from 'next/link';
import { notFound } from 'next/navigation';
import { admin } from '@/lib/security';
import { db } from '@/lib/db';
import { AdminLogin, AdminLogout } from '@/components/admin-auth';
import { ContentEditor } from '@/components/content-editor';
import { LessonImportPanel } from '@/components/lesson-import-panel';
import { lessonUrl } from '@/lib/content';
import { ImportPanel } from '@/components/import-panel';
import { TaxonomyForm } from '@/components/taxonomy-form';
import { AddReviewerForm, ResolveToggle, ReviewerActions } from '@/components/review';
import {
  FEEDBACK_QUESTIONS,
  FEEDBACK_SHORT_LABELS,
  TRACK_LABELS,
  comingSoonEnabled,
  type FeedbackAnswers,
} from '@/lib/reviewers';
import { emailSettings } from '@/lib/subscribers';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administration', robots: { index: false, follow: false } };
type Params = {
  tab?: string;
  edit?: string;
  q?: string;
  status?: string;
  category?: string;
  difficulty?: string;
  saved?: string;
};
export default async function AdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await admin();
  if (!session)
    return (
      <div className="container">
        <AdminLogin />
      </div>
    );
  const p = await searchParams;
  const tab = [
    'questions',
    'lessons',
    'import',
    'categories',
    'subscribers',
    'reviewers',
    'audit',
  ].includes(p.tab || '')
    ? p.tab!
    : 'overview';
  const [categories, lessonOptions, disciplines] = await Promise.all([
    db.category.findMany({ include: { discipline: true }, orderBy: { name: 'asc' } }),
    db.lesson.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    db.discipline.findMany({ orderBy: { name: 'asc' } }),
  ]);
  let editor = null;
  if (p.edit && (tab === 'questions' || tab === 'lessons')) {
    if (p.edit === 'new')
      editor = <ContentEditor kind={tab} categories={categories} lessons={lessonOptions} />;
    else if (tab === 'questions') {
      const q = await db.question.findUnique({
        where: { id: p.edit },
        include: { options: { orderBy: { position: 'asc' } }, lessons: true },
      });
      if (!q) notFound();
      editor = (
        <ContentEditor
          kind="questions"
          initial={{ ...q, lessonIds: q.lessons.map((l) => l.lessonId) }}
          categories={categories}
          lessons={lessonOptions}
        />
      );
    } else {
      const l = await db.lesson.findUnique({ where: { id: p.edit } });
      if (!l) notFound();
      editor = (
        <ContentEditor kind="lessons" initial={l} categories={categories} lessons={lessonOptions} />
      );
    }
  }
  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      <div className="admin-header">
        <div>
          <p className="eyebrow">LSU Editorial workspace</p>
          <h1>
            {p.edit
              ? `${p.edit === 'new' ? 'New' : 'Edit'} ${tab === 'questions' ? 'question' : 'lesson'}`
              : 'Content administration'}
          </h1>
        </div>
        <AdminLogout />
      </div>
      <nav className="admin-tabs" aria-label="Administration">
        {[
          ['overview', 'Overview'],
          ['questions', 'Questions'],
          ['lessons', 'Lessons'],
          ['import', 'Import & export'],
          ['categories', 'Categories'],
          ['subscribers', 'Subscribers'],
          ['reviewers', 'Reviewers'],
          ['audit', 'Audit history'],
        ].map(([id, label]) => (
          <Link href={`/admin?tab=${id}`} className={tab === id ? 'active' : ''} key={id}>
            {label}
          </Link>
        ))}
      </nav>
      {p.saved && (
        <div className="success-message" role="status">
          Content saved. Publication and review metadata have been updated.
        </div>
      )}
      {editor || (
        <>
          {tab === 'overview' ? (
            <Overview />
          ) : tab === 'import' ? (
            <>
              <LessonImportPanel />
              <h2 style={{ marginTop: 48 }}>Import questions</h2>
              <ImportPanel />
            </>
          ) : tab === 'categories' ? (
            <>
              <TaxonomyForm disciplines={disciplines} />
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Slug</th>
                      <th>Discipline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.slug}</td>
                        <td>{c.discipline.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : tab === 'subscribers' ? (
            <Subscribers />
          ) : tab === 'reviewers' ? (
            <Reviewers params={p} />
          ) : tab === 'audit' ? (
            <Audit />
          ) : (
            <ContentList kind={tab as 'questions' | 'lessons'} params={p} categories={categories} />
          )}
        </>
      )}
    </div>
  );
}
async function Subscribers() {
  const [counts, recent] = await Promise.all([
    db.subscriber.groupBy({ by: ['status'], _count: { _all: true } }),
    db.subscriber.findMany({
      where: { status: 'CONFIRMED' },
      orderBy: { confirmedAt: 'desc' },
      take: 25,
      select: { id: true, email: true, source: true, confirmedAt: true },
    }),
  ]);
  const count = (status: string) => counts.find((c) => c.status === status)?._count._all ?? 0;
  return (
    <>
      <div className="stats-grid">
        {[
          ['Confirmed', count('CONFIRMED')],
          ['Awaiting confirmation', count('PENDING')],
          ['Unsubscribed (kept 30 days)', count('UNSUBSCRIBED')],
          [
            'Phase 1 target',
            `${Math.min(100, Math.round((count('CONFIRMED') / 500) * 100))}% of 500`,
          ],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="form-actions">
        <a className="button" href="/api/admin/subscribers?format=csv">
          Export confirmed subscribers (CSV)
        </a>
      </div>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Signed up from</th>
              <th>Confirmed</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.source || '—'}</td>
                <td>{r.confirmedAt?.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
const reviewerStatus: Record<string, string> = {
  REQUESTED: 'Asked to review',
  INVITED: 'Invited, not opened yet',
  ACTIVE: 'Active',
  REVOKED: 'Access revoked',
  DECLINED: 'Declined',
};
const day = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : '—');
async function Reviewers({ params }: { params: Params }) {
  const show = params.status === 'all' ? undefined : params.status === 'resolved';
  const [reviewers, feedback, counts] = await Promise.all([
    db.reviewer.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { feedback: true } } },
    }),
    db.feedback.findMany({
      where: show === undefined ? {} : { resolved: show },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { reviewer: { select: { name: true, role: true } } },
    }),
    db.feedback.groupBy({ by: ['resolved'], _count: { _all: true } }),
  ]);
  const canEmail = !!emailSettings();
  const open = counts.find((c) => !c.resolved)?._count._all ?? 0;
  const done = counts.find((c) => c.resolved)?._count._all ?? 0;
  const n = (st: string) => reviewers.filter((r) => r.status === st).length;
  return (
    <>
      <div className={comingSoonEnabled() ? 'warning-message' : 'success-message'} role="status">
        {comingSoonEnabled()
          ? 'Coming-soon mode is on: the public sees the coming-soon page. Set COMING_SOON=off in Vercel and redeploy to open the site.'
          : 'Coming-soon mode is off: the site is public. Reviewers can still leave feedback.'}
      </div>
      <div className="stats-grid">
        {[
          ['Requests waiting', n('REQUESTED')],
          ['Active reviewers', n('ACTIVE')],
          [
            'Experts',
            reviewers.filter(
              (r) => r.track === 'expert' && r.status !== 'REVOKED' && r.status !== 'DECLINED',
            ).length,
          ],
          ['Feedback to read', open],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <AddReviewerForm canEmail={canEmail} />
      <h2>People</h2>
      {reviewers.length === 0 ? (
        <div className="empty-state">
          <h3>No reviewers yet</h3>
          <p>Requests from the coming-soon page appear here for you to approve.</p>
        </div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Status</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewers.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>{' '}
                    <span className={`track-pill ${r.track}`}>
                      {TRACK_LABELS[r.track === 'expert' ? 'expert' : 'learner']}
                    </span>
                    <br />
                    {r.email}
                    <br />
                    <span className="count-label">
                      {r.role || '—'} · {r.source === 'request' ? 'asked via form' : 'added by you'}{' '}
                      · {day(r.createdAt)}
                    </span>
                    {r.note && <p className="count-label">“{r.note}”</p>}
                  </td>
                  <td>{reviewerStatus[r.status]}</td>
                  <td>
                    <span className="count-label">
                      Invited {day(r.invitedAt)}
                      <br />
                      Last seen {day(r.lastSeenAt)}
                      <br />
                      {r._count.feedback} feedback
                    </span>
                  </td>
                  <td>
                    <ReviewerActions
                      id={r.id}
                      status={r.status}
                      track={r.track}
                      canEmail={canEmail}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h2 style={{ marginTop: 48 }}>Feedback</h2>
      <nav className="admin-tabs" aria-label="Feedback filter">
        {[
          ['open', `To read (${open})`],
          ['resolved', `Dealt with (${done})`],
          ['all', 'All'],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={`/admin?tab=reviewers&status=${id}`}
            className={(params.status || 'open') === id ? 'active' : ''}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="form-actions">
        <a className="button button-outline" href="/api/admin/feedback">
          Export all feedback (CSV)
        </a>
      </div>
      {feedback.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here</h3>
          <p>Feedback from the button on each page appears here, newest first.</p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedback.map((f) => {
            const a = (f.answers || {}) as FeedbackAnswers;
            return (
              <article key={f.id} className={`feedback-item${f.resolved ? ' resolved' : ''}`}>
                <div className="feedback-meta">
                  <strong>
                    {f.reviewer?.name ?? (f.actor ? `You (${f.actor})` : 'Removed reviewer')}
                  </strong>
                  <span className={`track-pill ${f.track}`}>
                    {TRACK_LABELS[f.track === 'expert' ? 'expert' : 'learner']}
                  </span>
                  {f.reviewer?.role && <span>{f.reviewer.role}</span>}
                  <a className="text-link" href={f.path} target="_blank" rel="noreferrer">
                    {f.path}
                  </a>
                  <span>{f.createdAt.toISOString().slice(0, 16).replace('T', ' ')} UTC</span>
                  <ResolveToggle id={f.id} resolved={f.resolved} />
                </div>
                <dl className="feedback-answers">
                  {FEEDBACK_QUESTIONS[f.track === 'expert' ? 'expert' : 'learner'].map((q) => {
                    const v = a[q.id];
                    const detail = a[`${q.id}Detail`];
                    const flagged = q.type === 'choice' && q.detail && v === q.detail.when;
                    return (
                      <div key={q.id} style={{ display: 'contents' }}>
                        <dt>{FEEDBACK_SHORT_LABELS[q.id] || q.id}</dt>
                        <dd className={flagged ? 'flag' : ''}>
                          {v === undefined ? '—' : q.type === 'scale' ? `${v} / 5` : String(v)}
                          {detail ? `: ${detail}` : ''}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
async function Overview() {
  const [total, published, drafts, lessonTotal, lessonPublished, attempts, submitted] =
    await Promise.all([
      db.question.count(),
      db.question.count({ where: { status: 'PUBLISHED', reviewedAt: { not: null } } }),
      db.question.count({ where: { status: 'DRAFT' } }),
      db.lesson.count(),
      db.lesson.count({ where: { status: 'PUBLISHED', reviewedAt: { not: null } } }),
      db.attempt.count(),
      db.attempt.findMany({
        where: { submittedAt: { not: null } },
        select: { result: true, isDemo: true },
      }),
    ]);
  const scores = submitted
    .filter((a) => !a.isDemo)
    .map((a) => (a.result as { percentage: number }).percentage);
  return (
    <>
      <div className="stats-grid">
        {[
          ['Total questions', total],
          ['Published questions', published],
          ['Draft questions', drafts],
          ['Total lessons', lessonTotal],
          ['Published lessons', lessonPublished],
          ['Quiz attempts', attempts],
          [
            'Average score',
            scores.length
              ? `${Math.round(scores.reduce((n, v) => n + v, 0) / scores.length)}%`
              : '—',
          ],
          ['Submitted demos', submitted.filter((a) => a.isDemo).length],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-note">
        <strong>Your scientific review is the publication gate.</strong>
        <p>
          Demonstration seeds remain Draft. Standard quizzes select only Published questions with
          recorded review metadata. Average scores exclude demo attempts.
        </p>
      </div>
      <div className="form-actions">
        <Link className="button" href="/admin?tab=questions&edit=new">
          Create a question
        </Link>
        <Link className="button button-outline" href="/admin?tab=lessons&edit=new">
          Create a lesson
        </Link>
        <Link className="text-link" href="/admin?tab=import">
          Import a question bank →
        </Link>
      </div>
    </>
  );
}
async function ContentList({
  kind,
  params: p,
  categories,
}: {
  kind: 'questions' | 'lessons';
  params: Params;
  categories: { id: string; name: string }[];
}) {
  const where = {
    ...(p.status && ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'].includes(p.status)
      ? { status: p.status as 'DRAFT' }
      : {}),
    ...(p.category ? { categoryId: p.category } : {}),
    ...(p.difficulty && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(p.difficulty)
      ? { difficulty: p.difficulty as 'BEGINNER' }
      : {}),
  };
  const rows =
    kind === 'questions'
      ? (
          await db.question.findMany({
            where: {
              ...where,
              ...(p.q ? { text: { contains: p.q, mode: 'insensitive' as const } } : {}),
            },
            include: { category: true },
            orderBy: { updatedAt: 'desc' },
            take: 100,
          })
        ).map((q) => ({ ...q, title: q.text, viewUrl: null as string | null }))
      : (
          await db.lesson.findMany({
            where: {
              ...where,
              ...(p.q ? { title: { contains: p.q, mode: 'insensitive' as const } } : {}),
            },
            include: { category: { include: { discipline: true } } },
            orderBy: { updatedAt: 'desc' },
            take: 100,
          })
        ).map((l) => ({
          ...l,
          viewUrl: l.status === 'ARCHIVED' ? null : (lessonUrl(l) as string | null),
        }));
  return (
    <>
      <div className="section-heading">
        <div>
          <h2 style={{ fontSize: 'var(--text-subheading)' }}>
            {kind === 'questions' ? 'Question bank' : 'Lesson library'}
          </h2>
          <p className="muted">Search before creating content to detect potential duplicates.</p>
        </div>
        <div className="form-actions" style={{ margin: 0 }}>
          {kind === 'lessons' && (
            <Link
              className="button button-outline button-small"
              href="/admin?tab=import#lesson-import"
            >
              Import from Markdown
            </Link>
          )}
          <Link className="button button-small" href={`/admin?tab=${kind}&edit=new`}>
            Create {kind === 'questions' ? 'question' : 'lesson'}
          </Link>
        </div>
      </div>
      <form className="filters">
        <input type="hidden" name="tab" value={kind} />
        <label className="field">
          <span>Search</span>
          <input name="q" defaultValue={p.q} placeholder="Search text…" />
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={p.status || ''}>
            <option value="">All statuses</option>
            {['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={p.category || ''}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Difficulty</span>
          <select name="difficulty" defaultValue={p.difficulty || ''}>
            <option value="">All levels</option>
            {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <button className="button button-small">Filter</button>
      </form>
      <p className="count-label">
        Showing up to 100 matching records. Refine filters for larger banks.
      </p>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>{kind === 'questions' ? 'Question' : 'Lesson'}</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Version</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.category.name}</td>
                <td>{r.difficulty.toLowerCase()}</td>
                <td>
                  <span className="tag">{r.status.replace('_', ' ')}</span>
                </td>
                <td>{r.version}</td>
                <td>
                  <Link className="text-link" href={`/admin?tab=${kind}&edit=${r.id}`}>
                    Edit →
                  </Link>
                  {r.viewUrl && (
                    <>
                      {' · '}
                      <Link className="text-link" href={r.viewUrl}>
                        {r.status === 'PUBLISHED' ? 'View' : 'Preview'}
                      </Link>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty-state">
          <p>No content matches these filters.</p>
        </div>
      )}
    </>
  );
}
async function Audit() {
  const rows = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <>
      <p className="count-label">
        Latest 100 changes. Audit records preserve before and after content for important edits.
      </p>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Time (UTC)</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.createdAt.toISOString()}</td>
                <td>{r.actor}</td>
                <td>{r.action}</td>
                <td>
                  {r.entity} · {r.entityId}
                </td>
                <td>
                  <details>
                    <summary>View changes</summary>
                    <pre
                      style={{
                        maxWidth: 500,
                        maxHeight: 300,
                        overflow: 'auto',
                        fontSize: 'var(--text-micro)',
                      }}
                    >
                      {JSON.stringify({ before: r.before, after: r.after }, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
