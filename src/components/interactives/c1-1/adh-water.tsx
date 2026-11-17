'use client';
/*
 * C1.1 new visual (learner review #1): how ADH gets water back.
 * Runs on a loop so each cause is followed by its effect without clicking:
 * no ADH → ADH arrives → binds V2, a signal runs into the cell → aquaporin-2
 * channels move into the urine-side membrane → water crosses towards the salty
 * medulla and the urine concentrates. The loop then resets, which also shows
 * what happens when ADH falls: the channels are taken back in.
 */
import type { CSSProperties } from 'react';
import { Arrow, C, Droplet, Frame, Ion, Responsive, blobPath, type Layout } from '../kit';
import { LoopBar, useLoop } from '../loop';

const PHASES = ['No ADH', 'ADH arrives', 'Binds V2', 'Channels move in', 'Water leaves'];
const DURATIONS = [2800, 1700, 1700, 2000, 5200];

const TEXT = [
  'No ADH. The water channels (aquaporin-2) wait in vesicles inside the cell, so water stays in the duct and the urine leaves dilute.',
  'Plasma becomes more concentrated, and ADH is released into the blood.',
  'ADH binds its V2 receptor on the blood side of the cell. A signal (cyclic AMP) runs into the cell.',
  'The signal moves the vesicles to the urine side, and aquaporin-2 channels are inserted into the membrane.',
  'Water now crosses the cell and leaves through aquaporin-3 and -4, drawn by the salty medulla around the duct. The urine concentrates, up to about 1,200 mmol/kg. When ADH falls, the channels are taken back in.',
];

const flow = (dx: number, dy: number, delay: number, dur = 2.6) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

function Flow({ x, y, style }: { x: number; y: number; style: CSSProperties }) {
  return (
    <g className="ix-flow" style={style}>
      <Droplet x={x} y={y} s={0.85} />
    </g>
  );
}

function Column({
  id,
  x,
  y,
  w,
  h,
  p,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
}) {
  const dw = Math.max(26, w * 0.18);
  const dx = x + w * 0.42 - dw / 2;
  const gid = `${id}-grad`;
  const depths = [0.3, 0.55, 0.8];
  const flowing = p >= 4;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--ix-solid-sodium)" stopOpacity={0.06} />
          <stop offset="1" stopColor="var(--ix-solid-sodium)" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <rect x={x} y={y + 4} width={w} height={h} rx={16} fill={C.drop} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={`url(#${gid})`}
        stroke={C.outline}
        strokeWidth={1.8}
      />
      {[0.2, 0.42, 0.64, 0.86].map((f) => (
        <circle
          key={f}
          cx={x + w * 0.82}
          cy={y + h * f}
          r={2.2 + f * 3}
          fill="var(--ix-solid-sodium)"
          opacity={0.35 + f * 0.5}
        />
      ))}
      <rect
        x={dx}
        y={y - 10}
        width={dw}
        height={h + 20}
        rx={dw / 2}
        fill="var(--ix-tint-water)"
        stroke={C.outline}
        strokeWidth={2.2}
      />
      <rect
        className="ix-anim-slow"
        x={dx + 3}
        y={y - 7}
        width={dw - 6}
        height={h + 14}
        rx={dw / 2 - 3}
        fill="var(--ix-solid-mustard)"
        style={{ opacity: flowing ? 0.6 : 0.08 }}
      />
      {[0, 1, 2].map((i) => (
        <Flow key={`d${i}`} x={dx + dw / 2} y={y + 8} style={flow(0, h - 16, i * 0.85, 2.6)} />
      ))}
      {flowing &&
        depths.map((d, i) => (
          <g key={`o${d}`}>
            <Flow x={dx + dw + 6} y={y + h * d} style={flow(16 + i * 10, 0, i * 0.4, 1.8)} />
            <Flow x={dx - 6} y={y + h * d} style={flow(-(14 + i * 8), 0, 0.9 + i * 0.4, 1.8)} />
          </g>
        ))}
      <Arrow id={id} d={`M${dx + dw / 2} ${y + h + 6}V${y + h + 26}`} />
      <text x={x + w - 10} y={y + 22} textAnchor="end" fontSize={12} fontWeight={600} fill={C.ink}>
        ~300
      </text>
      <text
        x={x + w - 10}
        y={y + h - 12}
        textAnchor="end"
        fontSize={12}
        fontWeight={600}
        fill={C.ink}
      >
        ~1,200
      </text>
      <rect
        x={dx - 6}
        y={y + h * 0.5 - 18}
        width={dw + 12}
        height={36}
        rx={8}
        fill="none"
        stroke={C.ink}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={dx + dw / 2}
        y={y + h + 44}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={flowing ? C.ink : C.muted}
      >
        {flowing ? 'urine out: concentrated' : 'urine out: dilute'}
      </text>
    </g>
  );
}

function Cell({
  id,
  x,
  y,
  w,
  h,
  p,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
}) {
  const aL = x + w * 0.26;
  const bL = x + w * 0.74;
  const mid = (aL + bL) / 2;
  const yRec = y + h * 0.27;
  const rows = [0.5, 0.67, 0.84].map((f) => y + h * f);
  const arrived = p >= 1;
  const bound = p >= 2;
  const inserted = p >= 3;
  const flowing = p >= 4;
  const sigEnd = { x: mid + 6, y: rows[0] - 22 };
  return (
    <g>
      <rect x={x} y={y} width={w * 0.26 - 6} height={h} fill="var(--ix-tint-water)" rx={12} />
      <rect x={bL + 6} y={y} width={w * 0.26 - 6} height={h} fill="var(--ix-tint-sodium)" rx={12} />
      <rect x={aL} y={y + 5} width={bL - aL} height={h - 6} rx={16} fill={C.drop} />
      <rect
        x={aL}
        y={y + 1}
        width={bL - aL}
        height={h - 6}
        rx={16}
        fill="var(--ix-tint-green)"
        stroke={C.outline}
        strokeWidth={2.5}
      />
      <rect
        x={aL + 4}
        y={y + 5}
        width={bL - aL - 8}
        height={h - 14}
        rx={12}
        fill="none"
        stroke={C.outline}
        strokeOpacity={0.35}
        strokeWidth={1.2}
      />
      <path
        d={blobPath(aL + (bL - aL) * 0.25, y + h * 0.27, 16, 4, 0.08)}
        fill="var(--ix-solid-green)"
        fillOpacity={0.35}
        stroke={C.outline}
        strokeOpacity={0.6}
        strokeWidth={1.2}
      />
      <text
        x={x + w * 0.12}
        y={y + 20}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.ink}
      >
        Urine
      </text>
      <text x={mid + 18} y={y + 24} textAnchor="middle" fontSize={12} fontWeight={600} fill={C.ink}>
        Duct cell
      </text>
      <text
        x={bL + w * 0.14}
        y={y + 20}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.ink}
      >
        Blood side
      </text>
      <rect
        className="ix-anim"
        x={bL - 6}
        y={yRec - 14}
        width={12}
        height={28}
        rx={5}
        fill={bound ? C.accent : 'var(--ix-solid-green)'}
        stroke={C.outline}
        strokeWidth={1.5}
      />
      <text
        x={bL - 12}
        y={yRec - 12}
        textAnchor="end"
        fontSize={11}
        fontWeight={600}
        fill={C.muted}
      >
        V2
      </text>
      <g
        className="ix-anim"
        style={{
          transform: `translate(${arrived ? 0 : w * 0.16}px, ${arrived ? 0 : -h * 0.18}px)`,
          opacity: arrived ? 1 : 0,
        }}
      >
        <Ion x={bL + 17} y={yRec} r={10} fill="var(--ix-solid-mustard)" />
        <text
          x={bL + 17}
          y={yRec - 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={C.ink}
        >
          ADH
        </text>
      </g>
      <g className="ix-anim" style={{ opacity: bound ? 1 : 0 }}>
        <Arrow
          id={id}
          d={`M${bL - 16} ${yRec + 4}Q${mid + 14} ${yRec + 4} ${sigEnd.x} ${sigEnd.y}`}
          dashed
        />
      </g>
      <circle
        className="ix-anim-slow"
        cx={bL - 16}
        cy={yRec + 4}
        r={6}
        fill={C.accent}
        stroke={C.outline}
        strokeWidth={1.2}
        style={{
          opacity: p === 2 ? 1 : 0,
          transformBox: 'view-box',
          transform:
            p >= 2 ? `translate(${sigEnd.x - (bL - 16)}px, ${sigEnd.y - (yRec + 4)}px)` : 'none',
        }}
      />
      {rows.map((ry) => (
        <g key={`b${ry}`} opacity={0.8}>
          <rect
            x={bL - 7}
            y={ry - 12}
            width={14}
            height={24}
            rx={5}
            fill="var(--ix-solid-water)"
            stroke={C.outline}
            strokeWidth={1.3}
          />
          <path
            d={`M${bL} ${ry - 7}V${ry + 7}`}
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      ))}
      {rows.map((ry) => (
        <g key={`a${ry}`}>
          <circle
            className="ix-anim"
            cx={mid}
            cy={ry}
            r={16}
            fill="var(--ix-tint-water)"
            stroke={C.outline}
            strokeWidth={1.3}
            style={{ opacity: inserted ? 0 : 1 }}
          />
          <circle
            className="ix-anim"
            cx={mid}
            cy={ry}
            r={12.5}
            fill="none"
            stroke={C.outline}
            strokeOpacity={0.35}
            style={{ opacity: inserted ? 0 : 1 }}
          />
          <g
            className="ix-anim"
            style={{ transform: `translate(${inserted ? 0 : mid - aL}px, 0)` }}
          >
            <rect
              x={aL - 8}
              y={ry - 13}
              width={16}
              height={26}
              rx={5}
              fill="var(--ix-solid-water)"
              stroke={C.outline}
              strokeWidth={1.6}
            />
            <path
              d={`M${aL} ${ry - 8}V${ry + 8}`}
              stroke="#fff"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}
      <text
        x={x + w * 0.12}
        y={rows[2] + 34}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={C.muted}
      >
        AQP2
      </text>
      <text
        x={bL + w * 0.14}
        y={rows[2] + 34}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={C.muted}
      >
        AQP3, AQP4
      </text>
      {!flowing &&
        [0, 1].map((i) => (
          <Flow key={`u${i}`} x={x + w * 0.12} y={y + 38} style={flow(0, h - 50, i * 1.3, 2.6)} />
        ))}
      {flowing &&
        rows.map((ry, i) =>
          [0, 1].map((j) => (
            <Flow
              key={`c${i}-${j}`}
              x={x + w * 0.05}
              y={ry}
              style={flow(w * 0.9, 0, i * 0.45 + j * 1.3, 2.6)}
            />
          )),
        )}
    </g>
  );
}

export function AdhWater() {
  const loop = useLoop(DURATIONS);
  const p = loop.phase;
  const wide: Layout = {
    w: 680,
    h: 372,
    draw: (id) => (
      <g>
        <text x={24} y={30} fontSize={12} fontWeight={600} fill={C.muted}>
          Medulla, mmol/kg
        </text>
        <Column id={id} x={24} y={52} w={176} h={250} p={p} />
        <path
          d="M150 177L264 60M150 213L264 304"
          stroke={C.muted}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          fill="none"
        />
        <Cell id={id} x={264} y={52} w={396} h={260} p={p} />
      </g>
    ),
  };
  const narrow: Layout = {
    w: 360,
    h: 610,
    draw: (id) => (
      <g>
        <text x={110} y={22} fontSize={12} fontWeight={600} fill={C.muted}>
          Medulla, mmol/kg
        </text>
        <Column id={id} x={110} y={40} w={150} h={200} p={p} />
        <path
          d="M156 140L20 330M196 140L340 330"
          stroke={C.muted}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          fill="none"
        />
        <Cell id={id} x={20} y={336} w={320} h={260} p={p} />
      </g>
    ),
  };
  return (
    <Frame
      title="ADH opens water channels, and the salty inner kidney pulls the water out"
      keyText="Left: the collecting duct runs down through the medulla, which gets saltier with depth. Right: one cell of the duct wall, close up. Blue blocks are water channels (aquaporins, AQP)."
      note="Teaching model, not to scale. It plays on a loop; pause it or tap a stage to hold it."
      wide
    >
      <LoopBar labels={PHASES} {...loop} />
      <Responsive
        name="c1-1-adh-water"
        label="How ADH lets the kidney take water back from the urine"
        wide={wide}
        narrow={narrow}
      />
      <div className="ix-readout ix-caption" aria-live="polite">
        <p>
          <strong>{PHASES[p]}</strong>
        </p>
        <p className="ix-sub">{TEXT[p]}</p>
      </div>
    </Frame>
  );
}
