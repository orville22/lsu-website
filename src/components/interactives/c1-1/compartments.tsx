/* C1.1 visual 2: where water, sodium and potassium live. */
import { C, Frame, Ion, Label, Responsive } from '../kit';

// Evenly spread, deterministic dot positions (R2 low-discrepancy sequence).
const frac = (v: number) => v - Math.floor(v);
const dots = (xa: number, xb: number, ya: number, yb: number, n: number, col: string) =>
  Array.from({ length: n }, (_, i) => (
    <Ion
      key={i}
      x={xa + 20 + frac(0.5 + i * 0.7548777) * (xb - xa - 40)}
      y={ya + 20 + frac(0.5 + i * 0.5698403) * (yb - ya - 40)}
      fill={col}
    />
  ));

function Box({
  x,
  y,
  w,
  h,
  shade,
  r = 10,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  shade: number;
  r?: number;
}) {
  return (
    <g>
      <rect x={x} y={y + 4} width={w} height={h} rx={r} fill={C.drop} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={C.node} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill={C.water}
        fillOpacity={shade}
        stroke={C.outline}
        strokeWidth={1.5}
      />
    </g>
  );
}

/** Phospholipid bilayer along a straight line: heads on both faces, tails between. */
function Bilayer({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const vertical = x1 === x2;
  const len = vertical ? y2 - y1 : x2 - x1;
  const n = Math.floor(len / 9);
  const step = len / n;
  return (
    <g>
      <rect
        x={vertical ? x1 - 7 : x1}
        y={vertical ? y1 : y1 - 7}
        width={vertical ? 14 : len}
        height={vertical ? len : 14}
        fill={C.node}
      />
      {Array.from({ length: n }, (_, i) => {
        const t = (vertical ? y1 : x1) + step * (i + 0.5);
        return [-1, 1].map((side) => {
          const hx = vertical ? x1 + side * 5 : t;
          const hy = vertical ? t : y1 + side * 5;
          const tx = vertical ? x1 + side * 0.8 : t;
          const ty = vertical ? t : y1 + side * 0.8;
          return (
            <g key={`${i}${side}`}>
              <line x1={hx} y1={hy} x2={tx} y2={ty} stroke={C.outline} strokeWidth={1} />
              <circle
                cx={hx}
                cy={hy}
                r={2.8}
                fill="var(--ix-solid-mustard)"
                stroke={C.outline}
                strokeWidth={0.9}
              />
            </g>
          );
        });
      })}
    </g>
  );
}

export function Compartments() {
  return (
    <Frame
      title="Sodium lives outside cells, potassium inside, and water moves freely between them"
      keyText="Green dots are potassium, orange dots sodium. Total body water is about 60% of body weight in men and 50% in women."
    >
      <Responsive
        name="compartments"
        label="Sodium lives outside cells, potassium inside, and water moves freely between them"
        wide={{
          w: 760,
          h: 300,
          draw: (id) => {
            const y0 = 50,
              h = 150,
              x1 = 24,
              xm = 430,
              xp = 640,
              x2 = 736;
            return (
              <>
                <Box x={x1} y={y0} w={xm - x1} h={h} shade={0.1} />
                {dots(x1, xm, y0, y0 + h, 12, C.potassium)}
                <Box x={xm} y={y0} w={xp - xm} h={h} shade={0.2} r={0} />
                {dots(xm, xp, y0, y0 + h, 7, C.sodium)}
                <Box x={xp} y={y0} w={x2 - xp} h={h} shade={0.34} />
                {dots(xp, x2, y0, y0 + h, 3, C.sodium)}
                <path
                  d={`M${xm} ${y0 - 12}V${y0 - 20}H${x2}V${y0 - 12}`}
                  fill="none"
                  stroke={C.arrow}
                  strokeWidth={1.25}
                />
                <Label x={(xm + x2) / 2} y={y0 - 28} strong>
                  Outside cells (ECF): sodium dominates
                </Label>
                <Bilayer x1={xm} y1={y0 + 2} x2={xm} y2={y0 + h - 2} />
                <Label x={(x1 + xm) / 2} y={y0 + h + 24} strong>
                  Inside cells (ICF)
                </Label>
                <Label x={(x1 + xm) / 2} y={y0 + h + 41}>
                  about 57–67% of body water; potassium dominates
                </Label>
                <Label x={(xm + xp) / 2} y={y0 + h + 24} strong>
                  Interstitial fluid
                </Label>
                <Label x={(xm + xp) / 2} y={y0 + h + 41}>
                  bathes the cells
                </Label>
                <Label x={(xp + x2) / 2} y={y0 + h + 24} strong>
                  Plasma
                </Label>
                <Label x={(xp + x2) / 2} y={y0 + h + 41}>
                  what the lab samples
                </Label>
                <path
                  d={`M${xm - 40} ${y0 + h + 62}H${xm + 40}`}
                  fill="none"
                  stroke={C.arrow}
                  strokeWidth={1.4}
                  markerStart={`url(#${id}-arrow)`}
                  markerEnd={`url(#${id}-arrow)`}
                />
                <Label x={xm} y={y0 + h + 84} strong>
                  Cell membrane (bilayer): water crosses freely,
                </Label>
                <Label x={xm} y={y0 + h + 100}>
                  so osmolality inside and outside stays equal
                </Label>
              </>
            );
          },
        }}
        narrow={{
          w: 360,
          h: 390,
          draw: (id) => {
            const x1 = 30,
              x2 = 350,
              xp = 250,
              yA = 46,
              yM = 150,
              yB = 250;
            return (
              <>
                <Label x={190} y={18} strong>
                  Inside cells (ICF)
                </Label>
                <Label x={190} y={35}>
                  about 57–67% of body water; potassium dominates
                </Label>
                <Box x={x1} y={yA} w={x2 - x1} h={yM - yA} shade={0.1} />
                {dots(x1, x2, yA, yM, 12, C.potassium)}
                <Box x={x1} y={yM} w={xp - x1} h={yB - yM} shade={0.2} />
                {dots(x1, xp, yM, yB, 7, C.sodium)}
                <Box x={xp} y={yM} w={x2 - xp} h={yB - yM} shade={0.34} />
                {dots(xp, x2, yM, yB, 3, C.sodium)}
                <Bilayer x1={x1 + 2} y1={yM} x2={x2 - 2} y2={yM} />
                <Label x={(x1 + xp) / 2} y={yB + 20} strong>
                  Interstitial fluid
                </Label>
                <Label x={(x1 + xp) / 2} y={yB + 36}>
                  bathes the cells
                </Label>
                <Label x={(xp + x2) / 2} y={yB + 20} strong>
                  Plasma
                </Label>
                <Label x={(xp + x2) / 2} y={yB + 36}>
                  what the lab samples
                </Label>
                <Label x={190} y={yB + 62} strong>
                  Outside cells (ECF): sodium dominates
                </Label>
                <Label x={190} y={yB + 78}>
                  interstitial fluid plus plasma
                </Label>
                <path
                  d={`M14 ${yM - 28}V${yM + 28}`}
                  fill="none"
                  stroke={C.arrow}
                  strokeWidth={1.4}
                  markerStart={`url(#${id}-arrow)`}
                  markerEnd={`url(#${id}-arrow)`}
                />
                <Label x={190} y={yB + 108} strong>
                  Cell membrane (bilayer): water crosses freely,
                </Label>
                <Label x={190} y={yB + 124}>
                  so osmolality inside and outside stays equal
                </Label>
              </>
            );
          },
        }}
      />
    </Frame>
  );
}
