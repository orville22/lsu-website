import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colour, font, GLASS, GLASS_LENGTH, LIQUID } from './brand';

export type TitleStingProps = { tagline: string };

const S = 3.6; // mark scale: 112 mark units → ~403 px
const WORD_SIZE = 100;

/**
 * 4-second opening sting. A beam of light crosses the frame, the cuvette draws
 * around it and fills, then the wordmark and tagline arrive. Light passes through
 * unfiltered.
 */
export const TitleSting: React.FC<TitleStingProps> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

  const markH = 112 * S;
  const top = height / 2 - markH / 2;
  const beamY = top + 62 * S;
  const beamH = 14 * S;
  const left = 262; // x of the mark's 112-unit box
  const textX = left + 84 * S + 56;

  const beam = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const draw = interpolate(frame, [8, 32], [GLASS_LENGTH, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const fill = interpolate(frame, [20, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  // a highlight travels along the beam: light passing straight through
  const sweep = interpolate(frame, [30, 78], [-0.15, 1.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const words = ['lab', 'science', 'unfiltered'];
  const dot = spring({ frame: frame - 64, fps, config: { damping: 9, stiffness: 180 } });
  const tag = interpolate(frame, [72, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

  return (
    <AbsoluteFill style={{ background: colour.cobalt, fontFamily: font.sans }}>
      {/* beam */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: beamY,
          width,
          height: beamH,
          background: colour.mustard,
          transform: `scaleX(${beam})`,
          transformOrigin: 'left center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: sweep * width - 220,
          top: beamY,
          width: 440,
          height: beamH,
          background: `linear-gradient(90deg, ${colour.mustard}00, ${colour.paper}cc, ${colour.mustard}00)`,
          opacity: frame > 30 && frame < 80 ? 1 : 0,
        }}
      />
      {/* cuvette */}
      <svg
        style={{ position: 'absolute', left, top }}
        width={112 * S}
        height={112 * S}
        viewBox="0 0 112 112"
        overflow="visible"
      >
        <defs>
          <clipPath id="fill">
            <rect x="0" y={92 - 48 * fill} width="112" height="112" />
          </clipPath>
        </defs>
        <path d={LIQUID} fill={colour.pink} clipPath="url(#fill)" />
        <rect x="38" y="62" width="36" height="14" fill={colour.mustard} opacity={beam} />
        <path
          d={GLASS}
          fill="none"
          stroke={colour.paper}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={GLASS_LENGTH}
          strokeDashoffset={draw}
        />
      </svg>
      {/* wordmark above the beam */}
      <div
        style={{
          position: 'absolute',
          left: textX,
          top: beamY - 34 - WORD_SIZE * 0.98,
          display: 'flex',
          alignItems: 'baseline',
          gap: WORD_SIZE * 0.24,
          fontSize: WORD_SIZE,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: colour.paper,
          lineHeight: 1,
          overflow: 'hidden',
          paddingBottom: 8,
        }}
      >
        {words.map((w, i) => {
          const p = spring({ frame: frame - 36 - i * 6, fps, config: { damping: 200 } });
          return (
            <span
              key={w}
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 110}%)`,
                opacity: p,
              }}
            >
              {w}
              {i === words.length - 1 && (
                <span
                  style={{
                    display: 'inline-block',
                    width: WORD_SIZE * 0.21,
                    height: WORD_SIZE * 0.21,
                    marginLeft: WORD_SIZE * 0.03,
                    borderRadius: '50%',
                    background: colour.mustard,
                    transform: `scale(${Math.max(0, dot)})`,
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
      {/* tagline below the beam */}
      <div
        style={{
          position: 'absolute',
          left: textX,
          top: beamY + beamH + 34,
          fontSize: 46,
          fontWeight: 500,
          color: colour.paper,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 16}px)`,
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
