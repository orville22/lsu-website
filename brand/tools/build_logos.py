"""Builds the final LSU logo suite (Beam mark) as SVG files with outlined type."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from textpath import text_path, x_height
from marks import C, B800, B700, B500

OUT = sys.argv[1] if len(sys.argv) > 1 else 'logo'
os.makedirs(OUT, exist_ok=True)

GLASS = 'M34 22 V86 a10 10 0 0 0 10 10 H68 a10 10 0 0 0 10 -10 V22'
LIQUID = 'M38 44 V86 a6 6 0 0 0 6 6 H68 a6 6 0 0 0 6 -6 V44 Z'


def beam_mark(uid, bg='cobalt', shadow='mustard', glass='paper', liquid='pink', beam='mustard',
              breakout=True):
    """The Beam mark in a 0..134 × 0..120 box (tile 112, shadow offset 8, beam break-out to 134)."""
    c = lambda k: C.get(k, k)
    out = f'<defs><clipPath id="{uid}-clip"><rect x="0" y="0" width="{134 if breakout else 112}" height="112"/></clipPath></defs>'
    if shadow:
        out += f'<rect x="8" y="8" width="112" height="112" rx="30" fill="{c(shadow)}"/>'
    out += f'<rect x="0" y="0" width="112" height="112" rx="30" fill="{c(bg)}"/>'
    bw = 140 if breakout else 112
    out += f'<rect x="-6" y="62" width="{bw}" height="14" rx="7" fill="{c(beam)}" clip-path="url(#{uid}-clip)"/>'
    out += f'<path d="{LIQUID}" fill="{c(liquid)}"/>'
    out += f'<path d="{GLASS}" fill="none" stroke="{c(glass)}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
    out += f'<rect x="38" y="62" width="36" height="14" fill="{c(beam)}"/>'
    return out


def beam_mark_onecolour(uid, colour, breakout=True):
    """Single-colour version: glass and beam knocked out of the tile; beam break-out in the colour."""
    c = C.get(colour, colour)
    m = (
        f'<defs><mask id="{uid}-m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="160" height="140">'
        f'<rect x="-10" y="-10" width="160" height="140" fill="#fff"/>'
        f'<path d="{GLASS}" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
        f'<rect x="10" y="62" width="92" height="14" fill="#000"/>'
        f'</mask></defs>'
    )
    m += f'<rect x="0" y="0" width="112" height="112" rx="30" fill="{c}" mask="url(#{uid}-m)"/>'
    if breakout:
        m += f'<rect x="108" y="62" width="26" height="14" rx="7" fill="{c}"/>'
    return m


def wordmark(x, y, size, ink, dot, lead=0.92):
    d1, w1 = text_path('lab science', B800, size, x, y, -0.035)
    d2, w2 = text_path('unfiltered', B800, size, x, y + size * lead, -0.035)
    r = size * 0.105
    gap = size * 0.03
    body = f'<path d="{d1} {d2}" fill="{C.get(ink, ink)}"/>'
    body += f'<circle cx="{x + w2 + gap + r:.2f}" cy="{y + size * lead - r:.2f}" r="{r:.2f}" fill="{C.get(dot, dot)}"/>'
    return body, max(w1, w2 + gap + 2 * r)


def wordmark_line(x, y, size, ink, dot):
    d, w = text_path('lab science unfiltered', B800, size, x, y, -0.03)
    r = size * 0.105
    gap = size * 0.03
    body = f'<path d="{d}" fill="{C.get(ink, ink)}"/>'
    body += f'<circle cx="{x + w + gap + r:.2f}" cy="{y - r:.2f}" r="{r:.2f}" fill="{C.get(dot, dot)}"/>'
    return body, w + gap + 2 * r


def save(name, w, h, body, bg=None, pad=0):
    W, H = w + 2 * pad, h + 2 * pad
    b = f'<rect width="{W}" height="{H}" fill="{C.get(bg, bg)}"/>' if bg else ''
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" width="{W:.0f}" height="{H:.0f}">'
         f'<title>Lab Science Unfiltered</title>{b}<g transform="translate({pad} {pad})">{body}</g></svg>')
    open(os.path.join(OUT, name + '.svg'), 'w').write(s)
    return name


SIZE = 46
LEAD = 0.92


def horizontal(uid, ink, dot, mark=None):
    mark = mark or beam_mark(uid)
    xh = x_height(B800, SIZE)
    y1 = 60 - (SIZE * LEAD) / 2 + xh / 2 - 1
    wm, ww = wordmark(152, y1, SIZE, ink, dot, LEAD)
    return mark + wm, 152 + ww, 120


def stacked(uid, ink, dot, mark=None):
    mark = mark or beam_mark(uid)
    size = 40
    wm_probe, ww = wordmark(0, 0, size, ink, dot)
    W = max(134, ww)
    mx = (W - 120) / 2  # centre the tile+shadow, beam breaks out to the right
    wm, _ = wordmark((W - ww) / 2, 120 + 22 + size * 0.72, size, ink, dot)
    return f'<g transform="translate({mx:.2f} 0)">{mark}</g>' + wm, W, 120 + 22 + size * 0.72 + size * LEAD + 10


made = []
# Marks
made.append(save('lsu-mark', 134, 120, beam_mark('a')))
made.append(save('lsu-mark-flat', 112, 112, beam_mark('b', shadow=None, breakout=False)))
made.append(save('lsu-mark-one-colour-ink', 134, 112, beam_mark_onecolour('d', 'ink')))
made.append(save('lsu-mark-one-colour-white', 134, 112, beam_mark_onecolour('e', '#ffffff')))
# Horizontal lockups
b, w, h = horizontal('f', 'ink', 'tomato'); made.append(save('lsu-logo-horizontal', w, h, b))
b, w, h = horizontal('g', 'paper', 'mustard'); made.append(save('lsu-logo-horizontal-reversed', w, h, b))
b, w, h = horizontal('h', 'ink', 'ink', beam_mark_onecolour('h', 'ink')); made.append(save('lsu-logo-horizontal-one-colour-ink', w, h, b))
b, w, h = horizontal('i', '#ffffff', '#ffffff', beam_mark_onecolour('i', '#ffffff')); made.append(save('lsu-logo-horizontal-one-colour-white', w, h, b))
# Stacked
b, w, h = stacked('j', 'ink', 'tomato'); made.append(save('lsu-logo-stacked', w, h, b))
b, w, h = stacked('k', 'paper', 'mustard'); made.append(save('lsu-logo-stacked-reversed', w, h, b))
# Wordmarks
b, w = wordmark(0, SIZE * 0.74, SIZE, 'ink', 'tomato'); made.append(save('lsu-wordmark', w, SIZE * 0.74 + SIZE * LEAD + 4, b))
b, w = wordmark_line(0, SIZE * 0.74, SIZE, 'ink', 'tomato'); made.append(save('lsu-wordmark-one-line', w, SIZE * 0.74 + SIZE * 0.24, b))
b, w = wordmark_line(0, SIZE * 0.74, SIZE, 'paper', 'mustard'); made.append(save('lsu-wordmark-one-line-reversed', w, SIZE * 0.74 + SIZE * 0.24, b))

# Favicon / app icon: flat, contained, square
made.append(save('favicon', 112, 112, beam_mark('m', shadow=None, breakout=False)))
# YouTube avatar (800×800, shown as a circle): full-bleed cobalt, beam runs edge to edge
av = (f'<defs><clipPath id="av"><circle cx="400" cy="400" r="400"/></clipPath></defs>'
      f'<g clip-path="url(#av)"><rect width="800" height="800" fill="{C["cobalt"]}"/>'
      f'<g transform="translate(400 400) scale(5.4) translate(-56 -59)">'
      f'<rect x="-80" y="62" width="280" height="14" rx="0" fill="{C["mustard"]}"/>'
      f'<path d="{LIQUID}" fill="{C["pink"]}"/>'
      f'<path d="{GLASS}" fill="none" stroke="{C["paper"]}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
      f'<rect x="38" y="62" width="36" height="14" fill="{C["mustard"]}"/></g></g>')
made.append(save('youtube-avatar', 800, 800, av))
print('\n'.join(made))

# YouTube banner 2560×1440; everything important inside the 1546×423 centre safe area
def banner():
    W, H = 2560, 1440
    cy = H / 2
    s = 2.2  # mark scale
    mark_h = 112 * s
    body = f'<rect width="{W}" height="{H}" fill="{C["cobalt"]}"/>'
    # the beam runs the full width of the banner at the mark's beam height
    beam_y = cy - mark_h / 2 + 62 * s
    body += f'<rect x="0" y="{beam_y:.1f}" width="{W}" height="{14 * s:.1f}" fill="{C["mustard"]}"/>'
    sx = (W - 1546) / 2 + 40
    body += (f'<g transform="translate({sx:.1f} {cy - mark_h / 2:.1f}) scale({s})">'
             f'<path d="{LIQUID}" fill="{C["pink"]}"/>'
             f'<path d="{GLASS}" fill="none" stroke="{C["paper"]}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
             f'<rect x="38" y="62" width="36" height="14" fill="{C["mustard"]}"/></g>')
    tx = sx + 112 * s + 70
    size = 104
    # wordmark sits above the beam, tagline below it
    d1, w1 = text_path('lab science unfiltered', B800, size, tx, beam_y - 34, -0.03)
    r = size * 0.105
    body += f'<path d="{d1}" fill="{C["paper"]}"/><circle cx="{tx + w1 + size*0.03 + r:.1f}" cy="{beam_y - 34 - r:.1f}" r="{r:.1f}" fill="{C["mustard"]}"/>'
    d2, _ = text_path('Clinical laboratory science, explained.', B500, 52, tx, beam_y + 14 * s + 74, -0.01)
    body += f'<path d="{d2}" fill="{C["paper"]}"/>'
    return body, W, H

b, w, h = banner(); made.append(save('youtube-banner', w, h, b))
