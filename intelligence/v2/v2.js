// strato v2: apertura della Home, occhiello d'area, movimento, note richiuse, barra laterale, ricerca ⌘K.
// Legge le variabili del template (N, OI, OC, CC, A, ME, NAVA, SEC, ORD, ST, press, nm, esc, days, show).
(function(){
var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
var amb=document.createElement('div');amb.id='v2amb';amb.setAttribute('aria-hidden','true');document.body.prepend(amb);
var dt=function(d){return String(d||'').split('-').reverse().join('/')};
// apertura della Home: frase, quattro numeri, tre notizie da leggere, chi preme di più, di cosa si muovono
function brief(){
 var R=document.getElementById('regia');if(!R||document.getElementById('v2brief'))return;
 var S=N.filter(function(n){return n.id!==ME}),O=OI.filter(function(o){return o.id!==ME}),nc=A.length-1;
 var n=function(dd){return S.filter(function(s){return days(s.d)<=dd}).length},o=function(dd){return O.filter(function(s){return days(s.d)<=dd}).length};
 var spark=function(L){var w=[];for(var i=0;i<12;i++)w.push(0);L.forEach(function(s){var k=Math.floor(days(s.d)/7);if(k>=0&&k<12)w[11-k]++});var m=Math.max.apply(null,w)||1;
  return '<svg viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+w.map(function(v,i){return(i*120/11).toFixed(1)+','+(30-v/m*26).toFixed(1)}).join(' ')+'"/></svg>'};
 var pr=(typeof press==='function'?press():[]).filter(function(p){return p.id!==ME}).slice(0,9);
 var mix={};O.forEach(function(s){if(days(s.d)<=365)mix[s.c]=(mix[s.c]||0)+1});var mx=Object.keys(mix).sort(function(a,b){return mix[b]-mix[a]}),mt=mx.reduce(function(t,k){return t+mix[k]},0)||1;
 var top=S.slice().sort(function(a,b){return a.d<b.d?1:-1}).slice(0,3);
 var kp=[['Notizie','ultimi 7 giorni',n(7),S,''],['Notizie','ultimi 30 giorni',n(30),S,''],['OSINT','segnali negli ultimi 90 giorni',o(90),O,'#2ec4b6'],['OSINT','segnali in 12 mesi',o(365),O,'#c678dd']];
 var e=document.createElement('div');e.id='v2brief';
 e.innerHTML='<div class="vb-intro"><span class="vb-pill"><i></i>In breve</span><h2>In 30 giorni <em>'+n(30)+' notizie</em> su '+new Set(S.filter(function(s){return days(s.d)<=30}).map(function(s){return s.id})).size+' dei '+nc+' concorrenti. '+o(365)+' segnali OSINT in un anno: fiere, investimenti, lanci, campagne.</h2>'+
  '<p>Aggiornato al '+dt(new Date().toISOString().slice(0,10))+'. Sotto trovi cosa leggere oggi, chi preme di più su '+esc(nm(ME))+' e, più in basso, la sala operativa con il quadro che ruota, la mappa e i nastri in diretta.</p></div>'+
  '<div class="vb-kpi">'+kp.map(function(k){return '<div class="vb-k"'+(k[4]?' style="--kc:'+k[4]+'"':'')+'><span>'+k[0]+'</span><b>'+k[2]+'</b><small>'+k[1]+'</small>'+spark(k[3])+'</div>'}).join('')+'</div>'+
  (top.length?'<div class="vb-h"><span class="vb-pill"><i></i>Da leggere oggi</span><span>le ultime notizie sui concorrenti</span></div>'+
  '<div class="vb-top">'+top.map(function(s){return '<a class="vb-s" href="'+esc(s.u)+'" target="_blank" rel="noopener"><span class="vb-c"><i></i>Notizia</span><b>'+esc(nm(s.id))+'</b><p>'+esc(s.t)+'</p><small>'+esc(s.s||'')+' · '+dt(s.d)+' <span aria-hidden="true">↗</span></small></a>'}).join('')+'</div>':'')+
  '<div class="vb-two">'+(pr.length?'<div class="vb-p"><div class="vb-h"><span class="vb-pill"><i></i>Chi preme di più</span><span>indice di pressione su '+esc(nm(ME))+' · valutazione · clic per il dossier</span></div>'+
  pr.map(function(p,i){return '<a class="vb-r" href="#dossier" data-st="dz:'+p.id+'"><em>'+(i+1)+'</em><b>'+esc(nm(p.id))+'</b><span class="vb-bar"><i style="width:'+Math.round(p.v)+'%"></i></span><strong>'+Math.round(p.v)+'</strong><small>su 100</small></a>'}).join('')+'</div>':'')+
  (mx.length?'<div class="vb-p"><div class="vb-h"><span class="vb-pill"><i></i>Di cosa si muovono</span><span>segnali OSINT per tipo · 12 mesi</span></div>'+
  mx.map(function(k){return '<div class="vb-m" style="--kc:'+CC(k)+'"><span><i></i>'+esc(OC[k]||k)+'</span><span class="vb-bar"><i style="width:'+(mix[k]/mix[mx[0]]*100).toFixed(1)+'%"></i></span><strong>'+mix[k]+'</strong><small>'+Math.round(mix[k]/mt*100)+'%</small></div>'}).join('')+'</div>':'')+'</div>'+
  '<div class="vb-h vb-ops"><span class="vb-pill"><i></i>Sala operativa</span><span>quadro che ruota, nastri ULTIME e SOCIAL, mappa, posizione su ogni misura</span></div>';
 var sh=R.querySelector('.lead');R.insertBefore(e,sh?sh.nextSibling:R.firstChild);
}
// note lunghe: chiuse, con «Leggi tutto»
function fold(){var sec=document.querySelector('#main>section');if(!sec)return;
 [].forEach.call(sec.querySelectorAll('.note,.disc'),function(n){if(n.dataset.v2f||!n.offsetParent||n.textContent.length<240)return;n.dataset.v2f=1;
  var lh=parseFloat(getComputedStyle(n).fontSize)||13;if(n.scrollHeight<lh*7.5)return;
  n.classList.add('v2fold');var b=document.createElement('button');b.type='button';b.className='v2more';b.setAttribute('aria-expanded','false');b.textContent='Leggi tutto';
  b.addEventListener('click',function(){var o=n.classList.toggle('v2un');b.setAttribute('aria-expanded',o);b.textContent=o?'Chiudi':'Leggi tutto';if(!o&&n.getBoundingClientRect().top<0)n.scrollIntoView({block:'center'})});
  n.parentNode.insertBefore(b,n.nextSibling)})}
// a ogni disegno della sezione: occhiello «AREA · 03 / 08», apertura della Home, movimento
function pass(){
 var sec=document.querySelector('#main>section');if(!sec)return;var id=sec.id;
 var A=null;NAVA.forEach(function(a){if(a[2].indexOf(id)>-1)A=a});
 var n=sec.querySelector('.sh i');if(n&&A&&!n.dataset.a){n.dataset.a=A[1];n.dataset.t=('0'+A[2].length).slice(-2)}
 if(id==='regia')brief();
 setTimeout(fold,60);
 if(still)return;
 if(!sec.dataset.v2s){sec.dataset.v2s=1;sec.classList.add('v2sec')}
 scan()}

// ── movimento: comparsa allo scorrimento, numeri che contano, barre e linee che si disegnano, luce sotto il cursore ──
var RV='.card,.kpis,.qg,.tick,.vb-k,.vb-s,.vb-p,.vb-intro,.vb-h';
var ob=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;ob.unobserve(x.target);reveal(x.target)})},{rootMargin:'0px 0px -6% 0px',threshold:.06}):null;
function reveal(el){
 var sib=el.parentNode?[].indexOf.call(el.parentNode.children,el):0;
 el.style.transitionDelay=Math.min(sib,8)*70+'ms';el.classList.add('in');
 setTimeout(function(){el.style.transitionDelay=''},1400);
 [].forEach.call(el.querySelectorAll('.vb-k b,.kpi b'),count);
 [].forEach.call(el.querySelectorAll('.vb-bar i'),function(b,i){b.style.transitionDelay=(200+i*60)+'ms';b.classList.add('go')});
 grow(el);rows(el);
 [].forEach.call(el.querySelectorAll('svg polyline,svg path'),function(p,i){if(i>40||!p.getTotalLength)return;var cs=getComputedStyle(p);if(cs.fill!=='none'||cs.stroke==='none')return;try{var L=p.getTotalLength();if(!L||L>4000)return;p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();p.style.transition='stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1) '+(250+i*40)+'ms';p.style.strokeDashoffset=0}catch(e){}})}
function count(b){
 var tn=b.firstChild;if(b.dataset.v2n||!tn||tn.nodeType!==3)return;var t=tn.nodeValue,m=/^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(.*)$/.exec(t);if(!m)return;b.dataset.v2n=1;
 var dec=m[3]||'',to=parseFloat(m[2].replace(/\./g,'')+(dec?'.'+dec:'')),t0=performance.now(),D=1100;
 var fmt=function(v){var s=v.toFixed(dec.length),p=s.split('.');return m[1]+p[0].replace(/\B(?=(\d{3})+(?!\d))/g,m[2].indexOf('.')>-1?'.':'')+(p[1]?','+p[1]:'')+m[4]};
 (function tick(now){var k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);tn.nodeValue=fmt(to*e);if(k<1)requestAnimationFrame(tick);else tn.nodeValue=t})(t0)}
function grow(el){var k=0;[].forEach.call(el.querySelectorAll('i[style*="width"],.sbar b,.sbar span'),function(b){if(b.dataset.v2g||b.closest('.vb-bar')||/transform/.test(b.getAttribute('style')||'')||b.offsetWidth<3)return;b.dataset.v2g=1;
 b.classList.add('v2g');b.style.setProperty('--gd',Math.min(k++,24)*35+'ms');requestAnimationFrame(function(){requestAnimationFrame(function(){b.classList.add('go')})})})}
function rows(el){[].forEach.call(el.querySelectorAll('table'),function(t){if(t.dataset.v2t||!t.tBodies[0])return;t.dataset.v2t=1;[].slice.call(t.tBodies[0].rows,0,40).forEach(function(r,i){r.style.setProperty('--r',i)});t.classList.add('v2tr')})}
// schede a confronto (loghi, pack, siti, feed): entrano una a una
var TL='.lt,.lsc,.rkl';
var tob=('IntersectionObserver' in window)?new IntersectionObserver(function(es){var k=0;es.forEach(function(x){if(!x.isIntersecting)return;tob.unobserve(x.target);var t=x.target;t.style.setProperty('--td',Math.min(k++,10)*55+'ms');t.classList.add('in');setTimeout(function(){t.style.setProperty('--td','0ms')},1600)})},{rootMargin:'0px 0px -4% 0px',threshold:.12}):null;
function scan(){if(still||!ob)return;var sec=document.querySelector('#main>section');if(!sec)return;
 [].forEach.call(sec.querySelectorAll(RV),function(el){if(el.dataset.v2r||el.closest('.v2rv'))return;el.dataset.v2r=1;el.classList.add('v2rv');ob.observe(el)});
 if(tob)[].forEach.call(sec.querySelectorAll(TL),function(el){if(el.dataset.v2c)return;el.dataset.v2c=1;el.classList.add('v2t');tob.observe(el)});
 [].forEach.call(sec.querySelectorAll('.v2rv.in'),function(el){grow(el);rows(el)})}
// show() riscrive #main a ogni cambio (sezione, filtri, rotazione): si riparte da lì
var mo=new MutationObserver(function(){clearTimeout(mo.t);mo.t=setTimeout(pass,60)});
mo.observe(document.getElementById('main'),{childList:true,subtree:true});
if(!still&&matchMedia('(pointer:fine)').matches)document.addEventListener('pointermove',function(ev){var c=ev.target.closest&&ev.target.closest('.card,.vb-k,.vb-s,.vb-p');if(!c)return;var r=c.getBoundingClientRect();c.style.setProperty('--mx',(ev.clientX-r.left)+'px');c.style.setProperty('--my',(ev.clientY-r.top)+'px')},{passive:true});
setTimeout(pass,30);
})();

// ── apertura a tutto schermo: avvisi = ultime notizie vere dei concorrenti, poi risposte contate dai dati ──
(function(){
var h=document.getElementById('v2h'),box=document.getElementById('v2chips'),fill=document.getElementById('v2fill'),root=document.documentElement;
if(!h)return;
var done=root.classList.contains('v2in'),timers=[];
function enter(y){if(done)return;done=true;timers.forEach(clearTimeout);root.classList.add('v2in');window.scrollTo(0,y||0)}
h.querySelectorAll('a[href="#regia"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();enter(0);if(location.hash!=='#regia')location.hash='regia';else show()})});
addEventListener('hashchange',function(){enter(0)});
addEventListener('scroll',function(){if(!done&&scrollY>=h.offsetHeight)enter(scrollY-h.offsetHeight)},{passive:true});
if(done)return;
var cut=function(s,n){return s.length>n?s.slice(0,n-1).replace(/\s\S*$/,'').replace(/[\s,;:.(–-]+$/,'')+'…':s};
var ev=N.filter(function(e){return e.id!==ME}).sort(function(a,b){return a.d<b.d?1:-1}).slice(0,6);
var nc=A.length-1,ns=ORD.length,no=OI.length;
var P=[[56,17],[71,29],[42,36],[83,44],[22,30],[60,50]],Q=[[57,20],[73,33],[40,40],[80,48],[25,33]];
var okT=[nc+' concorrenti\nsotto osservazione',N.length+' notizie\nraccolte e filtrate',no+' segnali OSINT\nfiere, investimenti, campagne','Stato e fonte\nper ogni dato',ns+' sezioni\nSales e Marketing'];
function chip(cls,xy,html,i){var s=document.createElement('span');s.className=cls+(i===2||i===4?' x':'');s.style.setProperty('--x',xy[0]+'%');s.style.setProperty('--y',xy[1]+'%');var t=document.createElement('em');t.style.fontStyle='normal';t.innerHTML=html;s.appendChild(t);box.appendChild(s);return s}
var ca=ev.map(function(e,i){return chip('a',P[i],'<b>'+esc(nm(e.id))+'</b>\n'+esc(cut(e.t,46)),i)});
var cb=okT.map(function(t,i){var p=t.split('\n');return chip('ok',Q[i],'<b>'+esc(p[0])+'</b>\n'+esc(p[1]),i)});
var line=document.getElementById('v2line');if(line)line.innerHTML=nc+' concorrenti, '+N.length+' notizie,<br>stato e fonte per ogni dato.';
var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!still)h.addEventListener('pointermove',function(e){h.style.setProperty('--px',(e.clientX/innerWidth-.5).toFixed(3));h.style.setProperty('--py',(e.clientY/innerHeight-.5).toFixed(3))},{passive:true});
if(still){h.classList.add('b');cb.forEach(function(s){s.classList.add('show')});fill.style.height='100%';return}
var T=13000,t0;
function at(ms,f){timers.push(setTimeout(f,ms))}
function cycle(){
 t0=Date.now();h.classList.remove('b');
 ca.forEach(function(s,i){at(700+i*480,function(){s.classList.add('show')})});
 at(6200,function(){ca.forEach(function(s){s.classList.remove('show')});h.classList.add('b')});
 cb.forEach(function(s,i){at(6900+i*420,function(){s.classList.add('show')})});
 at(T-900,function(){cb.forEach(function(s){s.classList.remove('show')})});
 at(T,cycle);
}
cycle();
(function rail(){if(done)return;fill.style.height=Math.min(100,(Date.now()-t0)/T*100)+'%';requestAnimationFrame(rail)})();
})();

// ── impianto da applicazione: barra laterale con aree e sezioni, percorso con avanti/indietro, ricerca rapida ⌘K ──
(function(){
var d=document,root=d.documentElement,bar=d.querySelector('.bar>.wrap');if(!bar)return;
var e=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var sn=function(id){return SEC[id]?SEC[id][0]:id};
var GL={sintesi:'◉',concorrenti:'◆',relazioni:'⟷',mercato:'◎',marketing:'▲',analisi:'✎',dati:'≡'};
var A2={},open={};NAVA.forEach(function(a){a[2].forEach(function(s){A2[s]=a})});
var ic={s:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17"/></svg>',
 l:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 6 10l6 6"/></svg>',
 r:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 4 6 6-6 6"/></svg>',
 p:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2.5"/><path d="M7.5 3.5v13"/></svg>',
 m:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>'};
function cur(){var s=d.querySelector('#main>section');return s&&A2[s.id]?s.id:ORD[0]}
var lg=d.getElementById('lgi'),logo=lg?'<span class="sd-lw"><img src="'+lg.src+'" alt=""></span>':'';
var side=d.createElement('aside');side.id='v2side';side.setAttribute('aria-label','Aree e sezioni');
var scrim=d.createElement('div');scrim.id='v2scrim';
var cb=d.createElement('div');cb.id='v2crumb';bar.insertBefore(cb,bar.firstChild);
var slg=d.getElementById('slg');if(slg)bar.appendChild(slg);
d.body.appendChild(scrim);d.body.appendChild(side);
function build(){
 var id=cur(),A=A2[id]||NAVA[0];open[A[0]]=true;
 side.innerHTML='<div class="sd-top"><a class="sd-logo" href="#regia">'+logo+'<span>INTELLIGENCE<em>'+e(M.sottotitolo||'')+'</em></span></a><button class="sd-tg" type="button" aria-label="'+(root.classList.contains('v2mini')?'Allarga':'Stringi')+' la barra laterale" title="Stringi o allarga la barra ( [ )">'+ic.p+'</button></div>'+
  '<button class="sd-k" type="button">'+ic.s+'<span>Cerca o vai a…</span><kbd>⌘K</kbd></button>'+
  '<nav class="sd-n" aria-label="Sezioni"><div class="sd-h">'+NAVA.length+' aree</div>'+NAVA.map(function(a){
   var gi='<i class="sd-ic" aria-hidden="true">'+(GL[a[0]]||'•')+'</i>';
   if(a[2].length===1)return '<a class="sd-1'+(a[2][0]===id?' on" aria-current="page':'')+'" href="#'+a[2][0]+'" title="'+e(a[1])+'">'+gi+'<span>'+e(a[1])+'</span></a>';
   return '<div class="sd-g'+(open[a[0]]?' open':'')+(a===A?' cur':'')+'"><button type="button" data-g="'+a[0]+'" data-f="'+a[2][0]+'" title="'+e(a[1])+'" aria-expanded="'+!!open[a[0]]+'">'+gi+'<span>'+e(a[1])+'</span><em>'+a[2].length+'</em></button><div>'+
    a[2].map(function(s){return '<a href="#'+s+'"'+(s===id?' class="on" aria-current="page"':'')+'>'+e(sn(s))+'</a>'}).join('')+'</div></div>'}).join('')+'</nav>'+
  '<div class="sd-f"></div>';
 side.querySelector('.sd-f').textContent=(ALL.length-1)+' concorrenti · '+ORD.length+' sezioni';
 var k=ORD.indexOf(id),pv=ORD[k-1],nx=ORD[k+1],L=A[2];
 cb.innerHTML='<button class="v2menu" type="button" aria-label="Apri aree e sezioni">'+ic.m+'</button>'+(L.length>1?'<span>'+e(A[1])+'</span><i>/</i>':'')+'<b>'+e(sn(id))+'</b>'+
  (L.length>1?'<em>'+(L.indexOf(id)+1)+' / '+L.length+'</em>':'')+'<span class="c-pn">'+
  (pv?'<a href="#'+pv+'" title="'+e(sn(pv))+'" aria-label="Sezione precedente: '+e(sn(pv))+'">'+ic.l+'</a>':'')+
  (nx?'<a href="#'+nx+'" title="'+e(sn(nx))+'" aria-label="Sezione successiva: '+e(sn(nx))+'">'+ic.r+'</a>':'')+'</span>'+
  '<button class="c-k" type="button" aria-label="Cerca o vai a">'+ic.s+'</button>';
}
var ALL=A;
side.addEventListener('click',function(ev){var g=ev.target.closest('[data-g]');
 if(ev.target.closest('.sd-tg')){mini(!root.classList.contains('v2mini'));return}
 if(g&&root.classList.contains('v2mini')&&innerWidth>1100){location.hash=g.dataset.f;return}
 if(g){var k=g.dataset.g;open[k]=!open[k];g.parentNode.classList.toggle('open',open[k]);g.setAttribute('aria-expanded',open[k]);return}
 if(ev.target.closest('.sd-k')){pal();return}
 if(ev.target.closest('a'))root.classList.remove('v2open')});
cb.addEventListener('click',function(ev){if(ev.target.closest('.v2menu'))root.classList.toggle('v2open');else if(ev.target.closest('.c-k'))pal()});
scrim.addEventListener('click',function(){root.classList.remove('v2open')});
addEventListener('hashchange',function(){setTimeout(build,40)});
function mini(on){root.classList.toggle('v2mini',on);try{localStorage.setItem('v2mini',on?'1':'0')}catch(x){}build();setTimeout(function(){dispatchEvent(new Event('resize'))},320)}
try{if(localStorage.getItem('v2mini')==='1')root.classList.add('v2mini')}catch(x){}
build();

// ricerca rapida: sezioni e aziende (l'azienda apre il dossier)
var P=d.createElement('div');P.id='v2pal';P.hidden=true;
P.innerHTML='<div class="pl-box" role="dialog" aria-modal="true" aria-label="Cerca o vai a"><label class="pl-in">'+ic.s+'<input type="text" placeholder="Sezione o azienda…" autocomplete="off" spellcheck="false" role="combobox" aria-controls="v2pl" aria-expanded="true"><kbd>esc</kbd></label><ul id="v2pl" role="listbox"></ul><div class="pl-ft"><span><kbd>↑</kbd><kbd>↓</kbd> scegli</span><span><kbd>↵</kbd> apri</span><span><kbd>⌘K</kbd> apri e chiudi</span></div></div>';
d.body.appendChild(P);
var inp=P.querySelector('input'),ul=P.querySelector('ul'),hits=[],sel=0,back=null;
var nf=function(s){return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()};
var IT=ORD.map(function(s){var a=A2[s];return{t:sn(s),s:a[2].length>1?a[1]:'',k:'Sezione',go:function(){location.hash=s}}})
 .concat(ALL.map(function(b){return{t:b.nome,s:b.id===ME?'la nostra scheda':'dossier',k:'Azienda',go:function(){ST.dz=b.id;if(location.hash==='#dossier')show();else location.hash='dossier'}}}));
function fill(){var q=nf(inp.value.trim());
 hits=q?IT.filter(function(x){return nf(x.t+' '+x.s).indexOf(q)>-1}).sort(function(a,b){return(nf(b.t).indexOf(q)===0)-(nf(a.t).indexOf(q)===0)}):IT;
 hits=hits.slice(0,60);if(sel>=hits.length)sel=0;
 ul.innerHTML=hits.length?hits.map(function(x,i){return '<li role="option" id="v2p'+i+'" data-i="'+i+'"'+(i===sel?' aria-selected="true"':'')+'><span class="pl-k">'+x.k+'</span><b>'+e(x.t)+'</b><small>'+e(x.s)+'</small></li>'}).join(''):'<li class="pl-0">Nessuna sezione o azienda con «'+e(inp.value.trim())+'»</li>';
 inp.setAttribute('aria-activedescendant',hits.length?'v2p'+sel:'')}
function mark(){[].forEach.call(ul.children,function(li,i){if(i===sel)li.setAttribute('aria-selected','true');else li.removeAttribute('aria-selected')});var c=ul.children[sel];if(c)c.scrollIntoView({block:'nearest'});inp.setAttribute('aria-activedescendant','v2p'+sel)}
function pal(){back=d.activeElement;P.hidden=false;inp.value='';sel=0;fill();inp.focus();root.classList.remove('v2open')}
function close(){P.hidden=true;if(back&&back.focus)back.focus()}
function pick(i){var x=hits[i];if(!x)return;P.hidden=true;x.go()}
inp.addEventListener('input',function(){sel=0;fill()});
P.addEventListener('keydown',function(ev){
 if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();if(hits.length){sel=(sel+(ev.key==='ArrowDown'?1:-1)+hits.length)%hits.length;mark()}}
 else if(ev.key==='Enter'){ev.preventDefault();pick(sel)}
 else if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();close()}
 else if(ev.key==='Tab')ev.preventDefault()});
ul.addEventListener('click',function(ev){var li=ev.target.closest('[data-i]');if(li)pick(+li.dataset.i)});
ul.addEventListener('mousemove',function(ev){var li=ev.target.closest('[data-i]');if(li&&+li.dataset.i!==sel){sel=+li.dataset.i;mark()}});
P.addEventListener('mousedown',function(ev){if(ev.target===P)close()});
addEventListener('keydown',function(ev){
 var t=ev.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
 if((ev.metaKey||ev.ctrlKey)&&!ev.altKey&&ev.key&&ev.key.toLowerCase()==='k'){ev.preventDefault();ev.stopPropagation();P.hidden?pal():close()}
 else if(ev.key==='/'&&!typing&&P.hidden&&root.classList.contains('v2in')){ev.preventDefault();ev.stopPropagation();pal()}
 else if(ev.key==='Escape'&&root.classList.contains('v2open'))root.classList.remove('v2open')
 else if(ev.key==='['&&!typing&&!ev.metaKey&&!ev.ctrlKey&&P.hidden&&innerWidth>1100&&root.classList.contains('v2in')){ev.preventDefault();mini(!root.classList.contains('v2mini'))}},true);
})();
