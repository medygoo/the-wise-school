(function(){
  'use strict';

  var APP_URL='https://medygoo.github.io/SchoolSafe-/';

  ['assets/premium.css','assets/premium-layout.css','assets/app-link.css','assets/equipe.css'].forEach(function(href){
    if(!document.querySelector('link[href="'+href+'"]')){
      var style=document.createElement('link');
      style.rel='stylesheet';style.href=href;
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

  if(!document.querySelector('.app-fab')){
    var fab=document.createElement('a');
    fab.className='app-fab';
    fab.href=APP_URL;
    fab.target='_blank';
    fab.rel='noopener';
    fab.setAttribute('aria-label','Ouvrir l’application SchoolSafe');
    fab.innerHTML='<span class="app-fab-etoile" aria-hidden="true">★</span><span><small>Espace numérique</small><b>Ouvrir SchoolSafe</b></span><span class="app-fab-fleche" aria-hidden="true">↗</span>';
    document.body.appendChild(fab);
  }

  /* L’équipe existait encore sur la page L’école, mais elle doit aussi être
     visible dès l’accueil. Les photos originales sont conservées telles quelles. */
  var pointEquipe=document.querySelector('.avantages-section');
  if(pointEquipe&&!document.querySelector('.equipe-accueil')){
    var equipe=document.createElement('section');
    equipe.className='section equipe-accueil';
    equipe.innerHTML='<div class="large">'+
      '<div class="apparait"><p class="eyebrow">Notre équipe</p><h2>Le corps administratif et les enseignants au service des enfants</h2><p class="equipe-intro">La Direction, la coordination pédagogique, les enseignants et le service de perception accompagnent les familles pendant toute l’année scolaire.</p></div>'+
      '<div class="equipe-grille">'+
        '<figure class="equipe-card apparait zoomable"><img src="img/promoteur.webp" alt="Promotion et Direction générale du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Promotion</b><span>Direction générale</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/directeur_primaire.webp" alt="Direction du cycle primaire" loading="lazy"><figcaption><b>Direction du primaire</b><span>Cycle primaire</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/dir_maternelle.webp" alt="Direction du cycle maternel" loading="lazy"><figcaption><b>Direction de la maternelle</b><span>Cycle maternel</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/coordinatrice.webp" alt="Coordination pédagogique de l’école" loading="lazy"><figcaption><b>Coordination pédagogique</b><span>Suivi des enseignements</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/teacher_luyeye.webp" alt="Enseignante du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Enseignement</b><span>Équipe pédagogique</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/teacher_manzambi.webp" alt="Enseignante du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Enseignement</b><span>Équipe pédagogique</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/teacher_tshimi.webp" alt="Enseignante du Complexe Scolaire Le Sage" loading="lazy"><figcaption><b>Enseignement</b><span>Équipe pédagogique</span></figcaption></figure>'+
        '<figure class="equipe-card apparait zoomable"><img src="img/perceptrice.webp" alt="Service de perception de l’école" loading="lazy"><figcaption><b>Perception</b><span>Frais scolaires et reçus</span></figcaption></figure>'+
      '</div>'+
      '<div class="equipe-suite apparait"><p>Les familles peuvent retrouver la présentation complète de l’établissement, son organisation et son dispositif d’encadrement.</p><a class="btn btn-or" href="ecole.html">Découvrir toute l’équipe →</a></div>'+
    '</div>';
    pointEquipe.parentNode.insertBefore(equipe,pointEquipe);
  }

  var header=document.querySelector('header');
  function headerAuDefilement(){if(header)header.classList.toggle('scrolled',window.scrollY>18)}
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

  var lb=document.getElementById('lb');
  if(lb){
    var img=document.getElementById('lb-img');
    var cap=document.getElementById('lb-cap');
    function ouvrir(source,texte){img.src=source;img.alt=texte||'';cap.textContent=texte||'';lb.classList.add('open');document.body.style.overflow='hidden'}
    function fermer(){lb.classList.remove('open');document.body.style.overflow='';img.removeAttribute('src')}
    Array.prototype.forEach.call(document.querySelectorAll('.zoomable'),function(el){
      el.setAttribute('tabindex','0');
      el.setAttribute('role','button');
      function action(){var im=el.tagName==='IMG'?el:el.querySelector('img');if(!im)return;var leg=el.querySelector('figcaption');ouvrir(im.getAttribute('src'),leg?leg.textContent.trim():im.alt)}
      el.addEventListener('click',action);
      el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();action()}});
    });
    lb.addEventListener('click',function(e){if(e.target!==img)fermer()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')fermer()});
  }

  var doux=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cibles=document.querySelectorAll('.apparait');
  if(doux||!('IntersectionObserver' in window)){
    Array.prototype.forEach.call(cibles,function(el){el.classList.add('vu')});
  }else{
    var obs=new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vu');obs.unobserve(e.target)}});
    },{rootMargin:'0px 0px -55px 0px',threshold:.06});
    Array.prototype.forEach.call(cibles,function(el){obs.observe(el)});
  }
})();
