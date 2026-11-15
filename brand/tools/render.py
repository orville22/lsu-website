import asyncio, sys, pathlib
from playwright.async_api import async_playwright
async def main(src, dst, scale):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        svg = pathlib.Path(src).read_text()
        import re
        w, h = map(float, re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg).groups())
        pg = await b.new_page(viewport={'width': int(w), 'height': int(h)}, device_scale_factor=scale)
        await pg.set_content(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
        await pg.screenshot(path=dst, omit_background=True, clip={'x':0,'y':0,'width':w,'height':h})
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv)>3 else 1))
