"""Open Graph / social share image, 1200×630."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from textpath import text_path
from build_logos import C, GLASS, LIQUID, B800, B500, save
def og():
    W, H = 1200, 630
    s = 2.3
    top = H / 2 - 112 * s / 2 + 10
    beam_y = top + 62 * s
    body = f'<rect width="{W}" height="{H}" fill="{C["cobalt"]}"/>'
    body += f'<rect x="0" y="{beam_y:.1f}" width="{W}" height="{14*s:.1f}" fill="{C["mustard"]}"/>'
    x0 = 70
    body += (f'<g transform="translate({x0} {top:.1f}) scale({s})"><path d="{LIQUID}" fill="{C["pink"]}"/>'
             f'<path d="{GLASS}" fill="none" stroke="{C["paper"]}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
             f'<rect x="38" y="62" width="36" height="14" fill="{C["mustard"]}"/></g>')
    tx = x0 + 84 * s + 40
    size = 76
    d, w = text_path('lab science unfiltered', B800, size, tx, beam_y - 28, -0.03)
    r = size * 0.105
    body += f'<path d="{d}" fill="{C["paper"]}"/><circle cx="{tx+w+size*0.03+r:.1f}" cy="{beam_y-28-r:.1f}" r="{r:.1f}" fill="{C["mustard"]}"/>'
    d2, _ = text_path('Clinical laboratory science, explained.', B500, 38, tx, beam_y + 14 * s + 58, -0.01)
    body += f'<path d="{d2}" fill="{C["paper"]}"/>'
    return body, W, H
if __name__ == '__main__':
    b, w, h = og(); save('og-image', w, h, b); print('ok')
