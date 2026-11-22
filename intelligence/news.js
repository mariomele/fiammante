// Notizie da Google News RSS → news.json (gratis, senza chiave). Uso: node news.js && node render.js
// Query in data/news_q.json: { id_azienda: { q: "query Google News", k: ["parole nel titolo"], x: "regex omonimi da escludere" } }
// Ogni notizia ha titolo, testata, data e link originale: nessun testo inventato. Conserva quelle già raccolte.
const fs = require('fs'), path = require('path');
const H = __dirname, DAYS = 365, OUT = path.join(H, 'news.json');
const Q = JSON.parse(fs.readFileSync(path.join(H, 'data', 'news_q.json'), 'utf8'));
const old = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { items: [] };
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tag = (s, t) => ((s.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1] || '')
  .replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

(async () => {
  const seen = new Map(old.items.map(n => [n.u, n])), since = Date.now() - DAYS * 864e5;
  for (const [id, c] of Object.entries(Q)) {
    const u = `https://news.google.com/rss/search?q=${encodeURIComponent(c.q)}&hl=it&gl=IT&ceid=IT:it`;
    let xml;
    try { xml = await (await fetch(u)).text(); } catch (e) { console.error(id, e.message); continue; }
    const x = c.x && new RegExp(c.x, 'i');
    for (const it of xml.split('<item>').slice(1)) {
      const src = tag(it, 'source'), t = tag(it, 'title').replace(new RegExp(` - ${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
      const d = new Date(tag(it, 'pubDate')), link = tag(it, 'link');
      if (isNaN(d) || d < since || !link || seen.has(link)) continue;
      if (c.k && !c.k.some(k => norm(t).includes(norm(k)))) continue;
      if (x && x.test(t)) continue;
      seen.set(link, { id, d: d.toISOString().slice(0, 10), t, s: src, u: link });
    }
  }
  const items = [...seen.values()].filter(n => new Date(n.d) >= since).sort((a, b) => b.d.localeCompare(a.d));
  fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), items }, null, 0));
  console.log('news.json', items.length, 'notizie,', items.length - old.items.length, 'nuove');
})();
