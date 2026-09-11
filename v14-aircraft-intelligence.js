(()=>{
'use strict';
if(document.getElementById('jtsAiInspector'))return;

const style=document.createElement('style');
style.id='jtsAiStyles';
style.textContent=`
#jtsAiInspector{position:fixed;right:18px;bottom:18px;width:min(440px,calc(100vw - 36px));background:rgba(0,10,0,.97);border:1px solid #1b661b;box-shadow:0 0 28px rgba(114,255,85,.18);z-index:60;display:none;color:#72ff55;font-family:"Courier New",monospace;box-sizing:border-box}
#jtsAiInspector.open{display:flex;flex-direction:column}
#jtsAiInspector *{box-sizing:border-box}
#jtsAiInspector .jtsAiHeader{display:flex;align-items:center;justify-content:space-between;padding:9px 11px;border-bottom:1px solid #1b661b;font-weight:900;flex:0 0 auto}
#jtsAiInspector .jtsAiActions{display:flex;gap:6px}
#jtsAiInspector button{font:inherit;color:#72ff55;background:#001000;border:1px solid #1b661b;padding:4px 8px;cursor:pointer;min-height:0;transform:none;box-shadow:none;text-shadow:none}
#jtsAiCollapse{display:none;white-space:nowrap}
#jtsAiInspector .jtsAiBody{padding:12px;overflow:auto;overscroll-behavior:contain}
#jtsAiInspector .jtsAiCall{font-size:25px;font-weight:900}
#jtsAiInspector .jtsAiRoute{font-size:18px;color:#62b8ff;margin:3px 0 11px}
#jtsAiInspector .jtsAiModel{font-size:17px;color:#c8ffc0;margin-bottom:10px}
#jtsAiInspector .jtsAiGrid{display:grid;grid-template-columns:125px 1fr;gap:5px 10px;font-size:13px}
#jtsAiInspector .jtsAiK{color:#4acb3d}
#jtsAiInspector .jtsAiV{color:#c8ffc0}
#jtsAiInspector .jtsAiAirport{margin-top:10px;padding-top:8px;border-top:1px solid #164d16;font-size:12px;line-height:1.45}
#jtsAiInspector .jtsAiPhoto{display:inline-block;margin-top:11px;color:#62b8ff;text-decoration:none;border:1px solid #164d16;padding:6px 8px}
#jtsAiInspector .jtsAiLoading{padding:18px}
#jtsAiInspector .jtsAiSummary{display:none}
@media(max-width:600px){
 #jtsAiInspector{left:0;right:0;bottom:0;width:auto;max-height:48dvh;border-left:0;border-right:0;border-bottom:0;box-shadow:0 -10px 30px rgba(0,0,0,.55)}
 #jtsAiInspector .jtsAiHeader{padding:8px 10px}
 #jtsAiInspector .jtsAiBody{padding:9px 11px 12px;max-height:calc(48dvh - 39px);font-size:12px}
 #jtsAiInspector .jtsAiCall{font-size:21px}
 #jtsAiInspector .jtsAiRoute{font-size:15px;margin:1px 0 4px}
 #jtsAiInspector .jtsAiModel{font-size:14px;margin-bottom:7px}
 #jtsAiInspector .jtsAiGrid{grid-template-columns:108px 1fr;gap:3px 7px;font-size:11px}
 #jtsAiInspector .jtsAiAirport{margin-top:7px;padding-top:6px;font-size:10px}
 #jtsAiInspector .jtsAiPhoto{position:sticky;bottom:0;background:#001000;margin-top:8px;padding:5px 7px}
 #jtsAiCollapse{display:inline-block}
 #jtsAiInspector .jtsAiSummary{display:none;padding:8px 11px 10px;line-height:1.35}
 #jtsAiInspector .jtsAiSummary .sCall{font-size:18px;font-weight:900}
 #jtsAiInspector .jtsAiSummary .sRoute{color:#62b8ff;font-size:13px}
 #jtsAiInspector .jtsAiSummary .sLine{color:#c8ffc0;font-size:12px;margin-top:2px}
 #jtsAiInspector.collapsed{max-height:none}
 #jtsAiInspector.collapsed .jtsAiBody{display:none}
 #jtsAiInspector.collapsed .jtsAiSummary{display:block}
 #jtsAiInspector.collapsed .jtsAiHeader{border-bottom:1px solid #164d16}
}
@media(orientation:landscape) and (max-height:500px){
 #jtsAiInspector{right:6px;left:auto;bottom:6px;width:min(330px,32vw);max-height:88dvh;border:1px solid #1b661b;box-shadow:0 0 22px rgba(0,0,0,.55)}
 #jtsAiInspector .jtsAiHeader{padding:6px 8px;font-size:11px}
 #jtsAiInspector .jtsAiBody{padding:7px 8px 9px;max-height:calc(88dvh - 34px);font-size:11px}
 #jtsAiInspector .jtsAiCall{font-size:18px}
 #jtsAiInspector .jtsAiRoute{font-size:13px;margin:1px 0 4px}
 #jtsAiInspector .jtsAiModel{font-size:12px;margin-bottom:6px}
 #jtsAiInspector .jtsAiGrid{grid-template-columns:96px 1fr;gap:2px 6px;font-size:9px}
 #jtsAiInspector .jtsAiAirport{margin-top:5px;padding-top:4px;font-size:9px;line-height:1.25}
 #jtsAiInspector .jtsAiPhoto{position:sticky;bottom:0;background:#001000;margin-top:5px;padding:4px 6px;font-size:9px}
 #jtsAiCollapse{display:inline-block;padding:3px 6px!important;font-size:10px!important}
 #jtsAiInspector .jtsAiSummary{display:none;padding:6px 8px 8px;line-height:1.25}
 #jtsAiInspector .jtsAiSummary .sCall{font-size:15px;font-weight:900}
 #jtsAiInspector .jtsAiSummary .sRoute{color:#62b8ff;font-size:11px}
 #jtsAiInspector .jtsAiSummary .sLine{color:#c8ffc0;font-size:10px;margin-top:2px}
 #jtsAiInspector.collapsed{max-height:none}
 #jtsAiInspector.collapsed .jtsAiBody{display:none}
 #jtsAiInspector.collapsed .jtsAiSummary{display:block}
 #jtsAiInspector.collapsed .jtsAiHeader{border-bottom:1px solid #164d16}
}
`;
document.head.appendChild(style);

const panel=document.createElement('section');
panel.id='jtsAiInspector';
panel.innerHTML=`<div class="jtsAiHeader"><span>AIRCRAFT INTELLIGENCE</span><span class="jtsAiActions"><button id="jtsAiCollapse" title="More info">+ INFO</button><button id="jtsAiClose" title="Close">X</button></span></div><div id="jtsAiSummary" class="jtsAiSummary"></div><div id="jtsAiBody" class="jtsAiBody"></div>`;
document.body.appendChild(panel);

const aiBody=document.getElementById('jtsAiBody');
const summary=document.getElementById('jtsAiSummary');
const collapse=document.getElementById('jtsAiCollapse');
const close=document.getElementById('jtsAiClose');
const scope=document.getElementById('scope');
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const V=v=>String(v||'').trim()||'---';
const compact=()=>matchMedia('(max-width:600px), (orientation:landscape) and (max-height:500px)').matches;
const isFR=()=>!!document.getElementById('langFR')?.classList.contains('active');

function setCollapsed(on){
 const fr=isFR();
 panel.classList.toggle('collapsed',on);
 collapse.textContent=on?(fr?"+ D'INFOS":'+ INFO'):(fr?'− RÉDUIRE':'− LESS');
 collapse.title=on?(fr?"Plus d'infos":'More info'):(fr?'Réduire':'Show less');
 close.title=fr?'Fermer':'Close';
}

async function showAircraft(tr){
 const a=tr.air||{},call=V(a.flight||a.hex),reg=V(a.r||a.reg||a.registration),hex=V(a.hex);
 panel.classList.add('open');
 setCollapsed(compact());
 summary.innerHTML=`<div class="sCall">${esc(call)}</div><div class="sLine">IDENTIFICATION EN COURS...</div>`;
 aiBody.innerHTML=`<div class="jtsAiCall">${esc(call)}</div><div class="jtsAiLoading">QUERYING AIRCRAFT DATABASE...</div>`;
 let d={};
 try{
  const r=await fetch(`/api/aircraft-info?hex=${encodeURIComponent(hex)}&reg=${encodeURIComponent(reg==='---'?'':reg)}&callsign=${encodeURIComponent(call==='---'?'':call)}`);
  if(r.ok)d=await r.json();
 }catch(e){}
 const rt=d.route||{},o=rt.origin||{},z=rt.destination||{};
 const route=(o.iata||o.icao)&&(z.iata||z.icao)?`${o.iata||o.icao} > ${z.iata||z.icao}`:V(a.route||'ROUTE UNKNOWN');
 const model=[d.manufacturer,d.type].filter(Boolean).join(' ')||V(a.t);
 const owner=V(d.registered_owner),airline=V(rt.airline);
 const duplicateOwner=owner!=='---'&&airline!=='---'&&owner.toUpperCase()===airline.toUpperCase();
 const displayOperator=airline!=='---'?airline:owner;
 const displayReg=V(d.registration||reg);
 summary.innerHTML=`<div class="sCall">${esc(call)}</div><div class="sRoute">${esc(route)}</div><div class="sLine">${esc(model)} · ${esc(displayReg)} · ${esc(displayOperator)}</div>`;
 aiBody.innerHTML=`<div class="jtsAiCall">${esc(call)}</div><div class="jtsAiRoute">${esc(route)}</div><div class="jtsAiModel">${esc(model)}</div><div class="jtsAiGrid"><div class="jtsAiK">REGISTRATION</div><div class="jtsAiV">${esc(displayReg)}</div><div class="jtsAiK">ICAO TYPE</div><div class="jtsAiV">${esc(V(d.icao_type||a.t))}</div><div class="jtsAiK">${duplicateOwner?'OPERATOR':'OWNER'}</div><div class="jtsAiV">${esc(owner)}</div>${duplicateOwner?'':`<div class="jtsAiK">OWNER COUNTRY</div><div class="jtsAiV">${esc(V(d.registered_owner_country_name))}</div><div class="jtsAiK">AIRLINE</div><div class="jtsAiV">${esc(airline)}</div>`}<div class="jtsAiK">AIRLINE ICAO</div><div class="jtsAiV">${esc(V(rt.airline_icao))}</div><div class="jtsAiK">HEX</div><div class="jtsAiV">${esc(hex)}</div></div>${o.name?`<div class="jtsAiAirport"><b>FROM</b> ${esc(V(o.iata||o.icao))} · ${esc(o.name)}<br>${esc(V(o.municipality))} · ${esc(V(o.country))}</div>`:''}${z.name?`<div class="jtsAiAirport"><b>TO</b> ${esc(V(z.iata||z.icao))} · ${esc(z.name)}<br>${esc(V(z.municipality))} · ${esc(V(z.country))}</div>`:''}${d.url_photo_search?`<a class="jtsAiPhoto" href="${esc(d.url_photo_search)}" target="_blank" rel="noopener">PHOTO SEARCH · ${esc(displayReg)} ↗</a>`:''}`;
}

function getGlobal(name){try{return window.eval(name)}catch(e){return null}}
function onScopePointerUp(e){
 const mode=getGlobal('displayMode');
 if(mode!=='radar'&&mode!=='radarwx')return;
 const hits=getGlobal('classicHit'),map=getGlobal('tracks');
 if(!Array.isArray(hits)||!map)return;
 const r=scope.getBoundingClientRect(),x=(e.clientX-r.left)*scope.width/r.width,y=(e.clientY-r.top)*scope.height/r.height,cx=scope.width/2,cy=scope.height/2;
 let best=null,bd=Infinity;
 for(const h of hits){const q=(x-(cx+h.px))**2+(y-(cy+h.py))**2;if(q<bd){bd=q;best=h}}
 if(!best||bd>(34*(devicePixelRatio||1))**2)return;
 const tr=map.get(best.id);
 if(tr)showAircraft(tr);
}

if(scope)scope.addEventListener('pointerup',onScopePointerUp,true);
for(const id of ['langFR','langEN'])document.getElementById(id)?.addEventListener('click',()=>setTimeout(()=>setCollapsed(panel.classList.contains('collapsed')),0));
close.onclick=()=>panel.classList.remove('open');
collapse.onclick=()=>setCollapsed(!panel.classList.contains('collapsed'));
addEventListener('resize',()=>{if(panel.classList.contains('open')&&compact())setCollapsed(true)});

// Branch-only visible version marker. Core V1.3H rendering remains untouched.
const sub=document.querySelector('.sub');
if(sub)sub.textContent=sub.textContent.replace('V1.3H','V1.4');
const tech=[...document.querySelectorAll('.headtech span')].find(s=>/VERSION|version/i.test(s.textContent));
if(tech){const b=tech.querySelector('b');if(b)b.textContent='V1.4'}
})();
