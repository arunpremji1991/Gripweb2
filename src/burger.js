/*
 * Scroll-driven burger assembly.
 *
 * Each ingredient is its own SVG layer (brand line-art style) so it can move
 * independently. To swap in photographic layers later, replace the `svg`
 * strings with <img> markup (transparent PNG/WebP, same 400-unit width) — the
 * timeline, labels and layout stay unchanged.
 *
 * Stage coordinate system: 400 x 368 "units"; the stage is CSS-scaled to fit.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STEPS } from './data.js';

/*
 * Photographic ingredient layers (transparent WebP, /public/img/ing/*.webp).
 * w/h are display size in stage units; `top` is the assembled position.
 * Swap a file (same name) to update an ingredient photo; the timeline is unchanged.
 */
const LAYERS = [
  { id: 'bunTop', alt: 'Brioche bun (top)', w: 400, h: 150, top: 0 },
  { id: 'sauce', alt: 'Ketchup and mustard sauce', w: 372, h: 50, top: 122 },
  { id: 'pickle', alt: 'Dill pickle chips', w: 300, h: 56, top: 148 },
  { id: 'onion', alt: 'Onion', w: 340, h: 54, top: 180 },
  { id: 'cheese', alt: 'American cheese', w: 384, h: 62, top: 208 },
  { id: 'pattyA', alt: 'Smashed beef patty', w: 410, h: 72, top: 238 },
  { id: 'pattyB', alt: 'Smashed beef patty', w: 396, h: 62, top: 282 },
  { id: 'bunBottom', alt: 'Brioche bun (bottom)', w: 396, h: 104, top: 318 },
];
const STAGE_H = 422;

const MID = (LAYERS.length - 1) / 2;
const isMobile = () => window.innerWidth < 960;
const gap = () => (isMobile() ? 40 : 54); // exploded spacing between layers, in stage units

export function initAssembly({ getLang }) {
  const section = document.querySelector('#top');
  if (!section) return;
  const stage = section.querySelector('.asm-stage');
  stage.style.setProperty('--sh', `${STAGE_H}px`);
  const panel = section.querySelector('.asm-panel');
  const fadeOut = section.querySelectorAll('.copy-text, .hero-cta');
  const final = section.querySelector('.asm-final');
  const cue = section.querySelector('.scroll-cue');
  const badge = section.querySelector('.hero-badge');
  const giant = section.querySelector('.hero-giant');
  const titleEl = section.querySelector('[data-asm-title]');
  const descEl = section.querySelector('[data-asm-desc]');
  const list = section.querySelector('.asm-list');

  /* ----- build layers ----- */
  const els = LAYERS.map((l, i) => {
    const el = document.createElement('div');
    el.className = 'asm-layer';
    el.dataset.layer = l.id;
    el.style.cssText = `top:${l.top}px;width:${l.w}px;height:${l.h}px;left:${(400 - l.w) / 2}px;z-index:${LAYERS.length - i}`;
    el.innerHTML = `<img src="/img/ing/${l.id}.webp" alt="" width="${l.w}" height="${l.h}" decoding="async" draggable="false" />`;
    stage.appendChild(el);
    return el;
  });

  /* ----- accessible list ----- */
  const renderList = () => {
    const lang = getLang();
    list.innerHTML = STEPS.map((s) => `<li><strong>${s.t[lang]}</strong> — ${s.d[lang]}</li>`).join('');
  };
  renderList();

  let current = -2;
  const setStep = (idx) => {
    if (idx === current) return;
    current = idx;
    const lang = getLang();
    const active = idx >= 0 ? STEPS[idx].layers : [];
    stage.dataset.focus = active.length ? 'on' : 'off';
    els.forEach((el) => el.classList.toggle('is-active', active.includes(el.dataset.layer)));
    panel.classList.toggle('is-on', idx >= 0);
    if (idx >= 0) {
      const s = STEPS[idx];
      titleEl.textContent = s.t[lang];
      descEl.textContent = s.d[lang];
    }
  };

  /* ----- fit the stage: large when assembled, scaled to fit when exploded ----- */
  let bumpExp = 0.85;
  const fit = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const mobile = isMobile();
    const span = STAGE_H + (LAYERS.length - 1) * gap() + 36;
    const widthCap = mobile ? (vw * 0.9) / 400 : (vw * 0.42) / 400;
    let kAsm = Math.max(0.5, Math.min((vh - (mobile ? 300 : 170)) / STAGE_H, widthCap, vw >= 1900 ? 2.1 : 1.5));
    let shift = mobile ? Math.round(Math.min(40, vh * 0.04)) : 0;
    if (mobile) {
      // short / narrow phones: keep the assembled burger between the headline and the button
      const ct = section.querySelector('.copy-text');
      const cta = section.querySelector('.hero-cta');
      if (ct && cta) {
        const top = ct.offsetTop + ct.offsetHeight + 10;
        const bottom = vh - (parseFloat(getComputedStyle(cta).bottom) || 46) - cta.offsetHeight - 10;
        const h = STAGE_H * kAsm;
        const sTop = vh / 2 + shift - h / 2;
        const sBottom = vh / 2 + shift + h / 2;
        if (sTop < top || sBottom > bottom) {
          kAsm = Math.max(0.35, Math.min(kAsm, (bottom - top) / STAGE_H));
          shift = Math.round((top + bottom) / 2 - vh / 2);
        }
      }
    }
    const kExp = Math.max(0.45, Math.min((vh - (mobile ? 260 : 120)) / span, widthCap));
    bumpExp = Math.min(1, kExp / kAsm);
    stage.style.setProperty('--k', kAsm.toFixed(3));
    stage.style.setProperty('--shift', `${shift}px`);
  };
  fit();
  document.fonts?.ready.then(fit); // headline height can change once the brand fonts arrive

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    section.classList.add('no-pin');
    window.addEventListener('resize', fit);
    return { relang: renderList };
  }

  /* ----- timeline: 0-1 explode | 1-8 steps | 8-9.4 reassemble | 9.4-10.4 final ----- */
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  els.forEach((el, i) => {
    const dir = i % 2 ? 1 : -1;
    tl.to(el, { y: () => (i - MID) * gap(), x: dir * 8, rotation: dir * 2.4, duration: 1 }, i * 0.025);
  });
  tl.to(stage, { '--bump': () => bumpExp, duration: 1 }, 0);
  tl.to(fadeOut, { autoAlpha: 0, y: -24, duration: 0.7, stagger: 0.05 }, 0.05);
  tl.to(cue, { autoAlpha: 0, duration: 0.4 }, 0.05);
  tl.to({}, { duration: 7 }, 1);
  // gentle sway so the scene stays alive while the steps play
  tl.to(els, { rotation: (i) => (i % 2 ? -2.4 : 2.4), duration: 3.5, ease: 'sine.inOut', stagger: 0.05 }, 1.2);
  tl.to(els, { rotation: (i) => (i % 2 ? 2.4 : -2.4), duration: 3.5, ease: 'sine.inOut', stagger: 0.05 }, 4.7);
  tl.to(els, { y: 0, x: 0, rotation: 0, duration: 1.4, ease: 'power3.inOut' }, 8);
  tl.to(stage, { '--bump': 1, duration: 1.4, ease: 'power3.inOut' }, 8);
  tl.fromTo(final, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 9.3);
  tl.to(stage, { '--bump': 1.05, duration: 1, ease: 'power2.out' }, 9.3);
  tl.to(badge, { rotation: 360, duration: 10.4, ease: 'none' }, 0);
  tl.to(giant, { yPercent: -12, duration: 10.4, ease: 'none' }, 0);
  tl.to({}, { duration: 0.4 }, 10.1);

  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    setStep(t >= 1 && t < 8 ? Math.min(STEPS.length - 1, Math.floor(t - 1)) : -1);
  });

  const scrollLen = () => window.innerHeight * (isMobile() ? 2.3 : 4.8); // same animation, shorter scroll
  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${scrollLen()}`,
    pin: true,
    scrub: 0.5,
    animation: tl,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefreshInit: fit,
  });

  /* ----- entrance: layers drop in one by one (plays once, never blocks ordering) ----- */
  gsap.from(els, {
    yPercent: (i) => -140 - i * 18, opacity: 0, scale: 0.7, rotation: (i) => (i % 2 ? 8 : -8),
    duration: 0.9, ease: 'back.out(1.4)', stagger: { each: 0.07, from: 'end' }, delay: 0.15,
    clearProps: 'opacity',
  });

  const onResize = () => fit();
  window.addEventListener('resize', onResize);
  ScrollTrigger.addEventListener('refresh', fit);

  return {
    relang: () => { renderList(); const c = current; current = -2; setStep(c); },
    destroy: () => { st.kill(); tl.kill(); window.removeEventListener('resize', onResize); },
  };
}
