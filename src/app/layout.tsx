import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { Navigation } from '@/components/navigation';
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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation />
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
              <Link href="/learn">Learning hub</Link>
              <Link href="/practice">Practice quizzes</Link>
              <Link href="/cases">Clinical cases</Link>
              <Link href="/watch">Video library</Link>
            </div>
            <div>
              <h3>Behind the science</h3>
              <Link href="/#about">About LSU</Link>
              <a href="https://orvillemalijan.com" target="_blank" rel="noreferrer">
                Founder’s portfolio <ArrowUpRight size={13} />
              </a>
              <Link href="/privacy">Privacy</Link>
              <Link href="/admin">Administration</Link>
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
