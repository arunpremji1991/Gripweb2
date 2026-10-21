import '../pages.css';
import { $, $$, gsap, ScrollTrigger, reduce, t, getLang, onLang, applyLang, initCore, revealAll } from '../core.js';
import { BRANCHES, REVIEWS } from '../data.js';

initCore('story');

if (!reduce) {
  gsap.from('.page-title .line > span', { yPercent: 115, duration: 0.9, stagger: 0.12, ease: 'power4.out', delay: 0.25 });
  gsap.from('.page-hero .kicker, .page-sub', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
  gsap.from('.page-hero-chef', { y: 120, rotation: 8, autoAlpha: 0, duration: 1, ease: 'back.out(1.5)', delay: 0.3 });
  gsap.to('.page-hero .hero-giant', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });

  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.vision-photo .sticker', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.vision-photo', start: 'top 70%', once: true } });
  gsap.from('.story-chef', { scale: 0.3, rotation: 18, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.vision-photo', start: 'top 60%', once: true } });

  // full-bleed night storefront: opens from an inset card as you scroll, photo settles
  gsap.fromTo('.shot-night .shot-frame', { clipPath: 'inset(14% 7% round 36px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.shot-night', start: 'top 85%', end: 'top 10%', scrub: true } });
  gsap.fromTo('.night-img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.shot-night', start: 'top 85%', end: 'bottom top', scrub: true } });

  // journey: the line draws pin by pin as you scroll; pins pop in when the line reaches them
  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 861px)', narrow: '(max-width: 860px)' }, (ctx) => {
    const horizontal = ctx.conditions.wide;
    const steps = $$('.jstep');
    const line = $('.journey');
    gsap.set('.jstep', { autoAlpha: 0.35 });
    gsap.fromTo(line, { '--p': 0 }, {
      '--p': 1, ease: 'none',
      scrollTrigger: {
        trigger: '.journey', start: horizontal ? 'top 75%' : 'top 70%', end: horizontal ? 'top 35%' : 'bottom 60%', scrub: 0.4,
        onUpdate: (self) => {
          steps.forEach((el, i) => {
            const on = self.progress >= i / steps.length + 0.02;
            if (el.dataset.on !== String(on)) {
              el.dataset.on = String(on);
              gsap.to(el, { autoAlpha: on ? 1 : 0.35, duration: 0.4 });
              gsap.to(el.querySelector('.jpin'), { y: on ? 0 : 10, scale: on ? 1 : 0.8, duration: 0.5, ease: 'back.out(2)' });
            }
          });
        },
      },
    });
  });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
}

const stars = (n) => `<span class="stars" role="img" aria-label="${n} / 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;

function renderReviews() {
  const lang = getLang();
  $('#ratingRow').innerHTML = BRANCHES.map((b) => `
    <li class="rating-card" data-reveal>
      <span class="rating-score" dir="ltr">${b.rating.score}<small>★</small></span>
      <div class="rating-meta">
        <h3>${b.name}</h3>
        <p class="rating-count"><strong dir="ltr">${b.rating.count}</strong> ${t('rev.reviews')} · ${t('rev.outof')}</p>
        <a class="btn btn-sm" href="${b.googleUrl}" target="_blank" rel="noopener">${t('rev.read')}</a>
      </div>
    </li>`).join('');
  const quotes = REVIEWS.filter((r) => r.text?.[lang] || r.text?.en);
  $('#quoteRow').innerHTML = quotes.map((r) => {
    const b = BRANCHES.find((x) => x.id === r.branch);
    return `
    <li class="quote-card" data-reveal>
      ${stars(r.stars || 5)}
      <blockquote>${r.text[lang] || r.text.en}</blockquote>
      <p class="quote-by"><strong>${r.name}</strong>${b ? ` · ${b.name}` : ''} · Google</p>
    </li>`;
  }).join('');
  $('#quoteRow').hidden = !quotes.length;
  revealAll();
}

if (!reduce) {
  gsap.from('.gal', { y: 70, autoAlpha: 0, scale: 0.94, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.gal-grid', start: 'top 80%', once: true } });
  $$('.gal img').forEach((img, i) => {
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

onLang(() => { revealAll(); renderReviews(); });
applyLang();
