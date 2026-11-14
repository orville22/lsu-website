'use client';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container" style={{ padding: '80px 0' }}>
      <p className="eyebrow">UNABLE TO LOAD THIS PAGE</p>
      <h1 style={{ fontSize: 'var(--text-title)' }}>The lab needs a moment.</h1>
      <p className="lead" style={{ margin: '20px 0 30px' }}>
        Try again in a moment. For local setup, check that PostgreSQL is running and the database
        migrations have been applied.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
