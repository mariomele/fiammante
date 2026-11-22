// node brand/og.js (dopo node render.js) → brand/og.png 1200x630: marchio, numeri veri dai dati e due schermate vere (Regia e Standing).
const fs=require('fs'),os=require('os'),path=require('path'),{execFileSync}=require('child_process');
const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',ROOT=path.join(__dirname,'..'),J=f=>{try{return JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'))}catch(e){return null}};
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'og-')),shot=(h,f,w,hh)=>execFileSync(CH,['--headless=new','--disable-gpu','--user-data-dir='+prof,'--hide-scrollbars','--virtual-time-budget=8000','--window-size='+w+','+hh,'--screenshot='+f,'file://'+path.join(ROOT,'index.html')+h],{stdio:'ignore'});
const A=path.join(prof,'a.png'),B=path.join(prof,'b.png');shot('',A,1440,1100);shot('#standing',B,1440,900);
const M=J('data/meta.json'),az=(a=>Array.isArray(a)?a:(a||{}).aziende||[])(J("data/aziende.json")),nw=(J('news.json')||{}).items||J('news.json')||[],os_=(J('data/osint.json')||{}).items||[],po=J('data/posts.json');
const np=po?Object.values(po.az||po).reduce((s,a)=>s+Object.values(a||{}).reduce((t,c)=>t+((c&&c.p)||[]).length,0),0):0;
const st=[[az.length,'aziende a confronto'],[os_.length,'segnali OSINT'],[np,'post analizzati'],[Array.isArray(nw)?nw.length:0,'notizie, ogni 2 ore']].filter(x=>x[0]);
const C=M.colore||'#d60723',ico=fs.readFileSync(path.join(__dirname,'icon.svg'),'utf8'),logo=M.logo?'data:image/png;base64,'+fs.readFileSync(path.join(ROOT,M.logo)).toString('base64'):'';
const html=`<!doctype html><meta charset=utf-8><style>
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;overflow:hidden;background:#07090d;color:#eef1f5;font-family:-apple-system,"SF Pro Display",system-ui,sans-serif;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(520px 420px at 170px 210px,${C}33,transparent 70%),radial-gradient(700px 500px at 1050px 640px,${C}22,transparent 70%),linear-gradient(rgba(160,170,190,.045) 1px,transparent 1px) 0 0/30px 30px,linear-gradient(90deg,rgba(160,170,190,.045) 1px,transparent 1px) 0 0/30px 30px}
.top{position:absolute;left:56px;top:54px;display:flex;align-items:center;gap:22px}.top svg{width:104px;height:104px;filter:drop-shadow(0 18px 34px ${C}55)}
.pl{background:#fff;border-radius:12px;padding:12px 16px;box-shadow:0 14px 34px rgba(0,0,0,.5)}.pl img{height:46px;display:block}
h1{position:absolute;left:56px;top:196px;font-size:76px;line-height:.95;font-weight:800;letter-spacing:-.02em}h1 em{display:block;font-style:normal;font:600 24px ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.42em;color:${C};margin-top:16px}
.tag{position:absolute;left:56px;top:345px;width:430px;font-size:25px;line-height:1.28;font-weight:600;color:#c9d0da}
.st{position:absolute;left:56px;top:448px;width:440px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.st div{border:1px solid #232a35;background:rgba(18,22,30,.8);border-radius:10px;padding:10px 14px}.st b{display:block;font-size:30px;line-height:1;font-weight:800}.st span{font-size:13px;color:#8b95a5}
.win{position:absolute;background:#0b0f14;border:1px solid #2a3240;border-radius:12px;overflow:hidden;box-shadow:0 34px 90px rgba(0,0,0,.75)}
.wb{height:26px;display:flex;align-items:center;gap:6px;padding:0 11px;background:#111721;border-bottom:1px solid #1e2632}.wb i{width:8px;height:8px;border-radius:50%;background:#2a3442}.wb i:first-child{background:${C}}
.wb span{margin:0 auto;font:10px ui-monospace,Menlo,monospace;letter-spacing:.08em;color:#7d8899}
.a{left:540px;top:34px;width:620px;transform:perspective(1600px) rotateY(-9deg);transform-origin:left center}.a .sh{height:420px;background:url("file://${A}") 0 -64px/620px auto no-repeat}
.b{left:690px;top:330px;width:470px;border-color:${C}88;box-shadow:0 34px 90px rgba(0,0,0,.8),0 0 0 1px ${C}44}.b .sh{height:250px;background:url("file://${B}") -6px -64px/560px auto no-repeat}
.bd{position:absolute;left:690px;top:300px;font:700 12px ui-monospace,Menlo,monospace;letter-spacing:.16em;color:#fff;background:${C};padding:5px 10px;border-radius:6px;z-index:2}
</style><div class="bg"></div>
<div class="top">${ico}${logo?`<div class="pl"><img src="${logo}"></div>`:''}</div>
<h1>${(M.nome||'').replace(/ Intelligence$/,'')}<em>INTELLIGENCE</em></h1>
<p class="tag">Concorrenti, marchio e mercato del pomodoro in un'unica dashboard.</p>
<div class="st">${st.map(x=>`<div><b>${x[0].toLocaleString('it-IT')}</b><span>${x[1]}</span></div>`).join('')}</div>
<div class="win a"><div class="wb"><i></i><i></i><i></i><span>REGIA</span></div><div class="sh"></div></div>
<div class="bd">STANDING DEL MARCHIO</div><div class="win b"><div class="wb"><i></i><i></i><i></i><span>STANDING</span></div><div class="sh"></div></div>`;
const H=path.join(prof,'og.html');fs.writeFileSync(H,html);
execFileSync(CH,['--headless=new','--disable-gpu','--user-data-dir='+prof,'--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=3000','--window-size=1200,630','--screenshot='+path.join(__dirname,'og.png'),'file://'+H],{stdio:'ignore'});
fs.rmSync(prof,{recursive:true,force:true});console.log('brand/og.png ok',st.map(x=>x.join(' ')).join(' · '));
