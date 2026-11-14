import { notFound } from 'next/navigation';
import { siteState } from '@/lib/visibility';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Breadcrumbs, PageIntro, DraftNotice } from '@/components/ui';
export const metadata = {
  title: 'Clinical cases',
  description:
    'Explore stepwise fictional educational cases connecting clinical chemistry principles and laboratory interpretation.',
  alternates: { canonical: '/cases' },
};
export default async function Cases() {
  if (!(await siteState()).show.casesPage) notFound();
  return (
    <div className="container" style={{ paddingBottom: 70 }}>
      <Breadcrumbs items={[{ label: 'Clinical cases' }]} />
      <PageIntro
        eyebrow="Connect the clues"
        title="Every result has a story."
        description="Move from patient scenario to laboratory findings and interpretation. Reveal each step, pause to think and connect the science."
      />
      <DraftNotice />
      <div style={{ maxWidth: 620 }}>
        <Link href="/cases/a-low-sodium-result" className="case-feature">
          <span className="small-label">CASE 01 · ELECTROLYTES · FICTIONAL EDUCATIONAL CASE</span>
          <h3>
            A low sodium result.
            <br />
            An unexpected clue.
          </h3>
          <p>
            A discrepancy between two methods prompts a closer look at the specimen. Work through
            this draft case step by step.
          </p>
          <span className="text-link">
            Open the case <ArrowUpRight size={16} />
          </span>
          <div className="case-values" aria-hidden="true">
            <span>
              Na⁺<strong>126</strong>
              <small>mmol/L · indirect ISE</small>
            </span>
            <span>
              Na⁺<strong>138</strong>
              <small>mmol/L · direct ISE</small>
            </span>
          </div>
        </Link>
      </div>
      <p className="content-note">
        Case authoring and advanced case interactions are planned after the core lesson and quiz
        systems.
      </p>
    </div>
  );
}
