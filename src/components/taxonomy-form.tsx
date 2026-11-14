'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function TaxonomyForm({ disciplines }: { disciplines: { id: string; name: string }[] }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function save(e: React.FormEvent<HTMLFormElement>, resource: string) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    try {
      const r = await fetch(`/api/admin/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.issues ? JSON.stringify(data.issues) : data.error);
      setSuccess('Created successfully.');
      form.reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="quiz-hub-grid">
        <form className="panel" onSubmit={(e) => save(e, 'categories')}>
          <h2>Add a category</h2>
          <label className="field">
            <span>Name</span>
            <input name="name" required minLength={2} />
          </label>
          <label className="field">
            <span>Slug</span>
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <label className="field">
            <span>Description</span>
            <input name="description" />
          </label>
          <label className="field">
            <span>Discipline</span>
            <select name="disciplineId">
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button" disabled={busy}>
            Create category
          </button>
        </form>
        <form className="panel" onSubmit={(e) => save(e, 'disciplines')}>
          <h2>Add a discipline</h2>
          <p>Use this when you are ready to expand beyond Clinical Chemistry.</p>
          <label className="field">
            <span>Name</span>
            <input name="name" required minLength={2} />
          </label>
          <label className="field">
            <span>Slug</span>
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <button className="button" disabled={busy}>
            Create discipline
          </button>
        </form>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}
    </>
  );
}
