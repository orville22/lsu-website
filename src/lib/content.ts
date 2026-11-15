import 'server-only';
import { db } from './db';
export const categoryInclude = { discipline: true } as const;
export async function catalog() {
  return db.category.findMany({
    include: {
      discipline: true,
      _count: {
        select: {
          lessons: { where: { status: 'PUBLISHED', reviewedAt: { not: null } } },
          questions: { where: { status: 'PUBLISHED', reviewedAt: { not: null } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}
/** Published, reviewed lessons only: everything the public can see. */
export async function publishedLessons() {
  return db.lesson.findMany({
    where: { status: 'PUBLISHED', reviewedAt: { not: null } },
    include: { category: { include: categoryInclude } },
    orderBy: { updatedAt: 'desc' },
  });
}
/** Unpublished lessons, for administrator previews only. */
export async function draftLessons() {
  return db.lesson.findMany({
    where: { status: { in: ['DRAFT', 'IN_REVIEW'] } },
    include: { category: { include: categoryInclude } },
    orderBy: { updatedAt: 'desc' },
  });
}
export function lessonUrl(l: {
  slug: string;
  status: string;
  category: { slug: string; discipline: { slug: string } };
}) {
  return l.status === 'PUBLISHED'
    ? `/learn/${l.category.discipline.slug}/${l.category.slug}/${l.slug}`
    : `/demo/learn/${l.slug}`;
}
