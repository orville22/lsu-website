"""Shape text with HarfBuzz and return SVG path data, so logos don't depend on installed fonts."""
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

_cache = {}


def _load(path):
    if path not in _cache:
        blob = hb.Blob.from_file_path(path)
        face = hb.Face(blob)
        font = hb.Font(face)
        tt = TTFont(path)
        _cache[path] = (font, tt, tt.getGlyphSet(), tt['head'].unitsPerEm)
    return _cache[path]


def text_path(text, font_path, size, x=0, y=0, tracking=0.0):
    """Returns (d, width). y is the baseline. tracking in em units (e.g. -0.02)."""
    font, tt, gs, upem = _load(font_path)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    scale = size / upem
    pen = SVGPathPen(gs)
    cx = 0
    order = tt.getGlyphOrder()
    n = len(buf.glyph_infos)
    for k, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        name = order[info.codepoint]
        t = TransformPen(pen, (scale, 0, 0, -scale, x + (cx + pos.x_offset) * scale, y - pos.y_offset * scale))
        gs[name].draw(t)
        cx += pos.x_advance
        if k < n - 1:
            cx += tracking * upem
    return pen.getCommands(), cx * scale


def cap_height(font_path, size):
    _, tt, _, upem = _load(font_path)
    return tt['OS/2'].sCapHeight * size / upem


def x_height(font_path, size):
    _, tt, _, upem = _load(font_path)
    return tt['OS/2'].sxHeight * size / upem
