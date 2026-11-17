'use client';
/*
 * C1.2 new visual (learner review #6): the freezing curve of an osmometer.
 * Temperature against time: the sample is supercooled, ice is triggered and
 * the released heat lifts the temperature to a plateau, which is read as the
 * freezing point. Schematic: the curve's shape, not instrument values.
 */
import { C, Frame, Responsive, type Layout } from '../kit';
import { StepControls, useSteps } from '../steps';

const STEPS = ['Supercool', 'Trigger ice', 'Read the plateau'];

const TEXT = [
  'The instrument cools a small sample below its freezing point without letting it freeze. The liquid is now supercooled.',
  'A sharp vibration or stir starts ice forming. Freezing releases heat, so the temperature jumps back up.',
  'The temperature levels off while ice and liquid are in equilibrium. That plateau is the freezing point: about −0.54 °C for plasma at 290 mmol/kg, because each osmole per kilogram of water lowers it by 1.86 °C.',
];

type Box = { x0: number; x1: number; y0: number; y1: number };

function Curve({ b, step }: { b: Box; step: number }) {
  const X = (t: number) => b.x0 + t * (b.x1 - b.x0);
  const Y = (v: number) => b.y0 + v * (b.y1 - b.y0);
  const zero = Y(0.24);
  const fp = Y(0.4);
  const segs = [
    `M${X(0)} ${Y(0.02)}C${X(0.14)} ${Y(0.3)} ${X(0.28)} ${Y(0.66)} ${X(0.42)} ${Y(1)}`,
    `M${X(0.42)} ${Y(1)}L${X(0.455)} ${fp}`,
    `M${X(0.455)} ${fp}H${X(0.82)}C${X(0.89)} ${fp + 4} ${X(0.95)} ${Y(0.5)} ${X(1)} ${Y(0.64)}`,
  ];
  const badge = [
    [X(0.3), Y(0.82)],
    [X(0.48), Y(0.72)],
    [X(0.64), fp - 22],
  ];
  return (
    <g>
      <path
        d={`M${b.x0} ${b.y0 - 10}V${b.y1 + 10}H${b.x1 + 10}`}
        fill="none"
        stroke={C.outline}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text x={b.x0 - 8} y={b.y0} textAnchor="end" fontSize={12} fill={C.muted}>
        Temp.
      </text>
      <text x={b.x1} y={b.y1 + 30} textAnchor="end" fontSize={12} fill={C.muted}>
        Time
      </text>
      <path
        d={`M${b.x0} ${zero}H${b.x1}`}
        stroke={C.muted}
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <text x={b.x0 - 8} y={zero + 4} textAnchor="end" fontSize={12} fill={C.muted}>
        0 °C
      </text>
      <path
        d={`M${b.x0} ${fp}H${b.x1}`}
        stroke="var(--ix-solid-sodium)"
        strokeWidth={1.2}
        strokeDasharray="4 4"
        opacity={step >= 2 ? 1 : 0.3}
      />
      <text
        x={b.x0 - 8}
        y={fp + 4}
        textAnchor="end"
        fontSize={12}
        fontWeight={step >= 2 ? 600 : 400}
        fill={step >= 2 ? C.ink : C.muted}
      >
        FP
      </text>
      {segs.map((d, i) => (
        <g key={d}>
          <path
            d={d}
            transform="translate(0 3)"
            fill="none"
            stroke={C.drop}
            strokeWidth={5}
            strokeLinecap="round"
            className="ix-anim"
            style={{ opacity: step >= i ? 1 : 0 }}
          />
          <path
            d={d}
            pathLength={1}
            fill="none"
            stroke={C.accent}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            className="ix-draw"
            style={{ strokeDashoffset: step >= i ? 0 : 1 }}
          />
        </g>
      ))}
      {badge.map(([bx, by], i) => (
        <g key={`b${i}`} className="ix-anim" style={{ opacity: step >= i ? 1 : 0 }}>
          <circle cx={bx} cy={by + 2} r={12} fill={C.drop} />
          <circle
            cx={bx}
            cy={by}
            r={12}
            fill={step === i ? C.accent : C.node}
            stroke={C.outline}
            strokeWidth={1.5}
          />
          <text
            x={bx}
            y={by + 4.5}
            textAnchor="middle"
            fontSize={12.5}
            fontWeight={700}
            fill={step === i ? C.onAccent : C.ink}
          >
            {i + 1}
          </text>
        </g>
      ))}
      <g className="ix-anim" style={{ opacity: step >= 2 ? 1 : 0 }}>
        <text
          x={X(0.64)}
          y={fp + 22}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={C.ink}
        >
          read here
        </text>
      </g>
    </g>
  );
}

export function FreezingCurve() {
  const s = useSteps(STEPS.length, 3200);
  const { step } = s;
  const wide: Layout = {
    w: 620,
    h: 300,
    draw: () => <Curve b={{ x0: 70, x1: 590, y0: 30, y1: 250 }} step={step} />,
  };
  const narrow: Layout = {
    w: 340,
    h: 280,
    draw: () => <Curve b={{ x0: 54, x1: 320, y0: 26, y1: 230 }} step={step} />,
  };
  return (
    <Frame
      title="A freezing point osmometer supercools the sample, triggers ice, then reads the plateau"
      keyText="Temperature of the sample against time. FP is the sample's freezing point."
      note="Schematic: the shape of the curve, not instrument values. The plateau sits further below 0 °C the more particles the sample holds."
    >
      <StepControls labels={STEPS} {...s} />
      <Responsive
        name="c1-2-freezing"
        label="Temperature of a sample in a freezing point osmometer over time"
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
