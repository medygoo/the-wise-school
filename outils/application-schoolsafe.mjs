import { readFile } from 'node:fs/promises';

const RACINE = new URL('../', import.meta.url);
const PAGES = [
  'index.html',
  'ecole.html',
  'programmes.html',
  'galerie.html',
  'inscription.html',
  'contact.html',
  'rentree.html'
];
const ANCIENNE_APP = 'https://medygoo.github.io/SchoolSafe-/';

function refuser(message) {
  console.error('\nX ' + message + '\n');
  process.exit(1);
}

const configuration = await readFile(new URL('assets/schoolsafe-config.js', RACINE), 'utf8');
if (!/appUrl\s*:\s*''/.test(configuration)) {
  refuser("Le lien SchoolSafe doit rester vide avant le raccordement reel de l'ecole.");
}

for (const page of PAGES) {
  const contenu = await readFile(new URL(page, RACINE), 'utf8');
  if (contenu.includes(ANCIENNE_APP)) {
    refuser(page + ' contient encore le lien de l\'ancienne application.');
  }

  const positionConfig = contenu.indexOf('assets/schoolsafe-config.js');
  const positionSite = contenu.indexOf('assets/site.js');
  if (positionConfig < 0 || positionSite < 0 || positionConfig > positionSite) {
    refuser(page + ' doit charger schoolsafe-config.js avant site.js.');
  }
}

const script = await readFile(new URL('assets/site.js', RACINE), 'utf8');
if (!script.includes('if(APP_DISPONIBLE)')) {
  refuser("site.js n'impose pas la verification du raccordement.");
}
if (!script.includes("APP_DISPONIBLE=adresseApp.protocol==='https:'")) {
  refuser("site.js n'impose pas HTTPS pour la future application.");
}
if (!script.includes("var ANCIENNE_APP='" + ANCIENNE_APP + "';")) {
  refuser("site.js ne bloque plus explicitement l'ancienne application.");
}

console.log('\n=== RACCORDEMENT SCHOOLSAFE ===\n');
console.log('OK 7 pages autonomes, ancien lien bloque, futur lien HTTPS desactive.\n');
