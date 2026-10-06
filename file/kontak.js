/* kontak.js: merender halaman dari data/kontak.json */
(() => {
  const SELF = document.currentScript && document.currentScript.src;
  const MASCOT = SELF ? new URL('../bombi.jpeg', SELF).href : 'bombi.jpeg';
  let D = null, bound = false;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lang = () => (window.I18N && I18N.lang) || 'id';
  const T = v => (v && typeof v === 'object') ? (v[lang()] || v.id || '') : (v ?? '');
  const load = u => (window.Site && Site.json) ? Site.json(u) : fetch(u).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' saat memuat ' + u); return r.json(); });
  const rv = (h, d = 0) => `<div class="kt-rv" style="--d:${d}s">${h}</div>`;
  const btn = b => `<a class="btn${b.gaya === 'ghost' ? ' btn--ghost' : ''}" href="${esc(b.link)}">${esc(T(b.teks))}</a>`;
  const head = o => `<div class="kt-head"><span class="kt-label">${esc(T(o.label))}</span><h2>${esc(T(o.judul))}</h2><i class="kt-head__bar" aria-hidden="true"></i>${o.sub ? `<p>${esc(T(o.sub))}</p>` : ''}</div>`;

  const hero = h => !h ? '' : `<section class="kt-hero">
    ${h.gambar ? `<img class="kt-hero__bg" src="${esc(h.gambar)}" alt="${esc(T(h.alt))}" onerror="this.remove()">` : ''}
    <div class="kt-hero__deco" aria-hidden="true"><span class="kt-hero__big">${esc(h.ikon || '')}</span>
      ${(h.ikon_kecil || []).slice(0, 4).map((e, i) => `<span class="kt-hero__i kt-hero__i--${i + 1}">${esc(e)}</span>`).join('')}</div>
    <div class="container kt-hero__in">
      ${(h.jejak || []).length ? `<nav class="kt-crumb" aria-label="breadcrumb">${h.jejak.map((c, i, a) => i < a.length - 1 ? `<a href="${esc(c.link)}">${esc(T(c.teks))}</a><b>›</b>` : `<span>${esc(T(c.teks))}</span>`).join('')}</nav>` : ''}
      <span class="kt-pill">${esc(T(h.label))}</span>
      <h1>${esc(T(h.judul_awal))} <span class="hl">${esc(T(h.judul_sorot))}</span> ${esc(T(h.judul_akhir))}</h1>
      <p>${esc(T(h.deskripsi))}</p><div class="kt-hero__cta">${(h.tombol || []).map(btn).join('')}</div></div></section>`;

  const stats = r => (r && r.length) ? `<div class="container"><div class="kt-ribbon">${r.map(x => `<div class="kt-rib"><span class="kt-rib__ico">${esc(x.ikon || '⭐')}</span><div><strong>${esc(x.angka)}</strong><small>${esc(T(x.label))}</small></div></div>`).join('')}</div></div>` : '';

  const sorotan = b => `<div class="kt-split">
    ${rv(`<div><span class="kt-label">${esc(T(b.label))}</span><h2>${esc(T(b.judul))}</h2><p>${esc(T(b.teks))}</p>
      <ul class="kt-check">${(b.poin || []).map(x => `<li>${esc(T(x))}</li>`).join('')}</ul>${b.tombol ? btn(b.tombol) : ''}</div>`)}
    ${rv(`<div class="kt-split__vis kt-c${(b.warna || 0) % 4}"><span class="kt-split__big" aria-hidden="true">${esc(b.ikon || '⭐')}</span>
      ${(b.chip || []).map((c, i) => `<em class="kt-chipf kt-chipf--${i + 1}">${esc(T(c))}</em>`).join('')}</div>`, .15)}</div>`;

  const kartu = b => `<div class="kt-cards">${(b.item || []).filter(x => x.tampil !== false).map((x, i) => rv(`<article class="kt-card kt-c${i % 4}">
    <div class="kt-card__ico">${esc(x.ikon || '⭐')}</div>${x.badge ? `<span class="kt-badge">${esc(T(x.badge))}</span>` : ''}
    <h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p>${x.aksi ? `<a class="kt-act" href="${esc(x.aksi.link)}"${/^https?:/.test(x.aksi.link) ? ' target="_blank" rel="noopener"' : ''}>${esc(T(x.aksi.teks))} <b aria-hidden="true">→</b></a>` : ''}</article>`, i * .1)).join('')}</div>`;

  const langkah = b => `<div class="kt-steps">${(b.item || []).map((x, i) => rv(`<article class="kt-step"><span class="kt-step__n">${i + 1}</span><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p></article>`, i * .1)).join('')}</div>`;

  const lokasi = b => {
    const d = .006, bbox = [b.lng - d, b.lat - d, b.lng + d, b.lat + d].join('%2C');
    const map = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${b.lat}%2C${b.lng}`;
    const gm = `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`;
    return `<div class="kt-loc">${rv(`<ul class="kt-info">
      <li><span>📍</span><div>${esc(b.alamat)}</div></li>
      <li><span>☎️</span><div><a href="tel:${esc(String(b.telepon).replace(/\s/g, ''))}">${esc(b.telepon)}</a></div></li>
      <li><span>✉️</span><div><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></div></li>
      <li><span>🕐</span><div>${esc(T(b.jam))}</div></li></ul>
      <a class="btn" href="${esc(gm)}" target="_blank" rel="noopener">${esc(T(b.peta))} ↗</a>`)}
      ${rv(`<iframe class="kt-map" src="${esc(map)}" title="${esc(b.alamat)}" loading="lazy"></iframe>`, .15)}</div>`;
  };

  const faq = b => `<div class="kt-faq">${(b.item || []).map((x, i) => rv(`<details class="kt-q"><summary>${esc(T(x.q))}</summary><p>${esc(T(x.a))}</p></details>`, i * .06)).join('')}</div>`;
  const tautan = b => `<div class="kt-links">${(b.item || []).map((x, i) => rv(`<a class="kt-link kt-c${i % 4}" href="${esc(x.link)}"><span class="kt-link__ico">${esc(x.ikon || '➜')}</span><h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p><b aria-hidden="true">→</b></a>`, i * .08)).join('')}</div>`;
  const tanya = b => rv(`<div class="kt-ask"><div class="kt-ask__txt"><span class="kt-label kt-label--w">${esc(T(b.label))}</span><h3>${esc(T(b.judul))}</h3><p>${esc(T(b.teks))}</p>
    <div class="kt-ask__btns"><button type="button" class="btn" data-bombi>${esc(T(b.tombol_bot))}</button>${b.tombol ? btn(b.tombol) : ''}</div></div>
    <div class="kt-ask__vis"><span class="kt-ask__glow"></span><span class="kt-ask__ring"></span><span class="kt-ask__pic"><img src="${esc(MASCOT)}" alt="Bombi" onerror="this.parentNode.textContent='🤖'"></span>${b.gelembung ? `<em class="kt-ask__bub">${esc(T(b.gelembung))}</em>` : ''}</div></div>`);


  const form = b => {
    const d = .006, bbox = [b.lng - d, b.lat - d, b.lng + d, b.lat + d].join('%2C');
    const map = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${b.lat}%2C${b.lng}`;
    return `<div class="kt-split kt-split--form">
      ${rv(`<form class="kt-form" data-form="${esc(b.email_tujuan)}" novalidate>
        <label><span>${esc(T(b.nama))}</span><input name="nama" type="text" required autocomplete="name"></label>
        <label><span>${esc(T(b.email))}</span><input name="email" type="email" required autocomplete="email"></label>
        <label><span>${esc(T(b.topik_label))}</span><select name="topik">${(b.topik || []).map(t => `<option>${esc(T(t))}</option>`).join('')}</select></label>
        <label><span>${esc(T(b.pesan))}</span><textarea name="pesan" rows="5" required></textarea></label>
        <button type="submit" class="btn">${esc(T(b.kirim))} ✉️</button>
        <p class="kt-note">${esc(T(b.catatan))}</p></form>`)}
      ${rv(`<iframe class="kt-map" src="${esc(map)}" title="${esc(b.alamat)}" loading="lazy"></iframe>`, .15)}</div>`;
  };
  const sosial = b => rv(`<div class="kt-soc"><div><span class="kt-label">${esc(T(b.label))}</span><h3>${esc(T(b.judul))}</h3><p>${esc(T(b.teks))}</p></div><div class="social" data-social-clone></div></div>`);
  const fillSocial = () => { const src = document.querySelector('.footer [data-social]'); if (!src || !src.innerHTML.trim()) return false;
    document.querySelectorAll('[data-social-clone]').forEach(e => { e.innerHTML = src.innerHTML; }); return true; };
  const alur = b => `<div class="kt-flow">${(b.item || []).map((x, i) => rv(`<article class="kt-fl kt-c${i % 4}"><span class="kt-fl__n"><b>${i + 1}</b><i aria-hidden="true">${esc(x.ikon || '⭐')}</i></span>
    <h3>${esc(T(x.judul))}</h3><p>${esc(T(x.teks))}</p>${(x.chip || []).length ? `<div class="kt-fl__chips">${x.chip.map(c => `<a class="kt-fl__chip" href="${esc(c.link)}">${esc(T(c.teks))}</a>`).join('')}</div>` : ''}</article>`, i * .12)).join('')}</div>`;
  const TYPES = { kartu, alur, form, tautan, faq, sosial };
  let alt = 0;
  const section = b => {
    const id = b.id ? ` id="${esc(b.id)}"` : '';
    if (b.tipe === 'tanya') return `<section class="kt-sec"${id}><div class="container">${tanya(b)}</div></section>`;
    const fn = TYPES[b.tipe]; if (!fn) return '';
    const cls = b.gelap ? ' kt-dark' : (alt++ % 2 ? ' kt-soft' : '');
    return `<section class="kt-sec${cls}"${id}><div class="container">${b.label && b.tipe !== 'sorotan' ? head(b) : ''}${fn(b)}</div></section>`;
  };

  function reveal(root, instant) {
    const els = root.querySelectorAll('.kt-rv:not(.in)');
    if (instant || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
    els.forEach(e => io.observe(e));
  }

  function countUp(root, instant) {
    root.querySelectorAll('.kt-rib strong').forEach(el => {
      const m = el.textContent.trim().match(/^(\D*)(\d+)(.*)$/);
      if (!m || instant || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      const [, pre, num, suf] = m, end = +num, t0 = { v: 0 };
      el.textContent = pre + '0' + suf;
      const io = new IntersectionObserver(es => es.forEach(x => {
        if (!x.isIntersecting) return; io.disconnect();
        const st = performance.now(), dur = 1100;
        const tick = n => { const k = Math.min(1, (n - st) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = pre + Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }), { threshold: .6 });
      io.observe(el);
    });
  }

  async function render() {
    const root = document.getElementById('kt-root');
    if (!root) return;
    try {
      D = D || await load('data/kontak.json');
      const first = !bound; alt = 0;
      root.innerHTML = hero(D.hero) + stats(D.ringkasan) + (D.bagian || []).map(section).join('');
      reveal(root, !first);
      countUp(root, !first);
      if (!fillSocial()) setTimeout(fillSocial, 700);
      if (first) {
        bound = true;
        root.addEventListener('submit', e => {
          const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
          const v = n => (f.elements[n].value || '').trim();
          if (!v('nama') || !v('email') || !v('pesan') || !f.elements.email.checkValidity()) { f.reportValidity(); return; }
          const body = v('pesan') + '\n\n— ' + v('nama') + ' (' + v('email') + ')';
          location.href = 'mailto:' + f.dataset.form + '?subject=' + encodeURIComponent('[' + v('topik') + '] ' + v('nama')) + '&body=' + encodeURIComponent(body);
        });
        root.addEventListener('pointermove', e => {
          const c = e.target.closest('.kt-card,.kt-link,.kt-fl,.kt-step,.kt-rib'); if (!c) return;
          const r = c.getBoundingClientRect();
          c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
        root.addEventListener('click', e => {
          if (e.target.closest('[data-bombi]')) { const t = document.getElementById('bombiTrigger'), w = document.getElementById('bombiWindow'); if (t && w && w.hidden) t.click(); }
        });
      }
    } catch (e) {
      console.error('kontak.js:', e);
      root.innerHTML = '<p style="padding:8rem 8%;text-align:center">Data halaman gagal dimuat (' + esc(e && e.message) + '). Periksa <b>data/kontak.json</b> dan lihat Console.</p>';
    }
  }
  document.addEventListener('components:ready', render);
  document.addEventListener('i18n:change', () => { if (D) render(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();