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
export async function lessons() {
  return db.lesson.findMany({
    where: {
      OR: [
        { status: 'PUBLISHED', reviewedAt: { not: null } },
        { status: 'DRAFT', isDemo: true },
      ],
    },
    include: { category: { include: categoryInclude } },
    orderBy: { updatedAt: 'desc' },
  });
}
export function lessonUrl(l: {
  slug: string;
  status: string;
  category: { slug: string; discipline: { slug: string } };
}) {
  return l.status === 'DRAFT'
    ? `/demo/learn/${l.slug}`
    : `/learn/${l.category.discipline.slug}/${l.category.slug}/${l.slug}`;
}
