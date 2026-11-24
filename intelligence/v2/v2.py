# index.html → index-v2.html: stesso cruscotto con l'aspetto «da applicazione» (strato v2 della skill dashboard-intelligence).
# Uso, dalla cartella del cruscotto: node render.js && python3 -I v2/v2.py
# Scrive index-v2.html accanto a index.html, così i percorsi logos/ e news.json restano validi; da pubblicare come index.html.
import base64, pathlib

here = pathlib.Path(__file__).parent
root = here.parent
src = (root / 'index.html').read_text()

b64 = lambda p: base64.b64encode((root / p).read_bytes()).decode()
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300..700&display=swap" rel="stylesheet">')
CSS = (here / 'v2.css').read_text()
HERO = ((here / 'v2-hero.html').read_text()
        .replace('__LOGO__', 'data:image/png;base64,' + b64('logos/icab.png'))
        .replace('__PACK1__', 'data:image/png;base64,' + b64('logos/pack/icab.png'))
        .replace('__PACK2__', 'data:image/png;base64,' + b64('logos/pack/icab-dolce.png')))
JS = (here / 'v2.js').read_text()

for a in ('</style></head>', '<div class="bar">', '</body></html>'):
    assert src.count(a) == 1, a
out = (src.replace('</style></head>', CSS + '</style>' + FONTS + '</head>', 1)
       .replace('<div class="bar">', HERO + '<div class="bar">', 1)
       .replace('</body></html>', '<script>' + JS + '</script></body></html>', 1))
(root / 'index-v2.html').write_text(out)
print('index-v2.html', len(out.encode()))
