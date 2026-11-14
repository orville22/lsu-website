import asyncio, re, pathlib, sys
from playwright.async_api import async_playwright
L = pathlib.Path('logo'); P = pathlib.Path('logo/png'); P.mkdir(exist_ok=True)
jobs = []
for f in sorted(L.glob('*.svg')):
    n = f.stem
    if n == 'favicon':
        for s in (16, 32, 48, 180, 192, 512): jobs.append((f, P / f'favicon-{s}.png', s))
    elif n == 'youtube-avatar': jobs.append((f, P / 'youtube-avatar-800.png', 800))
    elif n == 'youtube-banner': jobs.append((f, P / 'youtube-banner-2560x1440.png', 2560))
    elif n.startswith('lsu-mark'):
        for s in (512, 1024): jobs.append((f, P / f'{n}-{s}.png', s))
    else: jobs.append((f, P / f'{n}-2000.png', 2000))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for src, dst, width in jobs:
            svg = src.read_text()
            w, h = map(float, re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg).groups())
            scale = width / w
            pg = await b.new_page(viewport={'width': int(round(w)), 'height': int(round(h))}, device_scale_factor=scale)
            await pg.set_content(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
            await pg.screenshot(path=str(dst), omit_background=True, clip={'x': 0, 'y': 0, 'width': w, 'height': h})
            await pg.close()
        await b.close()
asyncio.run(main())
from PIL import Image
Image.open(P / 'favicon-48.png').save(L / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print(len(jobs), 'pngs')
