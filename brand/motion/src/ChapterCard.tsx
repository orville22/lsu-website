import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, tone, type Tone } from './brand';

export type ChapterCardProps = {
  /** e.g. "Part 2" or "02". Leave empty to hide. */
  label: string;
  title: string;
  /** Match the lesson's module colour on the website. */
  colour: Tone;
};

/** Full-frame section title between parts of a video. Cut away from it in the edit. */
export const ChapterCard: React.FC<ChapterCardProps> = ({ label, title, colour }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = tone[colour];
  const wipe = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.7, 0, 0.2, 1),
  });
  const beam = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });
  const lab = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const tit = spring({ frame: frame - 16, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ fontFamily: font.sans }}>
      <AbsoluteFill style={{ background: t.bg, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 560,
            width,
            height: 16,
            background: t.accent,
            transform: `scaleX(${beam})`,
            transformOrigin: 'left center',
          }}
        />
        <div style={{ position: 'absolute', left: 160, right: 160, bottom: 1080 - 520 }}>
          {label && (
            <div
              style={{
                fontFamily: font.mono,
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: t.fg,
                opacity: lab * 0.85,
                transform: `translateY(${(1 - lab) * 20}px)`,
                marginBottom: 14,
              }}
            >
              {label}
            </div>
          )}
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1,
              color: t.fg,
              opacity: tit,
              transform: `translateY(${(1 - tit) * 40}px)`,
            }}
          >
            {title}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
