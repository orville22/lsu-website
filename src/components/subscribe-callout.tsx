import { SubscribeForm } from './subscribe';
import { CONSENT_TEXT, emailSettings } from '@/lib/subscribers';

/**
 * Email sign-up block. Renders nothing until RESEND_API_KEY, EMAIL_FROM and
 * EMAIL_TOKEN_SECRET are configured, so the site never shows a form that can't work.
 */
export function SubscribeCallout({
  source,
  variant = 'section',
  title = 'Get new lessons by email.',
  description = 'One short email when a new lesson goes live. No spam, and you can leave whenever you like.',
}: {
  source: string;
  variant?: 'section' | 'lesson';
  title?: string;
  description?: string;
}) {
  if (!emailSettings()) return null;
  const headingId = `subscribe-${source.replace(/[^a-z0-9]+/gi, '-')}`;
  return (
    <section
      id={variant === 'section' ? 'subscribe' : undefined}
      className={`subscribe-callout subscribe-callout-${variant}`}
      aria-labelledby={headingId}
    >
      <div>
        <p className="eyebrow">Email updates</p>
        <h2 id={headingId}>{title}</h2>
        <p className="subscribe-description">{description}</p>
      </div>
      <SubscribeForm source={source} consentText={CONSENT_TEXT} />
    </section>
  );
}
