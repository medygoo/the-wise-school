/* Le comportement du site — tout ce qu'il lui faut, et rien d'autre.
   L'ancien fichier portait une barre de progression, un parallaxe et des
   compteurs animés : 121 lignes de décor qui s'exécutaient à chaque
   défilement. Ici : le menu, l'apparition, l'année, la page courante. */
(function () {
  'use strict';

  // ── le menu du téléphone ──
  var b = document.querySelector('.bouton-menu');
  var n = document.querySelector('nav');
  if (b && n) {
    b.addEventListener('click', function () {
      var ouvert = n.classList.toggle('ouvert');
      b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    n.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { n.classList.remove('ouvert'); b.setAttribute('aria-expanded', 'false'); }
    });
  }

  // ── la page où l'on se trouve, marquée dans le menu ──
  var ici = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('nav a'), function (a) {
    if (a.getAttribute('href') === ici) a.setAttribute('aria-current', 'page');
  });

  // ── l'année, pour ne jamais laisser un pied de page périmé ──
  Array.prototype.forEach.call(document.querySelectorAll('[data-annee]'), function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ── la visionneuse : une photo s'ouvre en grand ──
  // Elle vit ici, dans le script commun, pour que TOUTE page qui porte le
  // bloc #lb en profite. Elle était enfermée dans le script du formulaire :
  // la galerie, qui est la page des photos, n'y avait pas droit.
  var lb = document.getElementById('lb');
  if (lb) {
    var img = document.getElementById('lb-img'), cap = document.getElementById('lb-cap');
    var ouvrir = function (source, texte) {
      // La grande version, pas la vignette : `currentSrc` donne celle que le
      // navigateur a réellement choisie, qui peut être la petite.
      img.src = source; cap.textContent = texte || '';
      lb.classList.add('open'); document.body.style.overflow = 'hidden';
    };
    var fermer = function () { lb.classList.remove('open'); document.body.style.overflow = ''; };
    Array.prototype.forEach.call(document.querySelectorAll('.zoomable'), function (el) {
      el.addEventListener('click', function () {
        var im = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (!im) return;
        var leg = el.querySelector('.legende b');
        ouvrir(im.getAttribute('src'), leg ? leg.textContent : im.alt);
      });
    });
    lb.addEventListener('click', function (e) { if (e.target !== img) fermer(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
  }

  // ── le diaporama de l'accueil ──
  //
  //  Loms, 5 août 2026 : « les photos doivent changer à l'accueil après
  //  5 secondes ».
  //
  //  Trois choses qui décident de tout :
  //
  //  1. Le voile de `.heros::after` ne bouge JAMAIS. Le contraste a été
  //     mesuré contre le pire cas — une photographie entièrement blanche —
  //     et il tient donc pour toutes les photos, y compris la plus claire.
  //     Une photo qui apporterait son propre voile romprait cette garantie.
  //  2. Rien ne démarre tant que la photo suivante n'est pas CHARGÉE. Sur
  //     une connexion lente, un fondu vers une image absente donne un écran
  //     nu pendant deux secondes — pire que pas de diaporama du tout.
  //  3. Le défilement s'arrête quand l'onglet passe en arrière-plan : un
  //     minuteur qui tourne dans un onglet caché consomme la batterie du
  //     téléphone sans que personne ne regarde.
  var douxMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var heros = document.querySelectorAll('.heros img.fond');
  var points = document.querySelector('.heros-points');
  if (heros.length > 1 && !douxMq.matches) {
    var courant = 0, minuteur = null;
    var DELAI = 5000;

    // Les pastilles se construisent ici et pas dans le HTML : s'il n'y a
    // qu'une photo, ou si le script ne s'exécute pas, aucune pastille morte
    // ne reste à l'écran.
    var pastilles = [];
    if (points) {
      Array.prototype.forEach.call(heros, function (im, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Photographie ' + (i + 1) + ' sur ' + heros.length);
        b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        b.addEventListener('click', function () { montrer(i); relancer(); });
        points.appendChild(b);
        pastilles.push(b);
      });
    }

    var montrer = function (i) {
      heros[courant].classList.remove('on');
      courant = (i + heros.length) % heros.length;
      heros[courant].classList.add('on');
      pastilles.forEach(function (b, k) { b.setAttribute('aria-current', k === courant ? 'true' : 'false'); });
      // La suivante est demandée MAINTENANT, pour qu'elle soit prête dans
      // cinq secondes plutôt que chargée au moment de l'afficher.
      var next = heros[(courant + 1) % heros.length];
      if (next.loading === 'lazy') next.loading = 'eager';
    };

    var pret = function (im) { return im.complete && im.naturalWidth > 0; };
    var avancer = function () {
      var suivante = heros[(courant + 1) % heros.length];
      if (!pret(suivante)) {
        // Pas encore là : on la laisse arriver et on repasse dans 1 s.
        // On ne saute PAS une photo — l'école les a toutes choisies.
        minuteur = setTimeout(avancer, 1000);
        return;
      }
      montrer(courant + 1);
      minuteur = setTimeout(avancer, DELAI);
    };
    var relancer = function () { clearTimeout(minuteur); minuteur = setTimeout(avancer, DELAI); };

    montrer(0);
    relancer();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(minuteur); else relancer();
    });
    // Si l'appareil demande le calme en cours de route, on s'arrête.
    var stop = function () { if (douxMq.matches) clearTimeout(minuteur); };
    if (douxMq.addEventListener) douxMq.addEventListener('change', stop);
    else if (douxMq.addListener) douxMq.addListener(stop);
  }

  // ── l'apparition au défilement, si l'appareil ne s'y oppose pas ──
  var doux = douxMq.matches;
  var cibles = document.querySelectorAll('.apparait');
  if (doux || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cibles, function (el) { el.classList.add('vu'); });
    return;
  }
  // Les blocs d'une même rangée arrivent l'un après l'autre : c'est ce
  // décalage qui donne l'impression de vie, plutôt qu'un bloc qui tombe.
  // Le retard est plafonné — au-delà de quatre, on attendrait pour rien.
  Array.prototype.forEach.call(document.querySelectorAll('.grille, .ww-grid'), function (g) {
    var enfants = g.querySelectorAll(':scope > .apparait');
    Array.prototype.forEach.call(enfants, function (el, i) {
      if (i > 0) el.style.setProperty('--retard', Math.min(i, 4) * 90 + 'ms');
    });
  });

  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: .05 });
  Array.prototype.forEach.call(cibles, function (el) { obs.observe(el); });
})();
