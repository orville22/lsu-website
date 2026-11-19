/*
 * C1.2 new visual (learner review #3): a litre of plasma, side by side.
 * Normally about 930 mL of each litre is water and about 70 mL is lipid and
 * protein; sodium is dissolved only in the water. With very high lipid the water
 * share falls. An indirect ISE assumes the normal water share and reports low;
 * a direct ISE senses sodium in the water itself. Teaching model: 150 mmol of
 * sodium per litre of plasma water; high-lipid water share 0.80.
 */
import { C, Frame, Responsive, type Layout } from '../kit';

const NA_IN_WATER = 150;
const NORMAL_WATER = 0.93;

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
const LIPID = [
  [0.1, 0.25, 7],
  [0.28, 0.65, 5],
  [0.46, 0.3, 8],
  [0.66, 0.6, 6],
  [0.86, 0.35, 7],
  [0.18, 0.8, 4],
  [0.56, 0.82, 5],
  [0.76, 0.12, 4],
  [0.38, 0.12, 4],
];
const PROTEIN = [
  [0.2, 0.45],
  [0.6, 0.5],
  [0.92, 0.75],
  [0.04, 0.6],
];

function Litre({
  x,
  y,
  w,
  h,
  water,
  title,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  water: number;
  title: string;
}) {
  const solidsH = h * (1 - water);
  const top = y + solidsH;
  return (
    <g>
      <text
        x={x + w / 2}
        y={y - 12}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill={C.ink}
      >
        {title}
      </text>
      <ellipse cx={x + w / 2} cy={y + h + 12} rx={w * 0.52} ry={7} fill={C.drop} />
      <rect x={x} y={top} width={w} height={y + h - top} fill={C.water} fillOpacity={0.22} />
      <rect x={x} y={y} width={w} height={solidsH} fill="var(--ix-tint-mustard)" />
      <line
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
        return cy > top + 7 ? (
          <g key={`n${fx}-${fy}`}>
            <circle cx={x + 12 + fx * (w - 24)} cy={cy + 1.5} r={5} fill={C.drop} />
            <circle
              cx={x + 12 + fx * (w - 24)}
              cy={cy}
              r={5}
              fill={C.sodium}
              stroke={C.outline}
              strokeWidth={1}
            />
          </g>
        ) : null;
      })}
      {solidsH > 30 ? (
        <>
          {LIPID.map(([fx, fy, r]) => (
            <circle
              key={`l${fx}`}
              cx={x + 10 + fx * (w - 20)}
              cy={y + 8 + fy * (solidsH - 16)}
              r={r}
              fill="var(--ix-solid-mustard)"
              stroke={C.outline}
              strokeWidth={1}
            />
          ))}
          {PROTEIN.map(([fx, fy]) => (
            <path
              key={`p${fx}`}
              d={`M${x + 10 + fx * (w - 20) - 6} ${y + 8 + fy * (solidsH - 16)}q3 -5 6 0t6 0`}
              fill="none"
              stroke="var(--ix-solid-green)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}
        </>
      ) : (
        [0.15, 0.4, 0.65, 0.88].map((fx) => (
          <circle
            key={fx}
            cx={x + fx * w}
            cy={y + solidsH / 2}
            r={4}
            fill="var(--ix-solid-mustard)"
            stroke={C.outline}
            strokeWidth={1}
          />
        ))
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill="none"
        stroke={C.outline}
        strokeWidth={3}
      />
      <path
        d={`M${x + 10} ${y + 14}V${y + h - 14}`}
        stroke={C.highlight}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <text
        x={x + w / 2}
        y={y + h + 32}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.ink}
      >
        {Math.round(water * 1000)} mL water
      </text>
      <text x={x + w / 2} y={y + h + 48} textAnchor="middle" fontSize={11.5} fill={C.muted}>
        {Math.round((1 - water) * 1000)} mL lipid + protein
      </text>
    </g>
  );
}

const wide: Layout = {
  w: 640,
  h: 340,
  draw: () => (
    <g>
      <Litre x={70} y={40} w={180} h={240} water={0.93} title="Normal plasma" />
      <Litre x={390} y={40} w={180} h={240} water={0.8} title="Very high lipid" />
    </g>
  ),
};
const narrow: Layout = {
  w: 340,
  h: 340,
  draw: () => (
    <g>
      <Litre x={18} y={40} w={136} h={240} water={0.93} title="Normal" />
      <Litre x={186} y={40} w={136} h={240} water={0.8} title="Very high lipid" />
    </g>
  ),
};

export function PlasmaLitre() {
  const n = readings(0.93);
  const l = readings(0.8);
  return (
    <Frame
      title="Sodium is confined to plasma water, so a lower water fraction makes indirect ISE read falsely low"
      keyText="Each tube is one litre of plasma. Orange dots are sodium, dissolved only in the water; yellow is lipid and green is protein."
      note="Teaching model: the water holds 150 mmol of sodium per litre of water in both samples, and the high-lipid sample is about 80% water. Real samples vary."
    >
      <Responsive
        name="c1-2-plasma-litre"
        label="Normal and very high lipid plasma side by side, split into water and lipid plus protein"
        wide={wide}
        narrow={narrow}
      />
      <table className="ix-table">
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">Normal plasma</th>
            <th scope="col">Very high lipid</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Water in each litre</th>
            <td>about 930 mL</td>
            <td>about 800 mL</td>
          </tr>
          <tr>
            <th scope="row">Sodium in the water</th>
            <td>150 mmol per litre of water</td>
            <td>150 mmol per litre of water</td>
          </tr>
          <tr>
            <th scope="row">Indirect ISE (main analyser)</th>
            <td>{n.indirect} mmol/L</td>
            <td className="ix-hot">{l.indirect} mmol/L, falsely low</td>
          </tr>
          <tr>
            <th scope="row">Direct ISE (blood gas analyser)</th>
            <td>{n.direct} mmol/L</td>
            <td>{l.direct} mmol/L</td>
          </tr>
        </tbody>
      </table>
      <p className="ix-note">
        The indirect method dilutes a measured volume of whole plasma and assumes it is about 93%
        water. When lipid takes up more of the litre, that assumption fails and it reports less
        sodium. The direct method senses sodium in the water itself, so it reads normal: this is
        pseudohyponatraemia.
      </p>
    </Frame>
  );
}
