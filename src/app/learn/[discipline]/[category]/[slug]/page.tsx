import { notFound } from 'next/navigation';
import { Lesson, fetchLesson } from '@/components/lesson';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ discipline: string; category: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const p = await params;
  const l = await fetchLesson(p.slug, false);
  if (!l || l.category.slug !== p.category || l.category.discipline.slug !== p.discipline)
    return { title: 'Lesson not found' };
  return {
    title: l.title,
    description: l.description,
    alternates: { canonical: `/learn/${p.discipline}/${p.category}/${p.slug}` },
  };
}
export default async function PublishedLesson({ params }: Props) {
  const p = await params;
  const lesson = await fetchLesson(p.slug, false);
  if (
    !lesson ||
    lesson.category.slug !== p.category ||
    lesson.category.discipline.slug !== p.discipline
  )
    notFound();
  return <Lesson lesson={lesson} preview={false} />;
}
