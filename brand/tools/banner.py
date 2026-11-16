"""YouTube banner (2560×1440) with lab-themed brand shapes either side of the lockup.

Safe areas: the logo and tagline sit inside the 1546×423 centre box shown on every
device; the shapes sit in the 2560×423 band desktop shows, outside the text.
"""
import os, sys
sys.argv = [sys.argv[0], sys.argv[1] if len(sys.argv) > 1 else 'logo']
sys.path.insert(0, os.path.dirname(__file__))
from textpath import text_path
from build_logos import C, GLASS, LIQUID, B800, B500, save

DEEP = '#263c90'  # cobalt-hover: offset shadows on the cobalt ground
W, H = 2560, 1440
CY = H / 2


def disc_label(cx, cy, r, fill, label, sup, ink):
    """An ion: a flat disc with an offset shadow and its symbol."""
    out = f'<circle cx="{cx + 10}" cy="{cy + 10}" r="{r}" fill="{DEEP}"/>'
    out += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'
    size = r * 0.78
    d, w = text_path(label, B800, size, 0, 0, -0.02)
    sd, sw = text_path(sup, B800, size * 0.62, 0, 0)
    total = w + sw * 0.9
    x0 = cx - total / 2
    base = cy + size * 0.36
    d, _ = text_path(label, B800, size, x0, base, -0.02)
    sd, _ = text_path(sup, B800, size * 0.62, x0 + w + 2, base - size * 0.42)
    return out + f'<path d="{d} {sd}" fill="{ink}"/>'


def qc_card(x, y, w=330, h=170):
    """A small Levey–Jennings chart: mean, ±2 SD and a run of control values."""
    out = f'<rect x="{x + 12}" y="{y + 12}" width="{w}" height="{h}" rx="22" fill="{C["mustard"]}"/>'
    out += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="{C["paper"]}"/>'
    left, right = x + 34, x + w - 26
    mid = y + h / 2 + 18
    sd = 24
    for k, dash in ((0, ''), (-2, '10 9'), (2, '10 9')):
        yy = mid + k * sd
        stroke = C['ink'] if k == 0 else '#8a8178'
        out += (f'<line x1="{left}" y1="{yy}" x2="{right}" y2="{yy}" stroke="{stroke}" stroke-width="3"'
                + (f' stroke-dasharray="{dash}"' if dash else '') + ' stroke-linecap="round"/>')
    vals = [0.3, -0.6, 0.9, -0.2, 1.2, 0.4, -1.1, 0.6, -0.3, 2.4]
    n = len(vals)
    pts = [(left + 10 + i * (right - left - 20) / (n - 1), mid - v * sd) for i, v in enumerate(vals)]
    out += '<polyline points="' + ' '.join(f'{px:.1f},{py:.1f}' for px, py in pts) + \
        f'" fill="none" stroke="{C["cobalt"]}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>'
    for i, (px, py) in enumerate(pts):
        out += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{9 if i == n - 1 else 7}" fill="{C["tomato"] if i == n - 1 else C["cobalt"]}"/>'
    lab, _ = text_path('QC', B800, 24, x + 30, y + 36, 0.04)
    out += f'<path d="{lab}" fill="{C["ink"]}"/>'
    return out


def tube(cx, cy, angle, scale=1.0):
    """Collection tube after centrifugation: serum over cells, capped."""
    s = scale
    g = f'<g transform="translate({cx} {cy}) rotate({angle}) scale({s})">'
    g += f'<defs><clipPath id="tb"><path d="M-26 -60 V60 a26 26 0 0 0 52 0 V-60 Z"/></clipPath></defs>'
    g += f'<rect x="-26" y="-20" width="52" height="110" fill="{C["tomato"]}" clip-path="url(#tb)"/>'
    g += f'<rect x="-26" y="-50" width="52" height="34" fill="{C["mustard"]}" clip-path="url(#tb)"/>'
    g += f'<path d="M-26 -60 V60 a26 26 0 0 0 52 0 V-60" fill="none" stroke="{C["paper"]}" stroke-width="10" stroke-linejoin="round"/>'
    g += f'<rect x="-36" y="-96" width="72" height="34" rx="9" fill="{C["green"]}"/>'
    return g + '</g>'


def capsule(cx, cy, angle, length=120, r=26):
    g = f'<g transform="translate({cx} {cy}) rotate({angle})">'
    g += f'<rect x="{-length/2 + 8}" y="{-r + 8}" width="{length}" height="{2*r}" rx="{r}" fill="{DEEP}"/>'
    g += f'<path d="M0 {-r} H{length/2 - r} a{r} {r} 0 0 1 0 {2*r} H0 Z" fill="{C["paper"]}"/>'
    g += f'<path d="M0 {-r} H{-length/2 + r} a{r} {r} 0 0 0 0 {2*r} H0 Z" fill="{C["pink"]}"/>'
    return g + '</g>'


def plus(cx, cy, size, colour, opacity):
    t = size * 0.28
    return (f'<g opacity="{opacity}" fill="{colour}"><rect x="{cx - size/2}" y="{cy - t/2}" width="{size}" height="{t}" rx="{t/2}"/>'
            f'<rect x="{cx - t/2}" y="{cy - size/2}" width="{t}" height="{size}" rx="{t/2}"/></g>')


def dots(x0, y0, cols, rows, pitch, r, colour, opacity):
    return f'<g fill="{colour}" opacity="{opacity}">' + ''.join(
        f'<circle cx="{x0 + i * pitch}" cy="{y0 + j * pitch}" r="{r}"/>' for i in range(cols) for j in range(rows)) + '</g>'


def banner():
    s = 2.2
    mark_h = 112 * s
    beam_y = CY - mark_h / 2 + 62 * s
    body = f'<rect width="{W}" height="{H}" fill="{C["cobalt"]}"/>'
    # large quiet shapes for the full TV view (outside the desktop band)
    body += f'<circle cx="2380" cy="150" r="300" fill="{DEEP}"/>'
    body += f'<circle cx="160" cy="1330" r="320" fill="{DEEP}"/>'
    body += f'<circle cx="2380" cy="150" r="150" fill="none" stroke="{C["mustard"]}" stroke-width="10" opacity="0.6"/>'
    # background texture first, behind the beam
    body += dots(300, 560, 5, 3, 34, 5, C['paper'], 0.22)
    body += dots(2010, 830, 4, 3, 34, 5, C['paper'], 0.22)
    body += f'<circle cx="470" cy="905" r="30" fill="none" stroke="{C["paper"]}" stroke-width="6" opacity="0.35"/>'
    body += f'<circle cx="2470" cy="570" r="22" fill="none" stroke="{C["mustard"]}" stroke-width="6" opacity="0.7"/>'
    body += plus(90, 640, 40, C['paper'], 0.35) + plus(2020, 640, 34, C['mustard'], 0.8) + plus(1960, 905, 28, C['paper'], 0.35)
    # the beam
    body += f'<rect x="0" y="{beam_y:.1f}" width="{W}" height="{14 * s:.1f}" fill="{C["mustard"]}"/>'
    # left: ions and a tile
    body += disc_label(210, 610, 64, C['tomato'], 'Na', '+', C['ink'])
    body += disc_label(395, 860, 48, C['pink'], 'K', '+', C['ink'])
    body += f'<g transform="rotate(14 130 860)"><rect x="98" y="828" width="64" height="64" rx="16" fill="{DEEP}" transform="translate(8 8)"/><rect x="98" y="828" width="64" height="64" rx="16" fill="{C["mustard"]}"/></g>'
    # right: QC chart, tube, capsule
    body += qc_card(2070, 548)
    body += tube(2420, 832, 20, 0.85)
    body += capsule(2205, 880, -24)
    # lockup (unchanged): glass + beam, wordmark above, tagline below
    sx = (W - 1546) / 2 + 40
    body += (f'<g transform="translate({sx:.1f} {CY - mark_h / 2:.1f}) scale({s})">'
             f'<path d="{LIQUID}" fill="{C["pink"]}"/>'
             f'<path d="{GLASS}" fill="none" stroke="{C["paper"]}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
             f'<rect x="38" y="62" width="36" height="14" fill="{C["mustard"]}"/></g>')
    tx = sx + 112 * s + 70
    size = 104
    d1, w1 = text_path('lab science unfiltered', B800, size, tx, beam_y - 34, -0.03)
    r = size * 0.105
    body += f'<path d="{d1}" fill="{C["paper"]}"/><circle cx="{tx + w1 + size*0.03 + r:.1f}" cy="{beam_y - 34 - r:.1f}" r="{r:.1f}" fill="{C["mustard"]}"/>'
    d2, _ = text_path('Clinical laboratory science, explained.', B500, 52, tx, beam_y + 14 * s + 74, -0.01)
    body += f'<path d="{d2}" fill="{C["paper"]}"/>'
    return body


if __name__ == '__main__':
    save('youtube-banner', W, H, banner())
    print('ok', 'text ends at', round((W - 1546) / 2 + 40 + 112 * 2.2 + 70))
