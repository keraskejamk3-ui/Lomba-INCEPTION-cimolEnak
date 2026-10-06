/* international-class.js: render halaman International Class dari data/international-class.json
   Bahasa mengikuti I18N.lang (ID/EN). Dijalankan setelah 'components:ready' (navbar/footer sudah dimuat). */
(function () {
  const DATA_URL = 'data/international-class.json';
  let DATA = null;

  /* mulai unduh sedini mungkin (Site dari render.js) */
  if (typeof Site !== 'undefined' && Site.prefetch) Site.prefetch(DATA_URL);

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const lang = () => {
    try { if (typeof I18N !== 'undefined' && I18N.lang) return I18N.lang === 'en' ? 'en' : 'id'; } catch (e) {}
    return (document.documentElement.lang || 'id').slice(0, 2) === 'en' ? 'en' : 'id';
  };
  /* nilai bisa string biasa atau objek {id, en} */
  const t = v => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[lang()] != null ? v[lang()] : (v.id != null ? v.id : '')) : (v == null ? '' : v);
  const rupiah = n => 'Rp' + Number(n).toLocaleString('id-ID');
  const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString(lang() === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const isPast = iso => new Date(iso + 'T23:59:59') < new Date();
  const initials = name => name.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  /* ---------- peta titik dunia (grid 50 x 22, tiap sel = 1 titik) ---------- */
  const LAND = [
    [[14,18],[31,44]],
    [[3,12],[14,19],[25,47]],
    [[2,13],[15,18],[24,47]],
    [[2,14],[21,22],[25,47]],
    [[3,14],[21,23],[24,46]],
    [[4,14],[23,30],[31,45]],
    [[4,13],[22,29],[31,37],[38,45],[46,46]],
    [[5,12],[22,30],[31,36],[37,43],[46,47]],
    [[6,11],[22,31],[32,36],[37,43]],
    [[8,11],[21,30],[31,32],[34,36],[37,39]],
    [[9,17],[21,30],[35,35],[37,39],[40,41]],
    [[11,18],[22,31],[37,38],[39,41]],
    [[12,17],[24,31],[37,38],[39,41],[42,44]],
    [[12,18],[25,31],[37,39],[41,44]],
    [[12,18],[25,31],[39,44]],
    [[13,18],[25,31],[39,45]],
    [[13,17],[25,30],[39,45]],
    [[13,17],[26,30],[40,44]],
    [[13,16],[27,29],[41,44]],
    [[13,15]],
    [[13,15]],
    [[13,14]]
  ];
  const COLS = 50, ROWS = 22;

  function mapSvg() {
    let dots = '';
    LAND.forEach((runs, r) => runs.forEach(([a, b]) => {
      for (let c = a; c <= b; c++) dots += `<circle cx="${c * 10 + 5}" cy="${r * 10 + 5}" r="3.3"/>`;
    }));
    return `<svg viewBox="0 0 ${COLS * 10} ${ROWS * 10}" aria-hidden="true" focusable="false">${dots}</svg>`;
  }

  /* ---------- renderers ---------- */
  function head(title, lead) {
    return `<h2>${esc(t(title))}</h2>${lead ? `<p>${esc(t(lead))}</p>` : ''}`;
  }

  function renderHero(d) {
    $('icKicker').textContent = t(d.kicker);
    $('icPre').textContent = t(d.pre);
    $('icBig').textContent = t(d.big);
    $('icHeroText').textContent = t(d.text);
    $('icCtaPrimary').textContent = t(d.cta_primary);
    $('icCtaSecondary').textContent = t(d.cta_secondary);
    $('icSticker').textContent = t(d.badge);

    const pins = (d.pins || []).map(p => {
      const left = ((p.x + .5) / COLS * 100).toFixed(2), top = ((p.y + .5) / ROWS * 100).toFixed(2);
      return `<span class="ic-pin ic-pin--${esc(p.side || 'up')}" style="left:${left}%;top:${top}%"><i></i><b>${esc(t(p.name))}</b></span>`;
    }).join('');
    $('icMap').innerHTML = `<div class="ic-map" role="img" aria-label="${esc(t(d.map_label))}">${mapSvg()}${pins}</div>`;
  }

  function renderContact(k) {
    $('icContact').innerHTML = [
      k.web && `<li><a href="https://${esc(k.web)}" target="_blank" rel="noopener">${esc(k.web)}</a></li>`,
      k.instagram && `<li>${esc(k.instagram)}</li>`,
      k.phone && `<li><a href="tel:${esc(k.phone.replace(/[^\d+]/g, ''))}">${esc(k.phone)}</a></li>`,
      k.wa_display && `<li><a href="https://wa.me/62${esc(k.wa_display.replace(/\D/g, '').replace(/^0/, ''))}" target="_blank" rel="noopener">WA ${esc(k.wa_display)}</a></li>`
    ].filter(Boolean).join('');
  }

  function renderKompetensi(d) {
    $('icKompetensiHead').innerHTML = head(d.title, d.lead);
    $('icKompetensi').innerHTML = d.items.map(it => `
      <article class="ic-card">
        <span class="ic-card__icon" aria-hidden="true">${esc(it.icon)}</span>
        <h3>${esc(it.name)}</h3>
        <p class="ic-card__local">${esc(it.local)}</p>
        <h4>${esc(t(d.label))}</h4>
        <ul class="ic-tags">${it.skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      </article>`).join('');
  }

  function renderPorto(d) {
    $('icPortoHead').innerHTML = `<span class="ic-one" aria-hidden="true">1</span><div><h2>${esc(t(d.title))}</h2><p>${esc(t(d.lead))}</p></div>`;
    $('icPorto').innerHTML = d.items.map(it => `
      <article class="ic-win">
        <p class="ic-win__tag">${esc(t(it.tag))}</p>
        <h3>${esc(t(it.title))}</h3>
        <p class="ic-win__status">${esc(t(it.status))}</p>
        <ul>${it.names.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      </article>`).join('');
  }

  function renderJourney(d, jadwal) {
    $('icJourneyHead').innerHTML = head(d.title, d.lead);
    $('icJourney').innerHTML = d.grades.map(g => `
      <article class="ic-grade">
        <p class="ic-grade__no"><small>${esc(t(d.grade_label))}</small>${esc(g.grade)}</p>
        <h3>${esc(t(g.title))}</h3>
        <ul>${g.items.map(i => `<li>${esc(t(i))}</li>`).join('')}</ul>
      </article>`).join('');

    const anyPast = jadwal.items.some(i => isPast(i.date));
    $('icDates').innerHTML = `
      <ul class="ic-dates__list">${jadwal.items.map(i => `
        <li class="${isPast(i.date) ? 'is-past' : ''}">
          <span>${esc(t(i.label))}</span>
          <time datetime="${esc(i.date)}">${esc(fmtDate(i.date))}</time>
          ${isPast(i.date) ? `<em>${esc(t(jadwal.closed))}</em>` : ''}
        </li>`).join('')}</ul>
      ${anyPast ? `<p class="ic-dates__note">${esc(t(jadwal.closed_note))}</p>` : ''}`;
  }

  function renderAdmit(syarat, seleksi) {
    $('icSyarat').innerHTML = `<h3>${esc(t(syarat.title))}</h3>
      <ol class="ic-steps">${syarat.items.map(i => `
        <li><span>${esc(t(i.title))}</span>${i.note ? `<small>${esc(t(i.note))}</small>` : ''}</li>`).join('')}</ol>`;
    $('icSeleksi').innerHTML = `<h3>${esc(t(seleksi.title))}</h3>
      <ol class="ic-steps">${seleksi.items.map(i => `<li><span>${esc(t(i))}</span></li>`).join('')}</ol>`;
  }

  function renderBiaya(d) {
    $('icBiaya').innerHTML = `
      <div class="ic-tuition__main">
        <h3>${esc(t(d.title))}</h3>
        <p class="ic-tuition__label">${esc(t(d.contribution.label))}</p>
        <p class="ic-tuition__big">${esc(rupiah(d.contribution.amount))}</p>
        <p class="ic-tuition__note">${esc(t(d.contribution.note))}</p>
      </div>
      <div class="ic-tuition__side">
        <dl>
          <div><dt>${esc(t(d.monthly.label))}</dt><dd>${esc(rupiah(d.monthly.amount))}</dd></div>
          <div><dt>${esc(t(d.admission.label))}</dt><dd>${esc(rupiah(d.admission.amount))}</dd></div>
        </dl>
        <p class="ic-tuition__reapply">${esc(t(d.reapply))}</p>
        <div class="ic-actions">
          <a class="ic-btn ic-btn--solid" href="${esc(d.ppdb_url)}">${esc(t(d.cta))}</a>
          <a class="ic-btn ic-btn--ghost" href="https://wa.me/${esc(d.wa)}" target="_blank" rel="noopener">${esc(t(d.wa_cta))}</a>
        </div>
      </div>`;
  }

  function renderPakar(d) {
    $('icPakarHead').innerHTML = head(d.title, d.lead);
    $('icPakar').innerHTML = d.items.map(p => `
      <article class="ic-expert">
        <div class="ic-expert__photo">
          <span class="ic-expert__ini" aria-hidden="true">${esc(initials(p.name))}</span>
          <img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">
          <span class="ic-expert__batch">${esc(t(d.batch))} ${esc(p.batch)}</span>
          <span class="ic-expert__country">${esc(t(p.country))}</span>
        </div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(t(p.role))}<br><b>${esc(p.org)}</b></p>
      </article>`).join('');
  }

  function renderFitur(d) {
    $('icFiturHead').innerHTML = head(d.title);
    $('icFitur').innerHTML = d.items.map(i => `<li><span aria-hidden="true">${esc(i.icon)}</span>${esc(t(i))}</li>`).join('');
  }

  /* tiap section dibungkus sendiri: satu error tidak mematikan yang lain */
  const safe = (name, fn) => { try { fn(); } catch (e) { console.error('[International Class] gagal render ' + name, e); } };

  function render() {
    if (!DATA) return;
    document.documentElement.lang = lang();
    document.title = t(DATA.meta.title);
    safe('hero',       () => renderHero(DATA.hero));
    safe('kontak',     () => renderContact(DATA.kontak || {}));
    safe('kompetensi', () => renderKompetensi(DATA.kompetensi));
    safe('portofolio', () => renderPorto(DATA.portofolio));
    safe('journey',    () => renderJourney(DATA.journey, DATA.jadwal));
    safe('syarat',     () => renderAdmit(DATA.syarat, DATA.seleksi));
    safe('biaya',      () => renderBiaya(DATA.biaya));
    safe('pakar',      () => renderPakar(DATA.pakar));
    safe('fitur',      () => renderFitur(DATA.fitur));
  }

  let loading = null;
  async function start() {
    if (!$('icMap')) return;                       // bukan halaman ini
    try {
      if (!DATA) {
        loading = loading || (typeof Site !== 'undefined' && Site.json
          ? Site.json(DATA_URL)
          : fetch(DATA_URL).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' untuk ' + DATA_URL); return r.json(); }));
        DATA = await loading;
      }
      render();
    } catch (e) {
      loading = null;
      console.error('Gagal memuat data International Class. Jalankan lewat Live Server/http, bukan file://', e);
    }
  }

  /* render ulang saat bahasa diganti (tombol ID | EN di navbar) */
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('[data-lang]')) setTimeout(render, 80);
  });
  document.addEventListener('languagechange', render);
  document.addEventListener('i18n:change', render);

  /* sama seperti kontak.js: konten tidak bergantung pada navbar/footer.
     render sekarang, lalu render ulang saat components:ready (bahasa final dari I18N) */
  document.addEventListener('components:ready', start);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();