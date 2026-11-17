'use client';
/*
 * C1.2 new visual (learner review #3): a litre of plasma.
 * Normally about 930 mL is water and about 70 mL is lipid and protein. Sodium is
 * dissolved only in the water. An indirect ISE dilutes a measured volume of
 * whole plasma and assumes the normal water fraction, so when lipid takes up
 * more of the litre it reports less sodium. A direct ISE senses sodium in the
 * water itself and is not fooled. Teaching model: sodium in plasma water
 * 150 mmol/L of water; high-lipid water fraction 0.80.
 */
import { useState } from 'react';
import { C, Frame, Responsive, type Layout } from '../kit';

const NA_IN_WATER = 150;
const NORMAL_WATER = 0.93;

const CASES = [
  { key: 'normal', label: 'Normal plasma', water: 0.93 },
  { key: 'lipid', label: 'Very high lipid', water: 0.8 },
] as const;

/** What each method reports, in mmol/L. */
export function readings(waterFraction: number) {
  return {
    indirect: Math.round(NA_IN_WATER * waterFraction),
    direct: Math.round(NA_IN_WATER * NORMAL_WATER),
  };
}

const NA_DOTS = [
  [0.15, 0.05],
  [0.45, 0.08],
  [0.75, 0.06],
  [0.3, 0.2],
  [0.62, 0.22],
  [0.86, 0.18],
  [0.12, 0.34],
  [0.46, 0.36],
  [0.78, 0.33],
  [0.25, 0.5],
  [0.58, 0.49],
  [0.88, 0.52],
  [0.14, 0.64],
  [0.42, 0.66],
  [0.72, 0.63],
  [0.28, 0.78],
  [0.6, 0.8],
  [0.86, 0.76],
  [0.4, 0.9],
];
const SOLIDS = [
  [0.12, 0.3, 'l'],
  [0.3, 0.7, 'p'],
  [0.5, 0.35, 'l'],
  [0.7, 0.65, 'l'],
  [0.88, 0.4, 'p'],
  [0.2, 0.85, 'l'],
  [0.62, 0.15, 'p'],
  [0.8, 0.88, 'l'],
  [0.4, 0.55, 'l'],
] as const;

function Litre({
  x,
  y,
  w,
  h,
  water,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  water: number;
}) {
  const solidsH = h * (1 - water);
  const top = y + solidsH;
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + h + 12} rx={w * 0.5} ry={7} fill={C.drop} />
      <rect
        className="ix-grow"
        x={x}
        style={{ y: top, height: y + h - top }}
        width={w}
        fill={C.water}
        fillOpacity={0.22}
      />
      <rect
        className="ix-grow"
        x={x}
        y={y}
        width={w}
        style={{ height: solidsH }}
        fill="var(--ix-tint-mustard)"
      />
      <line
        className="ix-anim"
        x1={x}
        x2={x + w}
        y1={top}
        y2={top}
        stroke={C.outline}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      {NA_DOTS.map(([fx, fy]) => {
        const cy = y + h - 8 - fy * (h - 16);
        return (
          <circle
            key={`n${fx}-${fy}`}
            className="ix-anim"
            cx={x + 12 + fx * (w - 24)}
            cy={cy}
            r={5}
            fill={C.sodium}
            stroke={C.outline}
            strokeWidth={1}
            style={{ opacity: cy > top + 6 ? 1 : 0 }}
          />
        );
      })}
      {SOLIDS.map(([fx, fy, k], i) => (
        <circle
          key={`s${fx}`}
          className="ix-anim"
          cx={x + 12 + fx * (w - 24)}
          cy={y + 7 + fy * Math.max(solidsH - 14, 3)}
          r={k === 'l' ? 5 : 3.5}
          fill={k === 'l' ? 'var(--ix-solid-mustard)' : 'var(--ix-solid-green)'}
          stroke={C.outline}
          strokeWidth={1}
          style={{ opacity: solidsH > 30 || i % 3 === 0 ? 1 : 0 }}
        />
      ))}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill="none"
        stroke={C.outline}
        strokeWidth={3}
      />
      <text
        x={x + w / 2}
        y={y - 10}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.muted}
      >
        1 litre of plasma
      </text>
    </g>
  );
}

function Labels({
  x,
  y,
  h,
  water,
  lineFrom,
  compact,
}: {
  x: number;
  y: number;
  h: number;
  water: number;
  lineFrom: number;
  compact?: boolean;
}) {
  const top = y + h * (1 - water);
  const solidsMid = y + (top - y) / 2;
  const waterMid = top + (y + h - top) / 2;
  const mlWater = Math.round(water * 1000);
  return (
    <g>
      <path
        className="ix-anim"
        d={`M${lineFrom} ${solidsMid}H${x - 6}`}
        stroke={C.muted}
        strokeWidth={1.2}
      />
      <text className="ix-anim" x={x} y={solidsMid - 2} fontSize={13} fontWeight={600} fill={C.ink}>
        about {1000 - mlWater} mL {compact ? '' : 'lipid and protein'}
      </text>
      <text className="ix-anim" x={x} y={solidsMid + 14} fontSize={11.5} fill={C.muted}>
        {compact ? 'lipid and protein' : 'no sodium dissolved here'}
      </text>
      <path d={`M${lineFrom} ${waterMid}H${x - 6}`} stroke={C.muted} strokeWidth={1.2} />
      <text x={x} y={waterMid - 2} fontSize={13} fontWeight={600} fill={C.ink}>
        about {mlWater} mL water
      </text>
      <text x={x} y={waterMid + 14} fontSize={11.5} fill={C.muted}>
        {compact ? 'holds the sodium' : 'sodium is dissolved in this part'}
      </text>
    </g>
  );
}

export function PlasmaLitre() {
  const [k, setK] = useState<(typeof CASES)[number]['key']>('normal');
  const c = CASES.find((x) => x.key === k)!;
  const r = readings(c.water);
  const wide: Layout = {
    w: 560,
    h: 300,
    draw: () => (
      <g>
        <Litre x={40} y={34} w={170} h={240} water={c.water} />
        <Labels x={250} y={34} h={240} water={c.water} lineFrom={214} />
      </g>
    ),
  };
  const narrow: Layout = {
    w: 340,
    h: 300,
    draw: () => (
      <g>
        <Litre x={16} y={34} w={120} h={240} water={c.water} />
        <Labels x={156} y={34} h={240} water={c.water} lineFrom={140} compact />
      </g>
    ),
  };
  return (
    <Frame
      title="Sodium lives in plasma water, so less water per litre can fool the main analyser"
      keyText="Orange dots are sodium, which is dissolved only in the water. Yellow and green are lipid and protein."
      note="Teaching model: the sodium in the water is held at 150 mmol per litre of water, and the high-lipid sample is about 80% water. Real samples vary."
    >
      <div className="ix-choices" role="group" aria-label="Sample">
        {CASES.map((x) => (
          <button
            key={x.key}
            type="button"
            className="ix-choice"
            aria-pressed={k === x.key}
            onClick={() => setK(x.key)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <Responsive
        name="c1-2-plasma-litre"
        label="A litre of plasma split into water and lipid plus protein"
        wide={wide}
        narrow={narrow}
      />
      <div className={`ix-readout${r.indirect < 135 ? ' ix-readout-warn' : ''}`} aria-live="polite">
        <dl className="ix-stats">
          <div>
            <dt>Indirect ISE (main analyser)</dt>
            <dd className={r.indirect < 135 ? 'ix-hot' : undefined}>{r.indirect} mmol/L</dd>
          </div>
          <div>
            <dt>Direct ISE (blood gas analyser)</dt>
            <dd>{r.direct} mmol/L</dd>
          </div>
        </dl>
        <p className="ix-sub">
          {k === 'normal'
            ? 'Both agree. The indirect method dilutes a measured volume of whole plasma and assumes it is about 93% water, which holds here.'
            : 'The water still holds the same sodium, but each litre now contains less water. The indirect method still assumes 93% water, so it reports a falsely low sodium. The direct method senses sodium in the water itself and reads normal: this is pseudohyponatraemia.'}
        </p>
      </div>
    </Frame>
  );
}
