import type { Metadata } from 'next';
import { ClipboardCheck, MessageSquareText, UserCheck } from 'lucide-react';
import { ReviewerRequestForm } from '@/components/review';
export const metadata: Metadata = {
  title: 'Help review the lessons',
  description:
    'Volunteer to review Lab Science Unfiltered lessons. Students, educators and laboratory professionals tell us what is unclear, wrong or missing.',
  alternates: { canonical: '/review' },
};

const steps = [
  {
    icon: UserCheck,
    title: 'Ask for a place',
    text: 'Tell us a little about yourself. We invite a small number of reviewers at a time.',
  },
  {
    icon: ClipboardCheck,
    title: 'Get your personal link',
    text: 'If a place is available, we email you a link that marks you as a reviewer on this browser.',
  },
  {
    icon: MessageSquareText,
    title: 'Read and give feedback',
    text: 'A Feedback button appears on every page, with five or seven short questions. Answer as many as you like.',
  },
];

export default function ReviewPage() {
  return (
    <div className="container review-page">
      <header className="review-head">
        <p className="eyebrow">
          <span className="tiny-line" /> Volunteer reviewers
        </p>
        <h1>Help review the lessons</h1>
        <p className="hero-description">
          We’re inviting students, educators and laboratory professionals to read the lessons and
          tell us what’s unclear, wrong or missing. Practising scientists and academics review
          accuracy and currency; learners tell us whether it makes sense.
        </p>
      </header>
      <ol className="review-steps">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <Icon size={22} aria-hidden />
            <div>
              <h2>
                {i + 1}. {title}
              </h2>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <section
        className="soon-card soon-card-review review-form-card"
        aria-labelledby="review-form-title"
      >
        <h2 id="review-form-title">Ask to review</h2>
        <ReviewerRequestForm />
      </section>
    </div>
  );
}
