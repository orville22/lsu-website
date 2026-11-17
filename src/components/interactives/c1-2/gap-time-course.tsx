/*
 * C1.2 visual 2: after a toxic alcohol, the osmolal gap falls as the anion gap rises.
 * Schematic only: the shape of the change, not measured values or timings.
 */
import { C, Frame, Node, Responsive, type Layout } from '../kit';

function Curve({ d, colour, dashed }: { d: string; colour: string; dashed?: boolean }) {
  return (
    <>
      <path
        d={d}
        transform="translate(0 3)"
        fill="none"
        stroke={C.drop}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={colour}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={dashed ? '10 7' : undefined}
      />
    </>
  );
}

function Axes({
  x0,
  x1,
  y0,
  yB,
  early,
  late,
}: {
  x0: number;
  x1: number;
  y0: number;
  yB: number;
  early: number;
  late: number;
}) {
  return (
    <g>
      <path
        d={`M${x0} ${y0}V${yB}H${x1}`}
        fill="none"
        stroke={C.outline}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text x={x0 - 8} y={y0 + 6} textAnchor="end" fontSize={12} fill={C.muted}>
        Size
      </text>
      <text x={early} y={yB + 18} textAnchor="middle" fontSize={12} fill={C.muted}>
        early
      </text>
      <text x={late} y={yB + 18} textAnchor="middle" fontSize={12} fill={C.muted}>
        late
      </text>
      <text x={(x0 + x1) / 2} y={yB + 40} textAnchor="middle" fontSize={12} fill={C.muted}>
        Time since the alcohol was swallowed
      </text>
    </g>
  );
}

const wide: Layout = {
  w: 640,
  h: 310,
  draw: () => (
    <g>
      <Axes x0={60} x1={610} y0={50} yB={252} early={130} late={560} />
      <Curve d="M62 238C112 92 162 92 214 124S400 230 608 242" colour={C.accent} />
      <Curve d="M62 230C210 230 280 214 368 144S540 102 608 102" colour={C.sodium} dashed />
      <text x={150} y={78} fontSize={13} fontWeight={600} fill={C.ink}>
        Osmolal gap: the alcohol itself
      </text>
      <text x={414} y={82} fontSize={13} fontWeight={600} fill={C.ink}>
        Anion gap: its acids
      </text>
      <Node
        x={512}
        y={178}
        w={176}
        title="Late arrival"
        body={['normal osmolal gap,', 'severe acidosis']}
        hue="mustard"
      />
    </g>
  ),
};

const narrow: Layout = {
  w: 340,
  h: 410,
  draw: () => (
    <g>
      <Node
        x={240}
        y={44}
        w={168}
        title="Late arrival"
        body={['normal osmolal gap,', 'severe acidosis']}
        hue="mustard"
      />
      <path d="M290 76V316" stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 4" />
      <Axes x0={44} x1={326} y0={120} yB={342} early={88} late={286} />
      <g transform="translate(0 60)">
        <Curve d="M46 268C76 112 104 112 132 142S222 258 324 270" colour={C.accent} />
        <Curve d="M46 260C116 260 156 242 200 172S292 132 324 132" colour={C.sodium} dashed />
        <text x={86} y={98} fontSize={13} fontWeight={600} fill={C.ink}>
          Osmolal gap
        </text>
        <text x={236} y={114} fontSize={13} fontWeight={600} fill={C.ink}>
          Anion gap
        </text>
      </g>
    </g>
  ),
};

export function GapTimeCourse() {
  return (
    <Frame
      title="After a toxic alcohol, one gap closes as the other opens"
      keyText="Solid blue: the osmolal gap, made by the uncharged alcohol. Dashed orange: the anion gap, made by the charged acids it is broken down into."
      note="Schematic only: the shape of the change, not measured values or real timings."
    >
      <Responsive
        name="c1-2-time"
        label="After a toxic alcohol, the osmolal gap falls as the anion gap rises"
        wide={wide}
        narrow={narrow}
      />
    </Frame>
  );
}
