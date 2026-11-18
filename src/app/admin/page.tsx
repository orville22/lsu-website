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
import { AdminFeedbackActions, AdminReviewerActions } from '@/components/review';
import { reviewerRoles } from '@/lib/reviewers';
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
    'feedback',
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
          ['feedback', 'Feedback'],
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
            <Reviewers />
          ) : tab === 'feedback' ? (
            <FeedbackList showResolved={p.status === 'resolved'} />
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

const roleLabel = (r: string) => reviewerRoles[r as keyof typeof reviewerRoles] ?? r;
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '—');

async function Reviewers() {
  const rows = await db.reviewer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { feedback: true } } },
  });
  const requested = rows.filter((r) => r.status === 'REQUESTED');
  const approved = rows.filter((r) => r.status === 'APPROVED');
  const ended = rows.filter((r) => r.status === 'DECLINED' || r.status === 'REVOKED');
  return (
    <>
      <div className="stats-grid">
        {[
          ['Waiting for a decision', requested.length],
          ['Active reviewers', approved.length],
          ['Feedback received', rows.reduce((n, r) => n + r._count.feedback, 0)],
          ['Happy to be credited', approved.filter((r) => r.creditConsent).length],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="muted">
        Lessons set to <strong>In review</strong> are visible to active reviewers at{' '}
        <code>/review</code>. Approving a request emails a personal link; a new link replaces the
        old one.
      </p>
      <h2>Requests</h2>
      {requested.length ? (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Role and note</th>
                <th>Asked</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {requested.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <br />
                    {r.email}
                    {r.country && <span className="muted"> · {r.country}</span>}
                  </td>
                  <td>
                    {roleLabel(r.role)}
                    {r.creditConsent && <span className="muted"> · happy to be credited</span>}
                    {r.note && <p className="small">{r.note}</p>}
                  </td>
                  <td>{day(r.createdAt)}</td>
                  <td>
                    <AdminReviewerActions id={r.id} actions={['approve', 'decline', 'delete']} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No requests waiting.</p>
      )}
      <h2>Active reviewers</h2>
      {approved.length ? (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Invited</th>
                <th>Last seen</th>
                <th>Feedback</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <br />
                    {r.email}
                  </td>
                  <td>{roleLabel(r.role)}</td>
                  <td>{day(r.invitedAt)}</td>
                  <td>{day(r.lastSeenAt)}</td>
                  <td>{r._count.feedback}</td>
                  <td>
                    <AdminReviewerActions id={r.id} actions={['resend', 'revoke', 'delete']} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No active reviewers yet.</p>
      )}
      {ended.length > 0 && (
        <>
          <h2>Declined or revoked</h2>
          <p className="muted">Deleted automatically 30 days after the decision.</p>
          <div className="admin-table">
            <table>
              <tbody>
                {ended.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.name} · {r.email}
                    </td>
                    <td>{r.status === 'DECLINED' ? 'Declined' : 'Revoked'}</td>
                    <td>{day(r.updatedAt)}</td>
                    <td>
                      <AdminReviewerActions id={r.id} actions={['approve', 'delete']} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

const levelLabel: Record<string, string> = {
  TOO_BASIC: 'Too basic',
  ABOUT_RIGHT: 'About right',
  TOO_ADVANCED: 'Too advanced',
};

async function FeedbackList({ showResolved }: { showResolved: boolean }) {
  const [rows, counts] = await Promise.all([
    db.feedback.findMany({
      where: { status: showResolved ? 'RESOLVED' : 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: { reviewer: { select: { name: true, role: true } } },
      take: 300,
    }),
    db.feedback.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const pages = new Map<string, typeof rows>();
  for (const r of rows) pages.set(r.path, [...(pages.get(r.path) ?? []), r]);
  return (
    <>
      <div className="form-actions">
        <Link
          className={`button button-small ${showResolved ? 'button-outline' : ''}`}
          href="/admin?tab=feedback"
        >
          Open ({count('OPEN')})
        </Link>
        <Link
          className={`button button-small ${showResolved ? '' : 'button-outline'}`}
          href="/admin?tab=feedback&status=resolved"
        >
          Resolved ({count('RESOLVED')})
        </Link>
        <a className="button button-small button-outline" href="/api/admin/feedback">
          Export all feedback (CSV)
        </a>
      </div>
      {pages.size === 0 && <p className="empty-state">Nothing here yet.</p>}
      {[...pages.entries()].map(([path, items]) => (
        <section key={path} className="feedback-group">
          <h2>
            <a className="text-link" href={path} target="_blank" rel="noreferrer">
              {items[0].pageTitle || path}
            </a>{' '}
            <span className="muted small">
              {path} · {items.length} item{items.length === 1 ? '' : 's'}
            </span>
          </h2>
          {items.map((f) => (
            <article key={f.id} className="feedback-item">
              <header>
                <strong>
                  {f.kind === 'ERROR'
                    ? 'Error report (anonymous)'
                    : f.reviewer
                      ? `${f.reviewer.name} · ${roleLabel(f.reviewer.role)}`
                      : 'Reviewer (details removed or administrator test)'}
                </strong>
                <span className="muted small">
                  {f.createdAt.toISOString().slice(0, 16).replace('T', ' ')} UTC
                </span>
              </header>
              <dl>
                {f.clarity !== null && (
                  <>
                    <dt>Clarity</dt>
                    <dd>{f.clarity} / 5</dd>
                  </>
                )}
                {f.level && (
                  <>
                    <dt>Level</dt>
                    <dd>{levelLabel[f.level] ?? f.level}</dd>
                  </>
                )}
                {(
                  [
                    ['Accuracy', f.accuracy],
                    ['Illustrations', f.illustrations],
                    ['Missing or confusing', f.missing],
                    [f.kind === 'ERROR' ? 'Report' : 'Other', f.comment],
                  ] as const
                ).map(([label, text]) =>
                  text ? (
                    <div key={label} className="feedback-text">
                      <dt>{label}</dt>
                      <dd>{text}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
              <AdminFeedbackActions id={f.id} status={f.status} />
            </article>
          ))}
        </section>
      ))}
    </>
  );
}
