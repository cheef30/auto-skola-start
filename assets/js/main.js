/* Auto škola START — interakcije */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header shadow ---------- */
  const header = document.querySelector('.header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.nav a').forEach((a) =>
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- dropdown (klik za touch/tastaturu) ---------- */
  document.querySelectorAll('.dropdown').forEach((dd) => {
    const btn = dd.querySelector('button');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target)) {
        dd.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- hero slider ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero__slide')];
    const dots = [...hero.querySelectorAll('.hero__dot')];
    const title = hero.querySelector('[data-hero-title]');
    const lead = hero.querySelector('[data-hero-lead]');
    let i = 0;
    let timer;

    const go = (n) => {
      slides[i].classList.remove('is-active');
      dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      // restart dot animation
      void dots[i].offsetWidth;
      dots[i].classList.add('is-active');

      [title, lead].forEach((el) => el.classList.add('is-out'));
      setTimeout(() => {
        title.innerHTML = slides[i].dataset.title;
        lead.textContent = slides[i].dataset.lead;
        [title, lead].forEach((el) => el.classList.remove('is-out'));
      }, 450);
    };
    const start = () => {
      clearInterval(timer);
      if (!reduced) timer = setInterval(() => go(i + 1), 6000);
    };
    dots.forEach((d, n) => d.addEventListener('click', () => { if (n !== i) go(n); start(); }));
    start();
  }

  /* ---------- reveal + counters ---------- */
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const bar = el.closest('.stat')?.querySelector('.stat__bar i');
    if (bar) bar.style.width = target + '%';
    if (reduced) { el.firstChild.nodeValue = target; return; }
    const t0 = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.firstChild.nodeValue = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.dataset.count) animateCount(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, [data-count]').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }

  /* ---------- video (učitava YouTube tek na klik) ---------- */
  document.querySelectorAll('[data-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.video}?autoplay=1&rel=0`;
      f.title = 'Kako položiti vozački ispit';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.parentElement.appendChild(f);
      btn.remove();
    });
  });

  /* ---------- vaučer popup ---------- */
  const popup = document.querySelector('.popup');
  if (popup) {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('voucher-closed') === '1'; } catch (e) {}
    if (!dismissed) setTimeout(() => popup.classList.add('is-visible'), 4500);
    popup.querySelector('.popup__close').addEventListener('click', () => {
      popup.classList.remove('is-visible');
      try { sessionStorage.setItem('voucher-closed', '1'); } catch (e) {}
    });
  }

  /* ---------- galerija lightbox ---------- */
  const items = [...document.querySelectorAll('.gallery__item')];
  const lb = document.querySelector('.lightbox');
  if (items.length && lb) {
    const img = lb.querySelector('img');
    let cur = 0;
    const show = (n) => {
      cur = (n + items.length) % items.length;
      const src = items[cur].querySelector('img');
      img.src = src.src;
      img.alt = src.alt;
    };
    const open = (n) => { show(n); lb.classList.add('is-open'); lb.querySelector('.lightbox__close').focus(); };
    const close = () => { lb.classList.remove('is-open'); items[cur].focus(); };
    items.forEach((it, n) => it.addEventListener('click', () => open(n)));
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', () => show(cur - 1));
    lb.querySelector('.lightbox__next').addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- formular (otvara email klijent) ---------- */
  const form = document.querySelector('[data-signup]');
  if (form) {
    const params = new URLSearchParams(location.search);
    if (params.get('vaucer') !== null) {
      const note = form.querySelector('[name="poruka"]');
      if (note && !note.value) note.value = 'Želim da iskoristim vaučer od 50€ za upis preko sajta.';
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const body =
        `Ime i prezime: ${d.get('ime')}\n` +
        `Telefon: ${d.get('telefon')}\n` +
        `Email: ${d.get('email') || '-'}\n` +
        `Kategorija: ${d.get('kategorija') || '-'}\n\n` +
        `${d.get('poruka') || ''}`;
      location.href =
        'mailto:info@startautoskola.rs?subject=' +
        encodeURIComponent('Online prijava — ' + d.get('ime')) +
        '&body=' + encodeURIComponent(body);
      form.querySelector('.form__ok').classList.add('is-visible');
    });
  }

  /* ---------- godina u footeru ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
