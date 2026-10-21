/*
 * Shared by every page: fonts, global styles, language (EN/AR + RTL), header,
 * mobile drawer, footer, smooth scrolling and the page-transition wipe.
 */
import '@fontsource/lilita-one/400.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/baloo-bhaijaan-2/arabic-500.css';
import '@fontsource/baloo-bhaijaan-2/arabic-700.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { I18N, ORDER_URL, BRANCHES, SOCIAL } from './data.js';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- language ---------------- */
let lang = 'en';
try { lang = localStorage.getItem('grip-lang') || 'en'; } catch { /* storage unavailable */ }
if (!I18N[lang]) lang = 'en';
export const getLang = () => lang;
export const t = (k) => I18N[lang][k] ?? I18N.en[k] ?? '';
export const orderUrl = () => ORDER_URL[lang];

const langListeners = [];
export const onLang = (fn) => langListeners.push(fn);

/* ---------------- smooth scroll ---------------- */
export let lenis;
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function goTo(hash) {
  const target = $(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}

/* ---------------- shared chrome (header, drawer, footer) ---------------- */
let page = 'home';
const NAV = [
  { key: 'story', href: '/our-story/', label: 'nav.story' },
  { key: 'menu', href: '/menu/', label: 'nav.menu' },
  { key: 'leadership', href: '/leadership/', label: 'nav.leadership' },
  { key: 'locations', href: '/#locations', label: 'nav.locations' },
];

function chromeHtml() {
  const links = (cls) => NAV.map((n) => {
    const current = n.key === page;
    return `<a href="${n.href}" class="${cls}${current ? ' active' : ''}" data-nav="${n.key}"${current ? ' aria-current="page"' : ''}>${t(n.label)}</a>`;
  }).join('');
  return {
    header: `
      <a class="skip" href="#main">${t('nav.skip')}</a>
      <header class="nav" id="nav">
        <a class="nav-logo" href="/" aria-label="${t('a11y.home')}"><span class="logo-mask" role="img" aria-label="GRIP"></span></a>
        <nav class="nav-links" aria-label="Primary">${links('')}</nav>
        <div class="nav-actions">
          <button class="lang" type="button" id="langBtn">${t('a11y.lang')}</button>
          <a class="btn btn-sm js-order" target="_blank" rel="noopener">${t('cta.order')}</a>
          <button class="burger" type="button" id="burgerBtn" aria-expanded="false" aria-controls="drawer" aria-label="${t('a11y.menu')}"><span></span><span></span></button>
        </div>
      </header>
      <div class="drawer" id="drawer" hidden>
        <nav aria-label="Mobile">
          <a href="/" data-nav="home">${t('nav.home')}</a>
          ${links('')}
          <a class="btn btn-cream js-order" target="_blank" rel="noopener">${t('cta.order')}</a>
        </nav>
        <img class="drawer-chef" src="/brand/character-chef-flex.png" alt="" width="780" height="543" />
      </div>`,
    footer: `
      <footer class="foot">
        <img class="foot-chef" src="/brand/character-chef-curled.png" alt="" width="732" height="559" loading="lazy" />
        <div class="wrap foot-inner">
          <div class="foot-brand">
            <span class="logo-mask foot-logo" role="img" aria-label="GRIP"></span>
            <p>${t('foot.tag')}</p>
            <a class="btn btn-sm js-order" target="_blank" rel="noopener">${t('cta.order')}</a>
            <div class="foot-social">
              <span>${t('foot.follow')}</span>
              <a class="social-link" href="${SOCIAL.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="${t('a11y.instagram')}">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                <span dir="ltr">${SOCIAL.instagram.handle}</span>
              </a>
            </div>
          </div>
          <nav class="foot-col" aria-label="Footer">
            <h3>${t('foot.nav')}</h3>
            <a href="/">${t('nav.home')}</a>
            ${NAV.map((n) => `<a href="${n.href}">${t(n.label)}</a>`).join('')}
          </nav>
          <div class="foot-col">
            <h3>${t('foot.branches')}</h3>
            ${BRANCHES.map((b) => `<p><strong>${b.name}</strong><a href="tel:${b.tel}" dir="ltr">${b.phone}</a></p>`).join('')}
          </div>
        </div>
        <p class="foot-rights">${t('foot.rights')}</p>
      </footer>`,
  };
}

function renderChrome() {
  const { header, footer } = chromeHtml();
  const h = $('#site-header');
  const f = $('#site-footer');
  if (h) h.innerHTML = header;
  if (f) f.innerHTML = footer;
  $$('.js-order').forEach((a) => { a.href = ORDER_URL[lang]; });
  if (f && !reduce) {
    ScrollTrigger.getById('footchef')?.kill();
    gsap.fromTo('.foot-chef', { yPercent: 55 }, { yPercent: 0, ease: 'none', scrollTrigger: { id: 'footchef', trigger: '.foot', start: 'top 100%', end: 'top 70%', scrub: true } });
  }
}

export function applyLang() {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t(`title.${page}`) || document.title;
  renderChrome();
  $$('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (v) el.textContent = v; });
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('.js-order').forEach((a) => { a.href = ORDER_URL[lang]; });
  langListeners.forEach((fn) => fn(lang));
  ScrollTrigger.refresh();
}

/* ---------------- drawer ---------------- */
function openDrawer() {
  const d = $('#drawer');
  if (!d) return;
  d.hidden = false;
  document.body.classList.add('lock');
  $('#burgerBtn')?.setAttribute('aria-expanded', 'true');
  lenis?.stop();
}
export function closeDrawer() {
  const d = $('#drawer');
  if (!d || d.hidden) return;
  d.hidden = true;
  document.body.classList.remove('lock');
  $('#burgerBtn')?.setAttribute('aria-expanded', 'false');
  lenis?.start();
}

/* ---------------- page transition wipe ---------------- */
function mountWipe() {
  if (reduce) return;
  const w = document.createElement('div');
  w.className = 'wipe';
  w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<span class="logo-mask"></span>';
  document.body.appendChild(w); // reveal animation runs from CSS, so it can never get stuck
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    w.classList.remove('is-out');
    w.style.animation = 'none';
    void w.offsetWidth;
    w.style.animation = '';
  });
}

function navigateWithWipe(url) {
  const w = $('.wipe');
  if (!w || reduce) { location.href = url; return; }
  w.classList.add('is-out');
  setTimeout(() => { location.href = url; }, 480);
}

/* ---------------- global events (delegated, survive re-render) ---------------- */
document.addEventListener('click', (e) => {
  const burger = e.target.closest('#burgerBtn');
  if (burger) { ($('#drawer').hidden ? openDrawer : closeDrawer)(); return; }

  if (e.target.closest('#langBtn')) {
    lang = lang === 'en' ? 'ar' : 'en';
    try { localStorage.setItem('grip-lang', lang); } catch { /* ignore */ }
    applyLang();
    return;
  }

  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const href = a.getAttribute('href');
  if (/^(tel:|mailto:|https?:)/.test(href)) return;
  const url = new URL(href, location.href);
  if (url.origin !== location.origin) return;

  closeDrawer();
  const samePage = url.pathname === location.pathname;
  if (samePage && url.hash) {
    e.preventDefault();
    goTo(url.hash);
    history.replaceState(null, '', url.hash);
  } else if (samePage && !url.hash && !href.startsWith('#')) {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0 });
  } else if (!samePage) {
    e.preventDefault();
    navigateWithWipe(url.href);
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

/* ---------------- reveals ---------------- */
export function revealAll() {
  if (reduce) return;
  $$('[data-reveal]:not(.is-bound)').forEach((el) => {
    el.classList.add('is-bound');
    gsap.from(el, { y: 48, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}

/* ---------------- marquee (shared strip) ---------------- */
export function renderMarquee() {
  const track = $('.marquee-track');
  if (!track) return;
  const word = t('marquee');
  const chef = (n) => `<img class="mq-chef" src="/brand/character-chef-${n}.png" alt="" width="780" height="543" />`;
  const chunk = Array.from({ length: 6 }, () => `<span>${word}</span>${chef('curled')}<span class="o">GRIP</span>${chef('flex')}`).join('');
  track.innerHTML = chunk + chunk;
}

/* ---------------- init ---------------- */
export function initCore(pageKey) {
  page = pageKey;
  mountWipe();
  // header shadow once scrolled (created before page triggers; independent of pin spacing)
  ScrollTrigger.create({
    start: 40,
    onUpdate: (self) => $('#nav')?.classList.toggle('is-scrolled', self.scroll() > 40),
  });
  onLang(renderMarquee);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
