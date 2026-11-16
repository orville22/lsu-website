import type { Metadata } from 'next';
import { PageIntro, Breadcrumbs } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';
export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What Lab Science Unfiltered stores, why, where and for how long.',
  alternates: { canonical: '/privacy' },
};
/*
 * Keep this page in step with the code. If you add analytics, accounts, email
 * sign-up, comments or another third-party service, update it before release.
 */
export default function Privacy() {
  const contact = (
    <a className="text-link" href={siteConfig.contactUrl} target="_blank" rel="noreferrer">
      contact form
    </a>
  );
  return (
    <div className="container prose-page">
      <Breadcrumbs items={[{ label: 'Privacy' }]} />
      <PageIntro
        eyebrow={`Privacy · Updated ${siteConfig.privacyUpdated}`}
        title="Learn with a little less data."
        description="You don’t need an account to use Lab Science Unfiltered. There is no advertising, no analytics and no tracking cookies. This page explains the small amount of information the site does handle."
      />

      <h2>Who runs this site</h2>
      <p>
        Lab Science Unfiltered (LSU) is an independent educational website operated by Orville
        Malijan in Melbourne, Australia. For any privacy question or request, use the {contact}.
      </p>

      <h2>What we collect and why</h2>
      <p>
        <strong>Reading lessons.</strong> We don’t ask for your name or email, and we don’t record
        which lessons you read.
      </p>
      <p>
        <strong>Practice quizzes.</strong> When you start a quiz, your browser receives a random
        identifier in a cookie (<code>lsu_visitor</code>, lasting 30 days) so you can come back to
        your quiz and see your results. We store only a one-way hash of that identifier, together
        with the questions you were given, your answers, your score and the times involved. This is
        not linked to your name or any account.
      </p>
      <p>
        <strong>Stored in your browser only.</strong> Quiz answers are also kept in your browser’s
        local storage so a refresh doesn’t lose them, and your light or dark theme choice is
        remembered the same way. This stays on your device and is not sent to us beyond the answers
        you save or submit.
      </p>
      <p>
        <strong>Email updates (optional).</strong> If you sign up for email updates, we store your
        email address, the page you signed up from, the consent statement shown with the form, and
        when you signed up, confirmed or unsubscribed. We send a confirmation email first, and your
        address is added to the list only after you click its link. We use it only to email you
        about new lessons and occasional site updates. We don’t sell or share it, and we don’t track
        whether you open our emails. Every email has an unsubscribe link, which takes effect
        straight away.
      </p>
      <p>
        <strong>Preventing abuse.</strong> To limit automated misuse, the site keeps short-lived
        request counters. These are stored as keyed hashes, reset within an hour and are then
        deleted. The site does not store your IP address in its database.
      </p>
      <p>
        <strong>Hosting.</strong> Like any website host, our hosting provider processes technical
        information such as your IP address and browser type to deliver pages and protect the
        service, and may keep short-term logs under its own policies.
      </p>
      <p>
        <strong>Administrators.</strong> Site administrators sign in with a separate session cookie
        (<code>lsu_admin</code>) that expires after eight hours. Edits to content are recorded in an
        audit log.
      </p>

      <h2>Where it is stored</h2>
      <p>
        The site is hosted by Vercel and its database by Neon. Emails are sent through Resend, which
        receives your address and the message content in order to deliver each email. All three
        currently run in the United States, so the information described above is stored and
        processed outside Australia.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Quiz attempts are deleted automatically 30 days after they were last used.</li>
        <li>Request counters and expired administrator sessions are deleted automatically.</li>
        <li>
          Your email address is kept while you are subscribed. Sign-ups that are never confirmed,
          and addresses that unsubscribe, are deleted automatically after 30 days.
        </li>
        <li>Information in your browser stays until you clear your cookies and site data.</li>
      </ul>

      <h2>Videos, images and links</h2>
      <p>
        Lesson videos use YouTube’s privacy-enhanced mode and load only when you choose to play
        them; YouTube’s policies then apply. Some lessons show images hosted elsewhere, and
        references link to external sites such as journals, PubMed and doi.org. Those services have
        their own privacy practices.
      </p>

      <h2>Please don’t share patient information</h2>
      <p>
        LSU is for education. Don’t enter personal health information or anything that could
        identify a patient. Examples used in lessons are fictional or de-identified.
      </p>

      <h2>Your choices</h2>
      <p>
        You can unsubscribe from email updates using the link in any email we send. Clearing cookies
        and site data for this website removes the quiz identifier and anything saved in your
        browser. Because quiz records are stored only against a hashed identifier, we can’t link
        them to you, and they are deleted automatically after 30 days. If you have a question, a
        concern or a request, use the {contact}.
      </p>
      <p>
        We aim to handle personal information in line with the Australian Privacy Principles, and to
        send email only in line with the Spam Act 2003. If the site starts collecting anything new,
        such as accounts, this page will be updated first and the date above will change.
      </p>
    </div>
  );
}
