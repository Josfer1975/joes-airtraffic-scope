const CACHE='jts-shell-v13h-r2';
const SHELL=['/','/index.html','/manifest.webmanifest','/jts-r2-fix.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/api/'))return;
  if(u.pathname==='/'||u.pathname==='/index.html'){
    e.respondWith(fetch(e.request).then(async r=>{let t=await r.text();if(!t.includes('/jts-r2-fix.js'))t=t.replace('</body>','<script src="/jts-r2-fix.js?v=2"></script></body>');return new Response(t,{status:r.status,statusText:r.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}})}).catch(()=>caches.match('/index.html')));return;
  }
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))
});
