JOE'S TRAFFIC SCOPE — JTS-01 V1.1 WEB / MOBILE

OBJECTIF
Cette version conserve l'interface JTS V1.0 et remplace le serveur Python local par des fonctions Netlify.
Les routes /api/traffic, /api/wx/meta et /api/wx/tile restent identiques pour ne pas modifier le moteur visuel.

DEPLOIEMENT GITHUB + NETLIFY
1. Crée un nouveau dépôt GitHub, par exemple joes-traffic-scope-web.
2. Dépose TOUT le contenu de ce dossier à la racine du dépôt (index.html, netlify.toml, manifest.webmanifest, sw.js et le dossier netlify).
3. Dans Netlify : Add new project > Import an existing project > GitHub.
4. Sélectionne le dépôt.
5. Aucun Build command n'est nécessaire. Publish directory : .
6. Deploy.
7. Ouvre l'URL HTTPS fournie par Netlify.

SMARTPHONE
- Ouvre l'URL HTTPS dans Safari/Chrome.
- HOME / GPS peut utiliser la géolocalisation du téléphone après autorisation.
- iPhone : Partager > Sur l'écran d'accueil.
- Android : menu navigateur > Installer/Ajouter à l'écran d'accueil.

IMPORTANT
- La V1.0 EXE reste la version Windows de référence et n'est pas modifiée.
- Les API publiques ADSB.lol, OpenSky et RainViewer peuvent appliquer leurs propres limites ou changer leurs conditions d'accès.
- Les fonctions Netlify servent de relais même domaine, ce qui évite de dépendre du CORS des API côté navigateur.
