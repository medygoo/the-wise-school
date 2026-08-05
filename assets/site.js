(function(){
  'use strict';

  var APP_URL='https://medygoo.github.io/SchoolSafe-/';
  var LANG_KEY='cslesage_langue';

  ['assets/premium.css','assets/premium-layout.css','assets/app-link.css','assets/equipe.css','assets/experience-2026.css','assets/vivant.css'].forEach(function(href){
    if(!document.querySelector('link[href="'+href+'"]')){
      var style=document.createElement('link');
      style.rel='stylesheet';
      style.href=href;
      document.head.appendChild(style);
    }
  });

  /* Accès officiel à SchoolSafe sur toutes les pages. */
  var nav=document.querySelector('nav');
  if(nav&&!nav.querySelector('.nav-application')){
    var lienApp=document.createElement('a');
    lienApp.className='nav-application';
    lienApp.href=APP_URL;
    lienApp.target='_blank';
    lienApp.rel='noopener';
    lienApp.textContent='Application';
    lienApp.setAttribute('aria-label','Ouvrir l’application SchoolSafe dans un nouvel onglet');
    nav.appendChild(lienApp);
  }

  var heroActions=document.querySelector('.hero-premium .actions');
  if(heroActions&&!heroActions.querySelector('.btn-application')){
    var boutonHero=document.createElement('a');
    boutonHero.className='btn btn-verre btn-application';
    boutonHero.href=APP_URL;
    boutonHero.target='_blank';
    boutonHero.rel='noopener';
    boutonHero.innerHTML='Ouvrir SchoolSafe <span aria-hidden="true">↗</span>';
    heroActions.appendChild(boutonHero);
  }

  var liensFooter=document.querySelector('.footer-grille>div:last-child .petit');
  if(liensFooter&&!liensFooter.querySelector('.footer-application')){
    var saut=document.createElement('br');
    var appFooter=document.createElement('a');
    appFooter.className='footer-application';
    appFooter.href=APP_URL;
    appFooter.target='_blank';
    appFooter.rel='noopener';
    appFooter.textContent='Ouvrir l’application SchoolSafe ↗';
    liensFooter.appendChild(saut);
    liensFooter.appendChild(appFooter);
  }


  /* ══════════════════════════════════════════════════════════════════════
     LE MOUVEMENT — ce que le CSS ne sait pas faire seul
     ══════════════════════════════════════════════════════════════════════
     Tout ce qui suit est du DÉCOR : si ce bloc ne s'exécute pas, la page
     reste entière et lisible. Aucune information n'y est portée.
     Et tout se tait quand l'appareil demande le calme — on le demande UNE
     fois ici, plutôt que dans chaque fonction.                            */
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Le retard entre voisins d'une même rangée. Plafonné : au-delà de
     quatre, on attendrait pour rien. */
  Array.prototype.forEach.call(
    document.querySelectorAll('.grille,.galerie-accueil,.gallery-grid,.avantages-list,.piliers,.bande-promesse-grille,.cartes-cycles'),
    function(rangee){
      Array.prototype.forEach.call(rangee.children, function(el,i){
        if(i>0 && el.classList.contains('apparait')) el.style.setProperty('--retard', Math.min(i,4)*85+'ms');
      });
    });

  /* L'onde du bouton part du point survolé. */
  document.addEventListener('pointerenter', function(e){
    var b = e.target.closest && e.target.closest('.btn');
    if(!b || calme.matches) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty('--x', (e.clientX - r.left) + 'px');
    b.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }, true);

  /* Le filet de progression de la lecture. `scaleX` seul — aucune
     recomposition de page à chaque pixel défilé. */
  if(!calme.matches && !document.querySelector('.progression-page')){
    var barre = document.createElement('div');
    barre.className = 'progression-page';
    barre.setAttribute('aria-hidden','true');
    document.body.appendChild(barre);
    var enAttente = false;
    var majBarre = function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      barre.style.setProperty('--lu', h > 0 ? Math.min(1, window.scrollY / h) : 0);
      enAttente = false;
    };
    // Une lecture de position par IMAGE, pas par événement : sans ce frein,
    // un défilement rapide déclenche des centaines de calculs par seconde.
    window.addEventListener('scroll', function(){
      if(enAttente) return; enAttente = true; requestAnimationFrame(majBarre);
    }, {passive:true});
    majBarre();
  }

  /* Les nombres montent quand ils entrent à l'écran. On ne touche qu'au
     texte d'un élément dont la largeur est déjà fixée par
     `tabular-nums` : la ligne ne tremble pas. */
  if(!calme.matches && 'IntersectionObserver' in window){
    var chiffres = document.querySelectorAll('.bande-promesse-grille b');
    var vuChiffre = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){
        if(!e.isIntersecting) return;
        vuChiffre.unobserve(e.target);
        var cible = parseInt(e.target.textContent, 10);
        if(!isFinite(cible) || cible <= 0 || cible > 999) return;   // « 2 cycles » oui, un texte non
        var debut = null, duree = 900;
        var pas = function(t){
          if(debut === null) debut = t;
          var k = Math.min(1, (t - debut) / duree);
          e.target.textContent = Math.round(cible * (1 - Math.pow(1 - k, 3)));
          if(k < 1) requestAnimationFrame(pas);
        };
        e.target.textContent = '0';
        requestAnimationFrame(pas);
      });
    }, {threshold:.6});
    Array.prototype.forEach.call(chiffres, function(c){ vuChiffre.observe(c); });
  }

  /* La bande défilante des promesses de l'école. Le contenu est DOUBLÉ :
     avec une seule copie, on voit un saut à chaque tour de boucle. */
  var ancre = document.querySelector('.bande-promesse');
  if(ancre && !document.querySelector('.bande-defilante')){
    var PROMESSES = ['Former, réformer, exceller',
                     'Français et anglais dès la maternelle',
                     'Chaque enfant connu par son nom',
                     'Entrées et sorties contrôlées',
                     'Huit activités dans la semaine',
                     'De la maternelle à la 6ᵉ primaire'];
    var bande = document.createElement('div');
    bande.className = 'bande-defilante';
    bande.setAttribute('aria-hidden','true');   // le texte existe déjà ailleurs : ne pas le relire
    var piste = document.createElement('div');
    piste.className = 'bande-defilante-piste';
    PROMESSES.concat(PROMESSES).forEach(function(t){
      var s = document.createElement('span'); s.textContent = t; piste.appendChild(s);
    });
    bande.appendChild(piste);
    ancre.parentNode.insertBefore(bande, ancre.nextSibling);
  }

  /* Carrousel de la page d’accueil : une photographie différente toutes les 5 secondes. */
  var hero=document.querySelector('.hero-premium:not(.admission-hero)');
  if(hero&&!hero.dataset.sliderReady){
    var photoInitiale=hero.querySelector(':scope > .hero-photo');
    if(photoInitiale){
      /* Les photographies envoyées par l'école, en pleine résolution.
         Les trois `img/nouvelles/*` qui se trouvaient ici mesuraient 900,
         760 et 1100 pixels de large pour 15 Ko : très compressées, et
         floues dès qu'on les étire sur toute la largeur d'un écran.
         Celles-ci font 1448 à 1600 px et pèsent 91 à 148 Ko, avec une
         version @800 pour les téléphones. */
      var donneesSlides=[
        {src:'img/heros/h1.webp',petite:'img/heros/h1@800.webp',w:800,alt:'Les élèves du Complexe Scolaire Le Sage devant l’entrée, avec leurs enseignantes',focus:'center 40%'},
        {src:'img/heros/h3.webp',petite:'img/heros/h3@800.webp',w:724,alt:'Des élèves lisent à la bibliothèque de l’école',focus:'center'},
        {src:'img/heros/h2.webp',petite:'img/heros/h2@800.webp',w:724,alt:'Le cours de taekwondo du Complexe Scolaire Le Sage',focus:'center'},
        {src:'img/heros/h4.webp',petite:'img/heros/h4@800.webp',w:724,alt:'La remise des diplômes de fin de maternelle',focus:'center 35%'},
        {src:'img/heros/h5.webp',petite:'img/heros/h5@800.webp',w:800,alt:'Un enseignant accompagne une élève sur son cahier',focus:'center 35%'},
        {src:'img/heros/h6.webp',petite:'img/heros/h6@800.webp',w:800,alt:'L’équipe du Complexe Scolaire Le Sage devant l’école',focus:'center 40%'}
      ];
      var slides=document.createElement('div');
      slides.className='hero-slides';
      slides.setAttribute('aria-hidden','true');
      donneesSlides.forEach(function(item,index){
        var image=document.createElement('img');
        image.className='hero-slide'+(index===0?' active':'');
        image.src=item.src;
        /* Un téléphone ne doit pas tirer 1600 px : `srcset` lui laisse le
           choix, et les largeurs annoncées sont les VRAIES — un `w` faux
           fait choisir une image floue ou trop lourde. */
        if(item.petite)image.srcset=item.petite+' '+item.w+'w, '+item.src+' 1600w';
        image.sizes='100vw';
        image.alt='';
        image.style.objectPosition=item.focus;
        image.dataset.focus=item.focus;
        image.loading=index===0?'eager':'lazy';
        if(index===0)image.setAttribute('fetchpriority','high');
        slides.appendChild(image);
      });
      photoInitiale.replaceWith(slides);

      var controles=document.createElement('div');
      controles.className='hero-slider-controls';
      controles.setAttribute('aria-label','Choisir une photographie de l’école');
      var precedent=document.createElement('button');
      precedent.type='button';
      precedent.className='hero-slider-arrow';
      precedent.setAttribute('aria-label','Photographie précédente');
      precedent.textContent='‹';
      var points=document.createElement('div');
      points.className='hero-slider-dots';
      var suivant=document.createElement('button');
      suivant.type='button';
      suivant.className='hero-slider-arrow';
      suivant.setAttribute('aria-label','Photographie suivante');
      suivant.textContent='›';
      controles.appendChild(precedent);
      controles.appendChild(points);
      controles.appendChild(suivant);
      hero.appendChild(controles);

      var statut=document.createElement('div');
      statut.className='hero-slider-status';
      statut.setAttribute('aria-live','polite');
      statut.textContent='Vie scolaire · 1 / '+donneesSlides.length;
      hero.appendChild(statut);

      var images=Array.prototype.slice.call(slides.querySelectorAll('.hero-slide'));
      var boutons=[];
      var actif=0;
      var minuterie=null;
      donneesSlides.forEach(function(item,index){
        var point=document.createElement('button');
        point.type='button';
        point.className='hero-slider-dot'+(index===0?' active':'');
        point.setAttribute('aria-label','Afficher la photographie '+(index+1));
        point.addEventListener('click',function(){afficher(index,true);});
        points.appendChild(point);
        boutons.push(point);
      });
      function afficher(index,relancer){
        actif=(index+images.length)%images.length;
        images.forEach(function(img,i){img.classList.toggle('active',i===actif);});
        /* La suivante est demandée MAINTENANT : sur une connexion lente, un
           fondu vers une image absente donne un écran nu pendant deux
           secondes — pire que pas de carrousel du tout. */
        var apres=images[(actif+1)%images.length];
        if(apres&&apres.loading==='lazy')apres.loading='eager';
        boutons.forEach(function(btn,i){
          btn.classList.toggle('active',i===actif);
          btn.setAttribute('aria-current',i===actif?'true':'false');
        });
        statut.textContent='Vie scolaire · '+(actif+1)+' / '+images.length;
        if(relancer)demarrer();
      }
      function arreter(){if(minuterie){window.clearInterval(minuterie);minuterie=null;}}
      function demarrer(){
        arreter();
        minuterie=window.setInterval(function(){afficher(actif+1,false);},5000);
      }
      precedent.addEventListener('click',function(){afficher(actif-1,true);});
      suivant.addEventListener('click',function(){afficher(actif+1,true);});
      hero.addEventListener('mouseenter',arreter);
      hero.addEventListener('mouseleave',demarrer);
      hero.addEventListener('focusin',arreter);
      hero.addEventListener('focusout',demarrer);
      document.addEventListener('visibilitychange',function(){document.hidden?arreter():demarrer();});
      demarrer();
      hero.dataset.sliderReady='true';
    }
  }

  /* TROIS TUILES ÉTAIENT VIDES, et elles l'étaient EN LIGNE.
     `img/nouvelles/groupe-eleves.webp`, `salle-informatique.webp` et
     `taekwondo.webp` étaient injectées ici, en tête de galerie, avec une
     pastille « NOUVEAU ». Elles se décodaient sans erreur — 900×506,
     760×570, 1100×825 — et ne peignaient RIEN : mesuré au canevas, gris
     moyen 0, écart entre le pixel le plus clair et le plus sombre 0. Des
     fichiers de gabarit, jamais remplacés.

     C'est le défaut le plus difficile à voir : aucune erreur, aucune
     requête en échec, `naturalWidth` non nul — un audit qui vérifie que
     les images « se chargent » les déclarait bonnes. Seule la mesure des
     pixels le dit.

     Les photographies de l'école couvrent maintenant les trois mêmes
     sujets — le groupe, la lecture, le taekwondo — et elles sont écrites
     dans `galerie.html`, donc visibles même sans script.               */

  /* L’équipe reste visible sur l’accueil et sur la page L’école. */
  var pointEquipe=document.querySelector('.avantages-section');
  if(pointEquipe&&!document.querySelector('.equipe-accueil')){
    var equipe=document.createElement('section');
    equipe.className='section equipe-accueil';
    equipe.innerHTML='<div class="large">'+
      '<div class="apparait"><p class="eyebrow">Notre équipe</p><h2>Le corps administratif et les enseignants au service des enfants</h2><p class="equipe-intro">La Direction, la coordination générale, les enseignants et le service de perception accompagnent les familles pendant toute l’année scolaire.</p></div>'+
      '<div class="equipe-grille">'+
        '<figure class="equipe-card apparait zoomable"><img src="img/promoteur.webp" alt="Promotion et Direction générale du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Promotion</b><span>Direction générale</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/directeur_primaire.webp" alt="Direction du cycle primaire" loading="lazy"><figcaption><b>Direction du primaire</b><span>Cycle primaire</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/dir_maternelle.webp" alt="Direction du cycle maternel" loading="lazy"><figcaption><b>Direction de la maternelle</b><span>Cycle maternel</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/coordinatrice.webp" alt="Coordination générale de l’école" loading="lazy"><figcaption><b>Coordination générale</b><span>Supervision de l’établissement</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/teacher_luyeye.webp" alt="Enseignante du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Enseignement</b><span>Équipe pédagogique</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/teacher_manzambi.webp" alt="Enseignante du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Enseignement</b><span>Équipe pédagogique</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/teacher_tshimi.webp" alt="Enseignante du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Enseignement</b><span>Équipe pédagogique</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/perceptrice.webp" alt="Service de perception de l’école" loading="lazy"><figcaption><b>Perception</b><span>Frais scolaires et reçus</span></figcaption></figure>'+
      '</div>'+
      '<div class="equipe-suite apparait"><p>Les familles peuvent retrouver la présentation complète de l’établissement, son organisation et son dispositif d’encadrement.</p><a class="btn btn-or" href="ecole.html">Découvrir toute l’équipe →</a></div>'+
    '</div>';
    pointEquipe.parentNode.insertBefore(equipe,pointEquipe);
  }

  Array.prototype.forEach.call(document.querySelectorAll('img[src*="coordinatrice.webp"]'),function(photo){
    photo.alt='Coordination générale de l’école';
    var fiche=photo.closest('figure');
    if(!fiche)return;
    var titre=fiche.querySelector('b');
    var fonction=fiche.querySelector(':scope > span:last-child, figcaption span');
    if(titre)titre.textContent='Coordination générale';
    if(fonction)fonction.textContent='Supervision de l’établissement';
  });

  var header=document.querySelector('header');
  function headerAuDefilement(){if(header)header.classList.toggle('scrolled',window.scrollY>18);}
  headerAuDefilement();
  window.addEventListener('scroll',headerAuDefilement,{passive:true});

  var b=document.querySelector('.bouton-menu');
  var n=document.querySelector('nav');
  if(b&&n){
    b.addEventListener('click',function(){
      var ouvert=n.classList.toggle('ouvert');
      b.setAttribute('aria-expanded',ouvert?'true':'false');
    });
    n.addEventListener('click',function(e){
      if(e.target.tagName==='A'){
        n.classList.remove('ouvert');
        b.setAttribute('aria-expanded','false');
      }
    });
  }

  var ici=location.pathname.split('/').pop()||'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('nav a'),function(a){
    if(a.getAttribute('href')===ici)a.setAttribute('aria-current','page');
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-annee]'),function(el){
    el.textContent=new Date().getFullYear();
  });

  /* Version française / anglaise disponible sur toutes les pages. */
  var traductions={
    "Aller au contenu":"Skip to content",
    "Accueil":"Home",
    "L'école":"The school",
    "Programmes":"Programmes",
    "Galerie":"Gallery",
    "Inscription":"Enrolment",
    "Contact":"Contact",
    "Application":"App",
    "Ouvrir SchoolSafe":"Open SchoolSafe",
    "Ouvrir l’application SchoolSafe ↗":"Open the SchoolSafe app ↗",
    "Inscriptions 2026-2027 ouvertes":"Enrolment for 2026-2027 is open",
    "Kinshasa · Barumbu · Quartier Bon Marché":"Kinshasa · Barumbu · Bon Marché district",
    "Former, réformer,":"Educate, transform,",
    "exceller.":"excel.",
    "Une école bilingue français–anglais, de la maternelle à la 6e primaire, où l'enfant apprend, s'exprime, grandit et évolue dans un cadre suivi.":"A French-English bilingual school, from nursery to sixth grade, where every child learns, expresses themselves and grows in a caring environment.",
    "Préinscrire mon enfant":"Pre-enrol my child",
    "Appeler l'école":"Call the school",
    "Maternelle en anglais":"English-medium nursery",
    "Primaire bilingue":"Bilingual primary",
    "Aucun paiement en ligne":"No online payment",
    "Année scolaire":"School year",
    "Places ouvertes":"Places available",
    "cycles":"cycles",
    "Maternelle · Primaire":"Nursery · Primary",
    "langues":"languages",
    "Français · Anglais":"French · English",
    "activités":"activities",
    "incluses dans la semaine":"included in the week",
    "école attentive":"caring school",
    "à chaque enfant":"for every child",
    "Bienvenue chez nous":"Welcome to our school",
    "Une école qui associe apprentissage, créativité et protection":"A school combining learning, creativity and protection",
    "Le Complexe Scolaire Le Sage — The Wise School International — accueille les enfants de la maternelle et du primaire. Le programme national congolais est conduit en français et en anglais, avec un encadrement adapté à l'âge et au niveau de chaque élève.":"Complexe Scolaire Le Sage — The Wise School International — welcomes nursery and primary pupils. The Congolese national curriculum is taught in French and English, with guidance suited to each pupil's age and level.",
    "Les cours sont complétés par l'informatique, la danse, la musique, la poterie, le taekwondo, les ateliers créatifs et la cantine scolaire.":"Lessons are complemented by computing, dance, music, pottery, taekwondo, creative workshops and the school canteen.",
    "Apprendre":"Learn",
    "Des bases solides et un suivi régulier.":"Strong foundations and regular follow-up.",
    "S'exprimer":"Express",
    "Deux langues et plusieurs formes de créativité.":"Two languages and many forms of creativity.",
    "Grandir":"Grow",
    "Discipline, confiance et vie en communauté.":"Discipline, confidence and community life.",
    "Une école vivante":"A vibrant school",
    "Apprendre ensemble, bouger et partager.":"Learning, moving and sharing together.",
    "Admissions 2026-2027":"Admissions 2026-2027",
    "Les inscriptions sont en cours":"Enrolment is now open",
    "La préinscription se fait en quelques minutes. La famille vient ensuite à l'école avec les pièces demandées pour la validation du dossier.":"Pre-enrolment takes only a few minutes. The family then visits the school with the required documents so the application can be validated.",
    "Préinscription":"Pre-enrolment",
    "Remplissez la fiche en ligne ou contactez la Direction.":"Complete the online form or contact the School Management.",
    "Dossier à l'école":"Documents at school",
    "Apportez les documents de l'enfant et du tuteur.":"Bring the child's and guardian's documents.",
    "Validation":"Validation",
    "La Direction confirme la classe et finalise l'inscription.":"The School Management confirms the class and completes enrolment.",
    "Important :":"Important:",
    "aucun paiement ne se fait sur ce site. Les frais sont réglés uniquement à la caisse de l'école, contre reçu.":"no payment is made on this website. Fees are paid only at the school cashier's office against an official receipt.",
    "Commencer la préinscription":"Start pre-enrolment",
    "Nos cycles":"Our cycles",
    "Un parcours continu de la maternelle à la 6e primaire":"A continuous pathway from nursery to sixth grade",
    "Deux cycles, une même ambition : donner à chaque enfant des fondations solides.":"Two cycles, one ambition: giving every child strong foundations.",
    "Maternelle":"Nursery",
    "Éveil, langage, motricité, premières notions et apprentissage de la vie en groupe, avec une forte présence de l'anglais.":"Early learning, language, motor skills, first concepts and learning to live together, with strong exposure to English.",
    "1re, 2e et 3e maternelle":"1st, 2nd and 3rd nursery classes",
    "Activités manuelles et expression":"Hands-on activities and expression",
    "Horaires : 8 h à 14 h":"Hours: 8 a.m. to 2 p.m.",
    "Découvrir la maternelle →":"Discover nursery →",
    "Six années d'apprentissage en français et en anglais, avec préparation progressive à l'ENAFEP.":"Six years of learning in French and English, with progressive preparation for the ENAFEP examination.",
    "1re à 6e primaire":"1st to 6th primary",
    "Français, anglais, mathématiques et sciences":"French, English, mathematics and science",
    "Horaires : 7 h à 15 h":"Hours: 7 a.m. to 3 p.m.",
    "Découvrir le primaire →":"Discover primary →",
    "La vie à l'école":"Life at school",
    "Des journées qui donnent envie d'apprendre":"School days that inspire learning",
    "Les photos sont affichées dans leur version la plus nette disponible et mises en valeur sans modifier les visages.":"Photos are shown in the clearest available quality and enhanced for display without altering faces.",
    "Activité physique":"Physical activity",
    "Atelier artistique":"Art workshop",
    "Vie collective":"Community life",
    "Joie et mouvement":"Joy and movement",
    "Voir toute la galerie":"View the full gallery",
    "Pourquoi choisir Le Sage ?":"Why choose Le Sage?",
    "Une éducation complète, dans un cadre proche des familles":"A complete education in a family-centred environment",
    "Notre projet éducatif associe enseignement, activités pratiques, discipline, suivi des résultats et sécurité des entrées et sorties.":"Our educational approach combines teaching, practical activities, discipline, academic monitoring and controlled entry and exit.",
    "Connaître notre école":"Discover our school",
    "Enseignement bilingue":"Bilingual education",
    "Français et anglais dès la maternelle.":"French and English from nursery.",
    "Encadrement attentif":"Attentive guidance",
    "Un suivi adapté au niveau de l'enfant.":"Support adapted to each child's level.",
    "Activités variées":"Varied activities",
    "Informatique, arts, musique et sport.":"Computing, arts, music and sport.",
    "Sorties contrôlées":"Controlled departures",
    "L'enfant repart avec une personne autorisée.":"The child leaves with an authorised person.",
    "Notre équipe":"Our team",
    "Le corps administratif et les enseignants au service des enfants":"School management and teachers serving every child",
    "La Direction, la coordination générale, les enseignants et le service de perception accompagnent les familles pendant toute l’année scolaire.":"School Management, General Coordination, teachers and the cashier's office support families throughout the school year.",
    "Promotion":"School Founder",
    "Direction générale":"General Management",
    "Direction du primaire":"Primary Management",
    "Cycle primaire":"Primary cycle",
    "Direction de la maternelle":"Nursery Management",
    "Cycle maternel":"Nursery cycle",
    "Coordination générale":"General Coordination",
    "Supervision de l’établissement":"School supervision",
    "Enseignement":"Teaching",
    "Équipe pédagogique":"Teaching team",
    "Perception":"Cashier's office",
    "Frais scolaires et reçus":"School fees and receipts",
    "Les familles peuvent retrouver la présentation complète de l’établissement, son organisation et son dispositif d’encadrement.":"Families can view the full presentation of the school, its organisation and support structure.",
    "Découvrir toute l’équipe →":"Meet the full team →",
    "Une place pour votre enfant":"A place for your child",
    "Préparez maintenant la rentrée 2026-2027":"Prepare for the 2026-2027 school year now",
    "Contactez la Direction ou envoyez la fiche de préinscription en ligne.":"Contact School Management or send the online pre-enrolment form.",
    "Adresse":"Address",
    "Nous joindre":"Contact us",
    "Liens utiles":"Useful links",
    "École bilingue":"Bilingual school",
    "Notre école en images":"Our school in pictures",
    "Des moments vrais,":"Real moments,",
    "une école vivante":"a vibrant school",
    "Notre grande famille scolaire":"Our school family",
    "Informatique pratique":"Practical computing",
    "Discipline et confiance":"Discipline and confidence",
    "L'établissement":"The school",
    "Deux cycles, deux langues, une même exigence":"Two cycles, two languages, one standard of excellence",
    "Notre identité":"Our identity",
    "En bref":"At a glance",
    "La direction et l'encadrement":"Management and guidance",
    "La sécurité des enfants":"Children's safety",
    "Le suivi des résultats":"Academic monitoring",
    "Nos programmes":"Our programmes",
    "Les activités parascolaires":"Extracurricular activities",
    "Musique":"Music",
    "Danse":"Dance",
    "Poterie":"Pottery",
    "Informatique":"Computing",
    "Taekwondo":"Taekwondo",
    "Club bilingue":"Bilingual club",
    "Ateliers créatifs":"Creative workshops",
    "Cantine scolaire":"School canteen",
    "La cantine":"The canteen",
    "Le soutien scolaire":"Academic support",
    "Nous joindre":"Contact us",
    "Téléphone":"Telephone",
    "Courriel":"Email",
    "Horaires du secrétariat":"Office hours",
    "Pour une inscription":"For enrolment",
    "Inscrivez votre enfant":"Enrol your child",
    "Remplir la fiche →":"Complete the form →",
    "Quatre étapes simples":"Four simple steps",
    "Fiche en ligne":"Online form",
    "Documents":"Documents",
    "Paiement":"Payment",
    "Les pièces du dossier":"Required documents",
    "Fiche de renseignements":"Information form",
    "L'élève":"The pupil",
    "Les parents":"Parents",
    "Santé":"Health",
    "Tutelle et personnes autorisées":"Guardianship and authorised persons",
    "Envoyer à l'école":"Send to the school",
    "Envoyer par WhatsApp":"Send via WhatsApp",
    "Imprimer la fiche":"Print the form",
    "Documents scolaires":"School documents",
    "Billets de vacances":"Holiday supply lists",
    "Fermer":"Close",
    "Photographie précédente":"Previous photograph",
    "Photographie suivante":"Next photograph"
  };

  var textesOriginaux=new WeakMap();
  var titresPages={
    'index.html':'Complexe Scolaire Le Sage — Enrolment 2026-2027',
    'ecole.html':'The school — Complexe Scolaire Le Sage',
    'programmes.html':'Programmes and activities — Complexe Scolaire Le Sage',
    'galerie.html':'Gallery — Complexe Scolaire Le Sage',
    'inscription.html':'Enrolment 2026-2027 — Complexe Scolaire Le Sage',
    'contact.html':'Contact — Complexe Scolaire Le Sage'
  };
  var titreFrancais=document.title;

  function parcourirTextes(callback){
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var parent=node.parentElement;
      if(!parent||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(parent.tagName))return NodeFilter.FILTER_REJECT;
      if(!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var node;
    while((node=walker.nextNode()))callback(node);
  }

  function appliquerLangue(langue){
    parcourirTextes(function(node){
      if(!textesOriginaux.has(node))textesOriginaux.set(node,node.nodeValue);
      var original=textesOriginaux.get(node);
      if(langue==='fr'){
        node.nodeValue=original;
        return;
      }
      var propre=original.trim();
      var traduit=traductions[propre];
      if(traduit){
        var debut=original.match(/^\s*/)[0];
        var fin=original.match(/\s*$/)[0];
        node.nodeValue=debut+traduit+fin;
      }
    });
    document.documentElement.lang=langue;
    document.title=langue==='en'?(titresPages[ici]||'The Wise School International'):titreFrancais;
    var boutonsLangue=document.querySelectorAll('.lang-switch button');
    boutonsLangue.forEach(function(btn){
      var selectionne=btn.dataset.lang===langue;
      btn.classList.toggle('active',selectionne);
      btn.setAttribute('aria-pressed',selectionne?'true':'false');
    });
    try{localStorage.setItem(LANG_KEY,langue);}catch(e){}
  }

  var entete=document.querySelector('.entete');
  if(entete&&!entete.querySelector('.lang-switch')){
    var choixLangue=document.createElement('div');
    choixLangue.className='lang-switch';
    choixLangue.setAttribute('role','group');
    choixLangue.setAttribute('aria-label','Choisir la langue / Choose language');
    choixLangue.innerHTML='<button type="button" data-lang="fr" aria-label="Afficher le site en français">FR</button><button type="button" data-lang="en" aria-label="Display the website in English">EN</button>';
    entete.insertBefore(choixLangue,nav||null);
    choixLangue.addEventListener('click',function(e){
      var bouton=e.target.closest('button[data-lang]');
      if(bouton)appliquerLangue(bouton.dataset.lang);
    });
  }

  var langueInitiale='fr';
  try{langueInitiale=localStorage.getItem(LANG_KEY)||'fr';}catch(e){}
  appliquerLangue(langueInitiale==='en'?'en':'fr');

  var lb=document.getElementById('lb');
  if(lb){
    var img=document.getElementById('lb-img');
    var cap=document.getElementById('lb-cap');
    function ouvrir(source,texte){
      img.src=source;
      img.alt=texte||'';
      cap.textContent=texte||'';
      lb.classList.add('open');
      document.body.style.overflow='hidden';
    }
    function fermer(){
      lb.classList.remove('open');
      document.body.style.overflow='';
      img.removeAttribute('src');
    }
    Array.prototype.forEach.call(document.querySelectorAll('.zoomable'),function(el){
      el.setAttribute('tabindex','0');
      el.setAttribute('role','button');
      function action(){
        var im=el.tagName==='IMG'?el:el.querySelector('img');
        if(!im)return;
        var leg=el.querySelector('figcaption');
        ouvrir(im.getAttribute('src'),leg?leg.textContent.trim():im.alt);
      }
      el.addEventListener('click',action);
      el.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}
      });
    });
    lb.addEventListener('click',function(e){if(e.target!==img)fermer();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')fermer();});
  }

  var doux=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cibles=document.querySelectorAll('.apparait');
  if(doux||!('IntersectionObserver' in window)){
    Array.prototype.forEach.call(cibles,function(el){el.classList.add('vu');});
  }else{
    var obs=new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('vu');obs.unobserve(e.target);}
      });
    },{rootMargin:'0px 0px -55px 0px',threshold:.06});
    Array.prototype.forEach.call(cibles,function(el){obs.observe(el);});
  }
})();
