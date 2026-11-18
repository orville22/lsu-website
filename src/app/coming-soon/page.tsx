import type { Metadata } from 'next';
import { ArrowUpRight, Mail, MessageSquareText, PlayCircle } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { ScienceVisual } from '@/components/science-visual';
import { SubscribeForm } from '@/components/subscribe';
import { ReviewerRequestForm } from '@/components/review';
import { CONSENT_TEXT, emailSettings } from '@/lib/subscribers';
import { siteConfig } from '@/lib/site-config';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'Lab Science Unfiltered — Coming soon' },
  description:
    'Clinical chemistry lessons, interactive diagrams and practice questions for laboratory science students and professionals. Coming soon.',
  alternates: { canonical: '/' },
};

const notices: Record<string, string> = {
  invalid:
    'That invite link isn’t valid any more. It may have been replaced or withdrawn. If you think this is a mistake, ask us for a new one.',
};

export default async function ComingSoon({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const canEmail = !!emailSettings();
  return (
    <div className="soon">
      <header className="container soon-top">
        <span className="soon-brand">
          <BrandMark size={34} />
          <span>
            lab science unfiltered<span className="brand-dot">.</span>
          </span>
        </span>
      </header>
      {invite && notices[invite] && (
        <div className="container">
          <div className="error-message" role="alert">
            {notices[invite]}
          </div>
        </div>
      )}
      <section className="hero home-hero soon-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" /> Coming soon
            </p>
            <h1>
              Clinical laboratory science, <span>explained.</span>
            </h1>
            <p className="hero-description">
              Lessons that explain the science behind the result: why it happens, how the lab
              measures it, and what can go wrong.
            </p>
            <p className="hero-detail">
              Starting with clinical chemistry. Written for laboratory science students and working
              scientists, with interactive diagrams, practice questions and referenced sources.
            </p>
            <div className="hero-actions">
              {canEmail && (
                <a className="button" href="#updates">
                  <Mail size={18} aria-hidden /> Get launch updates
                </a>
              )}
              <a className="button button-outline" href="#review">
                <MessageSquareText size={18} aria-hidden /> Help us review it
              </a>
            </div>
          </div>
          <ScienceVisual />
        </div>
      </section>

      <section className="container soon-cards">
        {canEmail && (
          <article className="soon-card" id="updates" aria-labelledby="updates-title">
            <p className="eyebrow">Email updates</p>
            <h2 id="updates-title">Hear when we launch</h2>
            <p>One email when the site opens, then a short note when new lessons go live.</p>
            <SubscribeForm source="coming-soon" consentText={CONSENT_TEXT} />
          </article>
        )}
        <article
          className={`soon-card soon-card-review${canEmail ? '' : ' soon-card-wide'}`}
          id="review"
          aria-labelledby="review-title"
        >
          <div className="soon-card-intro">
            <p className="eyebrow">Volunteer reviewers</p>
            <h2 id="review-title">Read it before anyone else</h2>
            <p>
              We’re inviting a small group of students, educators and laboratory professionals to
              read the lessons before launch and tell us what’s unclear, wrong or missing. Each
              reviewer gets a personal link to the full site and a short feedback form on every
              page.
            </p>
          </div>
          <ReviewerRequestForm />
        </article>
        {siteConfig.youtubeUrl && (
          <article className="soon-card soon-card-video" aria-labelledby="watch-title">
            <PlayCircle size={30} aria-hidden />
            <div>
              <h2 id="watch-title">Watch on YouTube</h2>
              <p>Short explainers from the same lessons, as they’re made.</p>
            </div>
            <a
              className="button button-outline"
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Visit the channel <ArrowUpRight size={16} aria-hidden />
            </a>
          </article>
        )}
      </section>
    </div>
  );
}
