export function ScienceVisual() {
  return (
    <figure
      className="science-visual pump-illustration"
      aria-label="Sodium–potassium pump: three sodium ions out, two potassium ions in, using ATP."
    >
      <svg viewBox="0 0 600 500" role="img" aria-labelledby="pump-title pump-description">
        <title id="pump-title">Small ions. Big ideas.</title>
        <desc id="pump-description">
          A schematic cell membrane. The sodium–potassium ATPase transports three Na⁺ from inside to
          outside and two K⁺ from outside to inside per cycle, using ATP.
        </desc>
        <text x="30" y="40" className="pump-space-label">
          Outside the cell
        </text>
        <text x="30" y="470" className="pump-space-label">
          Inside the cell
        </text>
        {Array.from({ length: 18 }, (_, i) => (
          <g key={i} className="pump-membrane" opacity={i > 6 && i < 12 ? 0.14 : 0.55}>
            <circle cx={i * 36} cy="231" r="8" />
            <path d={`M${i * 36 - 4} 240v22m8-22v22`} />
            <circle cx={i * 36} cy="293" r="8" />
            <path d={`M${i * 36 - 4} 284v-14m8 14v-14`} />
          </g>
        ))}
        <path
          className="pump-body"
          d="M253 180c-28-61-61-47-51-13l37 85c7 18-9 55-22 78-20 36 20 58 39 29l40-63 32 61c17 32 62 9 45-23l-35-65c-10-20 3-44 11-61l26-54c15-32-23-50-42-18l-36 60-27-53Z"
        />
        <path
          className="pump-arrow sodium-arrow"
          d="M161 350c-42-45-44-113-7-165m-21 6 21-6 1 23"
        />
        <path
          className="pump-arrow potassium-arrow"
          d="M445 165c42 53 47 122 5 173m-1-23 1 23 22-6"
        />
        <g className="pump-ion sodium-ion">
          <circle cx="128" cy="116" r="38" />
          <text x="128" y="127">
            Na⁺
          </text>
        </g>
        <g className="pump-ion sodium-ion">
          <circle cx="298" cy="88" r="32" />
          <text x="298" y="99">
            Na⁺
          </text>
        </g>
        <g className="pump-ion sodium-ion">
          <circle cx="480" cy="100" r="35" />
          <text x="480" y="111">
            Na⁺
          </text>
        </g>
        <g className="pump-ion potassium-ion">
          <circle cx="154" cy="415" r="33" />
          <text x="154" y="426">
            K⁺
          </text>
        </g>
        <g className="pump-ion potassium-ion">
          <circle cx="488" cy="411" r="34" />
          <text x="488" y="422">
            K⁺
          </text>
        </g>
        <rect x="18" y="251" width="110" height="38" rx="8" className="pump-label-backdrop" />
        <rect x="466" y="251" width="111" height="38" rx="8" className="pump-label-backdrop" />
        <text x="24" y="278" className="pump-direction sodium-direction">
          3 Na⁺ out
        </text>
        <text x="473" y="278" className="pump-direction">
          2 K⁺ in
        </text>
        <path d="m286 382-12 22h15l-7 20 30-30h-16l8-12Z" className="pump-energy" />
        <text x="286" y="450" textAnchor="middle" className="pump-atp">
          ATP → ADP + Pᵢ
        </text>
      </svg>
    </figure>
  );
}
