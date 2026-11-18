import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { siteState } from '@/lib/visibility';
import { comingSoonEnabled } from '@/lib/reviewers';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || 'http://localhost:3000';
  // While coming soon, every other URL shows the same holding page.
  if (comingSoonEnabled())
    return [{ url: base }, { url: base + '/privacy' }, { url: base + '/review' }];
  const { show } = await siteState();
  const sections = [
    '',
    '/learn',
    ...(show.practice ? ['/practice'] : []),
    ...(show.cases ? ['/cases'] : []),
    ...(show.watch ? ['/watch'] : []),
    '/review',
    '/privacy',
  ];
  const lessons = await db.lesson.findMany({
    where: { status: 'PUBLISHED', reviewedAt: { not: null } },
    include: { category: { include: { discipline: true } } },
  });
  return [
    ...sections.map((path) => ({ url: base + path })),
    ...lessons.map((l) => ({
      url: `${base}/learn/${l.category.discipline.slug}/${l.category.slug}/${l.slug}`,
      lastModified: l.updatedAt,
    })),
  ];
}
