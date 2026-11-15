import { notFound } from 'next/navigation';
import { Breadcrumbs, PageIntro, DraftNotice } from '@/components/ui';
import { CaseStudy } from '@/components/case-study';
import { siteState } from '@/lib/visibility';
export const metadata = {
  title: 'Draft case: A low sodium result',
  robots: { index: false, follow: false },
};
export default async function Case({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await siteState()).show.casesPage) notFound();
  if ((await params).slug !== 'a-low-sodium-result') notFound();
  return (
    <div className="container">
      <div className="case-layout">
        <Breadcrumbs
          items={[{ label: 'Clinical cases', href: '/cases' }, { label: 'A low sodium result' }]}
        />
        <PageIntro
          eyebrow="Fictional educational case · electrolytes"
          title="A low sodium result. An unexpected clue."
          description="Pause at each step. Decide what you would investigate, then reveal the next part of this constructed laboratory scenario."
        />
        <DraftNotice />
        <CaseStudy />
      </div>
    </div>
  );
}
