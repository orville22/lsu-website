import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  ChartNoAxesCombined,
  Check,
} from 'lucide-react';
import { ScienceVisual } from '@/components/science-visual';
import { TopicArt, VideoArtwork } from '@/components/brand/topic-art';
import { MascotArtwork } from '@/components/brand/mascot-artwork';
import { topicPresentation } from '@/lib/topic-presentation';
import { SectionHeading, LessonCard } from '@/components/ui';
import { lessons, lessonUrl } from '@/lib/content';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const items = await lessons();
  return (
    <>
      <section className="hero home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" /> For the curious minds in the lab
            </p>
            <h1>
              Clinical laboratory
              <br />
              science, <span>explained.</span>
            </h1>
            <p className="hero-description">
              Go beyond memorising the result. Understand the science behind it.
            </p>
            <p className="hero-detail">
              Explore clinical chemistry through clear lessons, thoughtful practice and real-world
              connections.
            </p>
            <div className="hero-actions">
              <Link href="/learn" className="button">
                Start learning <ArrowUpRight size={18} />
              </Link>
              <Link href="/practice" className="button button-outline">
                Practice quiz <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span>
                <Check size={14} /> Learn at your own pace
              </span>
              <span>
                <Check size={14} /> No account needed
              </span>
            </div>
          </div>
          <ScienceVisual />
        </div>
      </section>
      <div className="principle-strip">
        <div className="container">
          <span>
            <BookOpen size={19} /> Understand the principles
          </span>
          <i />
          <span>
            <FlaskConical size={19} /> Connect with the laboratory
          </span>
          <i />
          <span>
            <ChartNoAxesCombined size={19} /> Put your knowledge into practice
          </span>
        </div>
      </div>
      <section className="section container home-topics">
        <SectionHeading
          eyebrow="Your learning starts here"
          title="One discipline. A world to explore."
          description="Build your clinical chemistry knowledge, one concept at a time."
          href="/learn"
          linkText="Explore the learning hub"
        />
        <div className="topic-grid">
          {[
            {
              n: '01',
              title: 'Foundations',
              text: 'Start with the principles that make laboratory science make sense.',
              slug: 'foundations',
              color: 'green',
            },
            {
              n: '02',
              title: 'Electrolytes & acid–base',
              text: 'Explore the delicate balance of ions, water and pH.',
              slug: 'electrolytes',
              color: 'cobalt',
            },
            {
              n: '03',
              title: 'Analytical techniques',
              text: 'Discover how instruments translate science into results.',
              slug: 'analytical-techniques',
              color: 'tomato',
            },
            {
              n: '04',
              title: 'Quality control',
              text: 'Understand what makes a result reliable and fit for purpose.',
              slug: 'quality-control',
              color: 'mustard',
            },
          ].map((t) => (
            <Link
              href={`/learn?category=${t.slug}`}
              className={`topic-card topic-${t.color}`}
              key={t.n}
            >
              <div className="topic-card-top">
                <span className="topic-number">{t.n}</span>
                <ArrowUpRight size={23} />
              </div>
              <TopicArt kind={topicPresentation({ slug: t.slug }).artwork} />
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <span className="topic-explore">
                Explore topic <ArrowUpRight size={17} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section section-tinted home-lessons">
        <div className="container">
          <SectionHeading
            eyebrow="Build your understanding"
            title="Take a closer look."
            description="Preview the first lessons being developed for the learning hub."
            href="/learn"
            linkText="Browse lessons"
          />
          <div className="lesson-grid">
            {items.slice(0, 3).map((l) => (
              <LessonCard key={l.id} lesson={{ ...l, url: lessonUrl(l) }} />
            ))}
          </div>
          <p className="content-note">
            <span className="status-dot" /> Initial lesson previews are AI-generated drafts awaiting
            founder review.
          </p>
        </div>
      </section>
      <section className="section container home-practice">
        <div className="practice-banner">
          <div>
            <p className="eyebrow">Make the connection</p>
            <h2>
              Learn it. Question it.
              <br />
              <span>Make it stick.</span>
            </h2>
            <p>
              Find what you know—and what to revisit—with practice that explains the thinking behind
              every answer.
            </p>
            <Link href="/practice" className="button button-light">
              Enter the quiz hub <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="practice-illustration" aria-hidden="true">
            <TopicArt kind="qc" />
            <div className="learning-loop">
              <span>Learn</span>
              <ArrowRight />
              <span>Practise</span>
              <ArrowRight />
              <span>Review</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section container section-split">
        <div>
          <SectionHeading
            eyebrow="From principle to practice"
            title="Every result has a story."
            description="Work through an educational case, reveal the findings and connect the analytical clues."
          />
          <Link href="/cases" className="case-feature">
            <span className="small-label">Fictional educational case · draft</span>
            <h3>
              A low sodium result.
              <br />
              An unexpected clue.
            </h3>
            <p>
              What changes when the specimen and the analytical method become part of the story?
            </p>
            <span className="text-link">
              Explore the case <ArrowUpRight size={17} />
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
        <div>
          <SectionHeading
            eyebrow="Another way to understand"
            title="See the science unfold."
            description="A home for LSU’s educational videos, connected to lessons and practice."
          />
          <Link href="/watch" className="watch-feature">
            <VideoArtwork />
            <div>
              <h3>Clear explanations. Deeper connections.</h3>
              <p>
                The video library is being prepared. Explore what’s coming.{' '}
                <ArrowUpRight size={16} />
              </p>
            </div>
          </Link>
        </div>
      </section>
      <section id="about" className="about-section">
        <div className="container about-grid">
          <MascotArtwork moment="welcome" />
          <div>
            <p className="eyebrow">Science without the unnecessary noise</p>
            <h2>
              Built for the
              <br />
              <span>“but why?”</span>
            </h2>
          </div>
          <div>
            <p className="about-lead">
              Lab Science Unfiltered is an independent learning platform for students and
              professionals who want to understand the principles behind the results.
            </p>
            <p>
              Starting with clinical chemistry, LSU connects structured lessons, practice questions
              and educational cases into one continuous learning experience.
            </p>
            <a
              href="https://orvillemalijan.com"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Meet the founder, Orville Malijan <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
