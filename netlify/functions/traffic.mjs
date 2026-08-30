function json(data, status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
export default async (req) => {
  try {
    const u=new URL(req.url), lat=Number(u.searchParams.get('lat')), lon=Number(u.searchParams.get('lon'));
    const radius=Math.max(1,Math.min(Number(u.searchParams.get('radius')||20),250));
    if(!Number.isFinite(lat)||!Number.isFinite(lon)) return json({error:'invalid lat/lon'},400);
    let primary='';
    try{
      const r=await fetch(`https://api.adsb.lol/v2/point/${lat.toFixed(5)}/${lon.toFixed(5)}/${radius.toFixed(1)}`,{headers:{'user-agent':'JoesTrafficScope/1.1','accept':'application/json'}});
      const d=await r.json(), ac=Array.isArray(d?.ac)?d.ac:[];
      if(r.ok && ac.length){d._jts_diag={source:'ADSB.LOL',http:r.status,ac_count:ac.length}; return json(d)}
      primary=`ADSB.LOL HTTP ${r.status}, ${ac.length} aircraft`;
    }catch(e){primary=String(e)}
    const dlat=radius/60, coslat=Math.max(.15,Math.cos(lat*Math.PI/180)), dlon=radius/(60*coslat);
    const os=`https://opensky-network.org/api/states/all?lamin=${Math.max(-90,lat-dlat).toFixed(5)}&lomin=${Math.max(-180,lon-dlon).toFixed(5)}&lamax=${Math.min(90,lat+dlat).toFixed(5)}&lomax=${Math.min(180,lon+dlon).toFixed(5)}`;
    const r=await fetch(os,{headers:{'user-agent':'JoesTrafficScope/1.1','accept':'application/json'}}), d=await r.json(), states=d.states||[], ac=[];
    for(const s of states){if(!Array.isArray(s)||s.length<17||s[5]==null||s[6]==null)continue; const dy=(s[6]-lat)*60,dx=(s[5]-lon)*60*coslat,dist=Math.hypot(dx,dy);if(dist>radius)continue;ac.push({hex:s[0],flight:(s[1]||'').trim(),lat:s[6],lon:s[5],alt_baro:s[8]?'ground':(s[7]!=null?Math.round(s[7]*3.28084):null),alt_geom:s[13]!=null?Math.round(s[13]*3.28084):null,gs:s[9]!=null?Math.round(s[9]*1.94384*10)/10:null,track:s[10],squawk:s[14]??null,_source:'opensky'})}
    return json({now:Number(d.time||0),ac,_jts_diag:{source:'OPENSKY',http:r.status,ac_count:ac.length,primary}})
  } catch(e){return json({error:String(e)},502)}
}
export const config={path:'/api/traffic'};
