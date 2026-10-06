/* prestasi.js: menampilkan halaman Prestasi dari data/prestasi.json */
(() => {
  const PH = "this.onerror=null;this.src='assets/img/placeholder.svg'";
  let DATA = null;
  const state = { tingkat: 'semua', tahun: 'semua', q: '' };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = v => (v && typeof v === 'object') ? (v[I18N.lang] || v.id || '') : (v ?? '');
  const load = url => (window.Site && Site.json) ? Site.json(url) : fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const ui = k => T(DATA.ui && DATA.ui[k]);
  const rv = (inner, d = 0) => `<div class="pr-rv" style="--d:${d}s">${inner}</div>`;     // muncul pelan saat di-scroll

  const MEDAL = {
    emas:       { ikon: '🥇', cls: 'gold' },
    perak:      { ikon: '🥈', cls: 'silver' },
    perunggu:   { ikon: '🥉', cls: 'bronze' },
    juara:      { ikon: '🏆', cls: 'trophy' },
    perwakilan: { ikon: '🌏', cls: 'world' }
  };
  const medal = x => MEDAL[x.medali] || { ikon: '⭐', cls: 'trophy' };
  const lvl = k => (DATA.tingkat && DATA.tingkat[k]) || {};
  const lvlLabel = k => T(lvl(k).label) || (k ? k.charAt(0).toUpperCase() + k.slice(1) : '');
  const lvlClass = k => ({ internasional: 'int', nasional: 'nas', provinsi: 'prov' }[k] || 'other');

  const items = () => (DATA.prestasi || []).filter(x => x.tampil !== false);
  const latestYear = () => Math.max(0, ...items().map(x => Number(x.tahun) || 0));

  const filtered = () => {
    const q = state.q.trim().toLowerCase();
    return items().filter(x => {
      if (state.tingkat !== 'semua' && x.tingkat !== state.tingkat) return false;
      if (state.tahun !== 'semua' && String(x.tahun) !== String(state.tahun)) return false;
      if (!q) return true;
      const hay = [x.judul && x.judul.id, x.judul && x.judul.en, x.kegiatan && x.kegiatan.id, x.kegiatan && x.kegiatan.en,
                   x.penghargaan && x.penghargaan.id, x.bidang, ...(x.peserta || [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  };

  const head = o => `<div class="pr-head"><span class="pr-label">${esc(T(o.label))}</span><h2>${esc(T(o.judul))}</h2>${o.sub ? `<p>${esc(T(o.sub))}</p>` : ''}</div>`;

  /* ---------- HERO ---------- */
  const hero = h => `<section class="pr-hero">
    <img class="pr-hero__bg" src="${esc(h.gambar)}" alt="${esc(T(h.alt))}" onerror="${PH}">
    <div class="pr-hero__deco" aria-hidden="true">
      <span class="pr-hero__cup">🏆</span><span class="pr-hero__m pr-hero__m--1">🥇</span><span class="pr-hero__m pr-hero__m--2">🥈</span><span class="pr-hero__m pr-hero__m--3">🥉</span>
      <i class="pr-spark pr-spark--1">✦</i><i class="pr-spark pr-spark--2">✦</i><i class="pr-spark pr-spark--3">✦</i><i class="pr-spark pr-spark--4">✦</i><i class="pr-spark pr-spark--5">✦</i>
    </div>
    <div class="container pr-hero__in">
      <span class="pr-pill">${esc(T(h.label))}</span>
      <h1>${esc(T(h.judul_awal))} <span class="hl">${esc(T(h.judul_sorot))}</span> ${esc(T(h.judul_akhir))}</h1>
      <p>${esc(T(h.deskripsi))}</p>
      <div class="pr-hero__cta">${(h.tombol || []).map(b =>
        `<a class="btn${b.gaya === 'ghost' ? ' btn--ghost' : ''}" href="${esc(b.link)}">${esc(T(b.teks))}</a>`).join('')}</div>
    </div>
  </section>`;

  /* ---------- ANGKA RINGKAS (dihitung otomatis) ---------- */
  const stats = first => {
    const all = items(), cnt = k => all.filter(x => x.tingkat === k).length;
    const rows = [['total', all.length, '🏆'], ['internasional', cnt('internasional'), '🌏'], ['nasional', cnt('nasional'), '🎖️'], ['provinsi', cnt('provinsi'), '📍']];
    return `<div class="container"><div class="pr-stats">${rows.map(([k, n, ic]) => `<div class="pr-stat">
      <span class="pr-stat__ico" aria-hidden="true">${ic}</span>
      <strong><span data-count="${n}">${first ? 0 : n}</span></strong><span class="pr-stat__lb">${esc(ui('stat_' + k))}</span></div>`).join('')}</div></div>`;
  };

  /* ---------- JEJAK PRESTASI PER TAHUN (dihitung otomatis) ---------- */
  const RANK = { internasional: 3, nasional: 2, provinsi: 1 };
  const trail = () => {
    const all = items();
    const years = [...new Set(all.map(x => Number(x.tahun)))].sort((a, b) => a - b);
    if (years.length < 2 || !DATA.jejak) return '';
    const newest = years[years.length - 1];
    const best = y => all.filter(x => Number(x.tahun) === y)
      .sort((a, b) => (b.unggulan ? 1 : 0) - (a.unggulan ? 1 : 0) || (RANK[b.tingkat] || 0) - (RANK[a.tingkat] || 0))[0];
    const nodes = years.map((y, i) => {
      const n = all.filter(x => Number(x.tahun) === y).length, x = best(y);
      return `<li class="pr-trail__node${y === newest ? ' is-new' : ''}">
        <span class="pr-trail__dot">${esc(x.ikon || medal(x).ikon)}</span>
        <strong>${esc(y)}</strong>
        <em>${esc(ui('prestasi_n').replace('{n}', n))}</em>
        <p>${esc(T(x.penghargaan))} · ${esc(T(x.judul))}</p>
        ${y === newest ? `<span class="pr-trail__new">${esc(ui('tag_terbaru'))}</span>` : ''}
      </li>`;
    }).join('');
    return `<section class="pr-trail"><div class="container">${rv(`<div class="pr-trail__box">
      <div class="pr-trail__head"><span class="pr-label">${esc(T(DATA.jejak.label))}</span><h3>${esc(T(DATA.jejak.judul))}</h3></div>
      <ol class="pr-trail__line" style="--n:${years.length}">${nodes}</ol></div>`)}</div></section>`;
  };

  /* ---------- SOROTAN ---------- */
  const featured = () => {
    const f = items().filter(x => x.unggulan).sort((a, b) => b.tahun - a.tahun).slice(0, 3);
    if (!f.length || !DATA.sorotan) return '';
    return `<section class="pr-sec" id="sorotan"><div class="container">${head(DATA.sorotan)}
      <div class="pr-feat">${f.map((x, i) => {
        const m = medal(x);
        return rv(`<article class="pr-feat__card">
          <span class="pr-feat__year">${esc(x.tahun)}</span>
          <div class="pr-feat__ico">${esc(x.ikon || m.ikon)}</div>
          <span class="pr-lvl pr-lvl--${lvlClass(x.tingkat)}">${esc(lvl(x.tingkat).ikon || '')} ${esc(lvlLabel(x.tingkat))}</span>
          <h3>${esc(T(x.penghargaan))}</h3>
          <p class="pr-feat__title">${esc(T(x.judul))}</p>
          <p class="pr-feat__ev">${esc(T(x.kegiatan))}</p>
        </article>`, i * 0.12);
      }).join('')}</div></div></section>`;
  };

  /* ---------- PODIUM MEDALI (dihitung otomatis) ---------- */
  const podium = () => {
    if (!DATA.podium) return '';
    const all = items(), by = k => all.filter(x => x.medali === k);
    const third = by('perunggu').length ? 'perunggu' : 'juara';
    const col = (k, rank) => {
      const list = by(k), fields = [...new Set(list.map(x => x.bidang || T(x.judul)))].slice(0, 3);
      return `<div class="pr-pod pr-pod--${rank}${k === 'juara' ? ' pr-pod--juara' : ''}">
        <div class="pr-pod__top"><span class="pr-pod__medal">${MEDAL[k].ikon}</span>
          <strong>${list.length}</strong><em>${esc(ui('podium_' + k))}</em>
          <small>${fields.length ? esc(fields.join(' · ')) : esc(ui('podium_kosong'))}</small></div>
        <div class="pr-pod__block"><span>${rank}</span></div></div>`;
    };
    return `<section class="pr-sec pr-soft pr-wave-w" id="podium"><div class="container">${head(DATA.podium)}
      ${rv(`<div class="pr-podium">${col('perak', 2)}${col('emas', 1)}${col(third, 3)}</div>`)}</div></section>`;
  };

  /* ---------- BIDANG KOMPETENSI (dihitung otomatis) ---------- */
  const fields = () => {
    if (!DATA.keahlian) return '';
    const map = {};
    items().forEach(x => { if (x.bidang) map[x.bidang] = (map[x.bidang] || 0) + 1; });
    const list = Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (!list.length) return '';
    const icons = DATA.keahlian.ikon || {};
    return `<section class="pr-sec pr-wave-s" id="bidang"><div class="container">${head(DATA.keahlian)}
      <div class="pr-fields">${list.map(([name, n], i) => rv(`<article class="pr-field">
        <div class="pr-field__ico">${esc(icons[name] || '⭐')}</div>
        <h3>${esc(name)}</h3><p>${esc(ui('prestasi_n').replace('{n}', n))}</p></article>`, i * 0.07)).join('')}</div></div></section>`;
  };

  /* ---------- KARTU PRESTASI ---------- */
  const card = (x, newest) => {
    const m = medal(x), isNew = Number(x.tahun) === newest;
    const tag = isNew ? `<span class="pr-new">${esc(ui('tag_terbaru'))}</span>` : '';
    const media = x.foto
      ? `<div class="pr-card__media"><img src="${esc(x.foto)}" alt="${esc(T(x.judul))}" loading="lazy" onerror="${PH}">${tag}<span class="pr-card__medal">${esc(x.ikon || m.ikon)}</span></div>`
      : `<div class="pr-card__media pr-card__media--${m.cls}">${tag}<span class="pr-card__big">${esc(x.ikon || m.ikon)}</span></div>`;
    const who = (x.peserta || []).length ? `<p class="pr-card__who"><b>${esc(ui('peserta'))}:</b> ${esc(x.peserta.join(', '))}</p>` : '';
    return `<article class="pr-card pr-card--${lvlClass(x.tingkat)}">
      ${media}
      <div class="pr-card__body">
        <div class="pr-card__tags">
          <span class="pr-lvl pr-lvl--${lvlClass(x.tingkat)}">${esc(lvl(x.tingkat).ikon || '')} ${esc(lvlLabel(x.tingkat))}</span>
          <span class="pr-card__date">🗓️ ${esc(T(x.tanggal) || x.tahun)}</span>
        </div>
        <span class="pr-card__award">${esc(T(x.penghargaan))}</span>
        <h3>${esc(T(x.judul))}</h3>
        <p class="pr-card__ev">${esc(T(x.kegiatan))}</p>
        ${who}
        ${x.tautan ? `<a class="pr-card__link" href="${esc(x.tautan)}" target="_blank" rel="noopener">${esc(ui('sumber'))} ↗</a>` : ''}
      </div>
    </article>`;
  };

  const listHTML = () => {
    const f = filtered(), newest = latestYear();
    const count = `<p class="pr-count">${esc(ui('menampilkan').replace('{n}', f.length))}</p>`;
    if (!f.length) return count + `<div class="pr-empty"><span>🔍</span><p>${esc(ui('kosong'))}</p><button type="button" data-pr-reset>${esc(ui('reset'))}</button></div>`;
    const years = [...new Set(f.map(x => x.tahun))].sort((a, b) => b - a);
    return count + years.map(y => `<div class="pr-year"><span>${esc(y)}</span></div>
      <div class="pr-grid">${f.filter(x => x.tahun === y).map(x => card(x, newest)).join('')}</div>`).join('');
  };

  const toolbar = () => {
    const all = items(), levels = Object.keys(DATA.tingkat || {}).filter(k => all.some(x => x.tingkat === k));
    const years = [...new Set(all.map(x => x.tahun))].sort((a, b) => b - a);
    const chip = (k, label, n) => `<button type="button" class="pr-chip${state.tingkat === k ? ' on' : ''}" data-pr-tingkat="${esc(k)}">${label}<i>${n}</i></button>`;
    return `<div class="pr-toolbar">
      <div class="pr-chips">${chip('semua', esc(ui('semua')), all.length)}${levels.map(k => chip(k, `${esc(lvl(k).ikon || '')} ${esc(lvlLabel(k))}`, all.filter(x => x.tingkat === k).length)).join('')}</div>
      <div class="pr-tools">
        <select id="pr-year" aria-label="${esc(ui('semua_tahun'))}"><option value="semua">${esc(ui('semua_tahun'))}</option>${years.map(y => `<option value="${esc(y)}"${String(state.tahun) === String(y) ? ' selected' : ''}>${esc(y)}</option>`).join('')}</select>
        <input id="pr-q" type="search" placeholder="${esc(ui('cari'))}" value="${esc(state.q)}" aria-label="${esc(ui('cari'))}">
      </div>
    </div>`;
  };

  const daftar = () => `<section class="pr-sec pr-soft pr-wave-w" id="daftar-prestasi"><div class="container">${head(DATA.daftar)}${toolbar()}<div id="pr-list">${listHTML()}</div></div></section>`;

  const pembinaan = () => (DATA.pembinaan && (DATA.pembinaan.item || []).length) ? `<section class="pr-sec pr-wave-s" id="pembinaan"><div class="container">${head(DATA.pembinaan)}
    <div class="pr-icons">${DATA.pembinaan.item.map((x, i) => rv(`<article class="pr-icon">
      <div class="pr-icon__ico">${esc(x.ikon)}</div><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * 0.1)).join('')}</div></div></section>` : '';

  const build = first => hero(DATA.hero) + stats(first) + trail() + featured() + podium() + fields() + daftar() + pembinaan();

  /* ---------- EFEK MUNCUL SAAT SCROLL ---------- */
  function reveal(root, instant) {
    const els = root.querySelectorAll('.pr-rv:not(.in)');
    if (instant || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- INTERAKSI FILTER ---------- */
  function refresh(root) {
    const list = root.querySelector('#pr-list');
    if (list) list.innerHTML = listHTML();
    root.querySelectorAll('[data-pr-tingkat]').forEach(b => b.classList.toggle('on', b.dataset.prTingkat === state.tingkat));
  }
  function bind(root) {
    root.addEventListener('click', e => {
      const c = e.target.closest('[data-pr-tingkat]');
      if (c) { state.tingkat = c.dataset.prTingkat; return refresh(root); }
      if (e.target.closest('[data-pr-reset]')) {
        state.tingkat = 'semua'; state.tahun = 'semua'; state.q = '';
        const y = root.querySelector('#pr-year'), q = root.querySelector('#pr-q');
        if (y) y.value = 'semua'; if (q) q.value = '';
        refresh(root);
      }
    });
    root.addEventListener('change', e => { if (e.target.id === 'pr-year') { state.tahun = e.target.value; refresh(root); } });
    root.addEventListener('input', e => { if (e.target.id === 'pr-q') { state.q = e.target.value; refresh(root); } });
  }

  async function render() {
    const root = document.getElementById('prestasi-root');
    if (!root) return;
    try {
      DATA = DATA || await load('data/prestasi.json').catch(() => load('prestasi.json'));   // utama: folder data/, cadangan: folder yang sama dengan prestasi.html
      const first = !render.done;
      root.innerHTML = build(first);
      reveal(root, !first);                       // render ulang (ganti bahasa): langsung tampil
      if (first) { bind(root); if (typeof initCounters === 'function') initCounters(); }
      render.done = true;
    } catch (e) {
      console.error('prestasi.js:', e);
      root.innerHTML = '<p style="padding:8rem 8%;text-align:center">Data halaman gagal dimuat. Pastikan file <b>data/prestasi.json</b> ada, dan periksa penulisannya (koma dan tanda kutip).</p>';
    }
  }

  document.addEventListener('components:ready', render);
  document.addEventListener('i18n:change', () => { if (DATA) render(); });
})();