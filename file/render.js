/* render.js: muat komponen (navbar/footer) + data situs, lalu jalankan i18n */
const Site = { data: {} };
const ICONS = {
  facebook: '<path d="M13.5 22v-8h2.7l.5-3.3h-3.2V8.6c0-.9.4-1.7 1.8-1.7h1.5V4.1S15.6 3.9 14.4 3.9c-2.5 0-4.2 1.5-4.2 4.3v2.5H7.4V14h2.8v8z"/>',
  x: '<path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/>',
  tiktok: '<path d="M16.6 3c.3 2.3 1.6 3.7 3.9 3.9v3c-1.4.1-2.6-.4-3.9-1.2v6.1c0 3.9-4.2 6.3-7.5 4.3-2.3-1.4-3.1-4.4-1.8-6.7 1-1.8 3-2.7 5-2.4v3.1c-.7-.2-1.5 0-2 .5-.8.9-.5 2.3.5 2.8 1.2.6 2.5-.3 2.5-1.6V3z"/>',
  youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3z"/>',
  instagram: '<path d="M12 7.3a4.700 4.700 0 1 0 0 9.400 4.700 4.700 0 0 0 0-9.400zm0 7.700a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM17.200 6a1.100 1.100 0 1 0 0 2.200 1.100 1.100 0 0 0 0-2.200zM12 3c-2.400 0-2.700 0-3.700.1-2.500.1-3.900 1.500-4 4C4.200 8.100 4.200 8.400 4.200 12s0 3.900.1 4.900c.1 2.500 1.500 3.900 4 4 1 .1 1.300.1 3.700.1s2.700 0 3.700-.1c2.500-.1 3.900-1.500 4-4 .1-1 .1-1.300.1-4.900s0-3.900-.1-4.900c-.1-2.500-1.500-3.900-4-4C14.700 3 14.400 3 12 3zm0 1.600c2.400 0 2.700 0 3.600.1 1.700.1 2.500.9 2.600 2.600.1.900.1 1.200.1 3.600s0 2.700-.1 3.600c-.1 1.700-.9 2.500-2.600 2.600-.9.100-1.200.1-3.600.1s-2.700 0-3.600-.1c-1.700-.1-2.500-.9-2.600-2.600-.1-.9-.1-1.200-.1-3.600s0-2.700.1-3.600C5.900 5.600 6.700 4.800 8.400 4.700c.9-.1 1.200-.1 3.600-.1z"/>'
};

/* Muat komponen. Satu komponen gagal tidak menghentikan yang lain. */
async function loadIncludes() {
  const slots = [...document.querySelectorAll('[data-include]')];
  await Promise.all(slots.map(async el => {
    try {
      const r = await fetch(el.dataset.include);
      if (r.ok) el.innerHTML = await r.text();
      else console.warn('[render.js] gagal memuat ' + el.dataset.include + ' (HTTP ' + r.status + ')');
    } catch (e) {
      console.warn('[render.js] gagal memuat ' + el.dataset.include, e);
    }
  }));
}

function bindSite() {
  const s = Site.data;
  document.querySelectorAll('[data-site]').forEach(el => { el.textContent = s[el.dataset.site] ?? ''; });
  document.querySelectorAll('[data-site-href]').forEach(el => {
    const type = el.dataset.siteHref, v = s[el.dataset.site] ?? '';
    el.href = type === 'tel' ? 'tel:' + v.replace(/\s/g, '') : type + ':' + v;
  });
  document.querySelectorAll('[data-site-src]').forEach(el => { el.src = s[el.dataset.siteSrc] || ''; });
  document.querySelectorAll('[data-wa]').forEach(el => { el.href = 'https://wa.me/' + s.whatsapp; });
  document.querySelectorAll('[data-social]').forEach(box => {
    box.innerHTML = Object.entries(s.social || {}).map(([k, url]) =>
      `<a href="${url}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ''}</svg></a>`).join('');
  });
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
}

/* Helper untuk halaman lain (Tahap 2+): await Site.json('data/mitra.json') */
Site._pre = {};
Site.prefetch = path => { const p = fetch(path).then(r => r.json()); p.catch(() => {}); Site._pre[path] = p; };
Site.json = path => {
  if (Site._pre[path]) { const p = Site._pre[path]; delete Site._pre[path]; return p; }   // pakai hasil prefetch (sekali pakai)
  return fetch(path).then(r => r.json());
};
/* Mulai unduh data sedini mungkin, jangan menunggu navbar/footer/i18n selesai */
Site.prefetch('data/site.json');
if (document.getElementById('majors')) ['beranda', 'statistik', 'mitra', 'jurusan'].forEach(n => Site.prefetch(`data/${n}.json`));

document.addEventListener('DOMContentLoaded', async () => {
  /* tiap langkah berdiri sendiri: satu yang gagal tidak menghentikan sisanya */
  const step = async (name, fn) => {
    try { await fn(); } catch (e) { console.error('[render.js] gagal pada langkah: ' + name, e); }
  };
  await step('site.json', async () => { Site.data = await Site.json('data/site.json'); });
  await step('includes',  loadIncludes);
  await step('bindSite',  bindSite);
  await step('I18N.init', () => I18N.init());
  document.dispatchEvent(new CustomEvent('components:ready'));   // selalu terkirim
});