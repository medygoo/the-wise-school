#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
//  LES IMAGES QUI SE CHARGENT ET NE MONTRENT RIEN
// ═══════════════════════════════════════════════════════════════════════════
//
//  Trois photographies de la galerie étaient VIDES — en ligne, avec une
//  pastille « NOUVEAU » par-dessus. Elles se décodaient sans la moindre
//  erreur : 900×506, 760×570, 1100×825, aucune requête en échec,
//  `naturalWidth` non nul. Des fichiers de gabarit jamais remplacés.
//
//  C'est le défaut le plus difficile à voir, parce que TOUT va bien : un
//  contrôle qui vérifie que « les images se chargent » les déclare bonnes.
//
//  ── UNE PREMIÈRE VERSION DE CET OUTIL A ÉTÉ JETÉE ─────────────────────
//
//  Elle mesurait les OCTETS PAR PIXEL, pour n'avoir aucune dépendance :
//  une image unie se compresse à presque rien, donc un fichier trop léger
//  devait être vide. Sur les 101 images du site, elle en a condamné SEIZE
//  — dont deux photographies que je venais moi-même de préparer et que je
//  savais bonnes. Le poids d'un fichier ne dit pas ce qu'il montre : une
//  photo peu contrastée descend aussi bas qu'une image vide.
//
//  Un outil qui se trompe seize fois sur cent n'aide personne : on cesse
//  de le lire, et le jour où il a raison on ne l'écoute plus. Il fallait
//  mesurer ce qu'on cherche vraiment — LES PIXELS — quitte à demander un
//  navigateur pour le faire.
//
//  ── CE QU'IL MESURE ───────────────────────────────────────────────────
//
//  Chaque image est réduite à 48×48 et l'on regarde l'écart entre son
//  pixel le plus clair et le plus sombre. Zéro écart = une surface unie :
//  il n'y a rien à voir.
//
//  Ce qu'il NE SAIT PAS vérifier, et qu'il dit plutôt que de se taire :
//    · une photographie légitimement unie — un mur, un ciel — serait
//      signalée. Il n'y en a aucune ici ; si l'école en dépose une, on
//      l'inscrit dans `TOLERE` plutôt que baisser le seuil pour tous ;
//    · une image du bon contenu mais du MAUVAIS SUJET. Aucun outil ne
//      sait cela — c'est l'école qui regarde.
//
//  Éprouvé dans les deux sens : `--preuve` fabrique une image unie et
//  l'outil doit la REFUSER.
//
//  Usage : npm install  (une fois)   puis   node outils/images-vides.mjs
// ═══════════════════════════════════════════════════════════════════════════

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, extname } from 'node:path';
import { createServer } from 'node:http';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PREUVE = process.argv.includes('--preuve');
const SEUIL = 8;              // écart clair/sombre en dessous duquel c'est uni
const TOLERE = new Set([]);   // les images légitimement unies

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  // Un contrôle qu'on ne peut pas exécuter ne doit JAMAIS passer en
  // silence : un « ✓ » posé sur un angle mort est le pire des mensonges.
  console.error("✗ `playwright` est absent — impossible de LIRE les pixels.");
  console.error('  Lancez `npm install` à la racine du site, puis relancez.');
  console.error("  Rien n'est vérifié tant que ce n'est pas fait.");
  process.exit(2);
}

const fichiers = [];
(function parcourir(d) {
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    if (statSync(f).isDirectory()) { parcourir(f); continue; }
    if (/\.(webp|png|jpe?g|avif)$/i.test(extname(f))) fichiers.push(relative(RACINE, f));
  }
})(join(RACINE, 'img'));

// On sert le dossier : `file://` interdit la lecture des pixels d'une image
// (canevas « souillé »), et c'est exactement ce qu'on veut lire.
const serveur = createServer((req, res) => {
  // On LIT d'abord, on répond ensuite : écrire l'en-tête puis échouer à la
  // lecture laissait la réponse à moitié partie, et le serveur tombait
  // en `ERR_HTTP_HEADERS_SENT` au lieu de rendre un 404.
  let corps = null;
  try {
    const chemin = join(RACINE, decodeURIComponent(req.url.split('?')[0]));
    if (!chemin.startsWith(RACINE)) { res.writeHead(403); res.end(); return; }
    corps = readFileSync(chemin);
  } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200); res.end(corps);
});
await new Promise(ok => serveur.listen(0, '127.0.0.1', ok));
const port = serveur.address().port;

const nav = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
});
const page = await (await nav.newContext()).newPage();
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'commit' }).catch(() => {});

// La preuve : une image RÉELLEMENT unie, fabriquée ici.
const UNIE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
  '<rect width="200" height="200" fill="#e8ecef"/></svg>');
const lot = PREUVE ? [['(fabriquée) surface unie', UNIE]]
                   : fichiers.map(f => [f, '/' + f.split('\\').join('/')]);

const mesures = await page.evaluate(async (lot) => {
  const out = [];
  for (const [nom, url] of lot) {
    const im = new Image();
    await new Promise(ok => { im.onload = ok; im.onerror = ok; im.src = url; });
    if (!im.naturalWidth) { out.push([nom, { erreur: true }]); continue; }
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0, 48, 48);
    const d = x.getImageData(0, 0, 48, 48).data;
    let min = 255, max = 0, alphaMax = 0;
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] + d[i + 1] + d[i + 2]) / 3;
      if (g < min) min = g;
      if (g > max) max = g;
      if (d[i + 3] > alphaMax) alphaMax = d[i + 3];
    }
    out.push([nom, { w: im.naturalWidth, h: im.naturalHeight,
                     etendue: Math.round(max - min), alphaMax }]);
  }
  return out;
}, lot);

await nav.close();
serveur.close();

console.log('═══ LES IMAGES QUI NE MONTRENT RIEN ═══\n');
let mauvaises = 0;
for (const [nom, m] of mesures) {
  if (m.erreur) { console.log(`   ✗ ${nom} — ne se décode pas`); mauvaises++; continue; }
  if (TOLERE.has(nom)) continue;
  if (m.etendue < SEUIL || m.alphaMax === 0) {
    mauvaises++;
    console.log(`   ✗ ${nom.padEnd(40)} ${m.w}×${m.h}  écart ${m.etendue}` +
                (m.alphaMax === 0 ? ' · entièrement transparente' : ' · surface unie'));
  }
}
console.log(`\n${mesures.length} image(s) mesurée(s), seuil d'écart ${SEUIL}.`);

if (PREUVE) {
  console.log(mauvaises
    ? '✓ PREUVE — une surface unie est REFUSÉE.'
    : "✗ PREUVE MANQUÉE — l'outil accepte une surface unie : il ne vérifie rien.");
  process.exit(mauvaises ? 0 : 1);
}
console.log(mauvaises
  ? `✗ ${mauvaises} image(s) se chargent sans rien montrer.`
  : '✓ Chacune porte une vraie image — aucune surface vide.');
process.exit(mauvaises ? 1 : 0);
