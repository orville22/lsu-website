import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { colour, font } from './brand';

export type SourceTagProps = {
  /** Reference number in the video description and lesson, e.g. 1. */
  number: number;
  /** Short citation shown on screen, e.g. "Faye S et al. Clin Biochem. 2019". */
  citation: string;
  position: 'top-right' | 'bottom-right';
};

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

/**
 * On-screen source for a claim, numbered to match the references in the video
 * description and on the lesson page. Transparent background.
 */
export const SourceTag: React.FC<SourceTagProps> = ({ number, citation, position }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const outP = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const p = inP * (1 - outP);
  return (
    <AbsoluteFill style={{ fontFamily: font.sans }}>
      <div
        style={{
          position: 'absolute',
          right: 96,
          ...(position === 'top-right' ? { top: 84 } : { bottom: 150 }),
          display: 'flex',
          alignItems: 'stretch',
          maxWidth: 820,
          borderRadius: 16,
          overflow: 'hidden',
          background: colour.paper,
          boxShadow: `8px 8px 0 ${colour.cobalt}`,
          opacity: p,
          transform: `translateX(${(1 - p) * 40}px)`,
        }}
      >
        <div
          style={{
            background: colour.mustard,
            color: colour.ink,
            fontFamily: font.mono,
            fontWeight: 700,
            fontSize: 30,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          [{number}]
        </div>
        <div style={{ padding: '14px 24px 16px' }}>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#5a5248',
            }}
          >
            Source
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: colour.ink, lineHeight: 1.25 }}>{citation}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
