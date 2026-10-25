/* Menu data for the site: live feed from the admin backend (/api/menu.php), static fallback from data.js */
import { MENU, productImg } from './data.js';

const BEEF = /Double beef patty/;

function fromStatic() {
  const sections = { new: [], beef: [], chicken: [], sides: [], sweet: [], drinks: [] };
  for (const c of MENU) {
    for (const it of c.items) {
      const id = c.id === 'burgers' ? (BEEF.test(it.ing.en) ? 'beef' : 'chicken') : c.id;
      sections[id]?.push({ id: it.name, name: it.name, nameAr: '', price: it.price, ing: it.ing || null, img: productImg(it.name) });
    }
  }
  return Object.entries(sections).map(([id, items]) => ({ id, items }));
}

function fromApi(data) {
  return data.sections.map((s) => ({
    id: s.id,
    items: s.items.map((it) => ({
      id: it.id,
      name: it.name,
      nameAr: it.name_ar || '',
      price: it.price,
      ing: it.ing_en || it.ing_ar ? { en: it.ing_en, ar: it.ing_ar || it.ing_en } : null,
      img: it.image || productImg(it.name),
    })),
  }));
}

let cache;
/** Resolves with [{ id, items }] for new / beef / chicken / sides / sweet / drinks. Never rejects. */
export function loadMenu() {
  cache ??= (async () => {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3500);
      const r = await fetch('/api/menu.php', { signal: ctl.signal, cache: 'no-cache' });
      clearTimeout(timer);
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      if (!Array.isArray(data.sections)) throw new Error('bad feed');
      return fromApi(data);
    } catch {
      return fromStatic();
    }
  })();
  return cache;
}

export const itemName = (it, lang) => (lang === 'ar' && it.nameAr ? it.nameAr : it.name);
