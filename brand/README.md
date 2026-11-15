# LSU brand kit

Sources for the Lab Science Unfiltered logo and video graphics. The brand book (logo rules, colour, type, voice) is the **Lab Science Unfiltered** design system in Claude; this folder holds the files it was built from.

```
brand/
  logo/          SVG logo suite (outlined type), favicon.ico
  logo/png/      PNG exports: marks 512/1024, lockups 2000 wide, favicons 16–512, YouTube avatar and banner
  video/         MP4 renders: title sting, chapter card, end card, overlay previews
  motion/        Remotion project that renders the video graphics
  tools/         Python scripts that generate the logo files
```

## Logo

The **Beam** mark: a cuvette with a light beam passing straight through it and out of the tile. Light, unfiltered. The open glass also reads as a U.

| File | Use |
| --- | --- |
| `lsu-logo-horizontal(.svg/-reversed)` | Default lockup; reversed on charcoal or ink |
| `lsu-logo-stacked(-reversed)` | Square spaces |
| `lsu-mark` | Mark alone (avatars, watermark) |
| `lsu-mark-flat`, `favicon.svg` | Small sizes: no shadow, beam contained |
| `…-one-colour-ink`, `…-one-colour-white` | Single-ink use; glass and beam knocked out |
| `lsu-wordmark`, `lsu-wordmark-one-line(-reversed)` | Text-only |
| `youtube-avatar`, `youtube-banner` | Channel art (banner content inside the 1546 × 423 safe area) |
| `og-image` | Link preview image for the website (1200 × 630) |

Never put the full-colour mark on cobalt: the tile disappears. Use the one-colour white version there.

To regenerate after a change:

```sh
cd brand
pip install -r tools/requirements.txt && playwright install chromium
python3 tools/make_fonts.py          # static instances of the site's Bricolage Grotesque
python3 tools/build_logos.py logo    # SVGs
python3 tools/og.py logo             # Open Graph image SVG
python3 tools/export_png.py          # PNGs and favicon.ico (edit the browser path in the script if needed)
```

## Video graphics (Remotion)

| Composition | Length | Output | Props |
| --- | --- | --- | --- |
| `TitleSting` | 4 s | MP4 | `tagline` |
| `LowerThird` | 6 s | ProRes 4444 with alpha | `title`, `subtitle`, `variant` (`cobalt`/`charcoal`) |
| `SourceTag` | 5 s | ProRes 4444 with alpha | `number`, `citation`, `position` (`top-right`/`bottom-right`) |
| `ChapterCard` | 3 s | MP4 | `label`, `title`, `colour` (`cobalt`/`tomato`/`mustard`/`green`/`charcoal`) |
| `EndCard` | 20 s | MP4 | `heading`, `url`, `guides` |

All are 1920 × 1080 at 30 fps. For a 25 fps timeline, change `FPS` in `src/Root.tsx`.

```sh
cd brand/motion
npm ci
npm run studio                     # preview and edit text live in the browser
npm run render:all                 # everything into out/
npx remotion render LowerThird out/lt-sodium.mov --codec=prores --prores-profile=4444 \
  --image-format=png --pixel-format=yuva444p10le \
  --props='{"title":"Sodium","subtitle":"Electrolytes","variant":"charcoal"}'
npx remotion render SourceTag out/source-2.mov --codec=prores --prores-profile=4444 \
  --image-format=png --pixel-format=yuva444p10le \
  --props='{"number":2,"citation":"Author B et al. Ann Clin Biochem. 2021","position":"top-right"}'
```

In DaVinci Resolve, put the `.mov` overlays on a track above the footage; ProRes 4444 keeps the transparency. The fonts are the website's own files in `motion/public/fonts`, so renders never depend on installed fonts.
