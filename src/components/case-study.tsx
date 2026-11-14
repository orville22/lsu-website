'use client';
import { useState } from 'react';
import Link from 'next/link';
export function CaseStudy() {
  const [reflection, setReflection] = useState('');
  return (
    <>
      <section className="case-step">
        <h2 style={{ fontSize: 'var(--text-subheading)' }}>The starting point</h2>
        <p>
          A fictional adult outpatient has a markedly lipaemic specimen. The chemistry analyser
          reports a low sodium result using an indirect ion-selective electrode method. A laboratory
          scientist reviews the result before release.
        </p>
        <p>
          This constructed scenario demonstrates an analytical concept. It is not a record of a real
          patient and does not provide patient management advice.
        </p>
      </section>
      <details className="case-step">
        <summary>
          <span>01</span>Reveal the initial laboratory findings
        </summary>
        <div className="table-scroll">
          <table>
            <caption>Illustrative results — not universal reference intervals</caption>
            <thead>
              <tr>
                <th>Investigation</th>
                <th>Finding</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sodium, indirect ISE</td>
                <td>126 mmol/L</td>
                <td>Low relative to this fictional lab’s adult interval (135–145 mmol/L)</td>
              </tr>
              <tr>
                <td>Specimen appearance</td>
                <td>Markedly lipaemic</td>
                <td>Prompts review of method susceptibility</td>
              </tr>
              <tr>
                <td>Measured serum osmolality</td>
                <td>289 mOsm/kg</td>
                <td>Within this fictional lab’s interval (275–295 mOsm/kg)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Intervals are illustrative and laboratory-dependent. What does the combination of specimen
          appearance and measured osmolality suggest?
        </p>
        <label className="field">
          <span>Your reasoning (kept only while this page is open)</span>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Which analytical detail would you investigate next?"
            maxLength={3000}
          />
        </label>
      </details>
      <details className="case-step">
        <summary>
          <span>02</span>Reveal a second method
        </summary>
        <table>
          <thead>
            <tr>
              <th>Investigation</th>
              <th>Finding</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sodium, direct ISE</td>
              <td>138 mmol/L</td>
            </tr>
          </tbody>
        </table>
        <p>
          The direct method result differs from the indirect method. Which step in the indirect
          method makes a reduced plasma water fraction relevant?
        </p>
      </details>
      <details className="case-step">
        <summary>
          <span>03</span>Explore the interpretation
        </summary>
        <p>
          In this constructed scenario, the combination is consistent with pseudohyponatraemia
          associated with marked lipaemia and an indirect ISE method. An indirect method includes
          sample dilution and reporting assumptions about the plasma water fraction. A direct ISE
          measures an undiluted specimen and avoids this particular electrolyte exclusion artefact.
        </p>
        <p>
          A measured osmolality within the laboratory interval can be a useful clue, but is not a
          standalone diagnosis. Real investigations require the complete clinical and analytical
          context, including glucose and other osmotically active substances. Do not make treatment
          decisions from this draft educational example.
        </p>
        <p>
          <strong>Key learning points:</strong> know the method, investigate specimen quality,
          distinguish a measurement artefact from a physiological change, and follow the
          laboratory’s validated investigation and reporting procedures.
        </p>
        <p>
          <a
            className="text-link"
            href="https://www.ncbi.nlm.nih.gov/books/NBK470386/"
            target="_blank"
            rel="noreferrer"
          >
            Further reading: NCBI Bookshelf · Hyponatremia ↗
          </a>
        </p>
        <p>
          <Link className="text-link" href="/demo/learn/pseudohyponatraemia">
            Review the draft concept lesson →
          </Link>
        </p>
      </details>
    </>
  );
}
