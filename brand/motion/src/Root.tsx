import { AbsoluteFill, Composition, Folder } from 'remotion';
import { TitleSting } from './TitleSting';
import { LowerThird } from './LowerThird';
import { SourceTag } from './SourceTag';
import { ChapterCard } from './ChapterCard';
import { EndCard } from './EndCard';

// 1920×1080 at 30 fps (YouTube default). For a 25 fps timeline, change FPS and re-render.
const FPS = 30;
const HD = { width: 1920, height: 1080, fps: FPS };

export const Root: React.FC = () => (
  <Folder name="LSU">
    <Composition
      id="TitleSting"
      component={TitleSting}
      durationInFrames={4 * FPS}
      {...HD}
      defaultProps={{ tagline: 'Clinical laboratory science, explained.' }}
    />
    <Composition
      id="LowerThird"
      component={LowerThird}
      durationInFrames={6 * FPS}
      {...HD}
      defaultProps={{
        title: 'Orville Malijan',
        subtitle: 'Medical Laboratory Scientist · Clinical Biochemistry',
        variant: 'cobalt' as const,
      }}
    />
    <Composition
      id="SourceTag"
      component={SourceTag}
      durationInFrames={5 * FPS}
      {...HD}
      defaultProps={{ number: 1, citation: 'Author A et al. Clin Chem. 2020', position: 'top-right' as const }}
    />
    <Composition
      id="ChapterCard"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      {...HD}
      defaultProps={{ label: 'PART 1', title: 'The exclusion effect', colour: 'cobalt' as const }}
    />
    <Composition
      id="EndCard"
      component={EndCard}
      durationInFrames={20 * FPS}
      {...HD}
      defaultProps={{ heading: 'Keep asking “but why?”', url: 'lsu-website.vercel.app', guides: false }}
    />
    <Folder name="Previews">
      <Composition
        id="LowerThirdPreview"
        component={LowerThirdPreview}
        durationInFrames={6 * FPS}
        {...HD}
        defaultProps={{
          title: 'Orville Malijan',
          subtitle: 'Medical Laboratory Scientist · Clinical Biochemistry',
          variant: 'cobalt' as const,
        }}
      />
      <Composition
        id="SourceTagPreview"
        component={SourceTagPreview}
        durationInFrames={5 * FPS}
        {...HD}
        defaultProps={{ number: 1, citation: 'Author A et al. Clin Chem. 2020', position: 'top-right' as const }}
      />
    </Folder>
  </Folder>
);

/** Overlays on a neutral backdrop, for previews only (the deliverables stay transparent). */
const Backdrop: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: '#7d8590' }}>{children}</AbsoluteFill>
);
export const LowerThirdPreview: React.FC<React.ComponentProps<typeof LowerThird>> = (p) => (
  <Backdrop>
    <LowerThird {...p} />
  </Backdrop>
);
export const SourceTagPreview: React.FC<React.ComponentProps<typeof SourceTag>> = (p) => (
  <Backdrop>
    <SourceTag {...p} />
  </Backdrop>
);
