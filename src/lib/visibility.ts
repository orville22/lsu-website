import 'server-only';
import { cache } from 'react';
import { db } from './db';
import { admin } from './security';
import { siteConfig } from './site-config';
import { categoryDefinitions } from './catalog';

const curriculumOrder = new Map<string, number>(categoryDefinitions.map(([slug], i) => [slug, i]));
export const byCurriculum = (
  a: { slug: string; name: string },
  b: { slug: string; name: string },
) =>
  (curriculumOrder.get(a.slug) ?? 999) - (curriculumOrder.get(b.slug) ?? 999) ||
  a.name.localeCompare(b.name);

const publishedWhere = { status: 'PUBLISHED' as const, reviewedAt: { not: null } };

/**
 * What the public site has to show, computed once per request.
 * Every nav item, homepage section and call to action is derived from this.
 */
export const siteState = cache(async () => {
  const [session, categories, questionCount] = await Promise.all([
    admin(),
    db.category.findMany({
      include: {
        discipline: true,
        _count: {
          select: {
            lessons: { where: publishedWhere },
            questions: { where: publishedWhere },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    db.question.count({ where: publishedWhere }),
  ]);
  const isAdmin = !!session;
  const lessonCount = categories.reduce((n, c) => n + c._count.lessons, 0);
  const practiceOpen = questionCount >= siteConfig.topicPracticeMinQuestions;
  return {
    isAdmin,
    lessonCount,
    questionCount,
    /** Categories with at least one published lesson, in curriculum order. */
    lessonCategories: categories.filter((c) => c._count.lessons > 0).sort(byCurriculum),
    /** Category IDs with enough published questions for topic practice. */
    practiceCategoryIds: new Set(
      categories
        .filter((c) => c._count.questions >= siteConfig.topicPracticeMinQuestions)
        .map((c) => c.id),
    ),
    show: {
      /** Linked from navigation and the homepage. */
      practice: questionCount >= siteConfig.practiceMinQuestions,
      /** Reachable at all (topic practice links from lessons). */
      practicePage: practiceOpen || isAdmin,
      cases: siteConfig.casesEnabled,
      casesPage: siteConfig.casesEnabled || isAdmin,
      watch: siteConfig.watchEnabled,
      watchPage: siteConfig.watchEnabled || isAdmin,
      youtubeUrl: siteConfig.youtubeUrl,
    },
  };
});
export type SiteState = Awaited<ReturnType<typeof siteState>>;

/** Lessons announced as coming next: titles only, never linked. */
export function upcomingLessons(categoryId?: string) {
  return db.lesson.findMany({
    where: {
      listAsUpcoming: true,
      status: { in: ['DRAFT', 'IN_REVIEW'] },
      ...(categoryId ? { categoryId } : {}),
    },
    select: { id: true, title: true, category: { select: { name: true, slug: true } } },
    orderBy: [{ category: { name: 'asc' } }, { createdAt: 'asc' }],
  });
}
