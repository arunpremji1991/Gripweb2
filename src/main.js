import './pages.css';
import { $, $$, gsap, ScrollTrigger, reduce, getLang, t, lp, onLang, applyLang, initCore, revealAll, renderBranchCards } from './core.js';
import { loadMenu, itemName } from './menu-store.js';
import { initAssembly } from './burger.js';

initCore('home');
let lang = getLang();
// hero pin must be created before any other ScrollTrigger so later triggers account for its spacing
const assembly = initAssembly({ getLang });

/* ---------------- signature menu rail (full menu lives on /menu/) ---------------- */
const SIGNATURE = ['Old School', 'Mushroom Swiss', 'Truffle', 'Grip', 'Brisket Burger'];
let menuData = null;
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function renderMenu() {
  if (!menuData) return;
  const all = menuData.flatMap((c) => c.items.map((i) => ({ ...i, cat: c.id })));
  // signature picks first; if the team hides one, fill from the beef burgers so the rail stays full
  let items = SIGNATURE.map((n) => all.find((i) => i.name === n)).filter(Boolean);
  for (const i of all.filter((x) => x.cat === 'beef')) if (items.length < 5 && !items.includes(i)) items.push(i);
  $('#menuRail').innerHTML = items.map((it) => `
    <li data-reveal>
      <a class="pcard-btn" href="${lp('/menu/')}#cat-${it.cat === 'new' ? 'new' : it.cat}">
        ${it.cat === 'new' ? `<em class="pcard-new">${t('menu.new')}</em>` : ''}
        <span class="pcard-img"><img src="${esc(it.img)}" alt="${esc(itemName(it, lang))}" width="400" height="400" loading="lazy" decoding="async" /></span>
        <span class="pcard-name">${esc(itemName(it, lang))}</span>
        <span class="pcard-price"><small>OMR</small> ${esc(it.price)}</span>
        ${it.ing?.[lang] ? `<span class="pcard-ing">${esc(it.ing[lang])}</span>` : ''}
      </a>
    </li>`).join('');
  revealAll();
}
loadMenu().then((d) => { menuData = d; renderMenu(); ScrollTrigger.refresh(); });

/* ---------------- branches ---------------- */
const renderBranches = () => renderBranchCards($('#branches'));

/* ---------------- nav state (home anchors) ---------------- */
let activeKey = '';
const markActive = () => $$('.nav-links a[data-nav]').forEach((a) => {
  const on = a.dataset.nav === activeKey && activeKey === 'locations';
  a.classList.toggle('active', on);
});
[['#locations', 'locations']].forEach(([id, key]) => {
  ScrollTrigger.create({
    trigger: id,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) activeKey = key; else if (activeKey === key) activeKey = ''; markActive(); },
  });
});
onLang(markActive);

if (!reduce) {
  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amt * 100 }, {
      yPercent: amt * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // photo reveal: frame opens from an inset card to full-bleed while the photo settles
  gsap.fromTo('.shot-frame', { clipPath: 'inset(14% 7% round 36px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.shot', start: 'top 85%', end: 'top 10%', scrub: true } });
  gsap.fromTo('.shot-frame picture img', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.shot', start: 'top 85%', end: 'bottom top', scrub: true } });
  gsap.from('.shot-line > span', { yPercent: 115, duration: 0.9, stagger: 0.14, ease: 'power4.out', scrollTrigger: { trigger: '.shot-text', start: 'top 92%', once: true } });

  // characters: peek up / pop in as their sections arrive
  gsap.fromTo('.shot-chef', { yPercent: 70, rotation: 8 }, { yPercent: 0, rotation: 0, ease: 'power3.out', scrollTrigger: { trigger: '.shot', start: 'top 40%', end: 'top -10%', scrub: true } });
  gsap.from('.story-chef', { scale: 0.3, rotation: 18, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.story-photo', start: 'top 60%', once: true } });
  gsap.from('.menu-chef', { yPercent: 40, rotation: -10, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.menu-foot', start: 'top 90%', once: true } });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });

  // story sticker
  gsap.from('.story-photo .sticker', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.story-photo', start: 'top 70%', once: true } });
  gsap.from('.smash-h span', { yPercent: 110, duration: 0.9, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: '.smash-h', start: 'top 80%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
}

/* ---------------- hero text entrance (short; never blocks ordering) ---------------- */
function heroIntro() {
  if (reduce) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero-title .line > span', { yPercent: 115, duration: 0.9, stagger: 0.12 }, 0.05)
    .from('.asm .kicker, .hero-sub', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.3)
    .from('.hero-cta .btn', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.55)
    .from('.hero-badge', { scale: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.7)
    .from('.hero-giant', { opacity: 0, duration: 1.2 }, 0);
}

/* ---------------- language hook + init ---------------- */
onLang((l) => {
  lang = l;
  renderMenu();
  renderBranches();
  assembly?.relang?.();
});
applyLang();
heroIntro();
