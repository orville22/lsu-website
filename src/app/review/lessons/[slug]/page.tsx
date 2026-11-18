import { notFound } from 'next/navigation';
import { Lesson } from '@/components/lesson';
import { db } from '@/lib/db';
import { admin } from '@/lib/security';
import { currentReviewer } from '@/lib/reviewer-session';
export const dynamic = 'force-dynamic';

/** Lessons in review: visible to approved reviewers and administrators only. */
function fetchReviewLesson(slug: string) {
  return db.lesson.findFirst({
    where: { slug, status: 'IN_REVIEW', isDemo: false },
    include: { category: { include: { discipline: true } } },
  });
}
async function allowed() {
  return !!(await currentReviewer()) || !!(await admin());
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = (await allowed()) ? await fetchReviewLesson((await params).slug) : null;
  return {
    title: l ? `In review: ${l.title}` : 'Lesson not found',
    robots: { index: false, follow: false },
  };
}
export default async function ReviewLesson({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await allowed())) notFound();
  const lesson = await fetchReviewLesson((await params).slug);
  if (!lesson) notFound();
  return <Lesson lesson={lesson} preview={false} reviewerPreview />;
}
