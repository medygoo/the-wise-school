#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
//  UNE SEULE FEUILLE DE STYLE
// ═══════════════════════════════════════════════════════════════════════════
//
//  Loms : « le site est lent à l'ouverture. »
//
//  Mesuré sur une connexion mobile lente — 400 kb/s, 400 ms de latence,
//  processeur divisé par quatre — l'accueil chargeait ainsi :
//
//    site.css        811 ms → 2921
//    site.js        1752 ms → 5001
//    premium.css    5061 ms → 6788     ← elles ATTENDENT site.js
//    …les cinq autres, toutes à 5061-5077 ms
//    photo du héros 5193 ms → 12769
//
//  `site.js` INJECTAIT les six autres feuilles. En `defer`, il ne s'exécute
//  qu'après l'analyse du document : le navigateur ne pouvait pas les
//  découvrir avant. Quatre secondes à ne rien faire.
//
//  Les déclarer dans le HTML les a fait partir à 472 ms — mais sept requêtes
//  bloquantes en parallèle se disputent alors la même bande passante, et le
//  premier affichage a RECULÉ de 3636 à 5204 ms. Le gain d'un côté était
//  perdu de l'autre.
//
//  Sur un lien à 400 ms de latence, ce qui coûte n'est pas le poids : ce sont
//  les allers-retours. Une seule feuille, un seul aller-retour.
//
//  L'ordre est celui d'origine — une règle qui gagnait par sa position doit
//  continuer de gagner.
//
//  `--verifier` échoue si `tout.css` ne correspond plus à ses sources. Un
//  fichier assemblé qu'on oublie de reconstruire est pire que pas de fichier
//  assemblé du tout : il fige une ancienne version sans le dire.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');
const VERIFIER = process.argv.includes('--verifier');

// `site.css` reste SEULE à bloquer l'affichage : c'est la typographie, la
// grille et l'en-tête — sans elle, la page s'affiche nue puis saute.
// Les six autres portent le décor, les animations et des pages précises.
// Elles sont assemblées à part et chargées SANS bloquer : mesuré, les
// mettre toutes en bloquant repoussait le premier affichage de 3636 à
// 7460 ms sur une connexion lente. Le poids ne se voit pas ; l'attente si.
const SOURCES = [
  'premium.css', 'premium-layout.css',
  'app-link.css', 'equipe.css', 'experience-2026.css', 'vivant.css',
];
const CIBLE = join(RACINE, 'assets', 'complement.css');

const morceaux = [];
let octets = 0;
for (const nom of SOURCES) {
  const chemin = join(RACINE, 'assets', nom);
  if (!existsSync(chemin)) {
    console.error(`✗ ${nom} est introuvable. L'assemblage produirait une feuille amputée.`);
    process.exit(2);
  }
  const contenu = readFileSync(chemin, 'utf8');
  octets += Buffer.byteLength(contenu);
  morceaux.push(`/* ═══ ${nom} ═══════════════════════════════════════════ */\n${contenu}`);
}

const ENTETE = `/* ASSEMBLÉ — ne pas modifier ce fichier.
   Il est produit par outils/assembler-css.mjs à partir de :
     ${SOURCES.join('\n     ')}
   Modifiez la source, puis : npm run css
   Une seule feuille = un seul aller-retour. Sur un lien à 400 ms de
   latence, ce sont les allers-retours qui coûtent, pas le poids. */\n\n`;

const assemble = ENTETE + morceaux.join('\n\n');

console.log('\n═══ UNE SEULE FEUILLE DE STYLE ═══\n');
console.log(`   ${SOURCES.length} sources · ${Math.round(octets / 1024)} Ko\n`);

if (VERIFIER) {
  if (!existsSync(CIBLE)) {
    console.error('✗ assets/complement.css est absent. Lancez : npm run css\n');
    process.exit(1);
  }
  const actuel = readFileSync(CIBLE, 'utf8');
  if (actuel !== assemble) {
    console.error('✗ assets/complement.css ne correspond plus à ses sources.');
    console.error('  Une feuille a été modifiée sans reconstruire l\'assemblage :');
    console.error('  le site publierait l\'ANCIENNE version sans le dire.');
    console.error('  Lancez : npm run css\n');
    process.exit(1);
  }
  console.log('✓ assets/complement.css est à jour.\n');
  process.exit(0);
}

writeFileSync(CIBLE, assemble);
console.log(`✓ assets/complement.css écrite — ${Math.round(Buffer.byteLength(assemble) / 1024)} Ko, une seule requête.\n`);
