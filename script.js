'use strict';

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mX = 0, mY = 0, fX = 0, fY = 0;

if (cursor && cursorFollower) {
  document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    cursor.style.left = mX + 'px';
    cursor.style.top = mY + 'px';
  });
  (function tick() {
    fX += (mX - fX) * .12;
    fY += (mY - fY) * .12;
    cursorFollower.style.left = fX + 'px';
    cursorFollower.style.top = fY + 'px';
    requestAnimationFrame(tick);
  })();
}

/* ============================================================
   NAV SCROLL
   ============================================================ */
const nav = document.getElementById('nav');
const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================================
   HAMBURGER
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, duration = 1400) {
  const start = performance.now();
  const run = t => {
    const p = Math.min((t - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

const statsEl = document.querySelector('.hero-stats');
if (statsEl) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      entries[0].target.querySelectorAll('[data-target]').forEach(n => animateCounter(n, +n.dataset.target));
    }
  }, { threshold: 0.5 }).observe(statsEl);
}

/* ============================================================
   SCROLL SPY
   ============================================================ */
document.querySelectorAll('section[id]').forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 }).observe(s);
});

/* ============================================================
   SMOOTH ANCHOR SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* ============================================================
   PORTFOLIO FILTER
   ============================================================ */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active'); b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.portfolio-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
      if (show) card.style.animation = 'fadeInUp .35s ease forwards';
    });
  });
});

/* ============================================================
   DEPOIMENTOS — grade ou carrossel infinito
   Lê os .dep-card de #dep-cards-source e:
     < 4 cards  → grade normal
     >= 4 cards → carrossel infinito automático
   ============================================================ */
(function initDepoimentos() {
  const source = document.getElementById('dep-cards-source');
  const container = document.getElementById('dep-container');
  if (!source || !container) return;

  const cards = [...source.querySelectorAll('.dep-card')];
  if (!cards.length) return;

  const THRESHOLD = 4;

  if (cards.length < THRESHOLD) {
    // Grade normal
    const grid = document.createElement('div');
    grid.className = 'dep-grid';
    cards.forEach((card, i) => {
      const clone = card.cloneNode(true);
      clone.classList.add('reveal', ['', 'delay-1', 'delay-2'][i % 3]);
      grid.appendChild(clone);
    });
    container.appendChild(grid);
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  } else {
    // Carrossel infinito
    const wrap = document.createElement('div');
    wrap.className = 'dep-carousel-wrap reveal';

    const track = document.createElement('div');
    track.className = 'dep-track';

    // Originais
    cards.forEach(card => track.appendChild(card.cloneNode(true)));

    // Clones para loop
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    wrap.appendChild(track);
    container.appendChild(wrap);

    // Dots
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'carousel-dots';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
      dotsWrap.appendChild(dot);
    });
    container.appendChild(dotsWrap);

    revealObserver.observe(wrap);

    // Inicia carrossel após layout
    setTimeout(() => startCarousel(wrap, track, cards.length, dotsWrap), 250);
  }
})();

function startCarousel(wrap, track, count, dotsWrap) {
  const dots = [...dotsWrap.querySelectorAll('.carousel-dot')];
  let pos = 0, speed = 0.45, paused = false, activeDot = 0;
  let cardW = 0, setW = 0;

  function measure() {
    const first = track.firstElementChild;
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    cardW = first.offsetWidth + gap;
    setW = cardW * count;
  }
  measure();

  function updateDots(idx) {
    activeDot = idx;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { pos = -(i * cardW); updateDots(i); });
  });

  wrap.addEventListener('mouseenter', () => paused = true);
  wrap.addEventListener('mouseleave', () => paused = false);
  wrap.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  wrap.addEventListener('touchend', () => { setTimeout(() => paused = false, 2500); }, { passive: true });

  window.addEventListener('resize', () => {
    clearTimeout(wrap._resizeTimer);
    wrap._resizeTimer = setTimeout(measure, 200);
  });

  (function tick() {
    if (!paused) {
      pos -= speed;
      if (setW > 0 && pos <= -setW) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      if (setW > 0) {
        const idx = Math.floor(Math.abs(pos) % setW / cardW) % count;
        if (idx !== activeDot) updateDots(idx);
      }
    }
    requestAnimationFrame(tick);
  })();
}

/* ============================================================
   FORM — redireciona para WhatsApp
   ============================================================ */
const form = document.getElementById('contatoForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Enviando...'; btn.disabled = true;

    const nome = document.getElementById('nome').value.trim();
    const mail = document.getElementById('email').value.trim();
    const tipo = document.getElementById('tipo').value;
    const msg = document.getElementById('mensagem').value.trim();
    const tipos = { landing: 'Landing Page', institucional: 'Site Institucional', wordpress: 'Site WordPress', outro: 'Outro' };
    const wa = encodeURIComponent(`Olá Antonio! Me chamo ${nome}.\n\nE-mail: ${mail}\nTipo: ${tipos[tipo] || tipo}\n\n${msg}`);

    // Troque o número abaixo pelo seu WhatsApp real (com DDI e DDD, sem + ou espaços)
    const waNum = '5521994882394';

    setTimeout(() => {
      const ok = document.getElementById('formSuccess');
      if (ok) ok.classList.add('show');
      btn.textContent = 'Mensagem enviada!';
      setTimeout(() => window.open(`https://wa.me/${waNum}?text=${wa}`, '_blank'), 1200);
    }, 700);
  });
}

/* ============================================================
   KEYFRAMES INJETADOS
   ============================================================ */
const s = document.createElement('style');
s.textContent = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .nav-link.active { color: var(--white) !important; background: rgba(255,255,255,.06) !important; }
`;
document.head.appendChild(s);
