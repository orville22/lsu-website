import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Breadcrumbs, PageIntro } from '@/components/ui';
import { ReviewerRequestForm, ReviewerSignOut } from '@/components/review';
import { db } from '@/lib/db';
import { lessonUrl, publishedLessons } from '@/lib/content';
import { currentReviewer } from '@/lib/reviewer-session';
import { REVIEWER_CONSENT_TEXT, reviewerRoles } from '@/lib/reviewers';
import { siteConfig } from '@/lib/site-config';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Volunteer as a reviewer',
  description:
    'Help review Lab Science Unfiltered’s clinical chemistry lessons before and after they go live. Open to students, laboratory scientists and educators.',
  alternates: { canonical: '/review' },
};

type Props = { searchParams: Promise<{ access?: string }> };

export default async function ReviewPage({ searchParams }: Props) {
  if (!siteConfig.reviewProgramme) notFound();
  const { access } = await searchParams;
  const reviewer = await currentReviewer();
  if (reviewer) return <ReviewerHome name={reviewer.name} welcome={access === 'granted'} />;
  return (
    <div className="container prose-page review-page">
      <Breadcrumbs items={[{ label: 'Volunteer as a reviewer' }]} />
      {(access === 'invalid' || access === 'limited') && (
        <div className="error-message" role="alert">
          {access === 'invalid' ? (
            <>
              That reviewer link isn’t active. A newer link may have replaced it, or access may have
              ended. Ask for a new one through the{' '}
              <a
                className="text-link"
                href={siteConfig.contactUrl}
                target="_blank"
                rel="noreferrer"
              >
                contact form
              </a>
              .
            </>
          ) : (
            'Too many attempts from this connection. Please try your link again in an hour.'
          )}
        </div>
      )}
      <PageIntro
        eyebrow="Volunteer reviewers"
        title="Help shape the lessons."
        description="Lab Science Unfiltered is new, and every lesson is checked against its references before it goes live. A second pair of eyes from people who study or work in the lab makes them better."
      />
      <h2>Who it’s for</h2>
      <p>
        Students in laboratory science or medicine, laboratory scientists and technicians at any
        stage of their career, and educators. You don’t need to be an expert in every topic: “I got
        lost here” is as useful as “this reference range is out of date”.
      </p>
      <h2>What you’d do</h2>
      <ul>
        <li>Read lessons, including ones that aren’t public yet.</li>
        <li>
          Use the <strong>Feedback</strong> button on any page to answer up to five short questions:
          clarity, accuracy, level, illustrations, and what’s missing.
        </li>
        <li>Review as much or as little as you like. A lesson takes about 15 to 20 minutes.</li>
      </ul>
      <h2>What happens next</h2>
      <p>
        Each request is read personally. If it’s approved, you’ll get an email with your own
        reviewer link. Opening it gives that browser access; there’s no password. You can stop at
        any time.
      </p>
      <section className="review-request" aria-labelledby="review-request-heading">
        <h2 id="review-request-heading">Volunteer</h2>
        <ReviewerRequestForm roles={reviewerRoles} consentText={REVIEWER_CONSENT_TEXT} />
      </section>
    </div>
  );
}

async function ReviewerHome({ name, welcome }: { name: string; welcome: boolean }) {
  const [inReview, published] = await Promise.all([
    db.lesson.findMany({
      where: { status: 'IN_REVIEW', isDemo: false },
      include: { category: { include: { discipline: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    publishedLessons(),
  ]);
  const first = name.split(/\s+/)[0] || name;
  return (
    <div className="container prose-page review-page">
      <Breadcrumbs items={[{ label: 'Reviewer area' }]} />
      {welcome && (
        <div className="success-message" role="status">
          You’re signed in as a reviewer on this browser. Open your link on any other device you’d
          like to use.
        </div>
      )}
      <PageIntro
        eyebrow="Reviewer area"
        title={`Thanks for reviewing, ${first}.`}
        description="Open any lesson below and use the Feedback button at the bottom right of the page. Answer as many or as few of the questions as you like, and send feedback as often as you like."
      />
      <h2>In review: not public yet</h2>
      {inReview.length ? (
        <ul className="review-lesson-list">
          {inReview.map((l) => (
            <li key={l.id}>
              <Link className="text-link" href={`/review/lessons/${l.slug}`}>
                {l.title} <ArrowUpRight size={14} />
              </Link>
              <span className="muted"> · {l.category.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          Nothing is waiting for review right now. New lessons will appear here.
        </p>
      )}
      <h2>Published lessons</h2>
      <p>These are public, but your feedback still shapes their next revision.</p>
      <ul className="review-lesson-list">
        {published.map((l) => (
          <li key={l.id}>
            <Link className="text-link" href={lessonUrl(l)}>
              {l.title} <ArrowUpRight size={14} />
            </Link>
            <span className="muted"> · {l.category.name}</span>
          </li>
        ))}
      </ul>
      <h2>Good to know</h2>
      <ul>
        <li>Lessons in review can change while you read them.</li>
        <li>Please don’t share your link or screenshots of unpublished lessons.</li>
        <li>Never include patient information in feedback.</li>
      </ul>
      <div className="form-actions" style={{ marginTop: 32 }}>
        <ReviewerSignOut />
      </div>
    </div>
  );
}
