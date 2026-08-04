# Le site du Complexe Scolaire Le Sage

**Ce dépôt EST le site.** Ce que vous modifiez ici part tout seul sur
`cslesage.com`, en une minute environ. **FileZilla ne sert plus.**

Vous gardez votre nom de domaine et votre hébergeur LWS : rien ne change de ce
côté. Ce qui change, c'est **qui fait le téléversement** — ce n'est plus votre
connexion depuis Kinshasa, ce sont les serveurs de GitHub. Et seuls les
fichiers modifiés partent, au lieu des 5 Mo du dossier entier.

---

# 1 · À faire UNE SEULE FOIS — environ cinq minutes

GitHub doit pouvoir se connecter à votre hébergeur à votre place. Il lui faut
donc les trois informations FTP — les mêmes que celles que vous tapez dans
FileZilla. On les range dans un coffre que GitHub appelle les **secrets** :
**personne ne peut les relire ensuite**, ni moi, ni un visiteur du dépôt.

### Étape 1 — Ouvrir le coffre

Sur la page du dépôt :

```
Settings  ▸  Secrets and variables  ▸  Actions  ▸  New repository secret
```

*(« Settings » est l'onglet le plus à droite, avec la petite roue dentée.)*

### Étape 2 — Déposer les trois secrets, un par un

Pour chacun : taper le **nom** exactement comme ci-dessous, coller la
**valeur**, puis « Add secret ».

| Nom — à écrire exactement | Valeur à coller |
|---|---|
| `FTP_SERVEUR` | l'adresse du serveur FTP, celle de FileZilla (elle commence par `ftp.`) |
| `FTP_UTILISATEUR` | votre identifiant FTP, donné par LWS |
| `FTP_MOT_DE_PASSE` | votre mot de passe FTP |

> Vous retrouvez les trois dans votre espace client LWS, rubrique **FTP**, ou
> dans FileZilla : menu **Fichier ▸ Gestionnaire de sites**.

**Attention aux espaces.** Un espace collé au début ou à la fin d'un mot de
passe est la cause n°1 des échecs — et il est invisible.

### Étape 3 — Si le site n'est pas à la racine

Dans FileZilla, regardez où vous déposez `index.html`. Si c'est bien à la
racine (`/`), **passez cette étape**. Si c'est dans un dossier comme
`/www` ou `/public_html`, il faut le dire :

```
Settings ▸ Secrets and variables ▸ Actions ▸ onglet « Variables » ▸ New variable
        Nom    : FTP_DOSSIER
        Valeur : /public_html          (ou ce que montre FileZilla)
```

### Étape 4 — La première publication

```
Onglet  Actions  ▸  « Publier le site »  ▸  bouton « Run workflow »
```

Une ligne apparaît. Un **rond jaune** = en cours. Une **coche verte** = le site
est à jour. Une **croix rouge** = rien n'a été publié, et le site en ligne est
resté celui d'avant — cliquez dessus pour lire ce qui a bloqué.

**À partir de là, c'est automatique.** Vous n'aurez plus jamais à revenir ici.

---

# 2 · Modifier le site, tous les jours

Tout se fait depuis le navigateur — **y compris depuis votre téléphone**.

## Changer un texte

1. Ouvrir la page à modifier : `index.html` (accueil), `ecole.html`,
   `programmes.html`, `galerie.html`, `inscription.html`, `contact.html`.
2. Cliquer sur le **crayon** ✏️ en haut à droite.
3. Modifier le texte. **Ne touchez qu'à ce qui est entre les balises** — le
   texte que vous lisez normalement, pas ce qui est entre `<` et `>`.
4. En bas : bouton vert **« Commit changes »**.
5. Dans la petite fenêtre, écrire en une ligne ce que vous avez changé
   (« nouveau montant du minerval »), puis **« Commit changes »**.

C'est fini. Une minute plus tard, c'est en ligne.

## Ajouter une photo

1. Sur la page d'accueil du dépôt, bouton **« Add file » ▸ « Upload files »**.
2. Glisser la photo, ou la choisir depuis le téléphone.
3. **« Commit changes »**.

**Vous n'avez pas à vous soucier du poids.** Une photo de 4 Mo prise au
téléphone est **allégée automatiquement** au moment de la publication — le site
reste rapide, et votre photo d'origine reste intacte dans GitHub.

Ensuite, pour qu'elle apparaisse : il faut l'appeler depuis une page. Ouvrez la
page voulue avec le crayon et copiez une ligne qui ressemble à celle-ci, en
remplaçant le nom du fichier :

```html
<img src="ma-nouvelle-photo.jpg" alt="Décrivez la photo en quelques mots">
```

> Le `alt` n'est pas décoratif : c'est ce que lit un lecteur d'écran, et ce qui
> s'affiche si la photo ne charge pas.

## Supprimer quelque chose

- **Un texte** : le crayon ✏️, effacer les lignes, « Commit changes ».
- **Un fichier entier** : ouvrir le fichier, bouton **« … » ▸ « Delete file »**.

## Ce qu'il vaut mieux me demander

Ajouter une **page entière**, changer la **disposition**, ou toucher aux
**couleurs** : dites-le moi. Les couleurs du site suivent la charte de l'école
— gris, blanc, or — et un outil vérifie que chaque texte reste lisible. Une
couleur changée à la main peut passer sous le seuil sans que ça se voie.

---

# 3 · Revenir en arrière

C'est ce que FileZilla ne savait pas faire : il écrasait sans mémoire.

```
Onglet  Commits  ▸  choisir la modification  ▸  « Revert »
```

Le site revient à l'état d'avant, tout seul, en une minute. **Rien n'est jamais
perdu** : chaque version est gardée.

---

# 4 · Trois choses à ne jamais faire

1. **Ne jamais écrire le mot de passe FTP dans un fichier du dépôt.** Il n'a
   qu'une place : le coffre des secrets. Un mot de passe déposé dans un fichier
   est lisible par tous, et le retirer ne l'efface pas de l'historique.
2. **Ne pas supprimer le dossier `.github`** — c'est lui qui publie.
3. **Aucune donnée réelle d'élève, de parent ou de paiement sur le site.**
   Le site est public. Les noms, les notes et les paiements restent dans
   l'application, derrière la connexion.

---

# 5 · Quand ça ne marche pas

| Ce que vous voyez | Ce que ça veut dire |
|---|---|
| **Croix rouge** dans Actions | Rien n'a été publié — le site en ligne est intact. Cliquez sur la croix : la raison est écrite en clair, en français. |
| Coche verte, mais la page semble inchangée | C'est votre navigateur qui garde l'ancienne. **Ctrl + F5** (ou fermer l'onglet et rouvrir). |
| `530` ou « login incorrect » | Un des trois secrets est faux — le plus souvent un espace en trop. Refaites l'étape 2. |
| `timeout` ou « connection refused » | LWS refuse la connexion venue de l'extérieur. Dites-le moi : on passe à l'autre solution. |

---

# 6 · Les deux façons de mettre le site à jour

| | quoi | qui |
|---|---|---|
| **GitHub** *(ce guide)* | photos, textes, structure, pages | la Direction, ou moi |
| **« Mon site web »** dans l'application | les annonces et les actualités | la Direction seule, sans passer par GitHub |

Les deux fonctionnent ensemble. Le second est encore en cours de branchement.
