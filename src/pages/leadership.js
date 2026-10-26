import '../pages.css';
import { $, $$, gsap, ScrollTrigger, reduce, getLang, onLang, applyLang, initCore, revealAll } from '../core.js';
import { LEADERS } from '../data.js';

initCore('leadership');

function renderLeaders() {
  const lang = getLang();
  $('#leadRow').innerHTML = LEADERS.map((p) => `<li class="lead-tag">${p.name[lang]}</li>`).join('');
  if (!reduce) gsap.from('.lead-tag', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
  revealAll();
}

if (!reduce) {
  gsap.from('.page-title .line > span', { yPercent: 115, duration: 0.9, stagger: 0.12, ease: 'power4.out', delay: 0.2 });
  gsap.from('.lead-title .kicker', { y: 18, autoAlpha: 0, duration: 0.7, delay: 0.15 });
  gsap.from('.lead-chef', { yPercent: 60, rotation: 10, autoAlpha: 0, duration: 1, ease: 'back.out(1.4)', delay: 0.8 });
  // portraits drift at slightly different speeds as you leave the hero
  gsap.from('.lead-story .sticker', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.lead-photo', start: 'top 70%', once: true } });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

onLang(() => {
  renderLeaders();
});
applyLang();

