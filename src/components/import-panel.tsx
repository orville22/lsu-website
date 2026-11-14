'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
type Preview = {
  count: number;
  errors: { row: number; message: string }[];
  preview: { row: number; text: string; difficulty: string; status: string }[];
};
export function ImportPanel() {
  const router = useRouter();
  const [raw, setRaw] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function request(commit: boolean) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const r = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw, format, commit }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (commit) {
        setSuccess(`${data.imported} questions imported as Draft. Nothing was published.`);
        setPreview(null);
        setRaw('');
        router.refresh();
      } else setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="import-panel">
      <div className="admin-note">
        Upload or paste up to 500 questions (1 MB request limit). Preview validates every row;
        importing is transactional. Existing duplicate text is rejected. All imported questions
        become Draft, including published backups.
      </div>
      <div className="form-actions">
        <a
          href="/question-import-template.csv"
          download
          className="button button-outline button-small"
        >
          Download CSV template
        </a>
        <a href="/api/admin/export" className="button button-outline button-small">
          Export JSON backup
        </a>
        <a href="/api/admin/export?format=csv" className="button button-outline button-small">
          Export CSV
        </a>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Format</span>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as 'csv' | 'json');
              setPreview(null);
            }}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </label>
        <label className="field">
          <span>Choose a file</span>
          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 900000) {
                  setError('File exceeds 900 KB. Split it into smaller batches.');
                  return;
                }
                setRaw(await f.text());
                setFormat(f.name.endsWith('.json') ? 'json' : 'csv');
                setPreview(null);
              }
            }}
          />
        </label>
      </div>
      <label className="field" style={{ marginTop: 20 }}>
        <span>Import content</span>
        <textarea
          className="input"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setPreview(null);
          }}
          spellCheck={false}
        />
      </label>
      <div className="form-actions">
        <button className="button" disabled={busy || !raw} onClick={() => request(false)}>
          {busy ? 'Validating…' : 'Validate & preview'}
        </button>
        {preview && preview.count > 0 && !preview.errors.length && (
          <button className="button" disabled={busy} onClick={() => request(true)}>
            Import {preview.count} drafts
          </button>
        )}
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
      {preview && (
        <>
          <p className="count-label">
            {preview.count} valid rows · {preview.errors.length} errors. Preview shows the first 10
            valid rows.
          </p>
          {preview.errors.map((e, i) => (
            <p className="error-message" key={i}>
              Row {e.row || 'file'}: {e.message}
            </p>
          ))}
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Question</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((r) => (
                  <tr key={r.row}>
                    <td>{r.row}</td>
                    <td>{r.text}</td>
                    <td>{r.difficulty}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
