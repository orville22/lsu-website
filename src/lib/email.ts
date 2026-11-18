import 'server-only';
import { siteConfig } from './site-config';
import { type EmailSettings, oneClickUnsubscribeUrl, unsubscribeUrl } from './subscribers';

/**
 * Sends email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * A plain fetch keeps the dependency list unchanged.
 */
export async function sendEmail(
  settings: EmailSettings,
  message: {
    to: string;
    subject: string;
    html: string;
    text: string;
    headers?: Record<string, string>;
    idempotencyKey?: string;
  },
) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
      ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: settings.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      headers: message.headers,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    // Log the status only; the body can echo the recipient address.
    console.error('email send failed', res.status);
    throw new Error(`Email provider responded ${res.status}`);
  }
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Brand colours from BRAND_GUIDELINES.md, inlined because email clients ignore stylesheets. */
const ink = '#2b2622';
const muted = '#5a5248';
const paper = '#f5eee0';
const card = '#fffaf0';
const line = '#ddcfb4';
const cobalt = '#344fb4';

function layout(settings: EmailSettings, body: string, footerExtra = '') {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${paper};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${card};border-radius:12px;border:1px solid ${line};">
        <tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:${ink};font-size:16px;line-height:1.6;">
          <p style="margin:0 0 24px;font-weight:bold;font-size:18px;letter-spacing:-0.01em;">lab science unfiltered<span style="color:${cobalt};">.</span></p>
          ${body}
        </td></tr>
      </table>
      <p style="max-width:560px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${muted};">
        Sent by Lab Science Unfiltered, an independent educational website run by Orville Malijan, Melbourne, Australia.
        <a href="${settings.siteUrl}" style="color:${muted};">${escape(new URL(settings.siteUrl).host)}</a> ·
        <a href="${escape(siteConfig.contactUrl)}" style="color:${muted};">Contact</a> ·
        <a href="${settings.siteUrl}/privacy" style="color:${muted};">Privacy</a>
        ${footerExtra}
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:28px 0;"><a href="${href}" style="display:inline-block;background:${cobalt};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;">${escape(label)}</a></p>`;
}

export function confirmationEmail(settings: EmailSettings, sub: { id: string; token: string }) {
  const confirm = `${settings.siteUrl}/subscribe/confirm?token=${encodeURIComponent(sub.token)}`;
  const leave = unsubscribeUrl(sub.id, settings);
  const html = layout(
    settings,
    `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;">Confirm your email</h1>
     <p style="margin:0;">Someone (hopefully you) asked to get email updates from Lab Science Unfiltered: new lessons as they’re published, plus occasional news about the site.</p>
     ${button(confirm, 'Yes, subscribe me')}
     <p style="margin:0;color:${muted};font-size:14px;">This link works for 7 days. If you didn’t ask for this, ignore this email and you won’t hear from us.</p>`,
    `<br>Not you? <a href="${leave}" style="color:${muted};">Remove this address</a>.`,
  );
  const text = `Confirm your email

Someone (hopefully you) asked to get email updates from Lab Science Unfiltered: new lessons as they're published, plus occasional news about the site.

Confirm here: ${confirm}

This link works for 7 days. If you didn't ask for this, ignore this email and you won't hear from us.

--
Lab Science Unfiltered, an independent educational website run by Orville Malijan, Melbourne, Australia.
${settings.siteUrl} · Contact: ${siteConfig.contactUrl}
Remove this address: ${leave}
`;
  return {
    subject: 'Confirm your Lab Science Unfiltered subscription',
    html,
    text,
    headers: listUnsubscribeHeaders(sub.id, settings),
  };
}

/**
 * RFC 2369 / RFC 8058 headers so Gmail, Outlook and Apple Mail can show their
 * own one-click unsubscribe. Include these on every email sent to the list.
 */
export function listUnsubscribeHeaders(id: string, settings: EmailSettings) {
  return {
    'List-Unsubscribe': `<${oneClickUnsubscribeUrl(id, settings)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/** Sent when a volunteer reviewer request is approved (or a new link is issued). */
export function reviewerInviteEmail(settings: EmailSettings, r: { name: string; link: string }) {
  const first = r.name.split(/\s+/)[0] || r.name;
  const html = layout(
    settings,
    `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;">You’re in, ${escape(first)}</h1>
     <p style="margin:0 0 12px;">Thank you for volunteering to review Lab Science Unfiltered. Your personal reviewer link is below. Open it on each device you’d like to review from.</p>
     <p style="margin:0;">Once you’re signed in you’ll see lessons that aren’t public yet, and a <strong>Feedback</strong> button on every page with five short questions. Answer as many or as few as you like.</p>
     ${button(r.link, 'Open reviewer access')}
     <p style="margin:0;color:${muted};font-size:14px;">This link is personal, so please don’t share it. If you’d rather stop reviewing, use the contact form and we’ll remove your details.</p>`,
  );
  const text = `You're in, ${first}

Thank you for volunteering to review Lab Science Unfiltered. Your personal reviewer link is below. Open it on each device you'd like to review from.

Once you're signed in you'll see lessons that aren't public yet, and a Feedback button on every page with five short questions. Answer as many or as few as you like.

Open reviewer access: ${r.link}

This link is personal, so please don't share it. If you'd rather stop reviewing, use the contact form and we'll remove your details.

--
Lab Science Unfiltered, an independent educational website run by Orville Malijan, Melbourne, Australia.
${settings.siteUrl} · Contact: ${siteConfig.contactUrl}
`;
  return { subject: 'Your Lab Science Unfiltered reviewer access', html, text };
}
