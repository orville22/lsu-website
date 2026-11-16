# Email sign-up

Visitors can sign up for email updates from the homepage and the end of each published lesson. Sign-up uses **double opt-in**: an address is added to the list only after the person clicks the link in a confirmation email. Email is sent through [Resend](https://resend.com) by its HTTP API (no SDK dependency).

The form is hidden until `RESEND_API_KEY`, `EMAIL_FROM` and `EMAIL_TOKEN_SECRET` are all set, so a half-configured deployment never shows a form that can't work.

## How it works

| Step        | What happens                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign up     | `POST /api/subscribe` validates the address, creates or refreshes a `PENDING` row and emails a confirmation link. The reply is the same for new, pending and already-confirmed addresses, so the form doesn't reveal who is subscribed.                                                                                                                                                           |
| Confirm     | The emailed link opens `/subscribe/confirm`, which has a button that `POST`s to `/api/subscribe/confirm`. Confirming needs a click (not just opening the link), so mail scanners that prefetch links can't confirm on someone's behalf. The token is single-use and expires after 7 days; only its SHA-256 is stored.                                                                             |
| Unsubscribe | Every email carries a link to `/subscribe/unsubscribe`, plus `List-Unsubscribe` and `List-Unsubscribe-Post` headers (RFC 8058) so Gmail, Outlook and Apple Mail show their own one-click unsubscribe. Links are HMAC-signed over the subscriber id with `EMAIL_TOKEN_SECRET`, so no token is stored and the link can be regenerated for any future email. Unsubscribing takes effect immediately. |
| Clean-up    | The daily cron (`/api/cron/cleanup`) deletes unconfirmed sign-ups and unsubscribed addresses 30 days after their last change. Confirmed subscribers are kept until they unsubscribe.                                                                                                                                                                                                              |

Abuse controls: a hidden honeypot field, 20 sign-ups per hour per IP, 3 confirmation emails per address per day, and the existing same-origin check. No IP address or browser data is stored with a subscriber.

Each row stores the consent statement shown beside the form (`CONSENT_TEXT` in `src/lib/subscribers.ts`), the page it came from (`home` or `lesson:<slug>`) and the sign-up, confirmation and unsubscribe times, which together record consent under the Spam Act 2003.

Administrators see counts, progress toward the 500-subscriber Phase 1 target, recent sign-ups and a CSV export of confirmed subscribers under **Admin → Subscribers**.

## Setup

1. **Verify the domain in Resend.** Resend → Domains → add `labscienceunfiltered.com` (or a subdomain such as `mail.labscienceunfiltered.com`), then add the SPF, DKIM and (recommended) DMARC records it shows at your DNS provider. Wait until Resend shows the domain as verified.
2. **Turn off open and click tracking** for that domain in Resend. The privacy page says LSU doesn't track email opens.
3. **Create an API key** with _Sending access_ only.
4. **Apply the migration** to Neon before deploying this code (it only adds a table):

   ```sh
   DATABASE_URL="<Neon unpooled URL>" npm run db:migrate
   ```

5. **Add the environment variables** in Vercel → Settings → Environment Variables (Production):

   | Variable             | Value                                                                                                                              |
   | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
   | `RESEND_API_KEY`     | The key from step 3                                                                                                                |
   | `EMAIL_FROM`         | e.g. `Lab Science Unfiltered <updates@labscienceunfiltered.com>` (must use the verified domain)                                    |
   | `EMAIL_TOKEN_SECRET` | `openssl rand -hex 32`. Set it once: changing it breaks unsubscribe links in emails already sent.                                  |
   | `SITE_URL`           | Must be `https://labscienceunfiltered.com`. Email links are built from it, and sign-up requests from any other origin are refused. |
   | `TRUST_PROXY`        | `true` on Vercel, so the per-IP limit counts each visitor separately instead of sharing one bucket.                                |

6. **Redeploy**, then sign up with your own address and check: the confirmation email arrives (not in spam), the button confirms, Admin → Subscribers shows you, and the unsubscribe link works.

## Limits on Resend's free plan

The free plan allows 3,000 emails a month and 100 a day from one domain. Confirmation emails fit easily. Once newsletters go to the whole list, a single send to more than 100 people exceeds the daily cap, so upgrade to Resend Pro or export the list (Admin → Subscribers → CSV) into a newsletter tool at that point.

## Sending future emails to the list

Not built yet. When it is, every email to a subscriber must include the unsubscribe link (`unsubscribeUrl()`) and the headers from `listUnsubscribeHeaders()` in `src/lib/email.ts`, identify LSU as the sender, and go only to `CONFIRMED` rows.
