import Link from 'next/link';
import { Play, ArrowUpRight } from 'lucide-react';
import { PageIntro, Breadcrumbs } from '@/components/ui';
import { videoCategories } from '@/lib/catalog';
export const metadata = {
  title: 'Educational video library',
  description:
    'The future home of Lab Science Unfiltered educational videos, connected to clinical chemistry lessons and practice.',
  alternates: { canonical: '/watch' },
};
export default function Watch() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Watch' }]} />
      <PageIntro
        eyebrow="See the science unfold"
        title="A different lens on the lab."
        description="A dedicated home for LSU’s educational videos, with a clear path from watching to understanding and practising."
      />
      <div className="admin-note">
        <strong>The video library is being prepared.</strong>
        <p>
          No LSU videos have been added yet. The categories below show the planned organisation.
          Reviewed lessons can already include privacy-conscious YouTube embeds, descriptions and
          related topic practice.
        </p>
      </div>
      <div className="watch-topics">
        {videoCategories.map((v, i) => (
          <section className="watch-topic" key={v}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--action)' }}
            >
              <Play size={20} />
              <span className="tag">Upcoming</span>
            </div>
            <h2>{v}</h2>
            <p>
              {
                [
                  'Concepts explained with the laboratory in view.',
                  'Core ideas for building a strong foundation.',
                  'Understand performance, recognise patterns and investigate.',
                  'Follow the reasoning behind laboratory interpretations.',
                  'Focused explanations for a quick concept refresh.',
                ][i]
              }
            </p>
          </section>
        ))}
      </div>
      <div className="panel" style={{ marginBottom: 60 }}>
        <h2>Keep your curiosity moving.</h2>
        <p>
          While the video library takes shape, explore draft lessons and try the demonstration quiz.
        </p>
        <Link href="/learn" className="button button-outline">
          Explore the learning hub <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
