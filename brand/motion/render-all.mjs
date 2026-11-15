// Renders every LSU graphic into out/. Usage: npm run render:all
// Optional: REMOTION_BROWSER=/path/to/chrome to use an installed browser.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const jobs = [
  // Full-frame pieces: H.264 MP4 drops straight onto a DaVinci Resolve timeline.
  { id: 'TitleSting', out: 'lsu-title-sting.mp4', codec: 'h264' },
  { id: 'ChapterCard', out: 'lsu-chapter-card.mp4', codec: 'h264' },
  { id: 'EndCard', out: 'lsu-end-card.mp4', codec: 'h264' },
  // Overlays keep their transparency: ProRes 4444 with alpha.
  { id: 'LowerThird', out: 'lsu-lower-third.mov', codec: 'prores', proResProfile: '4444', alpha: true },
  {
    id: 'LowerThird',
    out: 'lsu-lower-third-topic.mov',
    codec: 'prores',
    proResProfile: '4444',
    alpha: true,
    props: { title: 'Pseudohyponatraemia', subtitle: '', variant: 'charcoal' },
  },
  { id: 'SourceTag', out: 'lsu-source-tag.mov', codec: 'prores', proResProfile: '4444', alpha: true },
  // Small previews on a grey backdrop (for the brand kit page; not for editing).
  { id: 'LowerThirdPreview', out: 'preview-lower-third.mp4', codec: 'h264' },
  { id: 'SourceTagPreview', out: 'preview-source-tag.mp4', codec: 'h264' },
];

const only = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browserExecutable = process.env.REMOTION_BROWSER || null;
for (const j of jobs.filter((j) => !only.length || only.includes(j.id))) {
  const composition = await selectComposition({ serveUrl, id: j.id, inputProps: j.props ?? {}, browserExecutable });
  await renderMedia({
    serveUrl,
    composition,
    codec: j.codec,
    proResProfile: j.proResProfile,
    imageFormat: j.alpha ? 'png' : 'jpeg',
    pixelFormat: j.alpha ? 'yuva444p10le' : 'yuv420p',
    crf: j.codec === 'h264' ? 16 : undefined,
    inputProps: j.props ?? {},
    outputLocation: path.join('out', j.out),
    browserExecutable,
  });
  console.log('rendered', j.out);
}
