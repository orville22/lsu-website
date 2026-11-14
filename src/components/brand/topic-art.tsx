import type { TopicArtwork } from '@/lib/topic-presentation';
/** Decorative topic illustrations, not clinical data or a model of a complete assay. */
export function TopicArt({ kind, className = '' }: { kind: TopicArtwork; className?: string }) {
  return (
    <svg
      className={`topic-art ${className}`}
      viewBox="0 0 300 180"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'tubes' && (
        <>
          <ellipse cx="150" cy="157" rx="99" ry="9" fill="var(--art-shadow)" />
          {[
            { x: 65, h: 112, c: 'var(--art-pink)' },
            { x: 126, h: 135, c: 'var(--art-yellow)' },
            { x: 187, h: 98, c: 'var(--art-orange)' },
          ].map(({ x, h, c }) => (
            <g key={x}>
              <rect x={x} y={158 - h} width="43" height={h} rx="21" fill="var(--art-paper)" />
              <path d={`M${x + 6} 100h31v35a15.5 15.5 0 0 1-31 0Z`} fill={c} />
              <rect x={x - 3} y={150 - h} width="49" height="22" rx="6" fill="var(--art-ink)" />
              <path
                d={`M${x + 12} ${186 - h}v26`}
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                opacity=".8"
              />
            </g>
          ))}
          <path
            d="M40 126h17m185-77h17m-8-8v16"
            stroke="var(--art-paper)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'ions' && (
        <>
          <path
            d="M79 58 155 36 229 93 162 145 79 58Z"
            stroke="var(--art-paper)"
            strokeWidth="9"
            strokeLinejoin="round"
            opacity=".7"
          />
          <circle cx="79" cy="58" r="34" fill="var(--art-orange)" />
          <circle cx="155" cy="36" r="24" fill="var(--art-pink)" />
          <circle cx="229" cy="93" r="31" fill="var(--art-yellow)" />
          <circle cx="162" cy="145" r="29" fill="var(--art-paper)" />
          <g fill="var(--art-ink)" fontSize="22" fontWeight="600" textAnchor="middle">
            <text x="79" y="66">
              Na⁺
            </text>
            <text x="230" y="101">
              K⁺
            </text>
          </g>
          <path
            d="M40 133h20m-10-10v20"
            stroke="var(--art-paper)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'photometry' && (
        <>
          <ellipse cx="155" cy="157" rx="105" ry="8" fill="var(--art-shadow)" />
          <rect x="82" y="45" width="147" height="107" rx="17" fill="var(--art-paper)" />
          <path d="M82 108h147v26a18 18 0 0 1-18 18H100a18 18 0 0 1-18-18Z" fill="var(--art-ink)" />
          <rect x="147" y="61" width="39" height="53" rx="5" fill="var(--art-blue)" />
          <rect x="156" y="64" width="21" height="47" rx="3" fill="var(--art-yellow)" />
          <path
            d="M31 87h114m42 0h72"
            stroke="var(--art-yellow)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="m250 78 10 9-10 9"
            stroke="var(--art-yellow)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="205" cy="130" r="7" fill="var(--art-orange)" />
          <path d="M104 129h41" stroke="var(--art-paper)" strokeWidth="4" strokeLinecap="round" />
          <path
            d="m60 45 8 10m-32-3 13 7"
            stroke="var(--art-paper)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'qc' && (
        <>
          <path d="m46 35 206-12 9 132-206 12Z" fill="var(--art-shadow)" />
          <rect x="41" y="23" width="212" height="132" rx="12" fill="var(--art-paper)" />
          <path
            d="M66 53h163M66 88h163M66 123h163"
            stroke="var(--art-ink)"
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity=".25"
          />
          <path
            d="M76 90 104 76 132 94 160 67 188 79 218 52"
            stroke="var(--art-blue)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {[
            { x: 76, y: 90 },
            { x: 104, y: 76 },
            { x: 132, y: 94 },
            { x: 160, y: 67 },
            { x: 188, y: 79 },
            { x: 218, y: 52 },
          ].map((p) => (
            <circle key={p.x} cx={p.x} cy={p.y} r="6" fill="var(--art-orange)" />
          ))}
          <path
            d="M245 140h25m-12-12v25"
            stroke="var(--art-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'cardiac' && (
        <>
          <path
            d="M150 147c-14-12-80-53-80-89 0-35 48-45 80-9 32-36 80-26 80 9 0 36-66 77-80 89Z"
            fill="var(--art-pink)"
          />
          <path
            d="M35 92h59l13-24 18 49 23-66 20 43h96"
            stroke="var(--art-paper)"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="246" cy="41" r="12" fill="var(--art-yellow)" />
        </>
      )}
      {kind === 'immunoassay' && (
        <>
          <path
            d="m54 42 40 38 40-38M94 79v69m72-106 40 38 40-38m-40 37v69"
            stroke="var(--art-paper)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="m142 78 9-16 19 5 2 20-16 8Z" fill="var(--art-yellow)" />
          <circle cx="55" cy="39" r="13" fill="var(--art-orange)" />
          <circle cx="245" cy="39" r="13" fill="var(--art-pink)" />
        </>
      )}
    </svg>
  );
}

export function VideoArtwork() {
  return (
    <div className="science-video-art" aria-hidden="true">
      <svg viewBox="0 0 500 250" fill="none">
        <rect x="36" y="22" width="319" height="205" rx="19" fill="var(--art-ink)" />
        <rect x="52" y="47" width="287" height="151" rx="7" fill="var(--art-blue)" />
        {[65, 109, 153, 197, 241, 285].map((x) => (
          <g key={x}>
            <rect x={x} y="30" width="22" height="8" rx="2" fill="var(--art-paper)" />
            <rect x={x} y="208" width="22" height="8" rx="2" fill="var(--art-paper)" />
          </g>
        ))}
        <path
          d="M163 82h49m-40 0v43l-33 48q-5 9 7 9h85q12 0 7-9l-34-48V82"
          fill="var(--art-paper)"
        />
        <path d="m154 153-14 21q-3 5 6 5h85q9 0 6-5l-14-21Z" fill="var(--art-orange)" />
        <circle cx="187" cy="143" r="7" fill="var(--art-yellow)" />
        <circle cx="200" cy="121" r="4" fill="var(--art-yellow)" />
        <rect
          x="376"
          y="61"
          width="78"
          height="132"
          rx="14"
          transform="rotate(8 376 61)"
          fill="var(--art-yellow)"
        />
        <path
          d="m398 91 24 3m-29 24 32 4m-35 24 30 4"
          stroke="var(--art-ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span>Video library in development</span>
    </div>
  );
}
