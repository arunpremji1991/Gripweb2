import '../pages.css';
import { $, $$, gsap, ScrollTrigger, reduce, t, getLang, onLang, applyLang, initCore, revealAll, renderMarquee, lenis } from '../core.js';
import { loadMenu, itemName } from '../menu-store.js';

initCore('menu');

/* Page sections (new / beef / chicken / sides / sweet / drinks), filled from the admin feed */
const META = {
  new: { key: 'page.menu.cat.new', isNew: true, chef: 'curled' },
  beef: { key: 'page.menu.cat.beef', chef: 'flex' },
  chicken: { key: 'page.menu.cat.chicken', chef: 'burger-box' },
  sides: { key: 'page.menu.cat.sides', chef: 'curled' },
  sweet: { key: 'page.menu.cat.sweet', chef: 'flex' },
  drinks: { key: 'page.menu.cat.drinks', chef: 'burger-box' },
};
let data = null; // set once the menu has loaded
function sections() {
  return (data || []).filter((s) => s.items.length).map((s) => ({ ...s, ...META[s.id] }));
}

const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (p) => `<small>OMR</small> ${p}`;

function render() {
  if (!data) return;
  const lang = getLang();
  const secs = sections();

  $('#catNavInner').innerHTML = secs.map((s) => `<a href="#cat-${s.id}" data-cat="${s.id}">${t(s.key)}</a>`).join('');

  $('#menuPage').innerHTML = secs.map((s, n) => `
    <section class="mcat" id="cat-${s.id}" aria-labelledby="h-${s.id}">
      <header class="mcat-head" data-reveal>
        <span class="mcat-n">${String(n + 1).padStart(2, '0')}</span>
        <h2 id="h-${s.id}">${t(s.key)}</h2>
        <img class="mcat-chef wob" src="/brand/character-chef-${s.chef}.png" alt="" width="735" height="745" loading="lazy" />
      </header>
      <ul class="pgrid">
        ${s.items.map((it) => `
          <li class="pcard" data-reveal>
            <button type="button" class="pcard-btn" data-open="${s.id}|${it.id}" aria-haspopup="dialog">
              ${s.isNew ? `<em class="pcard-new">${t('menu.new')}</em>` : ''}
              <span class="pcard-img"><img src="${esc(it.img)}" alt="${esc(itemName(it, lang))}" width="400" height="400" loading="lazy" decoding="async" /></span>
              <span class="pcard-name">${esc(itemName(it, lang))}</span>
              <span class="pcard-price">${money(it.price)}</span>
              ${it.ing?.[lang] ? `<span class="pcard-ing">${esc(it.ing[lang])}</span>` : ''}
            </button>
          </li>`).join('')}
      </ul>
    </section>`).join('');

  revealAll();
  markActive();
}

/* ---- sticky category chips: scrollspy ---- */
let activeCat = '';
function markActive() {
  $$('#catNavInner a').forEach((a) => a.classList.toggle('active', a.dataset.cat === activeCat));
  const on = $(`#catNavInner a[data-cat="${activeCat}"]`);
  if (on) on.parentElement.scrollTo({ left: on.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
}
function spy() {
  ScrollTrigger.getAll().filter((s) => s.vars.id === 'cat-spy').forEach((s) => s.kill());
  sections().forEach((s) => ScrollTrigger.create({
    id: 'cat-spy', trigger: `#cat-${s.id}`, start: 'top 45%', end: 'bottom 45%',
    onToggle: (self) => { if (self.isActive) { activeCat = s.id; markActive(); } },
  }));
}

/* ---- details dialog ---- */
const dlg = $('#itemDialog');
function openItem(secId, id) {
  const lang = getLang();
  const sec = sections().find((s) => s.id === secId);
  const it = sec.items.find((i) => i.id === id);
  if (!it) return;
  $('#dlgImg').src = it.img;
  $('#dlgImg').alt = itemName(it, lang);
  $('#dlgCat').textContent = t(sec.key);
  $('#dlgName').textContent = itemName(it, lang);
  $('#dlgPrice').innerHTML = money(it.price);
  const list = it.ing && it.ing[lang] ? it.ing[lang].split(/\s*[,،]\s*/).filter(Boolean) : [];
  $('#dlgIng').innerHTML = list.map((x) => `<li>${esc(x)}</li>`).join('');
  $('#dlgIng').hidden = !list.length;
  $('#dlgIngH').hidden = !list.length;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  lenis?.stop();
  document.body.classList.add('lock');
  if (!reduce) gsap.fromTo('.pdialog-panel', { y: 40, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
}
function closeItem() {
  if (dlg.open) dlg.close();
}
dlg.addEventListener('close', () => { lenis?.start(); document.body.classList.remove('lock'); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) closeItem(); });
$('#dlgClose').addEventListener('click', closeItem);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open]');
  if (!b) return;
  const [secId, ...rest] = b.dataset.open.split('|');
  openItem(secId, rest.join('|'));
});

/* ---- entrance + parallax ---- */
if (!reduce) {
  gsap.from('.page-title .line > span', { yPercent: 115, duration: 0.9, ease: 'power4.out', delay: 0.25 });
  gsap.from('.page-hero .kicker, .page-sub, .page-hero .hero-cta', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
  gsap.from('.page-hero-chef', { y: 120, rotation: 8, autoAlpha: 0, duration: 1, ease: 'back.out(1.5)', delay: 0.3 });
  gsap.to('.page-hero .hero-giant', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
}

onLang(() => { render(); spy(); renderMarquee(); });
applyLang();
loadMenu().then((d) => { data = d; render(); spy(); ScrollTrigger.refresh(); });
if (location.hash) setTimeout(() => { const el = document.querySelector(location.hash); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 120, behavior: 'auto' }); }, 900);
