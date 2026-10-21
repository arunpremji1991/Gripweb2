/*
 * SEO configuration used at build time (and by the dev server) to generate
 * static English + Arabic pages, titles, descriptions, hreflang, structured
 * data, sitemap and robots.txt.
 *
 * SITE_URL: set when the real domain is ready, e.g.
 *   SITE_URL=https://yourdomain.com npm run build
 * Until then pages are built with noindex + robots Disallow so a temporary
 * hosting address is never indexed.
 */
import { BRANCHES } from './src/data.js';

export const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
export const INSTAGRAM = 'https://www.instagram.com/grip.om/';
export const ORDER = { en: 'https://menu.apetitomenu.com/GRIP/en', ar: 'https://menu.apetitomenu.com/GRIP/ar' };

/** Source file (relative to project root) for every page path */
export const PAGES = {
  '/': {
    file: 'index.html',
    en: {
      title: 'Smash Burger in Salalah | GRIP – Omani Smash Burger, Order Online',
      desc: 'GRIP is an Omani smash burger brand born in Dhofar. Two Salalah branches, Wafa Walk and Salalah Gardens Mall, rated 4.5 and 4.9 on Google. Order online.',
      crumb: 'Home',
    },
    ar: {
      title: 'سماش برجر في صلالة | جريب – علامة عُمانية، اطلب أونلاين',
      desc: 'جريب علامة عُمانية لبرجر السماش وُلدت في ظفار. فرعان في صلالة: Wafa Walk وSalalah Gardens Mall بتقييم 4.5 و4.9 على Google. اطلب أونلاين.',
      crumb: 'الرئيسية',
    },
  },
  '/menu/': {
    file: 'menu/index.html',
    en: {
      title: 'Menu: Smash Burgers, Chicken Burgers & Fries | GRIP Salalah',
      desc: 'The full GRIP menu in Salalah: beef smash burgers, crispy chicken burgers, loaded fries, shakes and drinks, with photos, ingredients and prices in OMR.',
      crumb: 'Menu',
    },
    ar: {
      title: 'قائمة جريب: سماش برجر وبرجر الدجاج والبطاطس | صلالة',
      desc: 'قائمة جريب الكاملة في صلالة: برجر سماش اللحم، برجر الدجاج المقرمش، بطاطس محمّلة، ميلك شيك ومشروبات مع الصور والمكونات والأسعار بالريال العُماني.',
      crumb: 'القائمة',
    },
  },
  '/our-story/': {
    file: 'our-story/index.html',
    en: {
      title: 'Our Story | GRIP – An Omani Burger Brand Born in Dhofar',
      desc: 'The story of GRIP: an Omani brand born in Dhofar, inspired by global smash burger practice and built with an Omani vision, growing from Salalah across Oman.',
      crumb: 'Our Story',
    },
    ar: {
      title: 'قصتنا | جريب – علامة برجر عُمانية وُلدت في ظفار',
      desc: 'قصة جريب: علامة عُمانية وُلدت في ظفار، استلهمت أفضل ممارسات برجر السماش وطُوّرت برؤية عُمانية، لتنمو من صلالة إلى مختلف أنحاء السلطنة.',
      crumb: 'قصتنا',
    },
  },
  '/leadership/': {
    file: 'leadership/index.html',
    en: {
      title: 'Leadership | GRIP – The Omani Founders Behind the Brand',
      desc: 'Meet the four Omani entrepreneurs behind GRIP: a shared vision to build a national brand defined by quality, operational excellence and long-term sustainability.',
      crumb: 'Leadership',
    },
    ar: {
      title: 'قيادتنا | جريب – المؤسسون العُمانيون خلف العلامة',
      desc: 'تعرّف على رواد الأعمال العُمانيين الأربعة خلف جريب: رؤية مشتركة لبناء علامة وطنية تعكس الجودة والتميز في التنفيذ والاستدامة.',
      crumb: 'قيادتنا',
    },
  },
  '/smash-burger-salalah/': {
    file: 'smash-burger-salalah/index.html',
    en: {
      title: 'Best Smash Burger in Salalah? Try GRIP | 2 Branches, Order Online',
      desc: 'Looking for the best smash burger in Salalah? GRIP serves beef smash burgers at Wafa Walk and Salalah Gardens Mall, rated 4.5 and 4.9 on Google. Order online.',
      crumb: 'Smash burger in Salalah',
    },
    ar: {
      title: 'أفضل سماش برجر في صلالة؟ جرّب جريب | فرعان، اطلب أونلاين',
      desc: 'تبحث عن أفضل سماش برجر في صلالة؟ جريب تقدم برجر السماش في فرعي Wafa Walk وSalalah Gardens Mall بتقييم 4.5 و4.9 على Google. اطلب أونلاين.',
      crumb: 'سماش برجر في صلالة',
    },
  },
};

const b = BRANCHES;
/** FAQ for the landing page (rendered as static HTML + FAQPage structured data) */
export const FAQ = {
  en: [
    ['Where can I find the best smash burger in Salalah?',
      `GRIP serves smash burgers at two branches in Salalah: Wafa Walk and Salalah Gardens Mall. On Google, the Wafa Walk branch is rated ${b[0].rating.score} from ${b[0].rating.count} reviews and the Salalah Gardens Mall branch ${b[1].rating.score} from ${b[1].rating.count} reviews. Try the Old School, Mushroom Swiss, Truffle or the signature GRIP burger.`],
    ['What is a smash burger?',
      'A smash burger is made by pressing a ball of ground beef flat on a very hot griddle, which gives the thin patty a crisp, caramelised crust while the inside stays juicy. GRIP’s beef burgers use a double beef patty on a brioche bun.'],
    ['What is on the GRIP menu?',
      'Beef smash burgers (Old School, Mushroom Swiss, Truffle and GRIP) and crispy chicken burgers (Classic, Original, Buffalo and Hot Nashville), plus loaded fries, tenders, milkshakes, ice cream and drinks. The Brisket Burger is a new addition. The full menu with photos and prices is on our menu page.'],
    ['Where are the GRIP branches in Salalah?',
      `Wafa Walk: ${b[0].address}, phone ${b[0].phone}. Salalah Gardens Mall: ${b[1].address}, phone ${b[1].phone}.`],
    ['Can I order GRIP online?',
      'Yes. You can order through the official GRIP online ordering page, which is linked from every page of this website.'],
    ['Is GRIP an Omani brand?',
      'Yes. GRIP is a 100% Omani-owned and led brand, born in Dhofar.'],
  ],
  ar: [
    ['أين أجد أفضل سماش برجر في صلالة؟',
      `تقدم جريب برجر السماش في فرعين بصلالة: Wafa Walk وSalalah Gardens Mall. على Google يحمل فرع Wafa Walk تقييم ${b[0].rating.score} من ${b[0].rating.count} تقييمًا، وفرع Salalah Gardens Mall تقييم ${b[1].rating.score} من ${b[1].rating.count} تقييمًا. جرّب «أولد سكول» أو «مشروم سويس» أو «ترافل» أو برجر جريب المميز.`],
    ['ما هو برجر السماش؟',
      'يُحضَّر برجر السماش بضغط كرة من اللحم البقري المفروم حتى تصبح رقيقة على سطح طهي ساخن جدًا، فتكتسب قشرة مقرمشة ومكرمَلة بينما يبقى الداخل عصيريًا. تُقدَّم برجر اللحم في جريب بقطعتين من اللحم البقري على خبز بريوش.'],
    ['ماذا تضم قائمة جريب؟',
      'برجر سماش اللحم (أولد سكول، مشروم سويس، ترافل وجريب) وبرجر الدجاج المقرمش (كلاسيك، أوريجنال، بافلو وهوت ناشفيل)، إضافة إلى بطاطس محمّلة وتندرز وميلك شيك وآيس كريم ومشروبات. وبرجر بريسكت إضافة جديدة. القائمة الكاملة مع الصور والأسعار في صفحة القائمة.'],
    ['أين تقع فروع جريب في صلالة؟',
      `Wafa Walk: ${b[0].address}، هاتف ${b[0].phone}. Salalah Gardens Mall: ${b[1].address}، هاتف ${b[1].phone}.`],
    ['هل يمكنني الطلب من جريب أونلاين؟',
      'نعم. يمكنك الطلب عبر صفحة الطلب الرسمية لجريب، وهي موجودة في كل صفحات هذا الموقع.'],
    ['هل جريب علامة عُمانية؟',
      'نعم. جريب علامة عُمانية بملكية وإدارة عُمانية بالكامل، وُلدت في ظفار.'],
  ],
};

const abs = (path) => (SITE_URL ? SITE_URL + path : path);
export const langPath = (path, lang) => (lang === 'ar' ? '/ar' + path : path);

export function jsonLdFor(path, lang) {
  const graph = [];
  const org = {
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: 'GRIP',
    url: abs('/'),
    logo: abs('/brand/badge-grip-round.png'),
    sameAs: [INSTAGRAM],
  };
  graph.push(org);
  if (path === '/' || path === '/smash-burger-salalah/') {
    BRANCHES.forEach((br) => graph.push({
      '@type': 'Restaurant',
      '@id': abs(`/#${br.id}`),
      name: br.name,
      parentOrganization: { '@id': org['@id'] },
      servesCuisine: ['American', 'Burgers', 'Smash burgers'],
      telephone: br.tel,
      address: {
        '@type': 'PostalAddress',
        streetAddress: br.street,
        addressLocality: 'Salalah',
        addressRegion: 'Dhofar',
        addressCountry: 'OM',
      },
      geo: { '@type': 'GeoCoordinates', latitude: br.geo.lat, longitude: br.geo.lng },
      hasMenu: abs('/menu/'),
      menu: abs('/menu/'),
      sameAs: [INSTAGRAM, br.googleUrl],
      image: abs('/img/storefront-night.jpg'),
    }));
  }
  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: PAGES['/'][lang].crumb, item: abs(langPath('/', lang)) },
        { '@type': 'ListItem', position: 2, name: PAGES[path][lang].crumb, item: abs(langPath(path, lang)) },
      ],
    });
  }
  if (path === '/smash-burger-salalah/') {
    graph.push({
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: FAQ[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
