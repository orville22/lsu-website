'use client';
/*
 * C1.2 interactive I2: effective and ineffective osmoles.
 * Add 60 mmol/kg of one solute to the fluid around a cell. Sodium and glucose
 * stay outside, so tonicity rises and water leaves; urea and ethanol spread to
 * both sides, so osmolality rises but tonicity and cell water don't change.
 * Cell water follows the simple osmometer relation (volume ∝ 1 / tonicity), and
 * the drawn cell's area is in proportion to it.
 */
import { useState } from 'react';
import { C, Frame, Ion } from '../kit';

export const BASE = 290;
export const ADDED = 60;

const SOLUTES = [
  {
    key: 'none',
    label: 'Nothing added',
    effective: false,
    colour: C.muted,
    text: 'Inside and outside both sit at 290 mmol/kg, so water has no reason to move. Pick a solute to add.',
  },
  {
    key: 'na',
    label: 'Sodium salt',
    effective: true,
    colour: C.sodium,
    text: 'Sodium is pumped back out of cells, so it stays outside. Water follows it out and the cell shrinks.',
  },
  {
    key: 'glu',
    label: 'Glucose, no insulin',
    effective: true,
    colour: 'var(--ix-solid-green)',
    text: 'Without insulin, glucose can’t get into cells such as muscle and fat, so it stays outside and pulls water out just as sodium does. This is what happens in uncontrolled diabetes.',
  },
  {
    key: 'gluIns',
    label: 'Glucose, with insulin',
    effective: false,
    colour: 'var(--ix-solid-green)',
    text: 'With insulin working, glucose moves into cells and is used, so it doesn’t stay outside to pull water out. Simplified: some cells, such as brain cells, take up glucose without insulin.',
  },
  {
    key: 'urea',
    label: 'Urea',
    effective: false,
    colour: 'var(--ix-solid-mustard)',
    text: 'Urea crosses the membrane and spreads to both sides. Osmolality rises, but tonicity and cell size don’t.',
  },
  {
    key: 'eth',
    label: 'Ethanol',
    effective: false,
    colour: 'var(--ix-solid-pink)',
    text: 'Ethanol crosses just as freely. It raises the measured osmolality, and the osmolal gap, but moves no water.',
  },
] as const;

export type SoluteKey = (typeof SOLUTES)[number]['key'];

export function cellState(key: SoluteKey) {
  const s = SOLUTES.find((x) => x.key === key)!;
  const osm = key === 'none' ? BASE : BASE + ADDED;
  const tonicity = s.effective ? osm : BASE;
  const waterChange = Math.round((BASE / tonicity - 1) * 100);
  return { osm, tonicity, waterChange, effective: s.effective };
}

// Fixed positions so server and client render the same picture.
const OUT = [
  [44, 60],
  [90, 52],
  [214, 54],
  [256, 66],
  [40, 120],
  [262, 124],
  [38, 186],
  [260, 190],
  [56, 220],
  [120, 226],
  [190, 224],
  [248, 218],
  [70, 92],
  [232, 96],
];
const IN = [
  [132, 118],
  [168, 114],
  [150, 150],
  [124, 160],
  [174, 164],
  [152, 94],
];
const ADD_OUT = [
  [60, 72],
  [240, 82],
  [44, 150],
  [256, 156],
  [72, 204],
  [230, 204],
  [150, 46],
  [150, 230],
];
const ADD_IN = [
  [140, 132],
  [166, 140],
  [146, 176],
];
const ANGLES = [0, Math.PI / 4, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

function Beaker({ solute }: { solute: (typeof SOLUTES)[number] }) {
  const st = cellState(solute.key);
  const cx = 150,
    cy = 140,
    r0 = 64;
  const r = r0 * Math.sqrt(BASE / st.tonicity);
  const outs = solute.key === 'none' ? [] : st.effective ? ADD_OUT : ADD_OUT.slice(0, 5);
  const ins = solute.key === 'none' || st.effective ? [] : ADD_IN;
  const glass = 'M14 18H20V222Q20 236 34 236H266Q280 236 280 222V18H286';
  return (
    <svg
      className="ix-svg ix-beaker ix-cell"
      viewBox="0 0 300 262"
      role="img"
      aria-label={`A cell in fluid after adding ${solute.label.toLowerCase()}`}
    >
      <defs>
        <marker
          id="ix-c1-2-cell-arrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={4.2}
          markerHeight={4.2}
          orient="auto-start-reverse"
        >
          <path
            d="M1 1L9 5L1 9Q2.6 5 1 1z"
            fill={C.accent}
            stroke={C.accent}
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <ellipse cx={150} cy={248} rx={128} ry={8} fill={C.drop} />
      <path
        d="M20 36H280V222Q280 236 266 236H34Q20 236 20 222Z"
        fill={C.water}
        fillOpacity={0.16}
      />
      <path d="M20 36H280" stroke={C.water} strokeWidth={2} strokeLinecap="round" />
      {OUT.map(([x, y]) => (
        <circle key={`o${x}-${y}`} cx={x} cy={y} r={3.5} fill={C.muted} opacity={0.7} />
      ))}
      {st.effective && (
        <circle
          cx={cx}
          cy={cy}
          r={r0}
          fill="none"
          stroke={C.muted}
          strokeWidth={1.2}
          strokeDasharray="4 4"
        />
      )}
      <circle cx={cx} cy={cy + 4} r={r} fill={C.drop} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="var(--ix-tint-water)"
        stroke={C.outline}
        strokeWidth={2.5}
      />
      <path
        d={`M${cx - r * 0.62} ${cy - r * 0.38}a${r * 0.72} ${r * 0.72} 0 0 1 ${r * 0.5} -${r * 0.4}`}
        stroke={C.highlight}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      {IN.map(([x, y]) => (
        <circle key={`i${x}-${y}`} cx={x} cy={y} r={3.5} fill={C.muted} opacity={0.7} />
      ))}
      {[...outs, ...ins].map(([x, y]) => (
        <Ion key={`a${x}-${y}`} x={x} y={y} r={6} fill={solute.colour} />
      ))}
      {st.effective &&
        ANGLES.map((a) => (
          <path
            key={a}
            d={`M${cx + (r + 5) * Math.cos(a)} ${cy + (r + 5) * Math.sin(a)}L${cx + (r + 27) * Math.cos(a)} ${cy + (r + 27) * Math.sin(a)}`}
            stroke={C.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            markerEnd="url(#ix-c1-2-cell-arrow)"
          />
        ))}
      <path
        d={glass}
        fill="none"
        stroke={C.outline}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const signed = (n: number) => (n < 0 ? `−${-n}%` : n > 0 ? `+${n}%` : 'no change');

export function CellTonicity() {
  const [key, setKey] = useState<SoluteKey>('none');
  const solute = SOLUTES.find((s) => s.key === key)!;
  const st = cellState(key);
  return (
    <Frame
      title="Only particles that stay outside the cell pull water out of it"
      keyText="Add 60 mmol/kg of one solute to the fluid around a cell. Grey dots are the particles already there; the coloured balls are what you added."
      note="Teaching model: the cell is treated as a simple osmometer, and its drawn area is in proportion to its water."
    >
      <div className="ix-choices" role="group" aria-label="Solute to add">
        {SOLUTES.map((s) => (
          <button
            key={s.key}
            type="button"
            className="ix-choice"
            aria-pressed={key === s.key}
            onClick={() => setKey(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="ix-row">
        <Beaker solute={solute} />
        <div className="ix-row-side">
          <div className="ix-readout" aria-live="polite">
            <p>
              <strong>
                {st.effective ? 'Water leaves the cell and it shrinks' : 'No net water movement'}
              </strong>
            </p>
            <dl className="ix-stats">
              <div>
                <dt>Measured osmolality</dt>
                <dd>{st.osm} mmol/kg</dd>
              </div>
              <div>
                <dt>Tonicity (effective osmolality)</dt>
                <dd className={st.effective ? 'ix-hot' : undefined}>{st.tonicity} mmol/kg</dd>
              </div>
              <div>
                <dt>Cell water</dt>
                <dd className={st.effective ? 'ix-hot' : undefined}>{signed(st.waterChange)}</dd>
              </div>
            </dl>
            <p className="ix-sub">{solute.text}</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}
