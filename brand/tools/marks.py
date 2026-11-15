"""LSU logo marks and lockups as SVG. All type is converted to outlines."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from textpath import text_path, cap_height, x_height

F = os.path.join(os.path.dirname(__file__), '..', 'fonts')
B800 = os.path.join(F, 'Bricolage-800.ttf')
B700 = os.path.join(F, 'Bricolage-700.ttf')
B500 = os.path.join(F, 'Bricolage-500.ttf')

C = dict(
    ink='#2b2622', cobalt='#344fb4', tomato='#d9735c', tomato_ink='#a3442f', mustard='#e6bc5c',
    green='#3e6a55', pink='#ebbcc3', paper='#fffaf0', white='#ffffff', charcoal='#35302b',
)


# ---- Marks: each draws into a 120×120 box (tile), returns SVG fragment -------------------
def tile(fill, shadow, r=30):
    s = f'<rect x="8" y="8" width="112" height="112" rx="{r}" fill="{shadow}"/>' if shadow else ''
    return s + f'<rect x="0" y="0" width="112" height="112" rx="{r}" fill="{fill}"/>'


def mark_beam(bg='cobalt', shadow='mustard', glass='paper', liquid='pink', beam='mustard', mono=None):
    """A cuvette with a light beam passing straight through it: science, unfiltered."""
    g = lambda k: C.get(mono or k, mono or k)
    out = tile(g(bg), g(shadow) if shadow else None)
    # beam passes through, breaking out of the tile on the right
    out += f'<rect x="-6" y="62" width="{140}" height="14" rx="7" fill="{g(beam)}" clip-path="url(#beamclip)"/>'
    # cuvette: open-top glass, liquid inside
    out += f'<path d="M38 44 V86 a6 6 0 0 0 6 6 H68 a6 6 0 0 0 6 -6 V44 Z" fill="{g(liquid)}"/>'
    out += f'<path d="M34 22 V86 a10 10 0 0 0 10 10 H68 a10 10 0 0 0 10 -10 V22" fill="none" stroke="{g(glass)}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
    # the beam is visible through the liquid (no filter)
    out += f'<rect x="38" y="62" width="36" height="14" fill="{g(beam)}"/>'
    return out


def mark_tube(bg='cobalt', shadow='mustard', glass='paper', serum='mustard', cells='tomato', cap='tomato', mono=None):
    """A separated blood-collection tube: the clinical laboratory specimen."""
    g = lambda k: C.get(mono or k, mono or k)
    out = tile(g(bg), g(shadow) if shadow else None)
    body = '<g transform="rotate(-18 56 58)">'
    body += f'<rect x="40" y="38" width="32" height="54" rx="0" fill="{g(cells)}" clip-path="url(#tubeclip)"/>'
    body += f'<rect x="40" y="38" width="32" height="24" fill="{g(serum)}" clip-path="url(#tubeclip)"/>'
    body += f'<path d="M40 30 V82 a16 16 0 0 0 32 0 V30" fill="none" stroke="{g(glass)}" stroke-width="8" stroke-linejoin="round"/>'
    body += f'<rect x="34" y="16" width="44" height="18" rx="6" fill="{g(cap)}" stroke="{g(glass)}" stroke-width="0"/>'
    body += '</g>'
    return out + body


def mark_mono(bg='mustard', shadow='cobalt', ink='ink', dot='tomato_ink', mono=None):
    """lowercase lsu monogram with the brand's full stop."""
    g = lambda k: C.get(mono or k, mono or k)
    out = tile(g(bg), g(shadow) if shadow else None)
    d, w = text_path('lsu', B800, 56, 0, 0, -0.03)
    xh = x_height(B800, 56)
    dot_r = 6.5
    total = w + 3 + dot_r * 2
    x0 = (112 - total) / 2
    y0 = 56 + xh / 2
    d, w = text_path('lsu', B800, 56, x0, y0, -0.03)
    out += f'<path d="{d}" fill="{g(ink)}"/>'
    out += f'<circle cx="{x0 + w + 3 + dot_r}" cy="{y0 - dot_r}" r="{dot_r}" fill="{g(dot)}"/>'
    return out


DEFS = (
    '<defs><clipPath id="beamclip"><rect x="0" y="0" width="134" height="112"/></clipPath>'
    '<clipPath id="tubeclip"><path d="M40 30 V82 a16 16 0 0 0 32 0 V30 Z"/></clipPath></defs>'
)


def wordmark(x, y, size=40, ink='ink', dot='tomato', lines=('lab science', 'unfiltered'), lead=0.92):
    """Two-line lowercase wordmark with the tomato full stop. y = first baseline."""
    out = ''
    d1, w1 = text_path(lines[0], B800, size, x, y, -0.035)
    d2, w2 = text_path(lines[1], B800, size, x, y + size * lead, -0.035)
    out += f'<path d="{d1} {d2}" fill="{C.get(ink, ink)}"/>'
    r = size * 0.105
    out += f'<circle cx="{x + w2 + size * 0.03 + r}" cy="{y + size * lead - r}" r="{r}" fill="{C.get(dot, dot)}"/>'
    return out, max(w1, w2 + size * 0.03 + 2 * r)


def svg(w, h, body, bg=None):
    b = f'<rect width="{w}" height="{h}" fill="{C.get(bg, bg)}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{DEFS}{b}{body}</svg>'


def lockup(mark_fn, ink='ink', dot='tomato', mark_kw=None, size=44):
    """Horizontal lockup: mark + two-line wordmark. Returns (svg_body, width, height)."""
    m = mark_fn(**(mark_kw or {}))
    ch = cap_height(B800, size)
    # vertically centre the two lines (x-height based, lowercase) against the 120 tile
    lead = 0.92
    y1 = 60 - (size * lead) / 2 + x_height(B800, size) / 2 - 2
    wm, ww = wordmark(146, y1, size, ink, dot)
    return f'<g>{m}</g>{wm}', 146 + ww + 8, 128


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    concepts = [('A — Beam', mark_beam), ('B — Tube', mark_tube), ('C — Monogram', mark_mono)]
    W, H = 1500, 1260
    body = f'<rect width="{W}" height="{H}" fill="#f8f9fc"/>'
    t, _ = text_path('LSU logo concepts', B800, 34, 60, 70)
    body += f'<path d="{t}" fill="{C["ink"]}"/>'
    for i, (name, fn) in enumerate(concepts):
        y = 120 + i * 380
        body += f'<rect x="40" y="{y}" width="{W - 80}" height="350" rx="24" fill="#fff" stroke="#d9dce7"/>'
        t, _ = text_path(name, B700, 22, 70, y + 44)
        body += f'<path d="{t}" fill="{C["muted"] if "muted" in C else "#5a5248"}"/>'
        # big mark
        body += f'<g transform="translate(70 {y + 80}) scale(1.9)">{fn()}</g>'
        # lockup on light
        lk, lw, lh = lockup(fn)
        body += f'<g transform="translate(380 {y + 110}) scale(1.15)">{lk}</g>'
        # reversed lockup on cobalt/charcoal
        body += f'<rect x="1010" y="{y + 70}" width="440" height="250" rx="18" fill="{C["charcoal"]}"/>'
        lk2, _, _ = lockup(fn, ink='paper', dot='mustard')
        body += f'<g transform="translate(1040 {y + 140}) scale(0.82)">{lk2}</g>'
        # favicon sizes
        for k, s in enumerate((0.4, 0.27, 0.14)):
            body += f'<g transform="translate({760 + k * 60} {y + 268}) scale({s})">{fn(shadow=None)}</g>'
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'concepts.svg'), 'w').write(svg(W, H, body))
    print('written')
