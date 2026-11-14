import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { colour, font, GLASS, LIQUID } from './brand';

export type LowerThirdProps = {
  /** Main line, e.g. a name or the topic of the segment. */
  title: string;
  /** Second line, e.g. a role or a short description. Leave empty for one line. */
  subtitle: string;
  /** Panel colour. */
  variant: 'cobalt' | 'charcoal';
};

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const IN = 22;
const OUT = 16;

/** Name or topic lower third. Transparent background: render as ProRes 4444 for the editor. */
export const LowerThird: React.FC<LowerThirdProps> = ({ title, subtitle, variant }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = (a: number, b: number) =>
    interpolate(frame, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const outP = interpolate(frame, [durationInFrames - OUT, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const beam = t(0, 14) * (1 - outP);
  const panel = t(6, IN) * (1 - outP);
  const text = t(12, IN + 4) * (1 - outP);
  const bg = variant === 'cobalt' ? colour.cobalt : colour.charcoal;

  return (
    <AbsoluteFill style={{ fontFamily: font.sans }}>
      <div style={{ position: 'absolute', left: 0, bottom: 118, display: 'inline-flex', paddingLeft: 120 }}>
        {/* the beam runs in from the frame edge, under the panel */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: -36,
            bottom: -10,
            height: 12,
            borderRadius: 6,
            background: colour.mustard,
            transform: `scaleX(${beam})`,
            transformOrigin: 'left center',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            padding: subtitle ? '22px 40px 26px 28px' : '20px 40px 22px 28px',
            background: bg,
            borderRadius: 22,
            clipPath: `inset(${(1 - panel) * 100}% 0 0 0 round 22px)`,
          }}
        >
          <svg width={64} height={64} viewBox="22 14 68 86" style={{ opacity: text, flexShrink: 0 }}>
            <path d={LIQUID} fill={colour.pink} />
            <rect x="38" y="62" width="36" height="14" fill={colour.mustard} />
            <path
              d={GLASS}
              fill="none"
              stroke={colour.paper}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              color: colour.paper,
              opacity: text,
              transform: `translateY(${(1 - text) * 14}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.25, marginTop: 4, opacity: 0.9 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
