/* i18n: ganti bahasa ID/EN, pilihan disimpan di localStorage */
const I18N = (() => {
  const KEY = 'smk_lang', DEFAULT = 'id', LANGS = ['id', 'en'], cache = {};
  let lang = DEFAULT, dict = {}, inited = false;

  const get = (obj, path) => String(path).split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  const t = key => get(dict, key) ?? key;

  async function load(l) {
    if (cache[l]) return cache[l];
    const res = await fetch(`data/lang-${l}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status} saat memuat data/lang-${l}.json`);
    return (cache[l] = await res.json());
  }

  function apply(root = document) {
    if (!Object.keys(dict).length) return;   // kamus belum siap: jangan timpa teks dengan nama key
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(p => {
        const [a, k] = p.split(':');
        if (a && k) el.setAttribute(a.trim(), t(k.trim()));
      });
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang [data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
  }

  async function set(l) {
    if (!LANGS.includes(l)) l = DEFAULT;
    let d;
    try {
      d = await load(l);
    } catch (e) {
      console.error('i18n:', e);
      // kalau belum ada kamus sama sekali, coba bahasa bawaan
      if (Object.keys(dict).length || l === DEFAULT) return;
      l = DEFAULT;
      try { d = await load(l); } catch (e2) { console.error('i18n:', e2); return; }
    }
    lang = l; dict = d;                       // diubah hanya setelah kamus berhasil dimuat
    try { localStorage.setItem(KEY, l); } catch (e) {}
    apply();
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: l } }));
  }

  async function init() {
    if (inited) return;                       // cegah listener terpasang dobel
    inited = true;
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-lang]');
      if (!b) return;
      if (b.tagName === 'A') e.preventDefault();
      set(b.dataset.lang);
    });
    let saved; try { saved = localStorage.getItem(KEY); } catch (e) {}
    await set(saved === 'en' ? 'en' : DEFAULT);
  }

  return { init, set, t, apply, get lang() { return lang; } };
})();

window.I18N = I18N;   // supaya juga terbaca lewat window.I18N (const di level atas tidak otomatis jadi properti window)