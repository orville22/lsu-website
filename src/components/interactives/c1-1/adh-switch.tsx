'use client';
/*
 * C1.1 visuals 4 and 6: the ADH switch.
 * "healthy": drag plasma osmolality across the threshold (about 284 mmol/kg) and
 * watch ADH, thirst and urine respond. Qualitative above the threshold.
 * "patient": the case patient (osmolality 270) whose urine is still concentrated.
 */
import { useId, useState, type CSSProperties } from 'react';
import { Frame } from '../kit';

const LO = 266;
const HI = 302;
const THRESHOLD = 284;
const pct = (osm: number) => `${(((osm - LO) / (HI - LO)) * 100).toFixed(1)}%`;

export function adhState(osm: number) {
  if (osm < THRESHOLD)
    return {
      on: false,
      level: 0,
      text: 'ADH switched off. The kidney clears free water, so urine becomes dilute.',
    };
  const level = Math.min(1, (osm - THRESHOLD) / 12);
  return {
    on: true,
    level,
    text:
      level < 1
        ? 'Above the threshold: ADH and thirst rise. Aquaporin-2 channels open and urine becomes more concentrated.'
        : 'Well above the threshold: ADH is high, thirst is strong and urine is close to the most concentrated the kidney can make.',
  };
}

function Track({ osm, marker }: { osm: number; marker?: string }) {
  const s = adhState(osm);
  return (
    <>
      <div className="ix-track" style={{ '--ix-split': pct(THRESHOLD) } as CSSProperties}>
        <div className={`ix-zone ix-zone-off${s.on ? ' dim' : ''}`}>
          ADH switched off
          <small>urine becomes dilute</small>
        </div>
        <div className={`ix-zone ix-zone-on${s.on ? '' : ' dim'}`}>
          ADH rising, thirst rising
          <small>urine becomes concentrated</small>
        </div>
        <div className="ix-threshold" aria-hidden="true">
          <span>Threshold, about {THRESHOLD} mmol/kg</span>
        </div>
        <div className="ix-marker" style={{ left: pct(osm) }} title={marker} aria-hidden="true" />
      </div>
      <div className="ix-axis" aria-hidden="true">
        <span>{LO}</span>
        <span>plasma osmolality, mmol/kg</span>
        <span>{HI}</span>
      </div>
    </>
  );
}

export function AdhSwitch({ variant = 'healthy' }: { variant?: 'healthy' | 'patient' }) {
  const [osm, setOsm] = useState(278);
  const uid = useId();
  if (variant === 'patient') {
    return (
      <Frame
        title="Below the threshold ADH should be off, so his concentrated urine needs explaining"
        keyText="The diamond marks our patient: plasma osmolality 270 mmol/kg."
      >
        <Track osm={270} marker="Our patient: 270 mmol/kg" />
        <div className="ix-readout ix-readout-warn">
          <p>
            <strong>Expected:</strong> dilute urine. <strong>Actual:</strong> urine osmolality 410
            mmol/kg.
          </p>
          <p className="ix-sub">Something other than osmolality is switching ADH on.</p>
        </div>
      </Frame>
    );
  }
  const s = adhState(osm);
  return (
    <Frame
      title="ADH switches on above a threshold; below it, the kidney clears water"
      keyText="ADH is also called vasopressin (AVP). Drag the slider to change plasma osmolality; the diamond follows it."
      note="Teaching model: the threshold varies between people, and ADH rises steeply rather than in fixed steps above it."
    >
      <Track osm={osm} />
      <div className="ix-controls ix-controls-stack">
        <label className="ix-control" htmlFor={`${uid}-osm`}>
          <span className="ix-control-head">
            <span>Plasma osmolality</span>
            <output htmlFor={`${uid}-osm`}>{osm} mmol/kg</output>
          </span>
          <input
            id={`${uid}-osm`}
            type="range"
            min={270}
            max={298}
            step={1}
            value={osm}
            onChange={(e) => setOsm(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="ix-readout" aria-live="polite">
        <p>
          ADH: <strong>{s.on ? (s.level < 1 ? 'rising' : 'high') : 'off'}</strong>
        </p>
        <p className="ix-sub">{s.text}</p>
      </div>
    </Frame>
  );
}
