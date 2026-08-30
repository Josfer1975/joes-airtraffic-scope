JOE'S TRAFFIC SCOPE // JTS-01 V1.2 WEB

WEB / MOBILE — NETLIFY

NOUVEAU V1.2
- 6 presets personnels configurables
- Edition du nom, latitude et longitude dans SETUP > MY PRESETS — EDIT
- Bouton GPS pour mémoriser la position courante dans un preset
- Sauvegarde locale dans le navigateur (localStorage) : chaque utilisateur conserve ses propres presets
- RESET PRESETS restaure : LFPG, EGLL, KJFK, KLAX, RJTT, YSSY
- Aucun compte ni base de données nécessaire

DEPLOIEMENT
Le dépôt GitHub est connecté à Netlify. Tout commit sur main déclenche automatiquement un nouveau déploiement.

Fichiers :
index.html
manifest.webmanifest
sw.js
netlify.toml
netlify/functions/traffic.mjs
netlify/functions/wx-meta.mjs
netlify/functions/wx-tile.mjs

Les routes /api/* sont gérées par les Netlify Functions.
