import { notFound } from 'next/navigation';
import { Lesson, fetchLesson } from '@/components/lesson';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = await fetchLesson((await params).slug, true);
  return {
    title: l ? `Draft preview: ${l.title}` : 'Lesson not found',
    robots: { index: false, follow: false },
  };
}
export default async function DemoLesson({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = await fetchLesson((await params).slug, true);
  if (!lesson) notFound();
  return <Lesson lesson={lesson} demo />;
}
