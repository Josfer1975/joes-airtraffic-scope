const UA = {'user-agent':'JoesTrafficScope/1.3H','accept':'application/json'};
const TIMEOUT_MS = 7500;
const memCache = new Map();
const routeCache = new Map();
const ROUTE_TTL_MS=3*60*60*1000;

function clean(v,max=24){return String(v||'').trim().toUpperCase().replace(/[^A-Z0-9+.-]/g,'').slice(0,max)}
function airportDisplay(x){if(!x||typeof x!=='object')return '';return String(x.iata_code||x.icao_code||'').trim().toUpperCase()}
async function enrichOne(a){
  const callsign=clean(a.flight||a.r||''), hex=clean(a.hex||'',12);
  if(!callsign)return a;
  const key=callsign; const hit=routeCache.get(key);
  if(hit&&Date.now()-hit.t<ROUTE_TTL_MS)return {...a,...hit.data};
  let data={};
  try{
    const r=await fetchJson(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`);
    const root=r.data?.response||{}, fr=root.flightroute||null;
    const origin=airportDisplay(fr?.origin), destination=airportDisplay(fr?.destination);
    if(origin)data.origin=origin;if(destination)data.destination=destination;
    if(origin&&destination)data.route=`${origin} → ${destination}`;
    if(fr?.airline?.name)data.airline=String(fr.airline.name);
  }catch{}
  routeCache.set(key,{t:Date.now(),data});
  if(routeCache.size>1000)routeCache.delete(routeCache.keys().next().value);
  return {...a,...data};
}
async function enrichAircraft(ac){
  const out=[];
  for(let i=0;i<ac.length;i+=4){out.push(...await Promise.all(ac.slice(i,i+4).map(enrichOne)))}
  return out;
}

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      'content-type':'application/json; charset=utf-8',
      'cache-control':'no-store',
      'netlify-cdn-cache-control':'public, durable, s-maxage=10, stale-while-revalidate=5'
    }
  });
}
async function fetchJson(url){
  const c=new AbortController(), t=setTimeout(()=>c.abort(),TIMEOUT_MS);
  try{
    const r=await fetch(url,{headers:UA,signal:c.signal});
    const text=await r.text();
    let d={};
    try{ d=text?JSON.parse(text):{} }catch{ throw new Error(`HTTP ${r.status} invalid JSON`) }
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return {data:d,status:r.status};
  }finally{ clearTimeout(t) }
}
function keyOf(a){ return String(a?.hex||'').toLowerCase().replace(/^~/,'').trim() }
function addSource(merged,order,items,name){
  for(const a of items||[]){
    const k=keyOf(a); if(!k) continue;
    if(!merged.has(k)){
      merged.set(k,{...a,_jts_sources:[name]}); order.push(k);
    }else{
      const b=merged.get(k);
      if(!b._jts_sources.includes(name)) b._jts_sources.push(name);
      for(const [field,val] of Object.entries(a)){
        if(field==='hex') continue;
        if((b[field]===null||b[field]===undefined||b[field]==='') &&
           !(val===null||val===undefined||val==='')) b[field]=val;
      }
    }
  }
}
function normalizeOpenSky(d,lat,lon,radius){
  const ac=[], coslat=Math.max(.15,Math.cos(lat*Math.PI/180));
  for(const s of d?.states||[]){
    if(!Array.isArray(s)||s.length<17||s[5]==null||s[6]==null) continue;
    const dy=(s[6]-lat)*60, dx=(s[5]-lon)*60*coslat;
    if(Math.hypot(dx,dy)>radius) continue;
    ac.push({
      hex:s[0], flight:(s[1]||'').trim(), lat:s[6], lon:s[5],
      alt_baro:s[8]?'ground':(s[7]!=null?Math.round(s[7]*3.28084):null),
      alt_geom:s[13]!=null?Math.round(s[13]*3.28084):null,
      gs:s[9]!=null?Math.round(s[9]*1.94384*10)/10:null,
      track:s[10],
      baro_rate:s[11]!=null?Math.round(s[11]*196.8504):null,
      squawk:s[14]??null
    });
  }
  return ac;
}

export default async (req) => {
  try{
    const u=new URL(req.url);
    const lat=Number(u.searchParams.get('lat')), lon=Number(u.searchParams.get('lon'));
    const radius=Math.max(1,Math.min(Number(u.searchParams.get('radius')||20),250));
    if(!Number.isFinite(lat)||!Number.isFinite(lon)) return json({error:'invalid lat/lon'},400);

    const cacheKey=`${lat.toFixed(5)}|${lon.toFixed(5)}|${radius.toFixed(1)}`;
    const cached=memCache.get(cacheKey);
    if(cached && Date.now()-cached.t<10000) return json(cached.data);

    const dlat=radius/60, coslat=Math.max(.15,Math.cos(lat*Math.PI/180)), dlon=radius/(60*coslat);
    const urls={
      lol:`https://api.adsb.lol/v2/point/${lat.toFixed(5)}/${lon.toFixed(5)}/${radius.toFixed(1)}`,
      fi:`https://opendata.adsb.fi/api/v3/lat/${lat.toFixed(5)}/lon/${lon.toFixed(5)}/dist/${radius.toFixed(1)}`,
      os:`https://opensky-network.org/api/states/all?lamin=${Math.max(-90,lat-dlat).toFixed(5)}&lomin=${Math.max(-180,lon-dlon).toFixed(5)}&lamax=${Math.min(90,lat+dlat).toFixed(5)}&lomax=${Math.min(180,lon+dlon).toFixed(5)}`
    };

    const openSkyEnabled=String(process.env.JTS_OPENSKY_ENABLED||'false').toLowerCase()==='true';

    const jobs=[
      fetchJson(urls.lol).then(x=>({name:'lol',...x})),
      fetchJson(urls.fi).then(x=>({name:'fi',...x}))
    ];
    if(openSkyEnabled) jobs.push(fetchJson(urls.os).then(x=>({name:'os',...x})));

    const settled=await Promise.allSettled(jobs);
    let lolAc=[], fiAc=[], osAc=[], statuses={}, errors={};
    for(const r of settled){
      if(r.status==='fulfilled'){
        const x=r.value; statuses[x.name]=x.status;
        if(x.name==='lol') lolAc=Array.isArray(x.data?.ac)?x.data.ac:[];
        if(x.name==='fi') fiAc=Array.isArray(x.data?.ac)?x.data.ac:[];
        if(x.name==='os') osAc=normalizeOpenSky(x.data,lat,lon,radius);
      }else{
        const msg=String(r.reason?.message||r.reason||'error');
        const idx=settled.indexOf(r);
        errors[idx===0?'lol':idx===1?'fi':'os']=msg;
      }
    }

    const merged=new Map(), order=[];
    addSource(merged,order,lolAc,'ADSB.LOL');
    addSource(merged,order,fiAc,'ADSB.FI');
    addSource(merged,order,osAc,'OPENSKY');

    const acRaw=order.map(k=>merged.get(k)).filter(a=>Number.isFinite(Number(a.lat))&&Number.isFinite(Number(a.lon)));
    const ac=await enrichAircraft(acRaw);
    if(!ac.length && Object.keys(errors).length===jobs.length){
      return json({error:'all traffic sources unavailable',_jts_diag:{errors}},502);
    }

    const payload={
      now:Date.now(),
      ac,
      _jts_diag:{
        source:openSkyEnabled?'TRIPLE FUSION + ROUTES':'DUAL FUSION + ROUTES',
        ac_count:ac.length,
        adsb_lol_count:lolAc.length,
        adsb_fi_count:fiAc.length,
        opensky_count:osAc.length,
        opensky_enabled:openSkyEnabled,
        statuses,
        errors
      }
    };
    memCache.set(cacheKey,{t:Date.now(),data:payload});
    if(memCache.size>100) memCache.delete(memCache.keys().next().value);
    return json(payload);
  }catch(e){
    return json({error:String(e?.message||e)},502);
  }
};

export const config={path:'/api/traffic'};
