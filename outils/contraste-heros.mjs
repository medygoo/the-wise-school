#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
//  LE CONTRASTE DU HÉROS — MESURÉ, PAS ESTIMÉ
// ═══════════════════════════════════════════════════════════════════════════
//
//  L'accueil pose son texte sur une PHOTOGRAPHIE qui change toutes les cinq
//  secondes. Mesurer contre une couleur ne veut donc rien dire : il faut
//  composer les couches — photographie · voile · halo — et prendre le pire
//  cas possible, une photographie ENTIÈREMENT BLANCHE. Si le texte tient là,
//  il tient sur n'importe quelle photo que l'école déposera demain.
//
//  Cette faute a déjà été commise DEUX fois dans ce projet :
//    · l'écran de connexion de l'application, mesuré contre son dégradé
//      déclaré alors qu'une photographie le recouvrait ;
//    · ce héros-ci, dont le sur-titre en or donnait 1,92:1 sur fond clair.
//  D'où cet outil : la troisième fois, c'est lui qui refusera.
//
//  Ce qu'il NE SAIT PAS vérifier, et qu'il dit plutôt que de se taire :
//    · l'ombre portée du titre (text-shadow) aide l'œil sans compter pour
//      WCAG — c'est une marge en notre faveur, jamais l'inverse ;
//    · le halo décoratif `.heros::before` : un dégradé n'a pas UNE opacité,
//      il en a autant que de points. Il n'entre donc PAS dans le calcul, et
//      aucune garantie ne repose sur lui. Ce qui compte est le fond du bloc
//      de texte, qui porte une seule valeur — c'est pour cela qu'il existe.
//
//  Éprouvé dans les deux sens : `--preuve` retire ce fond et ne laisse que
//  le voile — l'état exact d'avant la correction — et l'outil doit REFUSER.
//
//  Usage : node outils/contraste-heros.mjs [--preuve]
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS = readFileSync(join(RACINE, 'assets/site.css'), 'utf8');
const PREUVE = process.argv.includes('--preuve');

// ── couleur ────────────────────────────────────────────────────────────────
const lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
const L = ([r, g, b]) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const sur = (couche, a, fond) => fond.map((c, i) => a * couche[i] + (1 - a) * c);
const BLANC = [255, 255, 255];

// ── lecture des VRAIES valeurs livrées ─────────────────────────────────────
// Un outil qui porte ses propres constantes n'en vérifie aucune : il
// approuverait encore après qu'on ait éclairci le voile.
const manques = [];
const regle = sel => {
  const i = CSS.indexOf('\n' + sel + '{');
  if (i < 0) { manques.push(sel); return ''; }
  return CSS.slice(i + sel.length + 2, CSS.indexOf('}', i));
};
const alphas = (txt, quoi) => {
  const t = [...(txt || '').matchAll(/rgba?\([^)]*?,\s*([\d.]+)\s*\)/g)].map(m => +m[1]);
  if (!t.length) manques.push(quoi);
  return t;
};

const voileTxt = regle('.heros::after');
// La preuve rejoue l'état d'avant : le voile seul, sans fond sous le texte.
// C'est exactement ce qui était livré, et c'est ce que l'outil doit refuser.
const panneauTxt = PREUVE ? 'background:rgba(24,33,42,0)' : regle('.heros .large::before');

const aVoile = alphas(voileTxt, '.heros::after');
// Le voile : son arrêt le plus FAIBLE, c'est-à-dire le haut de l'écran.
const VOILE = aVoile.length ? Math.min(...aVoile) : (manques.push('voile'), 1);

// Le fond du texte porte UNE seule valeur — c'est exprès. Un dégradé n'a pas
// une opacité, il en a autant que de points : impossible de dire ce qu'il
// garantit. `.heros::before` est donc décoratif et n'entre PAS dans le
// calcul ; seule cette couche-ci compte, et le masque ne l'éteint que sur
// les bords, là où il n'y a plus de texte.
const mFond = /background:rgba?\([^)]*?,\s*([\d.]+)\s*\)/.exec(panneauTxt || '');
const HALO = mFond ? +mFond[1] : (manques.push('.heros .large::before — fond'), 0);

const TEINTE = [28, 38, 48];

// ── les textes du héros, avec leur opacité et leur taille réelles ──────────
const opacite = (sel, defaut) => {
  const m = /color:rgba?\([^)]*?,\s*([\d.]+)\s*\)/.exec(regle(sel));
  return m ? +m[1] : defaut;
};
const TEXTES = [
  ['titre (h1)',        BLANC, 1,                       32, 3.0],
  ['sous-titre du nom', BLANC, 1,                       21, 3.0],
  ['sur-titre',         BLANC, 1,                       13, 4.5],
  ['paragraphe',        BLANC, opacite('.heros p', .92), 17.5, 4.5],
];

// ── mesure ─────────────────────────────────────────────────────────────────
console.log('═══ LE CONTRASTE DU HÉROS, SUR PHOTOGRAPHIE ═══\n');
if (manques.length) {
  console.log("⚠️  Introuvables dans le fichier livré — l'outil ne peut pas les");
  console.log('    vérifier, et il ne fait pas semblant :');
  manques.forEach(m => console.log('      · ' + m));
  console.log('');
}
console.log(`   voile : ${VOILE}   ·   fond du texte : ${HALO}   ·   cumulé : ${(1 - (1 - VOILE) * (1 - HALO)).toFixed(3)}\n`);

const PHOTOS = { 'photographie BLANCHE (pire cas)': BLANC, 'photographie sombre': [26, 31, 20] };
let echecs = 0, mesures = 0;
for (const [nomPhoto, photo] of Object.entries(PHOTOS)) {
  console.log(`── ${nomPhoto}`);
  const fond = sur(TEINTE, HALO, sur(TEINTE, VOILE, photo));
  for (const [quoi, couleur, a, taille, seuil] of TEXTES) {
    const r = ratio(sur(couleur, a, fond), fond);
    const ok = r >= seuil; if (!ok) echecs++; mesures++;
    console.log(`   ${quoi.padEnd(20)} ${String(taille).padStart(5)}px  ${r.toFixed(2).padStart(6)}:1  ${ok ? '✓' : '✗ sous ' + seuil}`);
  }
  console.log('');
}

if (PREUVE) {
  console.log(echecs
    ? `✓ PREUVE — sans le fond du texte, l'outil REFUSE : ${echecs} couple(s) sous le seuil.`
    : "✗ PREUVE MANQUÉE — l'outil accepte le héros sans fond de texte : il ne vérifie rien.");
  process.exit(echecs ? 0 : 1);
}

console.log(echecs
  ? `✗ ${echecs} couple(s) sur ${mesures} sous le seuil`
  : `✓ ${mesures} mesures : le texte du héros se lit, même sur une photographie blanche.`);
process.exit(echecs ? 1 : 0);
