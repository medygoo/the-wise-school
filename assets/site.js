(function(){
  'use strict';

  ['assets/premium.css','assets/premium-layout.css'].forEach(function(href){
    if(!document.querySelector('link[href="'+href+'"]')){
      var style=document.createElement('link');
      style.rel='stylesheet';style.href=href;
      document.head.appendChild(style);
    }
  });

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
