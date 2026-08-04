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

  // ── l'apparition au défilement, si l'appareil ne s'y oppose pas ──
  var doux = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cibles = document.querySelectorAll('.apparait');
  if (doux || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cibles, function (el) { el.classList.add('vu'); });
    return;
  }
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: .05 });
  Array.prototype.forEach.call(cibles, function (el) { obs.observe(el); });
})();
