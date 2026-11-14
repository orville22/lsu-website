import { notFound } from 'next/navigation';
import { Lesson, fetchLesson } from '@/components/lesson';
import { admin } from '@/lib/security';
export const dynamic = 'force-dynamic';
// Unpublished lesson previews are for signed-in administrators only.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = (await admin()) ? await fetchLesson((await params).slug, true) : null;
  return {
    title: l ? `Preview: ${l.title}` : 'Lesson not found',
    robots: { index: false, follow: false },
  };
}
export default async function LessonPreview({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await admin())) notFound();
  const lesson = await fetchLesson((await params).slug, true);
  if (!lesson) notFound();
  return <Lesson lesson={lesson} preview />;
}
