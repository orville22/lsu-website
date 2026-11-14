import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { Navigation, type NavLink } from '@/components/navigation';
import { siteState } from '@/lib/visibility';
import './globals.css';
import './experience.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Lab Science Unfiltered — Understand the Science. Master the Lab.',
    template: '%s | Lab Science Unfiltered',
  },
  description:
    'A clinical laboratory science learning platform. Explore clinical chemistry through structured lessons, practice quizzes and educational cases.',
  openGraph: {
    type: 'website',
    siteName: 'Lab Science Unfiltered',
    title: 'Lab Science Unfiltered',
    description: 'Understand the Science. Master the Lab.',
    images: ['/opengraph-image.png'],
  },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // If the database is unreachable, keep a minimal working navigation.
  const { show, lessonCount } = await siteState().catch(() => ({
    lessonCount: 0,
    show: { practice: false, cases: false, watch: false, youtubeUrl: null as string | null },
  }));
  // Sections appear here only once they have published content.
  const sections: NavLink[] = [
    { href: '/learn', label: 'Learn' },
    ...(show.practice ? [{ href: '/practice', label: 'Practice' }] : []),
    ...(show.cases ? [{ href: '/cases', label: 'Clinical cases' }] : []),
    ...(show.watch ? [{ href: '/watch', label: 'Watch' }] : []),
  ];
  const navLinks: NavLink[] = [
    ...sections,
    { href: '/#about', label: 'About LSU' },
    ...(show.youtubeUrl ? [{ href: show.youtubeUrl, label: 'YouTube', external: true }] : []),
  ];
  const cta: NavLink = show.practice
    ? { href: '/practice', label: 'Let’s practise' }
    : { href: '/learn', label: 'Start learning' };
  const footerLabels: Record<string, string> = {
    '/learn': 'Learning hub',
    '/practice': 'Practice quizzes',
    '/cases': 'Clinical cases',
    '/watch': 'Video library',
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation links={navLinks} cta={cta} search={lessonCount > 0} />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <Link href="/" className="footer-brand">
                <FlaskConical size={23} /> Lab Science Unfiltered<span>.</span>
              </Link>
              <p>
                Understand the Science.
                <br />
                Master the Lab.
              </p>
            </div>
            <div>
              <h3>Keep exploring</h3>
              {sections.map((l) => (
                <Link key={l.href} href={l.href}>
                  {footerLabels[l.href]}
                </Link>
              ))}
              {show.youtubeUrl && (
                <a href={show.youtubeUrl} target="_blank" rel="noreferrer">
                  YouTube <ArrowUpRight size={13} />
                </a>
              )}
            </div>
            <div>
              <h3>Behind the science</h3>
              <Link href="/#about">About LSU</Link>
              <a href="https://orvillemalijan.com" target="_blank" rel="noreferrer">
                Founder’s portfolio <ArrowUpRight size={13} />
              </a>
              <Link href="/privacy">Privacy</Link>
            </div>
            <div className="footer-note">
              <span className="eyebrow">Built for understanding</span>
              <p>An independent learning space for curious minds in laboratory science.</p>
              <span className="small-label">Clinical Chemistry · First discipline</span>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>© {new Date().getFullYear()} Lab Science Unfiltered</span>
            <span>Educational content. Always follow your laboratory’s validated procedures.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
