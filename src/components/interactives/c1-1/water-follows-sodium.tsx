'use client';
/*
 * C1.1 new visual (learner review #2): water follows sodium.
 * The extracellular fluid is drawn as a pool around a few cells, fed by the
 * kidney (sodium) and by drinking and the kidney keeping water. Plays on a loop:
 * aldosterone keeps sodium → the fluid becomes saltier → osmoreceptors switch on
 * ADH and thirst → water arrives, the pool grows and the concentration returns.
 * Toy numbers: ECF 18 L at 140 mmol/L; 72 mmol of sodium kept, then 0.5 L water.
 */
import type { CSSProperties } from 'react';
import {
  Arrow,
  C,
  Droplet,
  Frame,
  Ion,
  Node,
  Responsive,
  type Layout,
  type NodeSpec,
} from '../kit';
import { LoopBar, useLoop } from '../loop';

const PHASES = ['Baseline', 'Sodium retained', 'ADH and thirst', 'Water follows'];
const DURATIONS = [2400, 2800, 2600, 4600];

export const STATES = [
  { na: 2520, litres: 18 },
  { na: 2592, litres: 18 },
  { na: 2592, litres: 18 },
  { na: 2592, litres: 18.5 },
];
export const conc = (i: number) => Math.round(STATES[i].na / STATES[i].litres);

const TEXT = [
  'Baseline extracellular fluid (ECF), the fluid around the cells: sodium 140 mmol/L.',
  'Aldosterone increases renal sodium reabsorption. The same volume of water now holds more sodium, so the sodium concentration and osmolality rise slightly.',
  'The osmoreceptors sense the higher osmolality. ADH rises and so does thirst.',
  'The kidney retains water and intake increases. The ECF expands until the sodium concentration returns to baseline: the retained sodium adds volume, not concentration.',
];

// Sodium positions as fractions of the liquid: x across, y up from the bottom.
// They spread out as the level rises, so the concentration looks the same.
const NA = [
  [0.14, 0.12],
  [0.38, 0.08],
  [0.64, 0.14],
  [0.86, 0.1],
  [0.24, 0.36],
  [0.52, 0.32],
  [0.78, 0.4],
  [0.12, 0.6],
  [0.4, 0.62],
  [0.66, 0.66],
  [0.88, 0.7],
  [0.28, 0.86],
];
const EXTRA = [
  [0.56, 0.84],
  [0.8, 0.9],
];

const flow = (dx: number, dy: number, delay: number, dur = 1.8) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

/**
 * The ECF drawn as a graduated beaker. Kept sodium adds ringed dots at the same
 * level (more concentrated); the water that follows raises the level, and the
 * dots spread out until the concentration is back where it started.
 */
function Beaker({
  cx,
  top,
  w,
  h,
  p,
}: {
  cx: number;
  top: number;
  w: number;
  h: number;
  p: number;
}) {
  const grown = p >= 3;
  const salty = p === 1 || p === 2;
  const x = cx - w / 2;
  const bottom = top + h;
  const full = h - 10;
  const level = (grown ? 0.82 : 0.66) * full;
  const inner = { x: x + 8, w: w - 16 };
  const lift = (fy: number) => ({ transform: `translate(0px, ${-fy * (level - 16) - 10}px)` });
  const glass = `M${x - 6} ${top}h12v${h - 14}q0 14 14 14h${w - 28}q14 0 14-14v${-(h - 14)}h12`;
  return (
    <g>
      <ellipse cx={cx} cy={bottom + 8} rx={w * 0.52} ry={7} fill={C.drop} />
      <rect
        className="ix-anim-slow"
        x={inner.x}
        y={bottom - full}
        width={inner.w}
        height={full}
        rx={10}
        fill="var(--ix-tint-water)"
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'bottom',
          transform: `scaleY(${level / full})`,
        }}
      />
      <rect
        className="ix-anim-slow"
        x={inner.x}
        y={bottom - full}
        width={inner.w}
        height={full}
        rx={10}
        fill="var(--ix-solid-sodium)"
        style={{
          opacity: salty ? 0.14 : 0,
          transformBox: 'fill-box',
          transformOrigin: 'bottom',
          transform: `scaleY(${level / full})`,
        }}
      />
      <path
        className="ix-anim-slow"
        d={`M${inner.x} ${bottom}H${inner.x + inner.w}`}
        stroke={C.water}
        strokeWidth={2.5}
        style={{ transform: `translate(0px, ${-level}px)` }}
      />
      {/* graduations */}
      {[0.25, 0.5, 0.75].map((f) => (
        <path
          key={f}
          d={`M${x + w - 4} ${bottom - f * full}h-16`}
          stroke={C.outline}
          strokeOpacity={0.45}
          strokeWidth={1.5}
        />
      ))}
      {NA.map(([fx, fy]) => (
        <g key={`${fx}${fy}`} className="ix-anim-slow" style={lift(fy)}>
          <Ion x={inner.x + 14 + fx * (inner.w - 28)} y={bottom} r={6} fill={C.sodium} />
        </g>
      ))}
      {EXTRA.map(([fx, fy]) => (
        <g key={`e${fx}`} className="ix-anim-slow" style={{ ...lift(fy), opacity: p >= 1 ? 1 : 0 }}>
          <Ion x={inner.x + 14 + fx * (inner.w - 28)} y={bottom} r={7} fill={C.sodium} />
          <circle
            cx={inner.x + 14 + fx * (inner.w - 28)}
            cy={bottom}
            r={11}
            fill="none"
            stroke={C.ink}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        </g>
      ))}
      <path d={glass} fill="none" stroke={C.outline} strokeWidth={2.5} strokeLinejoin="round" />
      <text
        x={cx}
        y={bottom + 30}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={600}
        fill={C.ink}
      >
        Extracellular fluid
      </text>
    </g>
  );
}

const N: Record<string, Omit<NodeSpec, 'x' | 'y' | 'w'>> = {
  kidney: {
    title: 'Kidney',
    body: ['aldosterone:', 'retains sodium'],
    hue: 'sodium',
    icon: 'kidney',
  },
  brain: {
    title: 'Osmoreceptors',
    body: ['ADH and', 'thirst rise'],
    hue: 'mustard',
    icon: 'brain',
  },
  water: {
    title: 'Water in',
    body: ['renal retention', 'and intake'],
    hue: 'water',
    icon: 'drop',
  },
};

function Lit({ n, on }: { n: NodeSpec; on: boolean }) {
  return (
    <g className="ix-anim" style={{ opacity: on ? 1 : 0.45 }}>
      <Node {...n} tone={on ? 'accent' : 'plain'} />
    </g>
  );
}

export function WaterFollowsSodium() {
  const loop = useLoop(DURATIONS);
  const p = loop.phase;
  const wide: Layout = {
    w: 700,
    h: 330,
    draw: (id) => (
      <g>
        <Beaker cx={350} top={70} w={210} h={228} p={p} />
        <Lit n={{ ...N.kidney, x: 84, y: 180, w: 140 }} on={p === 1} />
        <Lit n={{ ...N.brain, x: 610, y: 82, w: 150 }} on={p === 2} />
        <Lit n={{ ...N.water, x: 610, y: 270, w: 150 }} on={p === 3} />
        <g className="ix-anim" style={{ opacity: p === 1 ? 1 : 0.3 }}>
          <Arrow id={id} d="M156 180H226" accent={p === 1} />
        </g>
        <g className="ix-anim" style={{ opacity: p === 2 ? 1 : 0.3 }}>
          <Arrow id={id} d="M460 112Q500 82 532 82" accent={p === 2} />
        </g>
        <g className="ix-anim" style={{ opacity: p >= 2 ? 1 : 0.3 }}>
          <Arrow id={id} d="M610 114V238" accent={p === 3} dashed />
        </g>
        <g className="ix-anim" style={{ opacity: p === 3 ? 1 : 0.3 }}>
          <Arrow id={id} d="M532 262Q486 250 470 236" accent={p === 3} />
        </g>
        {p === 1 &&
          [0, 1, 2].map((i) => (
            <g key={`k${i}`} className="ix-flow" style={flow(80, 0, i * 0.6)}>
              <Ion x={150} y={180} r={6} fill={C.sodium} />
            </g>
          ))}
        {p === 3 &&
          [0, 1, 2, 3].map((i) => (
            <g key={`w${i}`} className="ix-flow" style={flow(0, 56, i * 0.45)}>
              <Droplet x={300 + i * 32} y={30} />
            </g>
          ))}
      </g>
    ),
  };
  const narrow: Layout = {
    w: 340,
    h: 580,
    draw: (id) => (
      <g>
        <Beaker cx={170} top={52} w={200} h={210} p={p} />
        <Lit n={{ ...N.kidney, x: 170, y: 340, w: 230 }} on={p === 1} />
        <Lit n={{ ...N.brain, x: 170, y: 432, w: 230 }} on={p === 2} />
        <Lit n={{ ...N.water, x: 170, y: 524, w: 230 }} on={p === 3} />
        <Arrow id={id} d="M170 370V398" accent={p >= 2} />
        <Arrow id={id} d="M170 462V490" accent={p >= 3} />
        {p === 1 &&
          [0, 1, 2].map((i) => (
            <g key={`k${i}`} className="ix-flow" style={flow(0, -40, i * 0.6)}>
              <Ion x={170} y={304} r={6} fill={C.sodium} />
            </g>
          ))}
        {p === 3 &&
          [0, 1, 2, 3].map((i) => (
            <g key={`w${i}`} className="ix-flow" style={flow(0, 70, i * 0.45)}>
              <Droplet x={118 + i * 35} y={4} />
            </g>
          ))}
      </g>
    ),
  };
  const st = STATES[p];
  const c = conc(p);
  return (
    <Frame
      title="Sodium retention expands the ECF, and the serum sodium concentration is maintained"
      keyText="The beaker stands for the extracellular fluid (ECF). Dots are sodium; ringed dots are sodium retained by the kidney."
      note="Teaching model: an ECF of 18 L, with the changes exaggerated for clarity. In vivo these steps overlap, so serum sodium barely changes."
      wide
    >
      <LoopBar labels={PHASES} {...loop} />
      <Responsive
        name="c1-1-water-follows"
        label="Kept sodium raises osmolality, ADH and thirst follow, and the extra water restores the sodium concentration"
        wide={wide}
        narrow={narrow}
      />
      <div
        className={`ix-readout ix-caption${c > 140 ? ' ix-readout-warn' : ''}`}
        aria-live="polite"
      >
        <p>
          <strong>{PHASES[p]}</strong>
        </p>
        <dl className="ix-stats">
          <div>
            <dt>Sodium in the ECF</dt>
            <dd className={p >= 1 ? 'ix-hot' : undefined}>{st.na.toLocaleString('en-AU')} mmol</dd>
          </div>
          <div>
            <dt>ECF volume</dt>
            <dd className={p >= 3 ? 'ix-hot' : undefined}>{st.litres.toFixed(1)} L</dd>
          </div>
          <div>
            <dt>Serum sodium</dt>
            <dd>{c} mmol/L</dd>
          </div>
        </dl>
        <p className="ix-sub">{TEXT[p]}</p>
      </div>
    </Frame>
  );
}
