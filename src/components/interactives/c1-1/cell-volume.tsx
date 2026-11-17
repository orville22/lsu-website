'use client';
/*
 * C1.1 new visual (learner review #4): cells swell and shrink.
 * One cell in normal, dilute and concentrated plasma. Water crosses the
 * membrane freely and moves towards the side with more dissolved particles.
 */
import type { CSSProperties } from 'react';
import { C, Frame, Responsive, type Layout } from '../kit';

const flow = (dx: number, dy: number, delay: number) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': '2.4s',
  }) as CSSProperties;

const OUT = [
  [0.08, 0.12],
  [0.3, 0.06],
  [0.7, 0.08],
  [0.92, 0.14],
  [0.06, 0.5],
  [0.94, 0.48],
  [0.1, 0.88],
  [0.32, 0.94],
  [0.68, 0.93],
  [0.9, 0.86],
  [0.2, 0.3],
  [0.82, 0.3],
  [0.18, 0.72],
  [0.84, 0.7],
];
const IN = [
  [0.42, 0.42],
  [0.58, 0.44],
  [0.5, 0.58],
  [0.4, 0.6],
  [0.6, 0.6],
];

type Kind = 'normal' | 'dilute' | 'conc';

const PANEL: Record<Kind, { title: string; sub: string; r: number; outDots: number; dir: number }> =
  {
    normal: { title: 'Normal plasma', sub: 'No net water movement', r: 1, outDots: 10, dir: 0 },
    dilute: {
      title: 'Dilute plasma',
      sub: 'Water moves in: the cell swells',
      r: 1.22,
      outDots: 5,
      dir: -1,
    },
    conc: {
      title: 'Concentrated plasma',
      sub: 'Water moves out: the cell shrinks',
      r: 0.78,
      outDots: 14,
      dir: 1,
    },
  };

function Panel({
  id,
  kind,
  x,
  y,
  w,
  h,
}: {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const p = PANEL[kind];
  const cx = x + w / 2;
  const cy = y + h / 2 + 4;
  const r0 = Math.min(w, h) * 0.2;
  const r = r0 * p.r;
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  return (
    <g>
      <rect x={x} y={y + 4} width={w} height={h} rx={14} fill={C.drop} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill="var(--ix-tint-water)"
        stroke={C.outline}
        strokeWidth={1.5}
      />
      {OUT.slice(0, p.outDots).map(([fx, fy]) => (
        <circle
          key={`o${fx}-${fy}`}
          cx={x + 8 + fx * (w - 16)}
          cy={y + 30 + fy * (h - 40)}
          r={4.5}
          fill={C.sodium}
          stroke={C.outline}
          strokeWidth={1}
        />
      ))}
      <circle cx={cx} cy={cy + 3} r={r} fill={C.drop} />
      <circle cx={cx} cy={cy} r={r} fill={C.node} stroke={C.outline} strokeWidth={2.5} />
      {kind !== 'normal' && (
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
      {IN.map(([fx, fy]) => (
        <circle
          key={`i${fx}-${fy}`}
          cx={cx + (fx - 0.5) * r0 * 1.6}
          cy={cy + (fy - 0.5) * r0 * 1.6}
          r={4.5}
          fill="var(--ix-solid-green)"
          stroke={C.outline}
          strokeWidth={1}
        />
      ))}
      {p.dir !== 0 &&
        angles.map((a, i) => {
          const start = p.dir > 0 ? r - 6 : r + 26;
          const len = 26 * p.dir;
          return (
            <g
              key={a}
              className="ix-flow"
              style={flow(Math.cos(a) * len, Math.sin(a) * len, i * 0.5)}
            >
              <path
                d={`M${cx + Math.cos(a) * start} ${cy + Math.sin(a) * start - 5}c-2.3 3.7-4.2 5.6-4.2 7.6a4.2 4.2 0 0 0 8.4 0c0-2-1.9-3.9-4.2-7.6Z`}
                fill={C.water}
                stroke={C.outline}
                strokeWidth={1}
              />
            </g>
          );
        })}
      <text x={cx} y={y + 22} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.ink}>
        {p.title}
      </text>
      <text
        x={cx}
        y={y + h + 24}
        textAnchor="middle"
        fontSize={12}
        fill={p.dir ? C.ink : C.muted}
        id={`${id}-${kind}`}
      >
        {p.sub}
      </text>
    </g>
  );
}

const wide: Layout = {
  w: 660,
  h: 270,
  draw: (id) => (
    <g>
      <Panel id={id} kind="normal" x={10} y={10} w={200} h={220} />
      <Panel id={id} kind="dilute" x={230} y={10} w={200} h={220} />
      <Panel id={id} kind="conc" x={450} y={10} w={200} h={220} />
    </g>
  ),
};

const narrow: Layout = {
  w: 340,
  h: 690,
  draw: (id) => (
    <g>
      <Panel id={id} kind="normal" x={50} y={10} w={240} h={180} />
      <Panel id={id} kind="dilute" x={50} y={240} w={240} h={180} />
      <Panel id={id} kind="conc" x={50} y={470} w={240} h={180} />
    </g>
  ),
};

export function CellVolume() {
  return (
    <Frame
      title="Water moves towards the more crowded side, so cells swell in dilute plasma and shrink in concentrated plasma"
      keyText="Orange dots are particles dissolved in the plasma; green dots are particles held inside the cell. The dashed ring is the cell's normal size."
      note="Not to scale. The arrows show net water movement; water crosses the membrane in both directions all the time."
      wide
    >
      <Responsive
        name="c1-1-cell-volume"
        label="A cell in normal, dilute and concentrated plasma"
        wide={wide}
        narrow={narrow}
      />
    </Frame>
  );
}
