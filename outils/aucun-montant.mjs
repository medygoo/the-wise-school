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
//  ─────────────────────────────────────────────────────────────────────────
//  L'ANGLE MORT, ET CE QU'IL A COÛTÉ — 10 août 2026
//  ─────────────────────────────────────────────────────────────────────────
//
//  Cet outil annonçait « ✓ Aucun montant nulle part ». Il disait vrai sur ce
//  qu'il regardait, et faux sur le site : `inscription.html` publiait les
//  QUATRE billets de vacances en image, en pleine résolution, ouvrables au
//  clic. On y lisait le minerval, ses trois tranches, la cantine au mois,
//  l'amortissement jouets, le cachetage de l'uniforme et le complet acheté
//  à l'école. Tout ce que la décision de Loms garde à la Direction.
//
//  L'outil ne lit que du texte. Un montant DANS une image lui est invisible
//  — et son « ✓ » couvrait cet angle mort au lieu de l'avouer. C'est la
//  faute exacte que tous nos audits traquent, commise par un audit.
//
//  Deux conséquences, l'une et l'autre nécessaires :
//
//   1. Il REFUSE désormais tout fichier image dont le nom annonce un
//      document d'argent — billet, frais, minerval, tarif, prix, facture,
//      reçu — qu'il soit référencé par une page ou non. Un fichier posé
//      dans le dépôt est publié par GitHub Pages même si aucun lien n'y
//      mène : il suffit d'en connaître l'adresse.
//
//   2. Il DÉCLARE, à chaque passage, le nombre d'images qu'il ne sait pas
//      lire. Un outil qui se tait sur ce qu'il ignore fabrique une
//      confiance qu'il ne mérite pas.
//
//  Éprouvé dans les deux sens : `--preuve` réinjecte « Minerval : 900 $ »
//  DANS une page et un billet DANS le dépôt — l'outil doit refuser les deux.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
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

// ───────────────────────────────────────────────────────────────────────────
//  LES IMAGES — ce que le contrôle du texte ne peut pas voir
// ───────────────────────────────────────────────────────────────────────────
//  Un nom de fichier n'est pas une preuve de contenu. Mais un document
//  scolaire d'argent porte presque toujours son métier dans son nom, et
//  c'est le seul indice qu'une machine puisse lire ici. Ce qui échappe à
//  cette liste est compté plus bas, et dit.
const NOMS_INTERDITS = [
  [/billet/i,   'un billet de vacances — il porte le minerval et ses tranches'],
  [/minerval/i, 'le minerval'],
  [/frais/i,    'les frais scolaires'],
  [/tarif|prix/i, 'une grille de prix'],
  [/facture|recu|reçu/i, 'une pièce comptable'],
];
const IMAGES = /\.(webp|png|jpe?g|gif|avif|svg|pdf)$/i;

function toutesLesImages(dossier, prefixe = '') {
  const sorties = [];
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const rel = prefixe ? `${prefixe}/${e.name}` : e.name;
    if (e.isDirectory()) sorties.push(...toutesLesImages(join(dossier, e.name), rel));
    else if (IMAGES.test(e.name)) sorties.push(rel);
  }
  return sorties;
}

const images = existsSync(join(RACINE, 'img')) ? toutesLesImages(join(RACINE, 'img'), 'img') : [];
// La preuve pose un billet dans le dépôt SANS qu'aucune page n'y renvoie :
// c'est précisément le cas que l'ancien contrôle laissait passer, et il est
// publié quand même — GitHub Pages sert tout fichier présent.
if (PREUVE) images.push('img/billet-primaire-3-4.webp');

const interdites = [];
for (const f of images) {
  const nom = f.split('/').pop();
  for (const [motif, quoi] of NOMS_INTERDITS) {
    if (motif.test(nom)) { interdites.push({ f, quoi }); break; }
  }
}

console.log('\n═══ AUCUN MONTANT SUR LE SITE PUBLIC ═══\n');
console.log(`   ${pages.length} pages lues · ${MOTIFS.length} formes de montant cherchées`);
console.log(`   ${images.length} images publiées · ${interdites.length} au nom interdit\n`);

if (trouves.length || interdites.length) {
  for (const t of trouves) {
    console.log(`   ✗ ${t.page} — « ${t.extrait} » (${t.monnaie})`);
    console.log(`       …${t.autour}…`);
  }
  for (const i of interdites) {
    console.log(`   ✗ ${i.f} — ${i.quoi}`);
    console.log('       Un fichier présent dans le dépôt est publié même sans lien vers lui.');
  }
  const n = trouves.length + interdites.length;
  console.log(`\n✗ ${n} exposition(s) des frais. Ils restent à la Direction —`);
  console.log('  décision de Loms du 10 août 2026.\n');
  process.exit(PREUVE ? 0 : 1);
}

if (PREUVE) {
  console.log("✗ PREUVE MANQUÉE — ni « Minerval : 900 $ » dans le texte,");
  console.log('  ni un billet posé dans le dépôt n\'ont été refusés.\n');
  process.exit(1);
}

console.log('✓ Aucun montant dans le texte. Les frais se demandent à la Direction.');
console.log(`\n  CE QUE CET OUTIL NE SAIT PAS VÉRIFIER — ${images.length} images.`);
console.log('  Il ne lit pas le texte À L\'INTÉRIEUR d\'une image. Le 10 août 2026,');
console.log('  quatre billets de vacances étaient publiés en pleine résolution avec');
console.log('  le minerval lisible, et cet outil annonçait « aucun montant ».');
console.log('  Toute affiche ajoutée au site se regarde à l\'œil avant d\'être publiée.\n');
