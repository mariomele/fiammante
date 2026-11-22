// node test.js → controlla che validate() blocchi i dati senza stato o senza fonte
const assert = require('assert'), { validate } = require('./render.js');
const ok = { meta: { nome: 'X', azienda: 'a', metriche: [{ k: 'rev', l: 'Ricavi' }] },
  aziende: [{ id: 'a', f: { rev: [10, 'ver', 'bilancio 2025', 'https://x.it'] } }], news: { items: [] } };
assert.deepStrictEqual(validate(ok), []);
const bad = JSON.parse(JSON.stringify(ok));
bad.aziende.push({ id: 'a', f: { rev: [5, 'ver', 'senza link'], emp: [3, 'boh', ''] } });
const e = validate(bad).join('\n');
for (const s of ['doppio', 'senza url', 'stato "boh"', 'emp: metrica non definita']) assert(e.includes(s), 'manca errore: ' + s);
// file dei moduli: ogni oggetto con s, e le righe dello storico
const mod = JSON.parse(JSON.stringify(ok));
mod.social = { az: { a: { ig: { fol: 5, s: 'dic', u: 'https://x.it' }, tono: { v: {}, s: 'val' } } } };
mod.storico = { a: { rev: [[2024, 9, 'ver', 'bilancio', 'https://x.it']] } };
assert.deepStrictEqual(validate(mod), []);
mod.ads = { az: { a: { meta: { n: 0, s: 'dic' } } } };
mod.storico.a.rev.push([2025, 10, 'ver', 'senza link']);
mod.seo = { dom: { a: { s: 'xx' } } };
const m = validate(mod).join('\n');
for (const s of ['ads.az.a.meta: stato dic senza url', 'storico.a.rev[1]: stato ver senza url', 'seo.dom.a: stato "xx"']) assert(m.includes(s), 'manca errore: ' + s);
console.log('ok');
