// Da dove vengono le analisi. Ogni testo scritto (analisi Sales e Marketing, giudizi, schede, battlecard, letture di gruppo)
// è «firmato» in data/_dal.json con l'impronta dei dati da cui è nato. Se quei dati cambiano, la firma non torna più:
// il build lo dice e la pagina mette un avviso sulla sezione, così una tabella nuova non convive con un testo vecchio.
//
//   node scripts/deps.js                              elenco delle analisi da rileggere (esce con 1 se ce ne sono)
//   node scripts/deps.js firma mkt premi social aziende.noi
//                                                     firma data/mkt.json con l'impronta attuale di premi, social e della riga noi
//   node scripts/deps.js chi premi                    quali analisi leggono premi (da rileggere se lo cambi)
//
// Una fonte è un file di data/ senza .json (o «news»), oppure un pezzo del file con il percorso a punti: «aziende.noi» è
// l'azienda con id noi dentro aziende.json, «premi.items» il campo items di premi.json. Più la fonte è stretta, meno falsi allarmi.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
// dati in data/ (kit) oppure, nei progetti più vecchi, alla radice
const H = path.join(__dirname, '..'), DD = fs.existsSync(path.join(H, 'data')) ? path.join(H, 'data') : H, DAL = path.join(DD, '_dal.json');

const file = k => k === 'news' ? path.join(H, 'news.json') : path.join(DD, k + '.json');
const fromDisk = k => fs.existsSync(file(k)) ? JSON.parse(fs.readFileSync(file(k), 'utf8')) : undefined;
// un passo del percorso trova la chiave dell'oggetto oppure, in una lista, l'elemento con quell'id
const step = (o, k) => o == null ? undefined : Array.isArray(o) && !/^\d+$/.test(k) ? o.find(x => x && x.id === k) : o[k];
const pick = (get, ref) => { const [f, ...p] = ref.split('.'); return p.reduce(step, get(f)); };
const imp = o => o === undefined ? null : crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 10);

// get(k) dà il contenuto del file k: dal disco, oppure dai dati già caricati da render.js
function stale(get = fromDisk) {
  const dal = get('_dal') || {}, out = {};
  for (const [k, x] of Object.entries(dal)) {
    const ch = Object.keys(x.fonti || {}).filter(r => imp(pick(get, r)) !== x.fonti[r]);
    if (!get(k)) ch.unshift('(il file firmato non esiste più)');
    if (ch.length) out[k] = { at: x.at, fonti: ch };
  }
  return out;
}

function firma(k, refs) {
  if (!fs.existsSync(file(k))) throw new Error(`data/${k}.json non esiste`);
  const dal = fs.existsSync(DAL) ? JSON.parse(fs.readFileSync(DAL, 'utf8')) : {};
  const fonti = {};
  for (const r of refs) { const h = imp(pick(fromDisk, r)); if (h === null) throw new Error(`fonte «${r}» non trovata`); fonti[r] = h; }
  dal[k] = { at: new Date().toISOString().slice(0, 10), fonti };
  fs.writeFileSync(DAL, JSON.stringify(dal, null, 1) + '\n');
  console.log(`firmato ${k} ← ${refs.join(', ')}`);
}

if (require.main === module) {
  const [cmd, k, ...refs] = process.argv.slice(2);
  if (cmd === 'firma') { if (!k || !refs.length) throw new Error('uso: node scripts/deps.js firma <analisi> <fonte> [fonte…]'); firma(k, refs); }
  else if (cmd === 'chi') {
    const dal = fromDisk('_dal') || {};
    const who = Object.entries(dal).filter(([, x]) => Object.keys(x.fonti).some(r => r === k || r.startsWith(k + '.'))).map(([a]) => a);
    console.log(who.length ? `${k} è letto da: ${who.join(', ')}` : `nessuna analisi firmata legge ${k}`);
  } else {
    const s = stale();
    for (const [a, x] of Object.entries(s)) console.log(`DA RILEGGERE ${a} (scritto il ${x.at}): cambiati ${x.fonti.join(', ')}`);
    if (!Object.keys(s).length) console.log('tutte le analisi firmate sono allineate ai dati');
    process.exitCode = Object.keys(s).length ? 1 : 0;
  }
}
module.exports = { stale, imp, pick };

// prova veloce: node scripts/deps.js prova
if (process.argv[2] === 'prova') {
  const D = { a: { x: 1, l: [{ id: 'p', v: 2 }] }, _dal: {} };
  const g = k => D[k];
  D._dal.a = { at: 'x', fonti: { 'a.l.p': imp(pick(g, 'a.l.p')) } };
  console.assert(!Object.keys(stale(g)).length, 'appena firmato deve essere allineato');
  D.a.x = 9; console.assert(!Object.keys(stale(g)).length, 'cambia un campo non firmato: niente avviso');
  D.a.l[0].v = 3; console.assert(stale(g).a.fonti[0] === 'a.l.p', 'cambia la fonte firmata: avviso');
  console.log('prova ok');
}
