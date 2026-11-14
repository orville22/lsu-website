import Link from 'next/link';
import type { Metadata } from 'next';
import { lessons, lessonUrl, catalog } from '@/lib/content';
import { PageIntro, Breadcrumbs, LessonCard, DraftNotice } from '@/components/ui';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Learning hub',
  description: 'Browse structured clinical chemistry lessons by topic, difficulty and subtopic.',
  alternates: { canonical: '/learn' },
};
export default async function Learn({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; difficulty?: string; subtopic?: string }>;
}) {
  const params = await searchParams;
  const [all, categories] = await Promise.all([lessons(), catalog()]);
  const filtered = all.filter(
    (l) =>
      (!params.category || l.category.slug === params.category) &&
      (!params.difficulty || l.difficulty === params.difficulty) &&
      (!params.subtopic || l.subtopic === params.subtopic) &&
      (!params.q ||
        `${l.title} ${l.description} ${l.subtopic} ${l.category.name}`
          .toLowerCase()
          .includes(params.q.toLowerCase())),
  );
  const published = filtered.filter((l) => l.status === 'PUBLISHED');
  const demos = filtered.filter((l) => l.status === 'DRAFT');
  return (
    <div className="container learn-hub">
      <Breadcrumbs items={[{ label: 'Learning hub' }]} />
      <PageIntro
        eyebrow="The learning hub"
        title="Understand the why."
        description="Build a connected understanding of clinical chemistry. Start with a topic, follow your curiosity and put each concept into practice."
      />
      <div className="learning-layout">
        <aside className="topic-sidebar" aria-label="Learning topics">
          <h2>Clinical Chemistry</h2>
          <Link href="/learn" className={!params.category ? 'active' : ''}>
            All topics
          </Link>
          {categories.map((c) => (
            <Link
              href={`/learn?category=${c.slug}`}
              key={c.id}
              className={params.category === c.slug ? 'active' : ''}
            >
              {c.name}
            </Link>
          ))}
        </aside>
        <div>
          <form id="search" className="filters" action="/learn">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <label className="field">
              <span>Find a concept</span>
              <input
                name="q"
                type="search"
                placeholder="Sodium, immunoassays, quality control…"
                defaultValue={params.q}
              />
            </label>
            <label className="field">
              <span>Difficulty</span>
              <select name="difficulty" defaultValue={params.difficulty || ''}>
                <option value="">All levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <label className="field">
              <span>Subtopic</span>
              <select name="subtopic" defaultValue={params.subtopic || ''}>
                <option value="">All subtopics</option>
                {[
                  ...new Set(
                    all
                      .filter((l) => !params.category || l.category.slug === params.category)
                      .map((l) => l.subtopic),
                  ),
                ]
                  .filter(Boolean)
                  .map((s) => (
                    <option key={s}>{s}</option>
                  ))}
              </select>
            </label>
            <button className="button button-small" type="submit">
              Search
            </button>
          </form>
          {published.length > 0 && (
            <>
              <p className="count-label">
                {published.length} published lesson{published.length === 1 ? '' : 's'}
              </p>
              <div className="lesson-grid">
                {published.map((l) => (
                  <LessonCard key={l.id} lesson={{ ...l, url: lessonUrl(l) }} />
                ))}
              </div>
            </>
          )}
          {!published.length && (
            <div className="empty-state">
              <h3>The library is taking shape.</h3>
              <p>
                Reviewed lessons will appear here after editorial approval. You can explore the
                clearly labelled draft previews below.
              </p>
            </div>
          )}
          {demos.length > 0 && (
            <>
              <div className="section-heading" style={{ marginTop: 35 }}>
                <div>
                  <p className="eyebrow">Behind the scenes</p>
                  <h2 style={{ fontSize: 'var(--text-subheading)' }}>Draft lesson previews</h2>
                </div>
              </div>
              <DraftNotice />
              <p className="count-label">
                {demos.length} draft preview{demos.length === 1 ? '' : 's'}
              </p>
              <div className="lesson-grid">
                {demos.map((l) => (
                  <LessonCard key={l.id} lesson={{ ...l, url: lessonUrl(l) }} />
                ))}
              </div>
            </>
          )}
          {!filtered.length && (
            <p className="muted">
              No lessons match these filters.{' '}
              <Link className="text-link" href="/learn">
                Clear filters
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
