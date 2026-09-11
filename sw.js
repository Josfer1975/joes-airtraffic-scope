const CACHE='jts-shell-v14-aircraft-intelligence';
const SHELL=['/','/index.html','/manifest.webmanifest','/v14-aircraft-intelligence.js'];
const AI_SCRIPT='<script src="/v14-aircraft-intelligence.js?v=1"></script>';
function injectAI(text){return text.includes('/v14-aircraft-intelligence.js')?text:text.replace('</body>',AI_SCRIPT+'</body>')}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.pathname.startsWith('/api/'))return;
 if(e.request.mode==='navigate'||u.pathname==='/'||u.pathname==='/index.html'){
  e.respondWith(fetch(e.request).then(async r=>{
   if(!r.ok)return r;
   const text=injectAI(await r.text());
   const h=new Headers(r.headers);h.set('content-type','text/html; charset=utf-8');
   const out=new Response(text,{status:r.status,statusText:r.statusText,headers:h});
   caches.open(CACHE).then(c=>c.put(e.request,out.clone()));
   return out;
  }).catch(async()=>{
   const r=await caches.match(e.request);if(!r)return r;
   const text=injectAI(await r.text());
   const h=new Headers(r.headers);h.set('content-type','text/html; charset=utf-8');
   return new Response(text,{status:r.status,statusText:r.statusText,headers:h});
  }));
  return;
 }
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
