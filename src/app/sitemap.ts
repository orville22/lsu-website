import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { siteState } from '@/lib/visibility';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || 'http://localhost:3000';
  const { show } = await siteState();
  const sections = [
    '',
    '/learn',
    ...(show.practice ? ['/practice'] : []),
    ...(show.cases ? ['/cases'] : []),
    ...(show.watch ? ['/watch'] : []),
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
