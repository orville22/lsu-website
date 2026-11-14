"""Creates static font instances (from the website's variable fonts) used to outline the logo type."""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, '..', '..', 'public', 'fonts')
OUT = os.path.join(HERE, '..', 'fonts')
os.makedirs(OUT, exist_ok=True)
for w in (500, 700, 800):
    f = instancer.instantiateVariableFont(TTFont(os.path.join(SRC, 'bricolage-grotesque-latin.woff2')), {'wght': w, 'opsz': 96})
    f.flavor = None
    f.save(os.path.join(OUT, f'Bricolage-{w}.ttf'))
print('fonts ready in', os.path.abspath(OUT))
