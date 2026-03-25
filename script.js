/* ============================================================
   AL DESENVOLVIMENTO WEB — script.js
   ============================================================ */

'use strict';

/* ============================================================
   FIREBASE INIT
   ============================================================ */
let db, storage, firebaseReady = false;

try {
  if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey !== 'COLE_AQUI') {
    firebase.initializeApp(firebaseConfig);
    db      = firebase.firestore();
    storage = firebase.storage();
    firebaseReady = true;
  }
} catch (e) {
  console.warn('Firebase não iniciado.', e);
}

/* ============================================================
   XSS PROTECTION
   ============================================================ */
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = String(str || '');
  return div.innerHTML;
}

/* ============================================================
   DEFAULTS
   ============================================================ */
const DEFAULT_PORTFOLIO = [
  { id:'0', title:'Dominique Personalizados', tag:'Landing Page',     desc:'Landing page focada em conversão para loja de brindes e presentes personalizados.', link:'', image:'', category:'landing',       techs:['HTML','CSS','JS'], order:0 },
  { id:'1', title:"Favela's Barber Shop",     tag:'Site Institucional', desc:'Site para barbearia com galeria de trabalhos e agendamento via WhatsApp.',        link:'', image:'', category:'institucional', techs:['HTML','CSS','JS'], order:1 },
  { id:'2', title:'Padaria Dona Eugênia',     tag:'Site Institucional', desc:'Site com cardápio digital, localização e contato para padaria local.',             link:'', image:'', category:'institucional', techs:['HTML','CSS','JS'], order:2 },
  { id:'3', title:'CEVIM',                    tag:'Site Institucional', desc:'Demo de site para escola com apresentação institucional e captação de matrículas.',link:'', image:'', category:'institucional', techs:['HTML','CSS','JS'], order:3 },
];

const DEFAULT_TESTIMONIALS = [
  { id:'0', name:'Dominique', company:'Dominique Personalizados', text:'O site ficou exatamente como eu imaginava. Antonio entendeu meu negócio e entregou antes do prazo. Meus clientes adoraram.', rating:5 },
  { id:'1', name:'Favela',    company:"Favela's Barber Shop",    text:'Profissional, direto ao ponto e comunicação excelente. O site trouxe novos clientes logo na primeira semana.',                rating:5 },
  { id:'2', name:'Eugênia',   company:'Padaria Dona Eugênia',   text:'Não entendia nada de site e ele foi paciente em tudo. Ficou lindo, aparece no Google e os clientes me encontram.',            rating:5 },
];

/* ============================================================
   LOAD SITE DATA
   ============================================================ */
async function initSite() {
  if (!firebaseReady) {
    renderPortfolio(DEFAULT_PORTFOLIO);
    renderTestimonials(DEFAULT_TESTIMONIALS);
    return;
  }

  try {
    const configSnap = await db.collection('config').doc('main').get();
    if (configSnap.exists) applyConfig(configSnap.data());

    const pfSnap = await db.collection('portfolio').orderBy('order').get();
    const portfolio = pfSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderPortfolio(portfolio.length ? portfolio : DEFAULT_PORTFOLIO);

    const depSnap = await db.collection('testimonials').orderBy('order').get();
    const deps = depSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTestimonials(deps.length ? deps : DEFAULT_TESTIMONIALS);

  } catch (e) {
    console.warn('Erro Firebase. Usando dados padrão.', e);
    renderPortfolio(DEFAULT_PORTFOLIO);
    renderTestimonials(DEFAULT_TESTIMONIALS);
  }
}

/* ============================================================
   APPLY CONFIG (Firebase → página)
   IMPORTANTE: a logo local (./assets/...) já está no src do HTML.
   Aqui só substituímos o src se o Firebase tiver uma logo cadastrada.
   Nunca escondemos a imagem — sem texto duplicado.
   ============================================================ */
function applyConfig(d) {
  // Logo: só atualiza o src se Firebase tiver uma URL salva
  if (d.logo) {
    const navImg    = document.getElementById('site-logo-nav');
    const footerImg = document.getElementById('site-logo-footer');
    if (navImg)    navImg.src    = d.logo;
    if (footerImg) footerImg.src = d.logo;
  }

  // Foto sobre mim
  if (d.aboutPhoto) {
    const img = document.getElementById('about-photo');
    const ph  = document.getElementById('photo-fallback');
    if (img) { img.src = d.aboutPhoto; img.style.display = 'block'; }
    if (ph)  ph.style.display = 'none';
  }

  // Textos
  if (d.aboutDesc1) setText('about-desc-1', d.aboutDesc1);
  if (d.aboutDesc2) setText('about-desc-2', d.aboutDesc2);

  // Preços
  if (d.prices) {
    if (d.prices.starter)  setText('price-starter',  d.prices.starter);
    if (d.prices.pro)      setText('price-pro',       d.prices.pro);
    if (d.prices.business) setText('price-business',  d.prices.business);
  }

  // Contato
  if (d.contact) {
    if (d.contact.phone)    setText('contact-phone',    d.contact.phone);
    if (d.contact.email)    setText('contact-email',    d.contact.email);
    if (d.contact.location) setText('contact-location', d.contact.location);
    if (d.contact.whatsapp) {
      const link = document.getElementById('whatsapp-link');
      if (link) link.href = `https://wa.me/${d.contact.whatsapp}?text=Ol%C3%A1%20Antonio!%20Quero%20um%20or%C3%A7amento.`;
    }
    if (d.contact.email) {
      const link = document.getElementById('email-link');
      if (link) link.href = `mailto:${d.contact.email}`;
    }
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ============================================================
   RENDER PORTFOLIO
   ============================================================ */
const THUMB_CLASSES = ['ct-1','ct-2','ct-3','ct-4','ct-5','ct-6'];

function renderPortfolio(items) {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!items || !items.length) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;grid-column:1/-1">Nenhum projeto ainda.</p>';
    return;
  }

  items.forEach((proj, i) => {
    const thumbClass = THUMB_CLASSES[i % THUMB_CLASSES.length];
    const hasImage   = proj.image && proj.image.trim();
    const hasLink    = proj.link  && proj.link.trim();
    const techs      = Array.isArray(proj.techs) ? proj.techs : ['HTML','CSS','JS'];

    const card = document.createElement('div');
    card.className        = 'portfolio-card reveal';
    card.dataset.category = sanitize(proj.category || 'institucional');

    card.innerHTML = `
      <div class="card-thumb ${thumbClass}">
        <div class="card-overlay">
          ${hasLink
            ? `<a href="${sanitize(proj.link)}" class="card-link-btn" target="_blank" rel="noopener noreferrer">Ver projeto</a>`
            : `<span class="card-link-btn" style="opacity:.4;cursor:default">Em breve</span>`}
        </div>
        ${hasImage
          ? `<img class="card-project-img" src="${sanitize(proj.image)}" alt="${sanitize(proj.title)}" style="display:block" loading="lazy" />`
          : `<div class="card-mock"><div class="cm-header"></div><div class="cm-body"><div class="cm-block b1"></div><div class="cm-block b2"></div></div></div>`}
      </div>
      <div class="card-info">
        <span class="card-tag">${sanitize(proj.tag || 'Projeto')}</span>
        <h3 class="card-title">${sanitize(proj.title)}</h3>
        <p class="card-desc">${sanitize(proj.desc)}</p>
        <div class="card-techs">${techs.map(t => `<span>${sanitize(t)}</span>`).join('')}</div>
      </div>`;

    grid.appendChild(card);
  });

  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter) applyFilter(activeFilter.dataset.filter);
}

/* ============================================================
   RENDER TESTIMONIALS
   ============================================================ */
const CAROUSEL_THRESHOLD = 4;
let carouselInstance = null;

function renderTestimonials(items) {
  const container = document.getElementById('dep-container');
  if (!container) return;
  container.innerHTML = '';

  if (!items || !items.length) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">Nenhum depoimento ainda.</p>';
    return;
  }

  if (items.length >= CAROUSEL_THRESHOLD) {
    renderCarousel(container, items);
  } else {
    renderDepGrid(container, items);
  }
}

function buildDepCard(dep) {
  const stars    = '★'.repeat(Math.max(1, Math.min(5, dep.rating || 5)));
  const initials = (dep.name || 'C').charAt(0).toUpperCase();
  const div = document.createElement('div');
  div.className = 'dep-card';
  div.innerHTML = `
    <div class="dep-stars" aria-label="${dep.rating || 5} estrelas">${sanitize(stars)}</div>
    <p class="dep-text">${sanitize(dep.text)}</p>
    <div class="dep-author">
      <div class="dep-avatar" aria-hidden="true">${sanitize(initials)}</div>
      <div>
        <strong>${sanitize(dep.name)}</strong>
        <span>${sanitize(dep.company)}</span>
      </div>
    </div>`;
  return div;
}

function renderDepGrid(container, items) {
  const grid = document.createElement('div');
  grid.className = 'dep-grid';
  items.forEach((dep, i) => {
    const card = buildDepCard(dep);
    card.classList.add('reveal', ['','delay-1','delay-2'][i % 3]);
    grid.appendChild(card);
  });
  container.appendChild(grid);
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function renderCarousel(container, items) {
  const wrap  = document.createElement('div');
  wrap.className = 'dep-carousel-wrap reveal';

  const track = document.createElement('div');
  track.className = 'dep-track';
  items.forEach(dep => track.appendChild(buildDepCard(dep)));
  wrap.appendChild(track);
  container.appendChild(wrap);

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'carousel-dots';
  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
    dotsWrap.appendChild(dot);
  });
  container.appendChild(dotsWrap);
  revealObserver.observe(wrap);

  setTimeout(() => {
    if (carouselInstance) carouselInstance.destroy();
    carouselInstance = new InfiniteCarousel(wrap, track, items.length, dotsWrap);
  }, 200);
}

/* ============================================================
   INFINITE CAROUSEL
   ============================================================ */
class InfiniteCarousel {
  constructor(wrap, track, count, dotsWrap) {
    this.wrap      = wrap;
    this.track     = track;
    this.count     = count;
    this.dotsWrap  = dotsWrap;
    this.dots      = dotsWrap ? [...dotsWrap.querySelectorAll('.carousel-dot')] : [];
    this.pos       = 0;
    this.speed     = 0.45;
    this.paused    = false;
    this.raf       = null;
    this.activeDot = 0;
    this._clone();
    this._bindEvents();
    this._tick();
  }

  _clone() {
    [...this.track.children].forEach(el => {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      this.track.appendChild(clone);
    });
    this._measure();
  }

  _measure() {
    const first = this.track.firstElementChild;
    if (!first) return;
    const gap   = parseFloat(getComputedStyle(this.track).gap) || 20;
    this.cardW  = first.offsetWidth + gap;
    this.setW   = this.cardW * this.count;
  }

  _bindEvents() {
    this.wrap.addEventListener('mouseenter', () => this.paused = true);
    this.wrap.addEventListener('mouseleave', () => this.paused = false);
    this.wrap.addEventListener('touchstart', () => { this.paused = true; }, { passive: true });
    this.wrap.addEventListener('touchend',   () => { setTimeout(() => this.paused = false, 2500); }, { passive: true });
    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { this.pos = -(i * this.cardW); this._updateDots(i); });
    });
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._measure(), 200);
    });
  }

  _updateDots(index) {
    this.activeDot = index;
    this.dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  _tick() {
    if (!this.paused) {
      this.pos -= this.speed;
      if (this.setW > 0 && this.pos <= -this.setW) this.pos = 0;
      this.track.style.transform = `translateX(${this.pos}px)`;
      if (this.dots.length && this.setW > 0) {
        const idx = Math.floor(Math.abs(this.pos) % this.setW / this.cardW) % this.count;
        if (idx !== this.activeDot) this._updateDots(idx);
      }
    }
    this.raf = requestAnimationFrame(() => this._tick());
  }

  destroy() { if (this.raf) cancelAnimationFrame(this.raf); }
}

/* ============================================================
   PORTFOLIO FILTER
   ============================================================ */
function applyFilter(filter) {
  document.querySelectorAll('.portfolio-card').forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.style.display = show ? '' : 'none';
    if (show) card.style.animation = 'fadeInUp .35s ease forwards';
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    applyFilter(btn.dataset.filter);
  });
});

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mX = 0, mY = 0, fX = 0, fY = 0;

if (cursor && cursorFollower) {
  document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    cursor.style.left = mX + 'px';
    cursor.style.top  = mY + 'px';
  });
  (function tick() {
    fX += (mX - fX) * .12;
    fY += (mY - fY) * .12;
    cursorFollower.style.left = fX + 'px';
    cursorFollower.style.top  = fY + 'px';
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
const navLinks  = document.getElementById('navLinks');

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
  const update = t => {
    const p = Math.min((t - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
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
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 }).observe(...document.querySelectorAll('section[id]') || []);

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
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* ============================================================
   FORM SUBMIT
   ============================================================ */
const form = document.getElementById('contatoForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = form.querySelector('.form-submit');
    btn.textContent = 'Enviando...'; btn.disabled = true;

    const nome  = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const tipo  = document.getElementById('tipo').value;
    const msg   = document.getElementById('mensagem').value.trim();
    const labels = { landing:'Landing Page', institucional:'Site Institucional', wordpress:'Site WordPress', outro:'Outro' };
    const wa    = encodeURIComponent(`Olá Antonio! Me chamo ${nome}.\n\nE-mail: ${email}\nTipo: ${labels[tipo]||tipo}\n\n${msg}`);

    let waNum = '5521994882394';
    if (firebaseReady) {
      try {
        const snap = await db.collection('config').doc('main').get();
        if (snap.exists && snap.data().contact?.whatsapp) waNum = snap.data().contact.whatsapp;
      } catch {}
    }

    setTimeout(() => {
      const success = document.getElementById('formSuccess');
      if (success) success.classList.add('show');
      btn.textContent = 'Mensagem enviada!';
      setTimeout(() => window.open(`https://wa.me/${waNum}?text=${wa}`, '_blank'), 1200);
    }, 700);
  });
}

/* ============================================================
   KEYFRAMES
   ============================================================ */
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .nav-link.active { color: var(--white) !important; background: rgba(255,255,255,.06) !important; }
`;
document.head.appendChild(styleEl);

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', initSite);
