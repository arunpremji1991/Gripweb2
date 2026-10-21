import '../pages.css';
import { $, $$, gsap, reduce, t, getLang, lp, onLang, applyLang, initCore, revealAll, renderBranchCards } from '../core.js';
import { MENU, productImg } from '../data.js';

initCore('landing');

const BEEF = ['Old School', 'Mushroom Swiss', 'Truffle', 'Grip'];

function renderRail() {
  const lang = getLang();
  const items = MENU.find((c) => c.id === 'burgers').items.filter((i) => BEEF.includes(i.name));
  $('#tryRail').innerHTML = items.map((it) => `
    <li data-reveal>
      <a class="pcard-btn" href="${lp('/menu/')}#cat-beef">
        <span class="pcard-img"><img src="${productImg(it.name)}" alt="${it.name} smash burger" width="400" height="400" loading="lazy" decoding="async" /></span>
        <span class="pcard-name">${it.name}</span>
        <span class="pcard-price"><small>OMR</small> ${it.price}</span>
        ${it.ing ? `<span class="pcard-ing">${it.ing[lang]}</span>` : ''}
      </a>
    </li>`).join('');
  revealAll();
}

if (!reduce) {
  gsap.from('.page-title .line > span', { yPercent: 115, duration: 0.9, stagger: 0.12, ease: 'power4.out', delay: 0.25 });
  gsap.from('.page-hero .kicker, .page-sub, .page-hero .hero-cta', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
  gsap.from('.page-hero-chef', { y: 120, rotation: 8, autoAlpha: 0, duration: 1, ease: 'back.out(1.5)', delay: 0.3 });
  gsap.to('.page-hero .hero-giant', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.what .sticker', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.vision-photo', start: 'top 70%', once: true } });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
}

onLang(() => { renderRail(); renderBranchCards($('#branches')); });
applyLang();
