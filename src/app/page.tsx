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
import { publishedLessons, lessonUrl } from '@/lib/content';
import { siteState, upcomingLessons } from '@/lib/visibility';
import { categoryDefinitions } from '@/lib/catalog';
import { UpcomingList } from '@/components/ui';
import { SubscribeCallout } from '@/components/subscribe-callout';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const [state, items, upcoming] = await Promise.all([
    siteState(),
    publishedLessons(),
    upcomingLessons(),
  ]);
  const { show } = state;
  // Topic cards only for modules that already have published lessons.
  const topics = state.lessonCategories.slice(0, 4).map((c, i) => ({
    n: categoryDefinitions.find(([slug]) => slug === c.slug)?.[3] ?? String(i + 1).padStart(2, '0'),
    title: c.name,
    text: c.description,
    slug: c.slug,
    color: topicPresentation(c).tone,
    count: c._count.lessons,
  }));
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
              {show.practice ? (
                <Link href="/practice" className="button button-outline">
                  Practice quiz <ArrowRight size={18} />
                </Link>
              ) : (
                <Link href="/#about" className="button button-outline">
                  About LSU <ArrowRight size={18} />
                </Link>
              )}
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
          <ScienceVisual
            lessonHref={(() => {
              const lesson = items.find((l) => l.slug === 'c1-1-water-sodium-homeostasis');
              return lesson ? lessonUrl(lesson) : undefined;
            })()}
          />
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
      {topics.length > 0 && (
        <section className="section container home-topics">
          <SectionHeading
            eyebrow="Your learning starts here"
            title="One discipline. A world to explore."
            description="Build your clinical chemistry knowledge, one concept at a time."
            href="/learn"
            linkText="Explore the learning hub"
          />
          <div className="topic-grid">
            {topics.map((t) => (
              <Link
                href={`/learn?category=${t.slug}`}
                className={`topic-card topic-${t.color}`}
                key={t.slug}
              >
                <div className="topic-card-top">
                  <span className="topic-number">{t.n}</span>
                  <ArrowUpRight size={23} />
                </div>
                <TopicArt kind={topicPresentation({ slug: t.slug }).artwork} />
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <span className="topic-explore">
                  {t.count} lesson{t.count === 1 ? '' : 's'} <ArrowUpRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {(items.length > 0 || upcoming.length > 0) && (
        <section className="section section-tinted home-lessons">
          <div className="container">
            {items.length > 0 && (
              <>
                <SectionHeading
                  eyebrow="Build your understanding"
                  title="Latest lessons."
                  description="Clear, referenced explanations of the science behind the result."
                  href="/learn"
                  linkText="Browse all lessons"
                />
                <div className="lesson-grid">
                  {items.slice(0, 3).map((l) => (
                    <LessonCard key={l.id} lesson={{ ...l, url: lessonUrl(l) }} />
                  ))}
                </div>
              </>
            )}
            <UpcomingList items={upcoming.slice(0, 6)} />
          </div>
        </section>
      )}
      {show.practice && (
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
                Find what you know—and what to revisit—with practice that explains the thinking
                behind every answer.
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
      )}
      {(show.cases || show.watch) && (
        <section className={`section container ${show.cases && show.watch ? 'section-split' : ''}`}>
          {show.cases && (
            <div>
              <SectionHeading
                eyebrow="From principle to practice"
                title="Every result has a story."
                description="Work through an educational case, reveal the findings and connect the analytical clues."
              />
              <Link href="/cases" className="case-feature">
                <span className="small-label">Fictional educational case</span>
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
          )}
          {show.watch && (
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
          )}
        </section>
      )}
      <div className="container">
        <SubscribeCallout source="home" />
      </div>
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
              Starting with clinical chemistry, every lesson is written by a practising medical
              laboratory scientist and backed by verified references.
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
