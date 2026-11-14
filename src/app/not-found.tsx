import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="container" style={{ padding: '90px 0' }}>
      <p className="eyebrow">404 · A DIFFERENT PATH</p>
      <h1 style={{ fontSize: 'var(--text-title)' }}>This page isn’t available.</h1>
      <p className="lead" style={{ margin: '20px 0 30px' }}>
        The content may be unpublished, or a quiz attempt may belong to another browser.
      </p>
      <Link className="button" href="/learn">
        Explore the learning hub
      </Link>
    </div>
  );
}
