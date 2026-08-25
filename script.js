// AquaMaster — Usługi Hydrauliczne
// Czysty JS, bez zależności: formularz Web3Forms, lightbox galerii, animacje przy scrollu.

(function () {
  'use strict';

  /* ---------- Animacje "reveal" przy scrollu ---------- */

  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Wysokosc paska -> zmienna CSS ---------- */

  function initHeaderHeight() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function apply() {
      var h = Math.round(header.getBoundingClientRect().height);
      if (h) document.documentElement.style.setProperty('--header-h', h + 'px');
    }

    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('load', apply);
  }

  /* ---------- Menu mobilne (hamburger) ---------- */

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Klik w link zamyka menu (kotwice na tej samej stronie)
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  /* ---------- Podswietlanie linku aktualnej sekcji ---------- */

  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.main-nav a.nav-link')
    ).filter(function (a) {
      return a.getAttribute('href').charAt(0) === '#';
    });
    if (!links.length) return;

    var sections = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) sections.push({ el: el, link: a });
    });
    if (!sections.length) return;

    function setActive(link) {
      links.forEach(function (a) {
        a.classList.toggle('is-active', a === link);
      });
    }

    // Klik od razu podswietla, bez czekania na przewiniecie
    links.forEach(function (a) {
      a.addEventListener('click', function () { setActive(a); });
    });

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].el === entry.target) setActive(sections[i].link);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s.el); });
  }

  /* ---------- Przycisk "wróć na górę" ---------- */

  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Formularz kontaktowy (Web3Forms) ---------- */

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('.form-submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      status.textContent = 'Wysyłamy…';
      status.className = 'form-status';
      submitBtn.disabled = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            status.textContent = 'Dziękujemy — oddzwonimy najszybciej jak się da.';
            status.className = 'form-status ok';
            form.reset();
          } else {
            status.textContent = 'Nie udało się wysłać. Zadzwoń: 518 802 375';
            status.className = 'form-status err';
          }
        })
        .catch(function () {
          status.textContent = 'Nie udało się wysłać. Zadzwoń: 518 802 375';
          status.className = 'form-status err';
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Lightbox galerii ---------- */

  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var img = document.getElementById('lightbox-img');
    var closeBtn = document.getElementById('lightbox-close');
    var prevBtn = document.getElementById('lightbox-prev');
    var nextBtn = document.getElementById('lightbox-next');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-src]'));
    var currentIndex = -1;

    if (!items.length) return;

    function open(index) {
      currentIndex = (index + items.length) % items.length;
      var el = items[currentIndex];
      img.src = el.getAttribute('data-lightbox-src');
      img.alt = el.querySelector('img') ? el.querySelector('img').alt : '';
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      img.src = '';
    }

    items.forEach(function (el, index) {
      el.addEventListener('click', function () { open(index); });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { open(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { open(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') open(currentIndex - 1);
      if (e.key === 'ArrowRight') open(currentIndex + 1);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeaderHeight();
    initReveal();
    initMobileNav();
    initScrollSpy();
    initBackToTop();
    initContactForm();
    initLightbox();
  });
})();
