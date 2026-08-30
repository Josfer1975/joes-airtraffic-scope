function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
export default async()=>{try{const r=await fetch('https://api.rainviewer.com/public/weather-maps.json');const m=await r.json(),f=m?.radar?.past||[];return json({generated:m.generated,latest:f.at(-1)||null})}catch(e){return json({error:String(e)},502)}};
export const config={path:'/api/wx/meta'};
