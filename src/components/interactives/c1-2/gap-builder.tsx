'use client';
/*
 * C1.2 interactive I1: the gap builder.
 * Calculated osmolality = 2 × Na + glucose + urea (+ factor × ethanol), all mmol/L.
 * Pick a preset, then move any slider; switch the ethanol factor between 1.25
 * (Purssell) and 1.0. Bars share one scale, so their lengths compare directly.
 */
import { useId, useState } from 'react';
import { Frame } from '../kit';

export type Values = { na: number; glu: number; urea: number; eth: number; meas: number };
export type Factor = 1 | 1.25;

const PRESETS: {
  key: string;
  label: string;
  v: Values;
  note: string;
  sub: string;
  /** The note only holds at this factor (ethanol presets). */
  factor?: Factor;
}[] = [
  {
    key: 'base',
    label: 'Healthy adult',
    v: { na: 140, glu: 5, urea: 5, eth: 0, meas: 292 },
    note: 'Sodium 140, glucose 5 and urea 5 mmol/L account for almost every particle.',
    sub: 'Nearly all of the measured osmolality is sodium and its partner anions.',
  },
  {
    key: 'raw',
    label: 'After drinking',
    v: { na: 140, glu: 5, urea: 5, eth: 0, meas: 342 },
    note: 'Same sodium, glucose and urea, but 52 extra particles per kilogram of water.',
    sub: 'Something the formula doesn’t count is present. Here it’s ethanol at 40 mmol/L, not yet measured.',
  },
  {
    key: 'fix',
    label: 'Ethanol added in',
    v: { na: 140, glu: 5, urea: 5, eth: 40, meas: 342 },
    factor: 1.25,
    note: 'Adding ethanol (1.25 × 40 = 50) to the calculation closes the gap.',
    sub: 'The ethanol explains the gap. It doesn’t prove nothing else is there.',
  },
  {
    key: 'kid',
    label: 'Kidney failure',
    v: { na: 138, glu: 5, urea: 40, eth: 0, meas: 326 },
    note: 'Urea 40 mmol/L makes the osmolality high, and the formula already counts it.',
    sub: 'Cells are not shrinking: urea is an ineffective osmole.',
  },
  {
    key: 'lip',
    label: 'Lipaemic sample',
    v: { na: 125, glu: 5, urea: 5, eth: 0, meas: 288 },
    note: 'Fat takes up plasma volume, so an indirect method reports sodium falsely low at 125.',
    sub: 'The osmometer counts particles in the water, so measured osmolality stays normal. Covered in C1.4.',
  },
  {
    key: 'case',
    label: 'The 2 am case',
    v: { na: 138, glu: 5.5, urea: 4.5, eth: 50, meas: 352 },
    factor: 1.25,
    note: 'The case: osmolality 352 mmol/kg, ethanol 50 mmol/L.',
    sub: 'With the 1.25 factor, ethanol explains nearly all of the gap. Switch to × 1.0 and see what’s left.',
  },
];

export function calculated(v: Values, factor: Factor) {
  return 2 * v.na + v.glu + v.urea + factor * v.eth;
}

export function gapOf(v: Values, factor: Factor) {
  return v.meas - calculated(v, factor);
}

/** Reading of a gap against the healthy range quoted in the lesson (about −14 to +10). */
export function band(gap: number) {
  if (gap > 10)
    return {
      note: 'Above the usual upper limit of about 10 mmol/kg.',
      sub: 'Something the formula doesn’t count may be present: unmeasured ethanol, a toxic alcohol, or a sample problem.',
      warn: true,
    };
  if (gap < -14)
    return {
      note: 'Below the range seen in healthy people.',
      sub: 'Check the units, the sample and the inputs before reading anything into it.',
      warn: true,
    };
  return {
    note: 'Within the range seen in healthy people, about −14 to +10 mmol/kg.',
    sub: 'A normal gap doesn’t rule out a toxic alcohol, especially late after ingestion.',
    warn: false,
  };
}

const fmt = (x: number) => {
  const r = Math.round(x * 10) / 10;
  return r < 0 ? `−${-r}` : `${r}`;
};
const same = (a: Values, b: Values) =>
  a.na === b.na && a.glu === b.glu && a.urea === b.urea && a.eth === b.eth && a.meas === b.meas;

const SLIDERS: {
  k: keyof Values;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { k: 'na', label: 'Sodium', unit: 'mmol/L', min: 110, max: 170, step: 1 },
  { k: 'glu', label: 'Glucose', unit: 'mmol/L', min: 0, max: 40, step: 0.5 },
  { k: 'urea', label: 'Urea', unit: 'mmol/L', min: 0, max: 60, step: 0.5 },
  { k: 'eth', label: 'Ethanol', unit: 'mmol/L', min: 0, max: 120, step: 5 },
  { k: 'meas', label: 'Measured osmolality', unit: 'mmol/kg', min: 240, max: 460, step: 1 },
];

export function GapBuilder() {
  const [v, setV] = useState<Values>(PRESETS[0].v);
  const [factor, setFactor] = useState<Factor>(1.25);
  const uid = useId();
  const calc = calculated(v, factor);
  const gap = v.meas - calc;
  const other: Factor = factor === 1.25 ? 1 : 1.25;
  const preset = PRESETS.find((p) => same(p.v, v));
  const usePreset = preset && (!preset.factor || preset.factor === factor);
  const b = band(gap);
  const text = usePreset ? { note: preset.note, sub: preset.sub, warn: false } : b;
  const scale = Math.max(360, calc, v.meas) * 1.04;
  const pct = (x: number) => `${((Math.max(0, x) / scale) * 100).toFixed(2)}%`;
  return (
    <Frame
      title="Calculated against measured osmolality: what the formula leaves uncounted"
      keyText="Pick a situation, then move any slider. The dashed box is the gap."
      note="Illustrative numbers. Both bars use the same scale."
    >
      <div className="ix-choices" role="group" aria-label="Situations">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="ix-choice"
            aria-pressed={preset?.key === p.key}
            onClick={() => setV(p.v)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="ix-controls">
        {SLIDERS.map((s) => (
          <label key={s.k} className="ix-control" htmlFor={`${uid}-${s.k}`}>
            <span className="ix-control-head">
              <span>{s.label}</span>
              <output htmlFor={`${uid}-${s.k}`}>
                {fmt(v[s.k])} {s.unit}
              </output>
            </span>
            <input
              id={`${uid}-${s.k}`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={v[s.k]}
              onChange={(e) => setV({ ...v, [s.k]: Number(e.target.value) })}
            />
          </label>
        ))}
        <div className="ix-control">
          <span className="ix-control-head">
            <span>Ethanol factor</span>
          </span>
          <div className="ix-choices ix-choices-tight" role="group" aria-label="Ethanol factor">
            {([1, 1.25] as const).map((f) => (
              <button
                key={f}
                type="button"
                className="ix-choice"
                aria-pressed={factor === f}
                onClick={() => setFactor(f)}
              >
                × {f === 1 ? '1.0' : '1.25'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ix-bars" aria-hidden="true">
        <span className="ix-bar-label">
          Calculated
          <small>the guest list</small>
        </span>
        <div className="ix-bar-track">
          <span
            className="ix-seg"
            style={{ width: pct(2 * v.na), background: 'var(--ix-solid-sodium)' }}
          />
          <span
            className="ix-seg"
            style={{ width: pct(v.glu), background: 'var(--ix-solid-green)' }}
          />
          <span
            className="ix-seg"
            style={{ width: pct(v.urea), background: 'var(--ix-solid-mustard)' }}
          />
          <span
            className="ix-seg"
            style={{ width: pct(factor * v.eth), background: 'var(--ix-solid-pink)' }}
          />
          {gap > 0 && <span className="ix-seg ix-seg-gap" style={{ width: pct(gap) }} />}
        </div>
        <span className="ix-bar-label">
          Measured
          <small>the headcount</small>
        </span>
        <div className="ix-bar-track">
          <span
            className="ix-seg"
            style={{ width: pct(v.meas), background: 'var(--ix-solid-water)' }}
          />
          {gap < 0 && <span className="ix-seg ix-seg-gap" style={{ width: pct(-gap) }} />}
        </div>
      </div>
      <ul className="ix-legend" aria-hidden="true">
        <li>
          <i style={{ background: 'var(--ix-solid-sodium)' }} />2 × sodium
        </li>
        <li>
          <i style={{ background: 'var(--ix-solid-green)' }} />
          glucose
        </li>
        <li>
          <i style={{ background: 'var(--ix-solid-mustard)' }} />
          urea
        </li>
        <li>
          <i style={{ background: 'var(--ix-solid-pink)' }} />
          ethanol × factor
        </li>
        <li>
          <i className="ix-legend-gap" />
          the gap
        </li>
      </ul>
      <div className={`ix-readout${text.warn ? ' ix-readout-warn' : ''}`} aria-live="polite">
        <p>
          Calculated <strong>{fmt(calc)}</strong> · measured <strong>{fmt(v.meas)}</strong> · gap{' '}
          <span className="ix-big">{fmt(gap)} mmol/kg</span>
        </p>
        <p>{text.note}</p>
        <p className="ix-sub">{text.sub}</p>
        <p className="ix-sub">
          {v.eth > 0
            ? `With the ethanol factor at ${factor === 1 ? '1.0' : '1.25'}, the residual gap is ${fmt(gap)}. At ${other === 1 ? '1.0' : '1.25'} it would be ${fmt(gapOf(v, other))}.`
            : `Tonicity (2 × Na + glucose) is ${fmt(2 * v.na + v.glu)} mmol/kg. Urea and ethanol don’t count towards it.`}
        </p>
      </div>
    </Frame>
  );
}
