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

/** Personal invite for a volunteer reviewer. The link is the reviewer's key, so it is sent only to them. */
export function reviewerInviteEmail(settings: EmailSettings, r: { name: string; link: string }) {
  const html = layout(
    settings,
    `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;">You’re invited to review Lab Science Unfiltered</h1>
     <p style="margin:0 0 12px;">Hi ${escape(r.name)},</p>
     <p style="margin:0 0 12px;">Thank you for offering to help. This personal link signs you in as a reviewer, so your feedback is recorded under your name.</p>
     ${button(r.link, 'Open the site')}
     <p style="margin:0 0 12px;">On every page you’ll find a <strong>Feedback</strong> button with five short questions. Answer as many as you like; the most useful thing you can tell us is anything that’s unclear, wrong or out of step with how your laboratory works.</p>
     <p style="margin:0;color:${muted};font-size:14px;">Please don’t forward this email: the link is yours, and your feedback is recorded under your name. If you didn’t ask to review the site, ignore this email.</p>`,
  );
  const text = `You're invited to review Lab Science Unfiltered

Hi ${r.name},

Thank you for offering to help. This personal link signs you in as a reviewer, so your feedback is recorded under your name:

${r.link}

On every page you'll find a Feedback button with five short questions. Answer as many as you like; the most useful thing you can tell us is anything that's unclear, wrong or out of step with how your laboratory works.

Please don't forward this email: the link is yours, and your feedback is recorded under your name. If you didn't ask to review the site, ignore this email.

--
Lab Science Unfiltered, an independent educational website run by Orville Malijan, Melbourne, Australia.
${settings.siteUrl} · Contact: ${siteConfig.contactUrl}
`;
  return { subject: 'Your invitation to review Lab Science Unfiltered', html, text };
}
