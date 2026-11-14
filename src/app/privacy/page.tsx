import { PageIntro, Breadcrumbs } from '@/components/ui';
export const metadata = {
  title: 'Privacy policy template',
  robots: { index: false, follow: true },
};
export default function Privacy() {
  return (
    <div className="container prose-page">
      <Breadcrumbs items={[{ label: 'Privacy' }]} />
      <PageIntro
        eyebrow="PRIVACY POLICY · PRE-DEPLOYMENT TEMPLATE"
        title="Learn with a little less data."
        description="This template describes the MVP’s current behaviour. The site owner must review it, add operator and contact details, and choose retention periods before deployment."
      />
      <h2>What the platform stores</h2>
      <p>
        No learner registration is required. An anonymous browser cookie identifies quiz attempts
        for 30 days. The database stores a hash of this identifier, selected questions, answers,
        scores and timestamps. Quiz answers are also saved in this browser’s local storage so a
        refresh can recover unsent changes.
      </p>
      <h2>Administrator access</h2>
      <p>
        Administrators sign in using an environment-configured username and password hash. An
        HttpOnly session cookie expires after eight hours. Content changes record the administrator
        identifier and before/after content in an audit log. Passwords are never stored in
        plaintext.
      </p>
      <h2>Operational data and retention</h2>
      <p>
        Rate-limit records use hashed request identifiers. IP addresses are only considered when a
        trusted reverse proxy has been configured. Hosting providers may record access logs. Before
        launch, document the hosting provider, lawful basis where applicable, log handling, contact
        address and retention periods. A maintenance command removes expired sessions and limiter
        records and anonymous attempts older than the configured retention period.
      </p>
      <h2>Embedded media and links</h2>
      <p>
        YouTube videos use youtube-nocookie.com and load only after a visitor chooses to load a
        video. Loading a video connects to YouTube, whose policies apply. An administrator may add
        externally hosted lesson images; loading those images connects to their host. External links
        have their own privacy practices.
      </p>
      <h2>Your choices</h2>
      <p>
        You can clear LSU cookies and local storage in your browser to remove the browser identifier
        and locally saved answers. Server records remain until the operator’s retention process
        removes them. The operator must add a contact method for applicable access and deletion
        requests before launch.
      </p>
      <h2>Educational use</h2>
      <p>
        Do not enter personal health information or identifiable patient details into the platform.
        Educational examples are fictional or appropriately anonymised. Case reflection text remains
        only in page memory and is discarded when you leave or reload the page.
      </p>
      <h2>Information to complete before publication</h2>
      <ul>
        <li>Operator’s legal name, country and privacy contact.</li>
        <li>Production hosting and database providers.</li>
        <li>Chosen retention periods and scheduled cleanup.</li>
        <li>Applicable user rights, jurisdiction and effective date.</li>
        <li>Any analytics or services added after this MVP.</li>
      </ul>
    </div>
  );
}
