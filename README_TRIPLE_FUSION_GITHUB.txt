JTS-01 V1.3H WEB — INJECTION GITHUB / FUSION
================================================

BASE
- Repart de la V1.3H Web GitHub/Netlify approuvée.
- index.html, manifest.webmanifest, sw.js et netlify.toml sont inchangés.
- Seul netlify/functions/traffic.mjs est remplacé.

MOTEUR
- ADSB.lol + adsb.fi V3 interrogés en parallèle.
- OpenSky est intégré et normalisé, mais désactivé par défaut sur le déploiement public.
- Fusion/dédoublonnage par ICAO24.
- Une source en panne n'empêche pas les autres de répondre.
- Timeout par source : 7,5 s.
- Petit cache serveur/CDN : 10 s.

IMPORTANT — OPENSKY
Les conditions OpenSky actuellement publiées indiquent qu'une utilisation REST API
dans un produit/service live ou automatisé nécessite un accord écrit préalable.
La variable Netlify JTS_OPENSKY_ENABLED est donc FALSE par défaut.

Après autorisation OpenSky :
Netlify > Site configuration > Environment variables
JTS_OPENSKY_ENABLED = true
puis redeployer.

INJECTION GITHUB
Copier le contenu de ce dossier A LA RACINE du dépôt joes-airtraffic-scope,
en remplaçant les fichiers existants.
Le fichier réellement modifié est :
netlify/functions/traffic.mjs

Netlify redéploiera automatiquement après le commit.
