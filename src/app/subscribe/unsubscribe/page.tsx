import type { Metadata } from 'next';
import { UnsubscribeAction } from '@/components/subscribe';
import { siteConfig } from '@/lib/site-config';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string | string[]; t?: string | string[] }>;
}) {
  const p = await searchParams;
  const s = typeof p.s === 'string' ? p.s : '';
  const t = typeof p.t === 'string' ? p.t : '';
  return (
    <div className="container subscribe-page">
      <p className="eyebrow">Email updates</p>
      <h1>Unsubscribe</h1>
      {s && t ? (
        <>
          <p>Stop all emails from Lab Science Unfiltered to this address.</p>
          <UnsubscribeAction s={s} t={t} />
        </>
      ) : (
        <p>
          This page needs the link from one of our emails. If you can’t find it, use the{' '}
          <a className="text-link" href={siteConfig.contactUrl} target="_blank" rel="noreferrer">
            contact form
          </a>{' '}
          and we’ll remove your address.
        </p>
      )}
    </div>
  );
}
