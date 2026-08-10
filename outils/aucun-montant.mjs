#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
//  AUCUN MONTANT SUR LE SITE PUBLIC
// ═══════════════════════════════════════════════════════════════════════════
//
//  Décision de Loms, 10 août 2026 : les frais scolaires restent à la
//  Direction. « Sauf les frais scolaires, qui doivent être gardés. »
//
//  Ce n'est pas une préférence de rédaction, c'est une règle : le site
//  expose désormais le contenu des billets de vacances — fournitures,
//  horaires, consignes — et ces billets PORTENT des montants. Minerval,
//  tranches, cantine, uniforme, jusqu'au paquet de papier hygiénique.
//  Chacun a dû être retiré à la main.
//
//  Une règle tenue à la main se perd à la première page ajoutée. Celle-ci se
//  vérifie : tout chiffre suivi de $, de FC, de USD ou d'« euros » est
//  refusé, où qu'il soit dans le site.
//
//  Ce qu'un site public affiche une fois, il ne le retire jamais des copies
//  d'écran déjà prises.
//
//  Éprouvé dans les deux sens : `--preuve` réinjecte « Minerval : 900 $ » et
//  l'outil DOIT refuser.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');
const PREUVE = process.argv.includes('--preuve');

// Un montant, c'est un nombre collé à une monnaie — dans un sens ou dans
// l'autre, avec ou sans espace, virgule ou point décimal.
const MOTIFS = [
  [/\d[\d  .,]*\s*(?:\$|USD|dollars?)/gi,        'dollars'],
  [/(?:\$|USD)\s*\d[\d  .,]*/gi,                 'dollars'],
  [/\d[\d  .,]*\s*(?:FC|francs?\s+congolais)/gi, 'francs congolais'],
  [/\d[\d  .,]*\s*(?:€|EUR|euros?)/gi,           'euros'],
];

// Ce que le contrôle ne doit PAS confondre avec un prix.
const INNOCENT = [
  /\d+\s*(?:pages?|ans?|élèves?|classes?|cm|ml|plis|couleurs?)/i,
];

const pages = readdirSync(RACINE).filter(f => f.endsWith('.html'));
if (!pages.length) {
  console.error('✗ Aucune page HTML trouvée — ce contrôle ne vérifierait rien.');
  process.exit(2);
}

const trouves = [];
for (const page of pages) {
  let texte = readFileSync(join(RACINE, page), 'utf8');
  // On ne lit que ce qui est VU : ni le code, ni les commentaires, ni les
  // adresses de fichiers. Un « h1.webp » n'est pas un prix.
  texte = texte
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  if (PREUVE && page === 'rentree.html') texte += ' Minerval : 900 $ payable en 3 tranches.';

  for (const [motif, monnaie] of MOTIFS) {
    for (const m of texte.matchAll(motif)) {
      const extrait = m[0].trim();
      if (INNOCENT.some(i => i.test(extrait))) continue;
      const autour = texte.slice(Math.max(0, m.index - 45), m.index + extrait.length + 45)
                          .replace(/\s+/g, ' ').trim();
      trouves.push({ page, extrait, monnaie, autour });
    }
  }
}

console.log('\n═══ AUCUN MONTANT SUR LE SITE PUBLIC ═══\n');
console.log(`   ${pages.length} pages lues · ${MOTIFS.length} formes de montant cherchées\n`);

if (trouves.length) {
  for (const t of trouves) {
    console.log(`   ✗ ${t.page} — « ${t.extrait} » (${t.monnaie})`);
    console.log(`       …${t.autour}…`);
  }
  console.log(`\n✗ ${trouves.length} montant(s) affiché(s). Les frais scolaires restent à la`);
  console.log('  Direction — décision de Loms du 10 août 2026.\n');
  process.exit(PREUVE ? 0 : 1);
}

if (PREUVE) {
  console.log("✗ PREUVE MANQUÉE — l'outil a laissé passer « Minerval : 900 $ ».\n");
  process.exit(1);
}
console.log('✓ Aucun montant nulle part. Les frais se demandent à la Direction.\n');
