// Homepage hero illustration. Tracks the current lesson focus (C1.1, water and sodium
// homeostasis): serum sodium as a balance between water (ADH and thirst) and sodium
// (the RAAS and aldosterone). Colours come from the brand tokens via CSS (.balance-*).

function Drop({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g className="balance-drop" transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0-26C9-13 17-4 17 6a17 17 0 0 1-34 0C-17-4-9-13 0-26Z" />
      <path className="balance-drop-shine" d="M-8 4a8 8 0 0 0 5 9" />
    </g>
  );
}

function Ion({ x, y, r = 21 }: { x: number; y: number; r?: number }) {
  return (
    <g className="balance-ion">
      <circle cx={x} cy={y} r={r} />
      <text x={x} y={y + 6}>
        Na⁺
      </text>
    </g>
  );
}

function Pill({
  x,
  y,
  w,
  label,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  tone: string;
}) {
  return (
    <g className={`balance-pill balance-pill-${tone}`}>
      <rect x={x} y={y} width={w} height={32} rx={16} />
      <text x={x + w / 2} y={y + 22}>
        {label}
      </text>
    </g>
  );
}

export function ScienceVisual() {
  return (
    <figure
      className="science-visual pump-illustration balance-illustration"
      aria-label="Serum sodium as a balance: water, controlled by ADH and thirst, on one side; sodium, controlled by the RAAS and aldosterone, on the other."
    >
      <svg viewBox="0 0 600 500" role="img" aria-labelledby="balance-title balance-description">
        <title id="balance-title">Water and sodium in balance</title>
        <desc id="balance-description">
          A balance scale. The left pan holds water drops, labelled ADH and thirst. The right pan
          holds sodium ions, labelled RAAS and aldosterone. A readout above the scale shows a serum
          sodium of 140 mmol/L: the result reflects the ratio of sodium to water.
        </desc>

        {/* background specks */}
        <g className="balance-specks">
          <circle cx="62" cy="128" r="5" />
          <circle cx="540" cy="150" r="7" />
          <circle cx="508" cy="58" r="4" />
          <circle cx="88" cy="210" r="3" />
          <circle cx="560" cy="250" r="4" />
          <circle cx="40" cy="300" r="6" />
        </g>

        <text x="36" y="58" className="balance-kicker">
          Serum sodium
        </text>
        <text x="36" y="84" className="balance-sub">
          a ratio, not an amount
        </text>

        {/* readout */}
        <g className="balance-readout">
          <rect x="340" y="30" width="226" height="72" rx="20" />
          <text x="362" y="76" className="balance-readout-ion">
            Na⁺
          </text>
          <text x="414" y="81" className="balance-readout-value">
            140
          </text>
          <text x="492" y="80" className="balance-readout-unit">
            mmol/L
          </text>
        </g>

        {/* stand */}
        <path className="balance-stand" d="M292 196h16l10 222h-36Z" />
        <path className="balance-stand" d="M226 440c0-14 12-24 26-24h96c14 0 26 10 26 24Z" />

        {/* needle */}
        <path className="balance-needle" d="M300 196V112" />
        <circle className="balance-needle-tip" cx="300" cy="108" r="8" />

        {/* hangers */}
        <path
          className="balance-hanger"
          d="M150 198 82 300M150 198l68 102M450 198l-68 102M450 198l68 102"
        />

        {/* beam */}
        <rect className="balance-beam" x="96" y="186" width="408" height="16" rx="8" />
        <circle className="balance-pivot" cx="300" cy="194" r="15" />
        <circle className="balance-hook" cx="150" cy="194" r="7" />
        <circle className="balance-hook" cx="450" cy="194" r="7" />

        {/* left pan: water */}
        <Drop x={120} y={283} s={0.95} />
        <Drop x={160} y={280} s={1.1} />
        <Drop x={196} y={287} s={0.85} />
        <Drop x={141} y={252} s={0.8} />
        <Drop x={179} y={250} s={0.75} />
        <path className="balance-pan" d="M66 300h168c0 26-36 44-84 44s-84-18-84-44Z" />

        {/* right pan: sodium */}
        <Ion x={412} y={278} />
        <Ion x={454} y={281} />
        <Ion x={495} y={279} r={19} />
        <Ion x={433} y={242} r={19} />
        <Ion x={474} y={243} r={18} />
        <path className="balance-pan" d="M366 300h168c0 26-36 44-84 44s-84-18-84-44Z" />

        {/* labels */}
        <text x="150" y="382" className="balance-label">
          Water
        </text>
        <Pill x={72} y={398} w={70} label="ADH" tone="pink" />
        <Pill x={150} y={398} w={84} label="Thirst" tone="pink" />

        <text x="450" y="382" className="balance-label">
          Sodium
        </text>
        <Pill x={364} y={398} w={72} label="RAAS" tone="green" />
        <Pill x={442} y={398} w={124} label="Aldosterone" tone="green" />

        <text x="300" y="478" className="balance-caption">
          Sodium ÷ water = the number on the report
        </text>
      </svg>
    </figure>
  );
}
