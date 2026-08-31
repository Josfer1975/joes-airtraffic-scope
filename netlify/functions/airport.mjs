let airportCache=null;
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function parseCSV(text){
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
    else if(c==='"')quoted=true; else if(c===','){row.push(field);field='';}
    else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';} else field+=c;
  }
  if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row)}
  return rows;
}
async function loadAirports(){
  if(airportCache)return airportCache;
  const r=await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv',{headers:{'user-agent':'JoesTrafficScope/1.3H','accept':'text/csv,*/*'}});
  if(!r.ok)throw new Error(`AIRPORT DATABASE HTTP ${r.status}`);
  const rows=parseCSV(await r.text()), head=rows.shift()||[], idx=Object.fromEntries(head.map((x,i)=>[x,i])), map=new Map();
  for(const a of rows){const ident=(a[idx.ident]||'').trim().toUpperCase(),gps=(a[idx.gps_code]||'').trim().toUpperCase(); if(ident.length===4)map.set(ident,a);if(gps.length===4)map.set(gps,a)}
  airportCache={map,idx}; return airportCache;
}
export default async(req)=>{try{const u=new URL(req.url),code=(u.searchParams.get('icao')||'').trim().toUpperCase();if(!/^[A-Z0-9]{4}$/.test(code))return json({error:'4-CHAR ICAO REQUIRED'},400);const {map,idx}=await loadAirports(),a=map.get(code);if(!a)return json({error:'ICAO NOT FOUND'},404);return json({ident:code,name:a[idx.name]||code,municipality:a[idx.municipality]||'',latitude_deg:Number(a[idx.latitude_deg]),longitude_deg:Number(a[idx.longitude_deg]),iso_country:a[idx.iso_country]||'',iata_code:a[idx.iata_code]||''})}catch(e){return json({error:'AIRPORT DATABASE UNAVAILABLE',detail:String(e)},502)}};
export const config={path:'/api/airport'};
