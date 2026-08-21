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
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
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
    initReveal();
    initContactForm();
    initLightbox();
  });
})();
