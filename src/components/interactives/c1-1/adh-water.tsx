'use client';
/*
 * C1.1 new visual (learner review #1): how ADH gets water back.
 * Left: the collecting duct running down through the medulla, which grows
 * saltier with depth (about 300 to about 1,200 mmol/kg). Right: one duct cell.
 * Step 1: no ADH, aquaporin-2 waits in vesicles. Step 2: ADH binds V2 and the
 * channels are inserted on the urine side. Step 3: water crosses the cell
 * towards the salty medulla (out through aquaporin-3 and -4) and urine concentrates.
 */
import type { CSSProperties } from 'react';
import { Arrow, C, Frame, Ion, Responsive, type Layout } from '../kit';
import { StepControls, useSteps } from '../steps';

const STEPS = ['No ADH', 'ADH binds', 'Water leaves'];

const TEXT = [
  'No ADH. The water channels (aquaporin-2) wait in vesicles inside the cell, so water stays in the duct and the urine leaves dilute.',
  'ADH binds its V2 receptor on the blood side of the cell. The signal moves the vesicles to the urine side, and aquaporin-2 channels are inserted into the membrane.',
  'Water now crosses the cell and leaves through aquaporin-3 and -4 on the blood side, drawn by the salty medulla around the duct. The urine becomes concentrated, up to about 1,200 mmol/kg.',
];

const flow = (dx: number, dy: number, delay: number, dur = 2.6) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

function Drop({ x, y, style }: { x: number; y: number; style: CSSProperties }) {
  return (
    <g className="ix-flow" style={style}>
      <path
        d={`M${x} ${y - 6}C${x - 2.5} ${y - 2} ${x - 4.5} ${y} ${x - 4.5} ${y + 2}a4.5 4.5 0 0 0 9 0c0-2-2-4-4.5-8Z`}
        fill={C.water}
        stroke={C.outline}
        strokeWidth={1}
      />
    </g>
  );
}

/** The medulla column with the collecting duct running down it. */
function Column({
  id,
  x,
  y,
  w,
  h,
  step,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  step: number;
}) {
  const dw = Math.max(26, w * 0.18);
  const dx = x + w * 0.42 - dw / 2;
  const gid = `${id}-grad`;
  const depths = [0.3, 0.55, 0.8];
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--ix-solid-sodium)" stopOpacity={0.06} />
          <stop offset="1" stopColor="var(--ix-solid-sodium)" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <rect x={x} y={y + 4} width={w} height={h} rx={14} fill={C.drop} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={`url(#${gid})`}
        stroke={C.outline}
        strokeWidth={1.5}
      />
      <rect
        x={dx}
        y={y - 10}
        width={dw}
        height={h + 20}
        rx={dw / 2}
        fill="var(--ix-tint-water)"
        stroke={C.outline}
        strokeWidth={2}
      />
      {step < 2 &&
        [0, 1, 2].map((i) => (
          <Drop key={`d${i}`} x={dx + dw / 2} y={y + 8} style={flow(0, h - 16, i * 0.85, 2.6)} />
        ))}
      {step === 2 &&
        depths.map((d, i) => (
          <g key={`o${d}`}>
            <Drop x={dx + dw + 4} y={y + h * d} style={flow(14 + i * 10, 0, i * 0.4, 1.8)} />
            <Drop x={dx - 4} y={y + h * d} style={flow(-(12 + i * 8), 0, 0.9 + i * 0.4, 1.8)} />
          </g>
        ))}
      <Arrow id={id} d={`M${dx + dw / 2} ${y + h - 4}V${y + h + 22}`} />
      <text x={x + w - 8} y={y + 22} textAnchor="end" fontSize={12} fontWeight={600} fill={C.ink}>
        ~300
      </text>
      <text
        x={x + w - 8}
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
    </g>
  );
}

/** One collecting duct cell between the urine and the blood side. */
function Cell({
  id,
  x,
  y,
  w,
  h,
  step,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  step: number;
}) {
  const aL = x + w * 0.26;
  const bL = x + w * 0.74;
  const mid = (aL + bL) / 2;
  const yRec = y + h * 0.27;
  const rows = [0.48, 0.66, 0.84].map((f) => y + h * f);
  const on = step >= 1;
  return (
    <g>
      <rect x={x} y={y} width={w * 0.26} height={h} fill="var(--ix-tint-water)" rx={10} />
      <rect x={bL} y={y} width={w * 0.26} height={h} fill="var(--ix-tint-sodium)" rx={10} />
      <rect x={aL} y={y + 5} width={bL - aL} height={h - 6} rx={14} fill={C.drop} />
      <rect
        x={aL}
        y={y + 1}
        width={bL - aL}
        height={h - 6}
        rx={14}
        fill={C.node}
        stroke={C.outline}
        strokeWidth={2.5}
      />
      <text
        x={x + w * 0.13}
        y={y + 20}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.ink}
      >
        Urine
      </text>
      <text x={mid} y={y + 22} textAnchor="middle" fontSize={12} fontWeight={600} fill={C.ink}>
        Duct cell
      </text>
      <text
        x={bL + w * 0.13}
        y={y + 20}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.ink}
      >
        Blood side
      </text>
      {/* V2 receptor on the blood side, and ADH arriving */}
      <rect
        x={bL - 5}
        y={yRec - 13}
        width={10}
        height={26}
        rx={4}
        fill="var(--ix-solid-green)"
        stroke={C.outline}
        strokeWidth={1.5}
      />
      <text x={bL} y={yRec + 30} textAnchor="middle" fontSize={11} fontWeight={600} fill={C.muted}>
        V2
      </text>
      <text
        x={x + w * 0.13}
        y={rows[2] + 32}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={C.muted}
      >
        AQP2
      </text>
      <text
        x={bL + w * 0.13}
        y={rows[2] + 32}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={C.muted}
      >
        AQP3, AQP4
      </text>
      <g
        className="ix-anim"
        style={{ transform: `translate(${on ? 0 : w * 0.16}px, 0)`, opacity: on ? 1 : 0 }}
      >
        <Ion x={bL + 15} y={yRec} r={9} fill="var(--ix-solid-mustard)" />
        <text
          x={bL + 15}
          y={yRec - 15}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill={C.ink}
        >
          ADH
        </text>
      </g>
      <g className="ix-anim" style={{ opacity: on ? 1 : 0 }}>
        <Arrow
          id={id}
          d={`M${bL - 16} ${yRec + 4}Q${mid + 10} ${yRec + 6} ${mid + 4} ${rows[0] - 20}`}
          dashed
        />
      </g>
      {/* Aquaporin-3 and -4: always on the blood side */}
      {rows.map((ry) => (
        <rect
          key={`b${ry}`}
          x={bL - 6}
          y={ry - 11}
          width={12}
          height={22}
          rx={4}
          fill="var(--ix-solid-water)"
          stroke={C.outline}
          strokeWidth={1.2}
          opacity={0.75}
        />
      ))}
      {/* Aquaporin-2: in vesicles, then in the urine-side membrane */}
      {rows.map((ry) => (
        <g key={`a${ry}`}>
          <circle
            className="ix-anim"
            cx={mid}
            cy={ry}
            r={15}
            fill="var(--ix-tint-water)"
            stroke={C.outline}
            strokeWidth={1.2}
            strokeDasharray="3 2"
            style={{ opacity: on ? 0 : 1 }}
          />
          <g className="ix-anim" style={{ transform: `translate(${on ? 0 : mid - aL}px, 0)` }}>
            <rect
              x={aL - 7}
              y={ry - 12}
              width={14}
              height={24}
              rx={4}
              fill="var(--ix-solid-water)"
              stroke={C.outline}
              strokeWidth={1.5}
            />
            <path
              d={`M${aL} ${ry - 7}V${ry + 7}`}
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}
      {/* Water */}
      {step < 2 &&
        [0, 1].map((i) => (
          <Drop key={`u${i}`} x={x + w * 0.13} y={y + 34} style={flow(0, h - 44, i * 1.3, 2.6)} />
        ))}
      {step === 2 &&
        rows.map((ry, i) =>
          [0, 1].map((j) => (
            <Drop
              key={`c${i}-${j}`}
              x={x + w * 0.06}
              y={ry}
              style={flow(w * 0.9, 0, i * 0.5 + j * 1.3, 2.6)}
            />
          )),
        )}
    </g>
  );
}

export function AdhWater() {
  const s = useSteps(STEPS.length);
  const { step } = s;
  const wide: Layout = {
    w: 680,
    h: 350,
    draw: (id) => (
      <g>
        <text x={24} y={30} fontSize={12} fontWeight={600} fill={C.muted}>
          Medulla, mmol/kg
        </text>
        <Column id={id} x={24} y={52} w={176} h={250} step={step} />
        <path
          d="M150 177L264 60M150 213L264 304"
          stroke={C.muted}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          fill="none"
        />
        <Cell id={id} x={264} y={52} w={396} h={260} step={step} />
        <text x={58} y={340} textAnchor="middle" fontSize={11.5} fill={C.muted}>
          urine out
        </text>
      </g>
    ),
  };
  const narrow: Layout = {
    w: 360,
    h: 580,
    draw: (id) => (
      <g>
        <text x={110} y={22} fontSize={12} fontWeight={600} fill={C.muted}>
          Medulla, mmol/kg
        </text>
        <Column id={id} x={110} y={40} w={150} h={200} step={step} />
        <path
          d="M156 140L20 300M196 140L340 300"
          stroke={C.muted}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          fill="none"
        />
        <Cell id={id} x={20} y={306} w={320} h={260} step={step} />
      </g>
    ),
  };
  return (
    <Frame
      title="ADH opens water channels, and the salty inner kidney pulls the water out"
      keyText="Left: the collecting duct runs down through the medulla, which gets saltier with depth. Right: one cell of the duct wall, close up. Blue blocks are water channels (aquaporins, AQP)."
      note="Teaching model: not to scale, and the signal from the receptor to the vesicles (cyclic AMP) is shown as a single arrow."
      wide
    >
      <StepControls labels={STEPS} {...s} />
      <Responsive
        name="c1-1-adh-water"
        label="How ADH lets the kidney take water back from the urine"
        wide={wide}
        narrow={narrow}
      />
      <div className="ix-readout" aria-live="polite">
        <p>
          <strong>
            Step {step + 1}: {STEPS[step]}
          </strong>
        </p>
        <p className="ix-sub">{TEXT[step]}</p>
      </div>
    </Frame>
  );
}
