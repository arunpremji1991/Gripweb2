import { defineConfig } from 'vite';
import { resolve, dirname, join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { I18N } from './src/data.js';
import { PAGES, FAQ, SITE_URL, ORDER, jsonLdFor, langPath } from './seo.config.js';

const root = process.cwd();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => (SITE_URL ? SITE_URL + p : p);

/** Which page path (e.g. '/menu/') a source html file / request belongs to */
const pathForFile = (rel) => Object.keys(PAGES).find((p) => PAGES[p].file === rel.replace(/^\//, ''));

/* ---------- <head> block (title, description, canonical, hreflang, og, JSON-LD) ---------- */
function headFor(path, lang) {
  const m = PAGES[path][lang];
  const self = langPath(path, lang);
  const lines = [];
  lines.push(`<title>${esc(m.title)}</title>`);
  lines.push(`<meta name="description" content="${esc(m.desc)}" />`);
  if (SITE_URL) {
    lines.push('<meta name="robots" content="index,follow,max-image-preview:large" />');
    lines.push(`<link rel="canonical" href="${SITE_URL}${self}" />`);
    lines.push(`<link rel="alternate" hreflang="en" href="${SITE_URL}${path}" />`);
    lines.push(`<link rel="alternate" hreflang="ar" href="${SITE_URL}${langPath(path, 'ar')}" />`);
    lines.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}" />`);
  } else {
    // temporary / staging address: never let it be indexed
    lines.push('<meta name="robots" content="noindex,nofollow" />');
  }
  lines.push('<meta property="og:type" content="website" />');
  lines.push('<meta property="og:site_name" content="GRIP" />');
  lines.push(`<meta property="og:title" content="${esc(m.title)}" />`);
  lines.push(`<meta property="og:description" content="${esc(m.desc)}" />`);
  lines.push(`<meta property="og:locale" content="${lang === 'ar' ? 'ar_OM' : 'en_US'}" />`);
  lines.push(`<meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_US' : 'ar_OM'}" />`);
  if (SITE_URL) lines.push(`<meta property="og:url" content="${SITE_URL}${self}" />`);
  lines.push(`<meta property="og:image" content="${abs('/brand/badge-grip-smashburger.png')}" />`);
  lines.push(`<script type="application/ld+json">${JSON.stringify(jsonLdFor(path, lang))}</script>`);
  return `<!--seo:start-->\n    ${lines.join('\n    ')}\n    <!--seo:end-->`;
}

function faqHtml(lang) {
  return `<!--faq:start--><ul class="faq">${FAQ[lang].map(([q, a]) => `
          <li class="faq-item"><details><summary>${esc(q)}</summary><p>${esc(a)}</p></details></li>`).join('')}
        </ul><!--faq:end-->`;
}

/* ---------- localise an English-rendered page into `lang` ---------- */
function localize(html, lang, path) {
  const dict = I18N[lang];
  let out = html
    .replace(/<html\b[^>]*>/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    // static text for every data-i18n element (so crawlers see real content without running JS)
    .replace(/(<([a-zA-Z0-9]+)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (full, open, tag, key, inner, close) => {
      const v = dict[key] ?? I18N.en[key];
      return v ? `${open}${esc(v)}${close}` : full;
    })
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, headFor(path, lang))
    .replace(/<!--faq:start-->[\s\S]*?<!--faq:end-->/, faqHtml(lang));
  if (lang === 'ar') {
    // keep visitors inside the Arabic version of the site
    out = out.replace(/(<a\b[^>]*?\shref=")(\/(?!\/)[^"]*)(")/g, (full, a, href, q) => {
      if (/^\/(assets|brand|img|src|@vite|@id|node_modules)\b/.test(href)) return full;
      return `${a}/ar${href === '/' ? '/' : href}${q}`;
    });
  }
  return out;
}

function seoPlugin() {
  let isBuild = false;
  let outDir = 'dist';
  return {
    name: 'grip-seo',
    configResolved(cfg) { isBuild = cfg.command === 'build'; outDir = cfg.build.outDir; },

    // English page: drop in placeholders -> real head/FAQ + static text
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const path = pathForFile(ctx.path || '');
        if (!path) return html;
        let h = html.replace('<!--seo-head-->', '<!--seo:start--><!--seo:end-->').replace('<!--faq-->', '<!--faq:start--><!--faq:end-->');
        return localize(h, 'en', path);
      },
    },

    // dev server: serve /ar/... by localising the English source page
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!/^\/ar(\/|$)/.test(url)) return next();
        const enPath = url.replace(/^\/ar/, '') || '/';
        const norm = enPath.endsWith('/') ? enPath : enPath + '/';
        if (!PAGES[norm]) return next();
        try {
          const src = readFileSync(join(root, PAGES[norm].file), 'utf8');
          const en = await server.transformIndexHtml('/' + PAGES[norm].file, src);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(localize(en, 'ar', norm));
        } catch (e) { next(e); }
      });
    },

    // production: generate dist/ar/**, sitemap.xml, robots.txt
    closeBundle() {
      if (!isBuild) return;
      const dist = resolve(root, outDir);
      for (const [path, p] of Object.entries(PAGES)) {
        const en = readFileSync(join(dist, p.file), 'utf8');
        const ar = localize(en, 'ar', path);
        const target = join(dist, 'ar', p.file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, ar);
      }
      const today = new Date().toISOString().slice(0, 10);
      if (SITE_URL) {
        const entry = (page, lang) => `
  <url>
    <loc>${SITE_URL}${langPath(page, lang)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${page}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}${langPath(page, 'ar')}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${page}"/>
  </url>`;
        const urls = Object.keys(PAGES).flatMap((pg) => [entry(pg, 'en'), entry(pg, 'ar')]).join('');
        writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}\n</urlset>\n`);
        writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /data/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
      } else {
        writeFileSync(join(dist, 'robots.txt'), '# Temporary address: do not index. Rebuild with SITE_URL=https://your-domain for production.\nUser-agent: *\nDisallow: /\n');
      }
    },
  };
}

// Multi-page site: English at /, Arabic generated at /ar/
export default defineConfig({
  plugins: [seoPlugin()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(PAGES).map(([p, v]) => [p === '/' ? 'main' : p.replace(/\//g, ''), resolve(root, v.file)])),
    },
  },
});
