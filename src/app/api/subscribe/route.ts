import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, HttpError, rateLimit, readJson } from '@/lib/security';
import { emailSettings, emailSchema, requestSubscription, sourceSchema } from '@/lib/subscribers';
import { confirmationEmail, sendEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';

/** Same reply for new, pending and already-confirmed addresses. */
const accepted = () =>
  Response.json({ ok: true, message: 'Check your inbox for a confirmation link.' });

export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await rateLimit('subscribe-ip', 20, 3600);
    const settings = emailSettings();
    if (!settings) throw new HttpError(503, 'Email sign-up isn’t available yet.');
    const body = z
      .object({
        email: z.unknown(),
        source: z.unknown().optional(),
        // Honeypot: hidden from people, often filled in by bots.
        company: z.string().max(200).optional(),
      })
      .parse(await readJson(req));
    if (body.company) return accepted();
    const parsed = emailSchema.safeParse(body.email);
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0]?.message || 'Enter a valid email address.');
    const email = parsed.data;
    await rateLimit('subscribe-email', 3, 86400, email);
    const outcome = await requestSubscription(db, {
      email,
      source: sourceSchema.parse(body.source),
    });
    if (outcome.action === 'send-confirmation') {
      const message = confirmationEmail(settings, outcome);
      try {
        await sendEmail(settings, {
          to: outcome.email,
          ...message,
          idempotencyKey: `confirm-${outcome.id}-${outcome.token.slice(0, 16)}`,
        });
      } catch {
        throw new HttpError(
          502,
          'We couldn’t send the confirmation email just now. Please try again in a few minutes.',
        );
      }
    }
    return accepted();
  } catch (e) {
    return errorResponse(e);
  }
}
