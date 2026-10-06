/* akomodasi.js: merender halaman dari data/akomodasi.json */
(() => {
  const SELF = document.currentScript && document.currentScript.src;
  const MASCOT = SELF ? new URL('../bombi.jpeg', SELF).href : 'bombi.jpeg';
  let D = null, bound = false;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lang = () => (window.I18N && I18N.lang) || 'id';
  const T = v => (v && typeof v === 'object') ? (v[lang()] || v.id || '') : (v ?? '');
  const load = u => (window.Site && Site.json) ? Site.json(u) : fetch(u).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' saat memuat ' + u); return r.json(); });
  const rv = (h, d = 0) => `<div class="ak-rv" style="--d:${d}s">${h}</div>`;
  const btn = b => `<a class="btn${b.gaya === 'ghost' ? ' btn--ghost' : ''}" href="${esc(b.link)}">${esc(T(b.teks))}</a>`;
  const head = o => `<div class="ak-head"><span class="ak-label">${esc(T(o.label))}</span><h2>${esc(T(o.judul))}</h2>${o.sub ? `<p>${esc(T(o.sub))}</p>` : ''}</div>`;

  const hero = h => !h ? '' : `<section class="ak-hero">
    ${h.gambar ? `<img class="ak-hero__bg" src="${esc(h.gambar)}" alt="${esc(T(h.alt))}" onerror="this.remove()">` : ''}
    <div class="ak-hero__deco" aria-hidden="true"><span class="ak-hero__big">${esc(h.ikon || '')}</span>
      ${(h.ikon_kecil || []).slice(0, 4).map((e, i) => `<span class="ak-hero__i ak-hero__i--${i + 1}">${esc(e)}</span>`).join('')}</div>
    <div class="container ak-hero__in">
      ${(h.jejak || []).length ? `<nav class="ak-crumb" aria-label="breadcrumb">${h.jejak.map((c, i, a) => i < a.length - 1 ? `<a href="${esc(c.link)}">${esc(T(c.teks))}</a><b>›</b>` : `<span>${esc(T(c.teks))}</span>`).join('')}</nav>` : ''}
      <span class="ak-pill">${esc(T(h.label))}</span>
      <h1>${esc(T(h.judul_awal))} <span class="hl">${esc(T(h.judul_sorot))}</span> ${esc(T(h.judul_akhir))}</h1>
      <p>${esc(T(h.deskripsi))}</p><div class="ak-hero__cta">${(h.tombol || []).map(btn).join('')}</div></div></section>`;

  const stats = r => (r && r.length) ? `<div class="container"><div class="ak-ribbon">${r.map(x => `<div class="ak-rib"><span class="ak-rib__ico">${esc(x.ikon || '⭐')}</span><div><strong>${esc(x.angka)}</strong><small>${esc(T(x.label))}</small></div></div>`).join('')}</div></div>` : '';

  const sorotan = b => `<div class="ak-split">
    ${rv(`<div><span class="ak-label">${esc(T(b.label))}</span><h2>${esc(T(b.judul))}</h2><p>${esc(T(b.teks))}</p>
      <ul class="ak-check">${(b.poin || []).map(x => `<li>${esc(T(x))}</li>`).join('')}</ul>${b.tombol ? btn(b.tombol) : ''}</div>`)}
    ${rv(`<div class="ak-split__vis ak-c${(b.warna || 0) % 4}"><span class="ak-split__big" aria-hidden="true">${esc(b.ikon || '⭐')}</span>
      ${(b.chip || []).map((c, i) => `<em class="ak-chipf ak-chipf--${i + 1}">${esc(T(c))}</em>`).join('')}</div>`, .15)}</div>`;

  const kartu = b => `<div class="ak-cards">${(b.item || []).filter(x => x.tampil !== false).map((x, i) => rv(`<article class="ak-card ak-c${i % 4}">
    <div class="ak-card__ico">${esc(x.ikon || '⭐')}</div>${x.badge ? `<span class="ak-badge">${esc(T(x.badge))}</span>` : ''}
    <h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * .1)).join('')}</div>`;

  const langkah = b => `<div class="ak-steps">${(b.item || []).map((x, i) => rv(`<article class="ak-step"><span class="ak-step__n">${i + 1}</span><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * .1)).join('')}</div>`;

  const lokasi = b => {
    const d = .006, bbox = [b.lng - d, b.lat - d, b.lng + d, b.lat + d].join('%2C');
    const map = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${b.lat}%2C${b.lng}`;
    const gm = `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`;
    return `<div class="ak-loc">${rv(`<ul class="ak-info">
      <li><span>📍</span><div>${esc(b.alamat)}</div></li>
      <li><span>☎️</span><div><a href="tel:${esc(String(b.telepon).replace(/\s/g, ''))}">${esc(b.telepon)}</a></div></li>
      <li><span>✉️</span><div><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></div></li>
      <li><span>🕐</span><div>${esc(T(b.jam))}</div></li></ul>
      <a class="btn" href="${esc(gm)}" target="_blank" rel="noopener">${esc(T(b.peta))} ↗</a>`)}
      ${rv(`<iframe class="ak-map" src="${esc(map)}" title="${esc(b.alamat)}" loading="lazy"></iframe>`, .15)}</div>`;
  };

  const faq = b => `<div class="ak-faq">${(b.item || []).map((x, i) => rv(`<details class="ak-q"><summary>${esc(T(x.q))}</summary><p>${esc(T(x.a))}</p></details>`, i * .06)).join('')}</div>`;
  const tautan = b => `<div class="ak-links">${(b.item || []).map((x, i) => rv(`<a class="ak-link ak-c${i % 4}" href="${esc(x.link)}"><span class="ak-link__ico">${esc(x.ikon || '➜')}</span><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p><b aria-hidden="true">→</b></a>`, i * .08)).join('')}</div>`;
  const tanya = b => rv(`<div class="ak-ask"><div class="ak-ask__txt"><span class="ak-label ak-label--w">${esc(T(b.label))}</span><h3>${esc(T(b.judul))}</h3><p>${esc(T(b.teks))}</p>
    <div class="ak-ask__btns"><button type="button" class="btn" data-bombi>${esc(T(b.tombol_bot))}</button>${b.tombol ? btn(b.tombol) : ''}</div></div>
    <div class="ak-ask__vis"><span class="ak-ask__glow"></span><span class="ak-ask__ring"></span><span class="ak-ask__pic"><img src="${esc(MASCOT)}" alt="Bombi" onerror="this.parentNode.textContent='🤖'"></span>${b.gelembung ? `<em class="ak-ask__bub">${esc(T(b.gelembung))}</em>` : ''}</div></div>`);

  const TYPES = { sorotan, kartu, langkah, lokasi, faq, tautan };
  let alt = 0;
  const section = b => {
    const id = b.id ? ` id="${esc(b.id)}"` : '';
    if (b.tipe === 'tanya') return `<section class="ak-sec"${id}><div class="container">${tanya(b)}</div></section>`;
    const fn = TYPES[b.tipe]; if (!fn) return '';
    const cls = b.gelap ? ' ak-dark' : (alt++ % 2 ? ' ak-soft' : '');
    return `<section class="ak-sec${cls}"${id}><div class="container">${b.label && b.tipe !== 'sorotan' ? head(b) : ''}${fn(b)}</div></section>`;
  };

  function reveal(root, instant) {
    const els = root.querySelectorAll('.ak-rv:not(.in)');
    if (instant || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
    els.forEach(e => io.observe(e));
  }

  async function render() {
    const root = document.getElementById('ak-root');
    if (!root) return;
    try {
      D = D || await load('data/akomodasi.json');
      const first = !bound; alt = 0;
      root.innerHTML = hero(D.hero) + stats(D.ringkasan) + (D.bagian || []).map(section).join('');
      reveal(root, !first);
      if (first) {
        bound = true;
        root.addEventListener('click', e => {
          if (e.target.closest('[data-bombi]')) { const t = document.getElementById('bombiTrigger'), w = document.getElementById('bombiWindow'); if (t && w && w.hidden) t.click(); }
        });
      }
    } catch (e) {
      console.error('akomodasi.js:', e);
      root.innerHTML = '<p style="padding:8rem 8%;text-align:center">Data halaman gagal dimuat (' + esc(e && e.message) + '). Periksa <b>data/akomodasi.json</b> dan lihat Console.</p>';
    }
  }
  document.addEventListener('components:ready', render);
  document.addEventListener('i18n:change', () => { if (D) render(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();