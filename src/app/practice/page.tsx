import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Breadcrumbs, PageIntro } from '@/components/ui';
import { PracticeStart } from '@/components/practice-start';
import { notFound } from 'next/navigation';
import { siteState } from '@/lib/visibility';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Practice quiz hub',
  description:
    'Practise clinical chemistry with topic-based and random quizzes, server-side scoring and detailed explanations.',
  alternates: { canonical: '/practice' },
};
export default async function Practice({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const state = await siteState();
  if (!state.show.practicePage) notFound();
  // Draft demonstration questions are an administrator testing tool only.
  const allowDemo = state.isAdmin;
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      questions: {
        where: {
          OR: [
            { status: 'PUBLISHED', reviewedAt: { not: null } },
            ...(allowDemo ? [{ status: 'DRAFT' as const, isDemo: true }] : []),
          ],
        },
        select: { status: true, subtopic: true },
      },
    },
  });
  return (
    <div className="container practice-hub" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ label: 'Practice' }]} />
      <PageIntro
        eyebrow="The clinical chemistry quiz hub"
        title="Turn knowledge into understanding."
        description="Choose a broad mix or focus on a topic. Take your time, test your reasoning and learn from the explanation behind every answer."
      />
      <PracticeStart
        initialCategory={params.category}
        initialDemo={allowDemo && params.demo === 'true'}
        allowDemo={allowDemo}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          published: c.questions.filter((q) => q.status === 'PUBLISHED').length,
          demo: c.questions.filter((q) => q.status === 'DRAFT').length,
          subtopics: [...new Set(c.questions.map((q) => q.subtopic))].filter(Boolean),
        }))}
      />
    </div>
  );
}
