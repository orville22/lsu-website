import type { Metadata } from 'next';
import Link from 'next/link';
import { ConfirmAction } from '@/components/subscribe';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Confirm your subscription',
  robots: { index: false, follow: false },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const value = typeof token === 'string' ? token : '';
  return (
    <div className="container subscribe-page">
      <p className="eyebrow">Email updates</p>
      <h1>Confirm your subscription</h1>
      {value ? (
        <>
          <p>
            One click and you’re in. We’ll email you when new lessons are published, plus the
            occasional site update. You can unsubscribe from any email.
          </p>
          <ConfirmAction token={value} />
        </>
      ) : (
        <p>
          This page needs the link from your confirmation email. Open the email and use its button,
          or{' '}
          <Link className="text-link" href="/#subscribe">
            sign up again
          </Link>
          .
        </p>
      )}
    </div>
  );
}
