/* guru.js: menampilkan halaman Guru dari data/guru.json */
(() => {
  const PH = "this.onerror=null;this.src='assets/img/placeholder.svg'";
  let DATA = null;
  let bound = false;
  const state = { kelompok: 'semua', q: '' };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lang = () => (window.I18N && I18N.lang) || 'id';
  const T = v => (v && typeof v === 'object') ? (v[lang()] || v.id || '') : (v ?? '');
  const load = url => (window.Site && Site.json) ? Site.json(url) : fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' saat memuat ' + url); return r.json(); });
  const ui = k => T(DATA && DATA.ui && DATA.ui[k]);
  const rv = (inner, d = 0) => `<div class="gr-rv" style="--d:${d}s">${inner}</div>`;

  /* ---------- DATA ---------- */
  const people = () => (DATA.guru || []).map((g, i) => ({ ...g, _i: i })).filter(g => g.tampil !== false);
  const groupOf = id => (DATA.kelompok || []).find(k => k.id === id) || {};
  const groupLabel = id => T(groupOf(id).label) || id || '';
  const groupRank = id => { const n = (DATA.kelompok || []).findIndex(k => k.id === id); return n < 0 ? 99 : n; };

  const filtered = () => {
    const q = state.q.trim().toLowerCase();
    return people().filter(g => {
      if (state.kelompok !== 'semua' && g.kelompok !== state.kelompok) return false;
      if (!q) return true;
      const hay = [g.nama, T(g.jabatan), g.pendidikan, ...(g.bidang || [])].join(' ').toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => groupRank(a.kelompok) - groupRank(b.kelompok) || a._i - b._i);
  };

  /* ---------- AVATAR (foto, atau inisial berwarna kalau foto tidak ada) ---------- */
  const initials = name => {
    const w = String(name || '').split(',')[0].split(/\s+/).filter(x => x && !/^(dr|drs|dra|prof|ir|h|hj)\.?$/i.test(x));
    return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
  };
  const hue = name => [...String(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
  const avatar = (g, cls = '') => `<div class="gr-av ${cls}"><span>${esc(initials(g.nama))}</span>${g.foto ? `<img src="${esc(g.foto)}" alt="${esc(g.nama)}" loading="lazy" onerror="this.remove()">` : ''}</div>`;

  /* ---------- HERO ---------- */
  const hero = h => {
    if (!h) return '';
    return `<section class="gr-hero">
    ${h.gambar ? `<img class="gr-hero__bg" src="${esc(h.gambar)}" alt="${esc(T(h.alt))}" onerror="${PH}">` : ''}
    <div class="gr-hero__deco" aria-hidden="true">
      <span class="gr-hero__big">👩‍🏫</span>
      <span class="gr-hero__i gr-hero__i--1">🎓</span><span class="gr-hero__i gr-hero__i--2">📚</span><span class="gr-hero__i gr-hero__i--3">💡</span><span class="gr-hero__i gr-hero__i--4">✏️</span>
      <i class="gr-spark gr-spark--1">✦</i><i class="gr-spark gr-spark--2">✦</i><i class="gr-spark gr-spark--3">✦</i><i class="gr-spark gr-spark--4">✦</i>
    </div>
    <div class="container gr-hero__in">
      <span class="gr-pill">${esc(T(h.label))}</span>
      <h1>${esc(T(h.judul_awal))} <span class="hl">${esc(T(h.judul_sorot))}</span> ${esc(T(h.judul_akhir))}</h1>
      <p>${esc(T(h.deskripsi))}</p>
      <div class="gr-hero__cta">${(h.tombol || []).map(b =>
        `<a class="btn${b.gaya === 'ghost' ? ' btn--ghost' : ''}" href="${esc(b.link)}">${esc(T(b.teks))}</a>`).join('')}</div>
    </div>
  </section>`;
  };

  /* ---------- ANGKA RINGKAS ---------- */
  const stats = first => {
    const rows = (DATA.ringkasan && DATA.ringkasan.item) || [];
    if (!rows.length) return '';
    return `<div class="container"><div class="gr-stats">${rows.map(r => `<div class="gr-stat">
      <span class="gr-stat__ico" aria-hidden="true">${esc(r.ikon || '⭐')}</span>
      <strong>${typeof r.angka === 'number' ? `<span data-count="${r.angka}">${first ? 0 : r.angka}</span>` : esc(r.angka)}</strong>
      <span class="gr-stat__lb">${esc(T(r.label))}</span></div>`).join('')}</div></div>`;
  };

  const head = o => `<div class="gr-head"><span class="gr-label">${esc(T(o.label))}</span><h2>${esc(T(o.judul))}</h2>${o.sub ? `<p>${esc(T(o.sub))}</p>` : ''}</div>`;

  /* ---------- KEPALA SEKOLAH ---------- */
  const kepsek = () => {
    const k = DATA.kepsek;
    if (!k) return '';
    return `<section class="gr-sec" id="kepala-sekolah"><div class="container">${rv(`<article class="gr-boss">
      <div class="gr-boss__photo">
        <span class="gr-boss__ring"></span>
        <div class="gr-boss__initial">${esc(initials(k.nama))}</div>
        ${k.foto ? `<img src="${esc(k.foto)}" alt="${esc(k.nama)}" onerror="this.remove()">` : ''}
      </div>
      <div class="gr-boss__body">
        <span class="gr-label">${esc(T(k.label))}</span>
        <h2>${esc(k.nama)}</h2>
        <p class="gr-boss__role">${esc(T(k.jabatan))}</p>
        <blockquote>${esc(T(k.kutipan))}</blockquote>
        ${k.tombol ? `<a class="btn" href="${esc(k.tombol.link)}">${esc(T(k.tombol.teks))}</a>` : ''}
      </div></article>`)}</div></section>`;
  };

  /* ---------- KENAPA GURU KAMI ---------- */
  const mengapa = () => (DATA.mengapa && (DATA.mengapa.item || []).length) ? `<section class="gr-sec gr-soft gr-wave-w" id="mengapa"><div class="container">${head(DATA.mengapa)}
    <div class="gr-icons">${DATA.mengapa.item.map((x, i) => rv(`<article class="gr-icon">
      <div class="gr-icon__ico">${esc(x.ikon)}</div><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * 0.1)).join('')}</div></div></section>` : '';

  /* ---------- DIREKTORI ---------- */
  const card = g => {
    const h = hue(g.nama);
    return `<article class="gr-card gr-c${h}">
      <div class="gr-card__cover"></div>
      ${avatar(g)}
      <div class="gr-card__body">
        <h3>${esc(g.nama)}</h3>
        <p class="gr-card__role">${esc(T(g.jabatan))}</p>
        ${(g.bidang || []).length ? `<div class="gr-tags">${g.bidang.slice(0, 3).map(b => `<span>${esc(b)}</span>`).join('')}</div>` : ''}
        <button type="button" class="gr-card__btn" data-gr-open="${g._i}">${esc(ui('profil'))}</button>
      </div></article>`;
  };

  const listHTML = () => {
    const f = filtered();
    const count = `<p class="gr-count">${esc(ui('menampilkan').replace('{n}', f.length))}</p>`;
    if (!f.length) return count + `<div class="gr-empty"><span>🔍</span><p>${esc(ui('kosong'))}</p><button type="button" data-gr-reset>${esc(ui('reset'))}</button></div>`;
    return count + `<div class="gr-grid">${f.map(card).join('')}</div>`;
  };

  const toolbar = () => {
    const all = people(), groups = (DATA.kelompok || []).filter(k => all.some(g => g.kelompok === k.id));
    const chip = (id, label, n) => `<button type="button" class="gr-chip${state.kelompok === id ? ' on' : ''}" data-gr-kelompok="${esc(id)}">${label}<i>${n}</i></button>`;
    return `<div class="gr-toolbar">
      <div class="gr-chips">${chip('semua', esc(ui('semua')), all.length)}${groups.map(k => chip(k.id, `${esc(k.ikon || '')} ${esc(T(k.label))}`, all.filter(g => g.kelompok === k.id).length)).join('')}</div>
      <input id="gr-q" type="search" placeholder="${esc(ui('cari'))}" value="${esc(state.q)}" aria-label="${esc(ui('cari'))}">
    </div>`;
  };

  const direktori = () => {
    if (!DATA.daftar || !people().length) return '';
    const note = T(DATA.daftar.pesan_lengkapi);
    return `<section class="gr-sec" id="daftar-guru"><div class="container">${head(DATA.daftar)}${toolbar()}<div id="gr-list">${listHTML()}</div>
      ${note ? `<p class="gr-note">✨ ${esc(note)}</p>` : ''}</div></section>`;
  };

  const dialogShell = () => `<dialog class="gr-dialog" id="gr-dialog" aria-label="${esc(ui('profil') || 'Profil')}"><div class="gr-dialog__in"></div></dialog>`;

  const dialogBody = g => {
    const chips = (g.bidang || []).length ? `<div class="gr-dlg__sec"><h4>${esc(ui('bidang'))}</h4><div class="gr-tags">${g.bidang.map(b => `<span>${esc(b)}</span>`).join('')}</div></div>` : '';
    const edu = g.pendidikan ? `<div class="gr-dlg__sec"><h4>${esc(ui('pendidikan'))}</h4><p>${esc(g.pendidikan)}</p></div>` : '';
    const bio = T(g.bio) ? `<div class="gr-dlg__sec"><h4>${esc(ui('tentang'))}</h4><p>${esc(T(g.bio))}</p></div>` : '';
    const motto = T(g.motto) ? `<blockquote class="gr-dlg__motto">“${esc(T(g.motto))}”</blockquote>` : '';
    return `<button type="button" class="gr-dialog__x" data-gr-close aria-label="${esc(ui('tutup'))}">×</button>
      <div class="gr-dlg__top gr-c${hue(g.nama)}">${avatar(g, 'gr-av--lg')}</div>
      <div class="gr-dlg__body">
        <span class="gr-pillx">${esc(groupLabel(g.kelompok))}</span>
        <h3>${esc(g.nama)}</h3>
        <p class="gr-card__role">${esc(T(g.jabatan))}</p>
        ${motto}${bio}${edu}${chips}
      </div>`;
  };

  const build = first => hero(DATA.hero) + stats(first) + kepsek() + mengapa() + direktori() + dialogShell();

  /* ---------- EFEK MUNCUL ---------- */
  function reveal(root, instant) {
    const els = root.querySelectorAll('.gr-rv:not(.in)');
    if (instant || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- INTERAKSI ---------- */
  function refresh(root) {
    const list = root.querySelector('#gr-list');
    if (list) list.innerHTML = listHTML();
    root.querySelectorAll('[data-gr-kelompok]').forEach(b => b.classList.toggle('on', b.dataset.grKelompok === state.kelompok));
  }
  function bind(root) {
    root.addEventListener('click', e => {
      const t = e.target;
      const c = t.closest('[data-gr-kelompok]');
      if (c) { state.kelompok = c.dataset.grKelompok; return refresh(root); }
      if (t.closest('[data-gr-reset]')) {
        state.kelompok = 'semua'; state.q = '';
        const q = root.querySelector('#gr-q'); if (q) q.value = '';
        return refresh(root);
      }
      const o = t.closest('[data-gr-open]');
      if (o) {
        const g = (DATA.guru || [])[Number(o.dataset.grOpen)], dlg = root.querySelector('#gr-dialog');
        if (g && dlg) {
          dlg.querySelector('.gr-dialog__in').innerHTML = dialogBody(g);
          if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
        }
        return;
      }
      if (t.closest('[data-gr-close]') || (t.id === 'gr-dialog')) {      // tombol tutup atau klik latar gelap
        const d = root.querySelector('#gr-dialog'); if (d) { if (d.close) d.close(); else d.removeAttribute('open'); }
      }
    });
    root.addEventListener('input', e => { if (e.target.id === 'gr-q') { state.q = e.target.value; refresh(root); } });
  }

  async function render() {
    const root = document.getElementById('guru-root');
    if (!root) return;
    try {
      DATA = DATA || await load('data/guru.json');
      const first = !bound;
      root.innerHTML = build(first);
      reveal(root, !first);
      if (first) {
        bound = true;                       // diset lebih dulu supaya listener tidak terpasang dobel
        bind(root);
        try { if (typeof initCounters === 'function') initCounters(); } catch (err) { console.warn('guru.js: initCounters gagal', err); }
      }
    } catch (e) {
      console.error('guru.js:', e);
      root.innerHTML = '<p style="padding:8rem 8%;text-align:center">Data halaman gagal dimuat (' + esc(e && e.message) + '). Periksa <b>data/guru.json</b> (koma dan tanda kutip) dan lihat Console untuk detail.</p>';
    }
  }

  document.addEventListener('components:ready', render);
  document.addEventListener('i18n:change', () => { if (DATA) render(); });

  // Cadangan: kalau event components:ready sudah lewat sebelum file ini dimuat, tetap tampilkan halaman.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();