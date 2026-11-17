'use client';
/*
 * C1.1 new visual (learner review #4): cells swell and shrink.
 * One cell in normal, dilute and concentrated plasma. Water moves towards the
 * side with more dissolved particles; the cell slowly swells or shrinks on a
 * loop, against a dashed ring showing its normal size.
 */
import type { CSSProperties } from 'react';
import { Arrow, C, CellBlob, Droplet, Frame, Ion, Responsive, type Layout } from '../kit';

const flow = (dx: number, dy: number, delay: number) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': '2.2s',
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
  [-0.32, -0.3],
  [0.3, -0.34],
  [-0.36, 0.3],
  [0.3, 0.36],
  [0.02, -0.5],
];

type Kind = 'normal' | 'dilute' | 'conc';
const PANEL: Record<
  Kind,
  { title: string; sub: string; s: number; outDots: number; dir: number; seed: number }
> = {
  normal: {
    title: 'Normal plasma',
    sub: 'No net water movement',
    s: 1,
    outDots: 10,
    dir: 0,
    seed: 1,
  },
  dilute: {
    title: 'Dilute plasma',
    sub: 'Water moves in: the cell swells',
    s: 1.22,
    outDots: 5,
    dir: -1,
    seed: 2,
  },
  conc: {
    title: 'Concentrated plasma',
    sub: 'Water moves out: the cell shrinks',
    s: 0.78,
    outDots: 14,
    dir: 1,
    seed: 3,
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
  const cy = y + h / 2 + 8;
  const r0 = Math.min(w, h) * 0.2;
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  // Arrows sit outside the cell's largest size and point the way water moves.
  const near = Math.max(r0, r0 * p.s) + 8;
  const far = near + 26;
  return (
    <g>
      <rect x={x} y={y + 4} width={w} height={h} rx={16} fill={C.drop} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill="var(--ix-tint-water)"
        stroke={C.outline}
        strokeWidth={1.8}
      />
      {OUT.slice(0, p.outDots).map(([fx, fy]) => (
        <Ion
          key={`o${fx}-${fy}`}
          x={x + 10 + fx * (w - 20)}
          y={y + 34 + fy * (h - 44)}
          r={5}
          fill={C.sodium}
        />
      ))}
      {kind !== 'normal' && (
        <circle
          cx={cx}
          cy={cy}
          r={r0}
          fill="none"
          stroke={C.muted}
          strokeWidth={1.4}
          strokeDasharray="4 4"
        />
      )}
      <CellBlob cx={cx} cy={cy} r={r0} seed={p.seed} swell={p.dir ? p.s : undefined}>
        {IN.map(([fx, fy]) => (
          <Ion
            key={`i${fx}-${fy}`}
            x={cx + fx * r0 * 1.3}
            y={cy + fy * r0 * 1.3}
            r={4.5}
            fill="var(--ix-solid-mustard)"
          />
        ))}
      </CellBlob>
      {p.dir !== 0 &&
        angles.map((a, i) => {
          const from = p.dir < 0 ? far : near;
          const to = p.dir < 0 ? near : far;
          const ax = (r: number) => cx + Math.cos(a) * r;
          const ay = (r: number) => cy + Math.sin(a) * r;
          return (
            <g key={a}>
              <Arrow id={id} d={`M${ax(from)} ${ay(from)}L${ax(to)} ${ay(to)}`} accent />
              <g className="ix-flow" style={flow(ax(to) - ax(from), ay(to) - ay(from), i * 0.5)}>
                <Droplet x={ax(from)} y={ay(from)} s={0.7} />
              </g>
            </g>
          );
        })}
      <text x={cx} y={y + 24} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.ink}>
        {p.title}
      </text>
      <text x={cx} y={y + h + 26} textAnchor="middle" fontSize={12} fill={p.dir ? C.ink : C.muted}>
        {p.sub}
      </text>
    </g>
  );
}

const wide: Layout = {
  w: 680,
  h: 286,
  draw: (id) => (
    <g>
      <Panel id={id} kind="normal" x={10} y={10} w={206} h={234} />
      <Panel id={id} kind="dilute" x={237} y={10} w={206} h={234} />
      <Panel id={id} kind="conc" x={464} y={10} w={206} h={234} />
    </g>
  ),
};

const narrow: Layout = {
  w: 340,
  h: 750,
  draw: (id) => (
    <g>
      <Panel id={id} kind="normal" x={40} y={10} w={260} h={200} />
      <Panel id={id} kind="dilute" x={40} y={260} w={260} h={200} />
      <Panel id={id} kind="conc" x={40} y={510} w={260} h={200} />
    </g>
  ),
};

export function CellVolume() {
  return (
    <Frame
      title="Water moves towards the more crowded side, so cells swell in dilute plasma and shrink in concentrated plasma"
      keyText="Orange balls are particles dissolved in the plasma; yellow ones are held inside the cell. Arrows show which way water moves. The dashed ring is the cell's normal size."
      note="Not to scale, and slowed down. The arrows show net water movement; water crosses the membrane in both directions all the time."
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
