import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { colour, font, GLASS, LIQUID } from './brand';

export type EndCardProps = {
  heading: string;
  /** Where the full lesson and references live. */
  url: string;
  /** Show outlines where YouTube end-screen elements go (turn off for the final render). */
  guides: boolean;
};

/**
 * 20-second end screen. The right-hand slots and the circle are left clear for
 * YouTube's end-screen elements (two videos and Subscribe), added in YouTube Studio.
 */
export const EndCard: React.FC<EndCardProps> = ({ heading, url, guides }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
  const p = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const beam = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const slot: React.CSSProperties = {
    position: 'absolute',
    border: guides ? `3px dashed ${colour.paper}88` : 'none',
    borderRadius: 12,
    color: `${colour.paper}aa`,
    fontFamily: font.mono,
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <AbsoluteFill style={{ background: colour.cobalt, fontFamily: font.sans }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 900,
          width: '100%',
          height: 14,
          background: colour.mustard,
          transform: `scaleX(${beam})`,
          transformOrigin: 'left center',
        }}
      />
      <div style={{ position: 'absolute', left: 120, top: 150, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
        <svg width={110} height={140} viewBox="22 14 68 86">
          <path d={LIQUID} fill={colour.pink} />
          <rect x="38" y="62" width="36" height="14" fill={colour.mustard} />
          <path d={GLASS} fill="none" stroke={colour.paper} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: colour.paper,
            width: 840,
          }}
        >
          {heading}
        </div>
        <div style={{ marginTop: 30, fontSize: 32, fontWeight: 500, color: colour.paper, width: 680, lineHeight: 1.35 }}>
          Full lesson and references at
          <div style={{ fontFamily: font.mono, fontWeight: 600, color: colour.mustard, marginTop: 6, fontSize: 30 }}>
            {url}
          </div>
        </div>
      </div>
      {/* YouTube end-screen element positions */}
      <div style={{ ...slot, left: 1000, top: 150, width: 800, height: 450 }}>{guides && 'Video'}</div>
      <div style={{ ...slot, left: 1000, top: 630, width: 380, height: 214 }}>{guides && 'Video'}</div>
      <div style={{ ...slot, left: 1460, top: 650, width: 180, height: 180, borderRadius: '50%' }}>
        {guides && 'Subscribe'}
      </div>
    </AbsoluteFill>
  );
};
