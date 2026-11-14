import { notFound } from 'next/navigation';
import { owner, HttpError } from '@/lib/security';
import { getAttempt, attemptView } from '@/lib/attempts';
import { QuizRunner } from '@/components/quiz-runner';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your practice attempt', robots: { index: false, follow: false } };
export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const a = await getAttempt((await params).id, await owner());
    return (
      <div className="container">
        <QuizRunner initial={attemptView(a)} />
      </div>
    );
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
