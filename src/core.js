/*
 * Shared by every page: fonts, global styles, language (EN/AR + RTL), header,
 * mobile drawer, footer, smooth scrolling and the page-transition wipe.
 */
import './styles.css';
import './xl.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { I18N, ORDER_URL, BRANCHES, SOCIAL } from './data.js';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- language: decided by the page URL (/ = English, /ar/ = Arabic) ---------------- */
let lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
export const getLang = () => lang;
export const t = (k) => I18N[lang][k] ?? I18N.en[k] ?? '';
export const orderUrl = () => ORDER_URL[lang];
/** prefix an internal path with the current language ('/menu/' -> '/ar/menu/') */
export const lp = (path) => (lang === 'ar' ? '/ar' : '') + path;
const otherLangUrl = () => {
  const p = location.pathname;
  return lang === 'ar' ? p.replace(/^\/ar(\/|$)/, '/') || '/' : '/ar' + (p === '/' ? '/' : p);
};

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
  { key: 'story', path: '/our-story/', label: 'nav.story' },
  { key: 'menu', path: '/menu/', label: 'nav.menu' },
  { key: 'leadership', path: '/leadership/', label: 'nav.leadership' },
  { key: 'locations', path: '/#locations', label: 'nav.locations' },
];

function chromeHtml() {
  const links = (cls) => NAV.map((n) => {
    const current = n.key === page;
    return `<a href="${lp(n.path)}" class="${cls}${current ? ' active' : ''}" data-nav="${n.key}"${current ? ' aria-current="page"' : ''}>${t(n.label)}</a>`;
  }).join('');
  return {
    header: `
      <a class="skip" href="#main">${t('nav.skip')}</a>
      <header class="nav" id="nav">
        <a class="nav-logo" href="${lp('/')}" aria-label="${t('a11y.home')}"><span class="logo-mask" role="img" aria-label="GRIP"></span></a>
        <nav class="nav-links" aria-label="Primary">${links('')}</nav>
        <div class="nav-actions">
          <a class="lang" id="langBtn" href="${otherLangUrl()}" hreflang="${lang === 'ar' ? 'en' : 'ar'}" lang="${lang === 'ar' ? 'en' : 'ar'}">${t('a11y.lang')}</a>
          <a class="btn btn-sm js-order" target="_blank" rel="noopener">${t('cta.order')}</a>
          <button class="burger" type="button" id="burgerBtn" aria-expanded="false" aria-controls="drawer" aria-label="${t('a11y.menu')}"><span></span><span></span></button>
        </div>
      </header>
      <div class="drawer" id="drawer" hidden>
        <nav aria-label="Mobile">
          <a href="${lp('/')}" data-nav="home">${t('nav.home')}</a>
          ${links('')}
          <a class="btn btn-cream js-order" target="_blank" rel="noopener">${t('cta.order')}</a>
        </nav>
        <img class="drawer-chef" src="/brand/character-chef-flex.png" alt="" width="780" height="543" />
      </div>
      ${page === 'menu' ? '' : `<a class="fab-menu" href="${lp('/menu/')}" aria-label="${t('fab.menu')}">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10a8 6 0 0 1 16 0z"/><path d="M3 14h18"/><path d="M5 14l1 1.5h12L19 14"/><path d="M5 18h14a1.5 1.5 0 0 1-1.5 2h-11A1.5 1.5 0 0 1 5 18z"/></svg>
        <span>${t('nav.menu')}</span>
      </a>`}`,
    footer: `
      <footer class="foot">
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
              <a class="social-link" href="${SOCIAL.tiktok.url}" target="_blank" rel="noopener noreferrer" aria-label="${t('a11y.tiktok')}">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                <span dir="ltr">${SOCIAL.tiktok.handle}</span>
              </a>
            </div>
          </div>
          <nav class="foot-col" aria-label="Footer">
            <h3>${t('foot.nav')}</h3>
            <a href="${lp('/')}">${t('nav.home')}</a>
            ${NAV.map((n) => `<a href="${lp(n.path)}">${t(n.label)}</a>`).join('')}
            <a href="${lp('/smash-burger-salalah/')}">${t('nav.landing')}</a>
          </nav>
          <div class="foot-col">
            <h3>${t('foot.branches')}</h3>
            ${BRANCHES.map((b) => `<p><strong>${b.name}</strong><a href="tel:${b.tel}" dir="ltr">${b.phone}</a></p>`).join('')}
          </div>
        </div>
        <div class="foot-rights">
          <p>${t('foot.rights')}</p>
          <p class="foot-credit">${t('foot.credit')} <strong>Glomark</strong></p>
          <a class="foot-admin" href="/admin/" rel="nofollow">${t('foot.admin')}</a>
        </div>
      </footer>`,
  };
}

function renderChrome() {
  const { header, footer } = chromeHtml();
  const h = $('#site-header');
  const f = $('#site-footer');
  if (h) h.innerHTML = header;
  if (f) f.innerHTML = footer;
  $$('.js-order').forEach((a) => { a.href = ORDER_URL[lang]; a.removeAttribute('target'); a.removeAttribute('rel'); });
}

/* escape text, then turn **phrase** into bold */
const fmt = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

export function applyLang() {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  renderChrome();
  $$('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (v) el.innerHTML = fmt(v); });
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('.js-order').forEach((a) => { a.href = ORDER_URL[lang]; a.removeAttribute('target'); a.removeAttribute('rel'); });
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

/* ---------------- branch cards (home + landing page) ---------------- */
export function renderBranchCards(el) {
  if (!el) return;
  el.innerHTML = BRANCHES.map((b, i) => `
    <article class="branch" data-reveal>
      <img class="branch-chef wob" src="/brand/character-chef-${i % 2 ? 'burger-box' : 'curled'}.png" alt="" width="735" height="745" loading="lazy" />
      <h3>${b.name}</h3>
      <p class="branch-city">${t('loc.city')}</p>
      <p class="branch-addr" dir="ltr">${b.address}</p>
      <a class="branch-tel" href="tel:${b.tel}" dir="ltr">${b.phone}</a>
      <div class="branch-cta">
        <a class="btn btn-cream" href="${b.maps}" target="_blank" rel="noopener">${t('cta.directions')}</a>
        <a class="btn btn-ghost" href="tel:${b.tel}">${t('cta.call')}</a>
        <a class="btn btn-ghost" href="${ORDER_URL[lang]}">${t('cta.orderOnline')}</a>
      </div>
    </article>`).join('');
  revealAll();
}

/* ---------------- marquee (shared strip) ---------------- */
export function renderMarquee() {
  const track = $('.marquee-track');
  if (!track) return;
  // brand artwork, never retyped: official 'smashburger' script + GRIP wordmark sticker
  const word = '<img class="mq-word" src="/brand/script-smashburger-arc.webp" alt="" width="2000" height="769" />';
  const logo = '<img class="mq-logo" src="/brand/logo-grip-sticker-outline.png" alt="" width="874" height="563" />';
  const chef = (n) => `<img class="mq-chef" src="/brand/character-chef-${n}.png" alt="" width="780" height="543" />`;
  const chunk = Array.from({ length: 6 }, () => `${word}${chef('curled')}${logo}${chef('flex')}`).join('');
  track.innerHTML = chunk + chunk;
}

/* Home, phones only: the hero's "Explore the menu" button travels to the corner and turns into the floating Menu button
   (same pill, colours swap cream -> orange, label swaps to icon + "Menu"). */
let flyer = null;
function flyMenuButton() {
  if (page !== 'home' || reduce || flyer || !window.matchMedia('(max-width: 767px)').matches) return;
  const fab = document.querySelector('.fab-menu');
  const btn = document.querySelector('.hero-cta .btn');
  if (!fab || !btn) return;
  const from = btn.getBoundingClientRect();
  const cta = btn.closest('.hero-cta');
  if (from.width < 10 || from.bottom < 0 || from.top > window.innerHeight || parseFloat(getComputedStyle(cta).opacity) < 0.3) return;

  // where the floating button will sit
  fab.classList.add('fab-fly');
  fab.style.opacity = '0';
  fab.style.translate = '0 0';
  const to = fab.getBoundingClientRect();
  fab.style.translate = '';

  const cs = getComputedStyle(btn);
  const fcs = getComputedStyle(fab);
  const startOpacity = parseFloat(getComputedStyle(cta).opacity) || 1;
  const SH_START = '0 0 0 0 rgba(26, 11, 6, 0), 0 5px 0 0 rgba(26, 11, 6, 0.28)';
  const SH_END = '0 8px 22px 0 rgba(26, 11, 6, 0.35), 0 4px 0 0 rgba(26, 11, 6, 0.25)';
  flyer = document.createElement('div');
  flyer.className = 'fab-flyer';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.innerHTML = `<span class="ff-a">${btn.textContent.trim()}</span><span class="ff-b">${fab.innerHTML}</span>`;
  Object.assign(flyer.style, {
    left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    background: cs.backgroundColor, color: cs.color, borderColor: cs.borderTopColor,
    fontSize: cs.fontSize, letterSpacing: cs.letterSpacing, boxShadow: SH_START, opacity: String(startOpacity),
  });
  // the Menu label keeps the floating button's own inner padding so the final hand-off is pixel-exact
  const ffb = flyer.querySelector('.ff-b');
  ffb.style.paddingInlineStart = fcs.paddingInlineStart;
  ffb.style.paddingInlineEnd = fcs.paddingInlineEnd;
  document.body.appendChild(flyer);
  btn.classList.add('fly-hide');

  const done = () => {
    fab.style.opacity = '1';
    flyer?.remove();
    flyer = null;
    requestAnimationFrame(() => { fab.classList.remove('fab-fly'); fab.style.opacity = ''; });
    if (!document.body.classList.contains('fab-on')) btn.classList.remove('fly-hide');
  };
  const orange = getComputedStyle(document.documentElement).getPropertyValue('--orange').trim();
  const cream = getComputedStyle(document.documentElement).getPropertyValue('--cream').trim();
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const tl = gsap.timeline({ onComplete: done });
  tl.to(flyer, { x: dx, y: dy, width: to.width, height: to.height, duration: 0.85, ease: 'power3.inOut' }, 0)
    .to(flyer, { fontSize: fcs.fontSize, letterSpacing: fcs.letterSpacing, boxShadow: SH_END, duration: 0.85, ease: 'power3.inOut' }, 0)
    .to(flyer, { opacity: 1, duration: 0.2, ease: 'none' }, 0)
    .to(flyer, { backgroundColor: orange, color: cream, borderColor: cream, duration: 0.5, ease: 'power1.inOut' }, 0.15)
    .to(flyer.querySelector('.ff-a'), { opacity: 0, duration: 0.22, ease: 'none' }, 0.12)
    .to(ffb, { opacity: 1, duration: 0.28, ease: 'none' }, 0.42);
  if (import.meta.env.DEV) window.__flyTl = tl;
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
  // floating Menu shortcut (phones/tablets): appears once the visitor starts scrolling, so it never covers the hero buttons
  // ...and steps aside once the footer comes into view, so it never covers the footer buttons
  const fab = () => {
    const foot = document.querySelector('.foot');
    const atFooter = foot ? foot.getBoundingClientRect().top < window.innerHeight - 40 : false;
    const on = window.scrollY > 120 && !atFooter;
    const was = document.body.classList.contains('fab-on');
    if (on && !was) flyMenuButton();
    document.body.classList.toggle('fab-on', on);
    if (!on && !flyer) document.querySelector('.hero-cta .btn')?.classList.remove('fly-hide');
  };
  window.addEventListener('scroll', fab, { passive: true });
  window.addEventListener('resize', fab);
  fab();
  onLang(renderMarquee);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
