// tpl.html + data/*.json + news.json → index.html. Uso: node render.js
// Controlla i dati prima di scrivere: un valore senza stato valido o senza fonte blocca il build.
const fs = require('fs'), path = require('path');
const H = __dirname, STATI = ['ver', 'dic', 'int', 'val', 'est'];

function validate(D) {
  const err = [], ids = new Set(), mk = new Set((D.meta.metriche || []).map(m => m.k));
  if (!D.meta.nome) err.push('meta.nome mancante');
  (D.aziende || []).forEach(a => {
    if (!a.id || ids.has(a.id)) err.push(`id azienda mancante o doppio: ${a.id}`);
    ids.add(a.id);
    Object.entries(a.f || {}).forEach(([k, x]) => {
      const w = `${a.id}.${k}`;
      if (!mk.has(k)) err.push(`${w}: metrica non definita in meta.metriche`);
      if (!Array.isArray(x) || x.length < 3) return err.push(`${w}: serve [valore, stato, nota, url]`);
      if (!STATI.includes(x[1])) err.push(`${w}: stato "${x[1]}" non valido (${STATI})`);
      // verificato e dichiarato vengono da una fonte esterna: senza link non si possono controllare
      if ((x[1] === 'ver' || x[1] === 'dic') && !/^https?:\/\//.test(x[3] || '')) err.push(`${w}: stato ${x[1]} senza url`);
    });
  });
  if (D.meta.azienda && !ids.has(D.meta.azienda)) err.push(`meta.azienda "${D.meta.azienda}" non è in aziende.json`);
  // file dei moduli: ogni oggetto con "s" è un dato → stato valido, e url se ver/dic
  const chk = (s, u, w) => {
    if (!STATI.includes(s)) err.push(`${w}: stato "${s}" non valido`);
    else if ((s === 'ver' || s === 'dic') && !/^https?:\/\//.test(u || '')) err.push(`${w}: stato ${s} senza url`);
  };
  const walk = (o, w) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${w}[${i}]`));
    if (!o || typeof o !== 'object') return;
    if (typeof o.s === 'string') chk(o.s, o.u, w);
    for (const k in o) walk(o[k], `${w}.${k}`);
  };
  for (const k in D) if (!['meta', 'aziende', 'news', 'news_q'].includes(k)) walk(D[k], k);
  // storico: righe [anno, valore, stato, nota, url]
  Object.entries(D.storico || {}).forEach(([id, m]) => Object.entries(m).forEach(([k, r]) => r.forEach((x, i) => chk(x[2], x[4], `storico.${id}.${k}[${i}]`))));
  (D.news.items || []).forEach(n => { if (!/^https?:\/\//.test(n.u || '')) err.push(`notizia senza link: ${n.t}`); });
  return err;
}

function build() {
  const D = {};
  for (const f of fs.readdirSync(path.join(H, 'data')).filter(f => f.endsWith('.json')))
    D[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(H, 'data', f), 'utf8'));
  const nf = path.join(H, 'news.json');
  D.news = fs.existsSync(nf) ? JSON.parse(fs.readFileSync(nf, 'utf8')) : { at: null, items: [] };
  // logo del cliente (meta.logo = file locale): incorporato in base64, la pagina resta un solo file
  const lf = D.meta.logo && path.join(H, D.meta.logo);
  if (lf && fs.existsSync(lf)) D.meta.logoData = `data:image/${path.extname(lf).slice(1).replace('jpg', 'jpeg').replace('svg', 'svg+xml')};base64,` + fs.readFileSync(lf).toString('base64');
  // loghi dei marchi (brand.json → logos/<id>.png) dentro la pagina, che resta un solo file
  for (const b of Object.values((D.brand || {}).az || {})) { const f = b.logo && b.logo.f && path.join(H, b.logo.f); if (f && fs.existsSync(f)) b.logo.data = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'); }
  // i 10 loghi mondiali di riferimento per il Global logo index (logos/top, come Massini)
  const td = path.join(H, 'logos', 'top'); if (D.brandx && fs.existsSync(td)) { D.toplogos = {}; for (const f of fs.readdirSync(td).filter(f => f.endsWith('.png'))) D.toplogos[f.slice(0, -4)] = 'data:image/png;base64,' + fs.readFileSync(path.join(td, f)).toString('base64'); }
  const err = validate(D);
  if (err.length) { console.error('Dati non validi:\n- ' + err.join('\n- ')); process.exit(1); }
  const js = JSON.stringify(D).replace(/</g, '\\u003c');
  const out = fs.readFileSync(path.join(H, 'tpl.html'), 'utf8').replace('__DATA__', () => js);
  // favicon (brand/icon.svg incorporata) e anteprima social (brand/og.png + meta.url): tag statici, i social non eseguono JS
  const M = D.meta, ea = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'), bf = f => fs.existsSync(path.join(H, 'brand', f));
  const tit = ea(M.nome + (M.sottotitolo ? ' · ' + M.sottotitolo : '')), ver = (M.aggiornato || '').replace(/-/g, '');
  const head = `<title>${tit}</title>` + (bf('icon.svg') ? `\n<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${fs.readFileSync(path.join(H, 'brand/icon.svg')).toString('base64')}">` : '') +
    (bf('favicon-32.png') ? `<link rel="icon" type="image/png" sizes="32x32" href="brand/favicon-32.png">` : '') + (bf('apple-touch-icon.png') ? `<link rel="apple-touch-icon" href="brand/apple-touch-icon.png">` : '') +
    (M.url && bf('og.png') ? `\n<meta property="og:type" content="website"><meta property="og:title" content="${tit}"><meta property="og:description" content="${ea(M.descrizione || '')}"><meta name="description" content="${ea(M.descrizione || '')}"><meta property="og:url" content="${ea(M.url)}"><meta property="og:image" content="${ea(M.url)}brand/og.png?v=${ver}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${ea(M.url)}brand/og.png?v=${ver}">` : '');
  fs.writeFileSync(path.join(H, 'index.html'), out.replace('<title>Intelligence</title>', () => head));
  console.log('index.html', Buffer.byteLength(out), 'byte,', D.aziende.length, 'aziende,', D.news.items.length, 'notizie');
}

if (require.main === module) build();
module.exports = { validate };
