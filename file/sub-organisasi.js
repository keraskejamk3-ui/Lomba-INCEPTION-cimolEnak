/* sub-organisasi.js: menampilkan halaman dari data/sub-organisasi.json (bagian-bagiannya diatur lewat JSON) */
(() => {
  const SELF = document.currentScript && document.currentScript.src;
  const MASCOT = SELF ? new URL('../bombi.jpeg', SELF).href : 'bombi.jpeg';
  let D = null, bound = false;
  const st = { k: 'semua', q: '' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lang = () => (window.I18N && I18N.lang) || 'id';
  const T = v => (v && typeof v === 'object') ? (v[lang()] || v.id || '') : (v ?? '');
  const load = u => (window.Site && Site.json) ? Site.json(u) : fetch(u).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' saat memuat ' + u); return r.json(); });
  const ui = k => T(D.ui && D.ui[k]);
  const rv = (h, d = 0) => `<div class="so-rv" style="--d:${d}s">${h}</div>`;
  const head = o => `<div class="so-head"><span class="so-label">${esc(T(o.label))}</span><h2>${esc(T(o.judul))}</h2>${o.sub ? `<p>${esc(T(o.sub))}</p>` : ''}</div>`;
  const btn = b => `<a class="btn${b.gaya === 'ghost' ? ' btn--ghost' : ''}" href="${esc(b.link)}">${esc(T(b.teks))}</a>`;

  const hero = h => !h ? '' : `<section class="so-hero">
    ${h.gambar ? `<img class="so-hero__bg" src="${esc(h.gambar)}" alt="${esc(T(h.alt))}" onerror="this.remove()">` : ''}
    <div class="so-hero__deco" aria-hidden="true"><span class="so-hero__big">${esc(h.ikon || '')}</span>
      ${(h.ikon_kecil || []).slice(0, 4).map((e, i) => `<span class="so-hero__i so-hero__i--${i + 1}">${esc(e)}</span>`).join('')}
      <i class="so-spark so-spark--1">✦</i><i class="so-spark so-spark--2">✦</i><i class="so-spark so-spark--3">✦</i></div>
    <div class="container so-hero__in">
      ${(h.jejak || []).length ? `<nav class="so-crumb" aria-label="breadcrumb">${h.jejak.map((c, i, a) => i < a.length - 1 ? `<a href="${esc(c.link)}">${esc(T(c.teks))}</a><b>›</b>` : `<span>${esc(T(c.teks))}</span>`).join('')}</nav>` : ''}
      <span class="so-pill">${esc(T(h.label))}</span>
      <h1>${esc(T(h.judul_awal))} <span class="hl">${esc(T(h.judul_sorot))}</span> ${esc(T(h.judul_akhir))}</h1>
      <p>${esc(T(h.deskripsi))}</p><div class="so-hero__cta">${(h.tombol || []).map(btn).join('')}</div></div></section>`;

  const stats = (r, first) => (r && r.length) ? `<div class="container"><div class="so-ribbon">${r.map(x => `<div class="so-rib"><span class="so-rib__ico">${esc(x.ikon || '⭐')}</span>
    <div><strong>${typeof x.angka === 'number' ? `<span data-count="${x.angka}">${first ? 0 : x.angka}</span>` : esc(x.angka)}</strong><small>${esc(T(x.label))}</small></div></div>`).join('')}</div></div>` : '';
  const tanya = b => rv(`<div class="so-ask"><div class="so-ask__txt"><span class="so-label">${esc(T(b.label))}</span><h3>${esc(T(b.judul))}</h3><p>${esc(T(b.teks))}</p>
    <div class="so-ask__btns"><button type="button" class="btn" data-bombi>${esc(T(b.tombol_bot))}</button>${b.tombol ? btn(b.tombol) : ''}</div></div>
    <div class="so-ask__vis"><span class="so-ask__glow"></span><img src="${esc(MASCOT)}" alt="Bombi" onerror="this.remove()"><em class="so-ask__bub">${esc(T(b.gelembung))}</em></div></div>`);

  const kartu = b => `<div class="so-cards">${(b.item || []).filter(x => x.tampil !== false).map((x, i) => rv(`<article class="so-card so-c${i % 6}">
    <div class="so-card__ico">${esc(x.ikon || '⭐')}</div><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * .1)).join('')}</div>`;
  const langkah = b => `<div class="so-steps">${(b.item || []).map((x, i) => rv(`<article class="so-step"><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * .1)).join('')}</div>`;
  const mitra = b => `<div class="so-partners">${(b.item || []).map(x => `<span>${esc(x.nama)}</span>`).join('')}</div>`;
  const cta = b => `<div class="container"><div class="so-cta"><div><h3>${esc(T(b.judul))}</h3><p>${esc(T(b.teks))}</p></div>${(b.tombol || []).map(btn).join('')}</div></div>`;

  /* daftar dengan filter kelompok + pencarian */
  const items = b => (b.item || []).map((g, i) => ({ ...g, _i: i })).filter(g => g.tampil !== false);
  const cardOf = (g, b) => { const k = (b.kelompok || []).find(x => x.id === g.kelompok) || {};
    return `<article class="so-card"><div class="so-card__ico">${esc(g.ikon || k.ikon || '⭐')}</div><h3>${esc(g.nama)}</h3>
      ${k.label ? `<p class="so-role">${esc(T(k.label))}</p>` : ''}${T(g.deskripsi) ? `<p>${esc(T(g.deskripsi))}</p>` : ''}
      ${(g.tag || []).length ? `<div class="so-tags">${g.tag.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}</article>`; };
  const listHTML = b => {
    const q = st.q.trim().toLowerCase();
    const f = items(b).filter(g => (st.k === 'semua' || g.kelompok === st.k) && (!q || [g.nama, T(g.deskripsi), ...(g.tag || [])].join(' ').toLowerCase().includes(q)));
    const n = `<p class="so-count">${esc(ui('menampilkan').replace('{n}', f.length))}</p>`;
    return f.length ? n + `<div class="so-cards">${f.map(g => cardOf(g, b)).join('')}</div>`
      : n + `<div class="so-empty"><p>${esc(ui('kosong'))}</p><button type="button" data-reset>${esc(ui('reset'))}</button></div>`;
  };
  const daftar = b => {
    const all = items(b);
    if (!all.length) return `<p class="so-note">✨ ${esc(T(b.pesan_kosong))}</p>`;
    const chip = (id, lb, n) => `<button type="button" class="so-chip${st.k === id ? ' on' : ''}" data-k="${esc(id)}">${lb}<i>${n}</i></button>`;
    const gs = (b.kelompok || []).filter(k => all.some(g => g.kelompok === k.id));
    return `<div class="so-toolbar"><div class="so-chips">${chip('semua', esc(ui('semua')), all.length)}${gs.map(k => chip(k.id, `${esc(k.ikon || '')} ${esc(T(k.label))}`, all.filter(g => g.kelompok === k.id).length)).join('')}</div>
      <input id="so-q" class="so-q" type="search" placeholder="${esc(ui('cari'))}" value="${esc(st.q)}" aria-label="${esc(ui('cari'))}"></div><div id="so-list" data-b="${b._n}">${listHTML(b)}</div>`;
  };

  const sorotan = b => `<div class="so-split">
    ${rv(`<div class="so-split__txt"><span class="so-label">${esc(T(b.label))}</span><h2>${esc(T(b.judul))}</h2><p>${esc(T(b.teks))}</p>
      <ul class="so-check">${(b.poin || []).map(x => `<li>${esc(T(x))}</li>`).join('')}</ul>${b.tombol ? btn(b.tombol) : ''}</div>`)}
    ${rv(`<div class="so-split__vis so-c${(b.warna || 0) % 6}"><span class="so-split__big" aria-hidden="true">${esc(b.ikon || '⭐')}</span>
      ${(b.chip || []).map((c, i) => `<em class="so-chipf so-chipf--${i + 1}">${esc(T(c))}</em>`).join('')}</div>`, .15)}</div>`;
  const kutipan = b => rv(`<figure class="so-quote"><span class="so-quote__mark" aria-hidden="true">“</span><span class="so-label so-label--w">${esc(T(b.label))}</span>
    <blockquote>${esc(T(b.teks))}</blockquote><figcaption>${b.nama ? `<b>${esc(b.nama)}</b>` : ''}${T(b.jabatan) ? `<span>${esc(T(b.jabatan))}</span>` : ''}</figcaption></figure>`);
  const tautan = b => `<div class="so-links">${(b.item || []).map((x, i) => rv(`<a class="so-link so-c${i % 6}" href="${esc(x.link)}"><span class="so-link__ico">${esc(x.ikon || '➜')}</span>
    <h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p><b aria-hidden="true">→</b></a>`, i * .08)).join('')}</div>`;
  const marquee = b => { const it = (b.item || []).map(x => `<span>${esc(T(x))}</span>`).join(''); return it ? `<div class="so-marq" aria-hidden="true"><div class="so-marq__t">${it}${it}</div></div>` : ''; };

  const TYPES = { kartu, langkah, mitra, daftar, sorotan, tautan };
  let alt = 0;
  const section = (b, i) => {
    const id = b.id ? ` id="${esc(b.id)}"` : '';
    if (b.tipe === 'tanya') return `<section class="so-sec"${id}><div class="container">${tanya(b)}</div></section>`;
    if (b.tipe === 'cta') return `<section class="so-sec"${id}>${cta(b)}</section>`;
    if (b.tipe === 'marquee') return marquee(b);
    if (b.tipe === 'kutipan') return `<section class="so-sec"${id}><div class="container">${kutipan(b)}</div></section>`;
    const fn = TYPES[b.tipe]; if (!fn) return '';
    b._n = i;
    const cls = b.gelap ? ' so-dark' : (alt++ % 2 ? ' so-soft' : '');
    return `<section class="so-sec${cls}"${id}><div class="container">${b.label && b.tipe !== 'sorotan' ? head(b) : ''}${fn(b)}</div></section>`;
  };

    function reveal(root, instant) {
    const els = root.querySelectorAll('.so-rv:not(.in)');
    if (instant || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
    els.forEach(e => io.observe(e));
  }
  const refresh = root => { const l = root.querySelector('#so-list'); if (!l) return;
    l.innerHTML = listHTML(D.bagian[Number(l.dataset.b)]);
    root.querySelectorAll('[data-k]').forEach(c => c.classList.toggle('on', c.dataset.k === st.k)); };
  function bind(root) {
    root.addEventListener('click', e => {
      if (e.target.closest('[data-bombi]')) { const t = document.getElementById('bombiTrigger'), w = document.getElementById('bombiWindow'); if (t && w && w.hidden) t.click(); return; }
      const c = e.target.closest('[data-k]');
      if (c) { st.k = c.dataset.k; return refresh(root); }
      if (e.target.closest('[data-reset]')) { st.k = 'semua'; st.q = ''; const q = root.querySelector('#so-q'); if (q) q.value = ''; refresh(root); }
    });
    root.addEventListener('input', e => { if (e.target.id === 'so-q') { st.q = e.target.value; refresh(root); } });
  }

  async function render() {
    const root = document.getElementById('org-root');
    if (!root) return;
    try {
      D = D || await load('data/sub-organisasi.json');
      const first = !bound;
      alt = 0;
      root.innerHTML = hero(D.hero) + stats(Array.isArray(D.ringkasan) ? D.ringkasan : (D.ringkasan && D.ringkasan.item), first) + (D.bagian || []).map(section).join('');
      reveal(root, !first);
      if (first) { bound = true; bind(root); try { if (typeof initCounters === 'function') initCounters(); } catch (err) { console.warn('sub-organisasi.js: initCounters gagal', err); } }
    } catch (e) {
      console.error('sub-organisasi.js:', e);
      root.innerHTML = '<p style="padding:8rem 8%;text-align:center">Data halaman gagal dimuat (' + esc(e && e.message) + '). Periksa <b>data/sub-organisasi.json</b> (koma dan tanda kutip) dan lihat Console.</p>';
    }
  }
  document.addEventListener('components:ready', render);
  document.addEventListener('i18n:change', () => { if (D) render(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();