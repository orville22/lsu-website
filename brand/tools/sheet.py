import os,sys,re
items=[('lsu-mark','#fff'),('lsu-mark-flat','#fff'),('lsu-mark-one-colour-ink','#fff'),('lsu-mark-one-colour-white','#35302b'),
 ('lsu-logo-horizontal','#fff'),('lsu-logo-horizontal-reversed','#35302b'),('lsu-logo-horizontal-one-colour-ink','#fff'),('lsu-logo-horizontal-one-colour-white','#344fb4'),
 ('lsu-logo-stacked','#fff'),('lsu-logo-stacked-reversed','#344fb4'),('lsu-wordmark','#fff'),('lsu-wordmark-one-line','#fff'),('lsu-wordmark-one-line-reversed','#35302b'),('youtube-avatar','#fff')]
cells=''
for n,bg in items:
    cells+=f'<div style="background:{bg};border:1px solid #ddd;border-radius:12px;padding:28px;display:flex;flex-direction:column;align-items:center;gap:10px"><img src="logo/{n}.svg" style="max-width:100%;max-height:170px"><code style="font:12px monospace;color:{"#999"}">{n}</code></div>'
open('sheet.html','w').write(f'<html><body style="margin:0;padding:30px;background:#f3f3f3;width:1340px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">{cells}</div></body></html>')
