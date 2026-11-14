import Link from 'next/link';
import type { Metadata } from 'next';
import { publishedLessons, draftLessons, lessonUrl } from '@/lib/content';
import { siteState, upcomingLessons } from '@/lib/visibility';
import { PageIntro, Breadcrumbs, LessonCard, UpcomingList } from '@/components/ui';
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
  const state = await siteState();
  const categories = state.lessonCategories;
  const activeCategory = categories.find((c) => c.slug === params.category);
  const [all, drafts, upcoming] = await Promise.all([
    publishedLessons(),
    state.isAdmin ? draftLessons() : Promise.resolve([]),
    upcomingLessons(activeCategory?.id),
  ]);
  const matches = (l: (typeof all)[number]) =>
    (!params.category || l.category.slug === params.category) &&
    (!params.difficulty || l.difficulty === params.difficulty) &&
    (!params.subtopic || l.subtopic === params.subtopic) &&
    (!params.q ||
      `${l.title} ${l.description} ${l.subtopic} ${l.category.name}`
        .toLowerCase()
        .includes(params.q.toLowerCase()));
  const published = all.filter(matches);
  const draftMatches = drafts.filter(matches);
  const filtering = !!(params.q || params.difficulty || params.subtopic);
  const subtopics = [
    ...new Set(
      all
        .filter((l) => !params.category || l.category.slug === params.category)
        .map((l) => l.subtopic),
    ),
  ].filter(Boolean);
  return (
    <div className="container learn-hub">
      <Breadcrumbs items={[{ label: 'Learning hub' }]} />
      <PageIntro
        eyebrow="The learning hub"
        title="Understand the why."
        description="Build a connected understanding of clinical chemistry. Start with a topic, follow your curiosity and put each concept into practice."
      />
      <div className={categories.length ? 'learning-layout' : 'learning-layout no-sidebar'}>
        {categories.length > 0 && (
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
        )}
        <div>
          {all.length > 0 && (
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
              {subtopics.length > 1 && (
                <label className="field">
                  <span>Subtopic</span>
                  <select name="subtopic" defaultValue={params.subtopic || ''}>
                    <option value="">All subtopics</option>
                    {subtopics.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}
              <button className="button button-small" type="submit">
                Search
              </button>
            </form>
          )}
          {published.length > 0 ? (
            <>
              <p className="count-label">
                {published.length} lesson{published.length === 1 ? '' : 's'}
              </p>
              <div className="lesson-grid">
                {published.map((l) => (
                  <LessonCard key={l.id} lesson={{ ...l, url: lessonUrl(l) }} />
                ))}
              </div>
            </>
          ) : all.length === 0 ? (
            <div className="empty-state">
              <h3>The first lessons are on their way.</h3>
              <p>
                Each lesson is written, referenced and reviewed before it appears here. Check back
                soon.
              </p>
            </div>
          ) : (
            <p className="muted">
              No lessons match {filtering ? 'these filters' : 'this topic yet'}.{' '}
              <Link className="text-link" href="/learn">
                Show all lessons
              </Link>
            </p>
          )}
          {!filtering && <UpcomingList items={upcoming} showCategory={!activeCategory} />}
          {state.isAdmin && draftMatches.length > 0 && (
            <>
              <div className="section-heading" style={{ marginTop: 35 }}>
                <div>
                  <p className="eyebrow">Visible to administrators only</p>
                  <h2 style={{ fontSize: 'var(--text-subheading)' }}>Unpublished lessons</h2>
                </div>
              </div>
              <div className="lesson-grid">
                {draftMatches.map((l) => (
                  <LessonCard key={l.id} lesson={{ ...l, url: lessonUrl(l) }} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
