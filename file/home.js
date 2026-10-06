/* home.js: render Beranda dari JSON */
(() => {
  const PH = "this.onerror=null;this.src='assets/img/placeholder.svg'";
  const LOGO_FALLBACK = "this.replaceWith(Object.assign(document.createElement('span'),{textContent:this.alt}))";
  const ICON = {
    era: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    dtp: '<path d="M12 2 2 7l10 5 10-5z"/><path d="M6 10v5c3 2 9 2 12 0v-5"/>',
    akreditasi: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
    opes: '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
    yayasan: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>'
  };
  const $el = id => document.getElementById(id) || {};   // aman jika elemen tidak ada di halaman tertentu
  const lang = () => (window.I18N && I18N.lang) || 'id';
  const L = o => (o && typeof o === 'object') ? (o[lang()] || o.id || '') : (o ?? '');
  const applyI18N = el => { if (window.I18N && typeof I18N.apply === 'function') I18N.apply(el); };
  const safeCall = (name, fn) => { try { if (typeof fn === 'function') fn(); } catch (e) { console.warn('home.js: ' + name + ' gagal', e); } };
  const logoImg = m => `<img class="logo" src="${m.logo}" alt="${m.nama}" loading="lazy" onerror="${LOGO_FALLBACK}">`;
  const marquee = (list, cls = '') => { const h = list.map(logoImg).join(''); return `<div class="marquee ${cls}"><div class="marquee__track">${h}${h}</div></div>`; };

  /* ===== PENGATURAN SLIDER HERO ===== */
  const HERO_DELAY_DEFAULT = 6000;      // jeda bawaan (ms), 1000 ms = 1 detik
  const HERO_PAUSE_ON_HOVER = true;     // berhenti saat kursor di atas hero
  const HERO_IGNORE_REDUCED_MOTION = false; // true = tetap jalan walau OS mematikan animasi

  function initSlider(el, data = []) {
    const slides = [...el.querySelectorAll('.hero__slide')];
    const dots = [...el.querySelectorAll('.hero__dots button')];
    if (!slides.length) return;
    let i = 0, timer;

    // jeda tiap slide: ambil "durasi" dari JSON, kalau tidak ada pakai bawaan
    const delay = k => (data[k] && Number(data[k].durasi)) || HERO_DELAY_DEFAULT;

    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === i));
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
    };

    const play = () => {
      clearTimeout(timer);
      const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
      if (slides.length < 2 || (reduce && !HERO_IGNORE_REDUCED_MOTION)) return;
      timer = setTimeout(() => { go(i + 1); play(); }, delay(i));
    };

    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));
    if (HERO_PAUSE_ON_HOVER) {
      el.addEventListener('mouseenter', () => clearTimeout(timer));
      el.addEventListener('mouseleave', play);
    }
    go(0); play();
  }

  async function renderHome() {
    if (renderHome.started) return;          // cegah render dobel (slide dan listener tidak menumpuk)
    renderHome.started = true;
    try {
      const [b, stat, mitra, jur] = await Promise.all(['beranda', 'statistik', 'mitra', 'jurusan'].map(n => Site.json(`data/${n}.json`)));

      // Hero
      const hero = document.getElementById('hero');
      if (hero && (b.hero || []).length) {
        hero.insertAdjacentHTML('afterbegin', b.hero.map((s, k) => `<div class="hero__slide">
    <!-- FOTO: hero-${k + 1}.jpg | 1920x1080 | foto gedung/kegiatan siswa -->
    <img src="${s.img}" data-i18n-attr="alt:${s.alt}" ${k ? 'loading="lazy"' : ''} onerror="${PH}"></div>`).join('') +
          `<div class="hero__dots">${b.hero.map((_, k) => `<button aria-label="Slide ${k + 1}"></button>`).join('')}</div>`);
        initSlider(hero, b.hero);
      }
      $el('strip').innerHTML = marquee((mitra || []).slice(0, 10));

      // Statistik
      $el('stats').innerHTML = (stat || []).map(s => `<div><div class="stats__num"><span data-count="${s.value}">0</span>${s.suffix ?? ''}</div><div class="stats__label" data-i18n="stats.${s.key}"></div></div>`).join('');

      // Sambutan
      const s = b.sambutan;
      if (s) {
        renderVideo(document.getElementById('video'), s);
        $el('person').innerHTML = `
    <img src="${s.foto}" alt="${s.nama}" onerror="${PH}">
    <div><strong style="display:block">${s.nama}</strong>
    <small style="display:block;color:#6b7280" data-i18n="greet.role"></small></div>`;
      }

      // Mengapa
      $el('why').innerHTML = (b.why || []).map(k => `<article class="card reveal"><div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ''}</svg></div><h3 data-i18n="why.${k}.t"></h3><p data-i18n="why.${k}.d"></p></article>`).join('');

      // Mitra marquee
      $el('mitra').innerHTML = marquee(mitra || [], 'marquee--slow');

      await renderMajors(false, jur);
      applyI18N();
      safeCall('initReveal', typeof initReveal === 'function' ? initReveal : null);
      safeCall('initCounters', typeof initCounters === 'function' ? initCounters : null);
    } catch (e) {
      renderHome.started = false;            // boleh dicoba lagi kalau event terpicu ulang
      console.error('home.js:', e);
    }
  }

  /* ===== VIDEO SAMBUTAN =====
     Diatur di data/beranda.json -> sambutan.video { type: "file" | "youtube", src }, sambutan.thumb (poster).
     file    : "assets/video/sambutan.mp4" (atau .webm)
     youtube : link watch / youtu.be / embed */
  function renderVideo(box, s) {
    if (!box) return;
    const v = s.video || {}, src = (v.src || '').trim(), poster = s.thumb || '';
    const yt = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    box.classList.add('gv');
    box.innerHTML = `<div class="gv__frame">
    ${src && !yt ? `<video class="gv__video" preload="metadata" playsinline ${poster ? `poster="${poster}"` : ''} src="${src}" aria-label="Video sambutan kepala sekolah"></video>` : ''}
    <button class="gv__play" type="button" aria-label="Putar video profil">
      <span class="gv__ring"></span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
      <span class="gv__label" data-i18n="greet.play"></span>
    </button>
    <span class="gv__badge">SMK Telkom Malang</span></div>`;
    const frame = box.querySelector('.gv__frame'), btn = box.querySelector('.gv__play'), vid = box.querySelector('.gv__video');
    if (!src) { box.classList.add('is-error'); return; }
    if (yt) {
      frame.style.cssText += `;background:#0b0c0e url("${poster || 'https://img.youtube.com/vi/' + yt[1] + '/hqdefault.jpg'}") center/cover no-repeat`;
      btn.addEventListener('click', () => {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
        f.title = 'Sambutan Kepala Sekolah'; f.allowFullscreen = true;
        f.allow = 'autoplay; encrypted-media; picture-in-picture';
        f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
        frame.appendChild(f); box.classList.add('is-playing');
      });
      return;
    }
    btn.addEventListener('click', () => { vid.controls = true; box.classList.add('is-playing'); vid.play().catch(() => {}); });
    vid.addEventListener('ended', () => { vid.controls = false; box.classList.remove('is-playing'); vid.load(); });
    vid.addEventListener('error', () => box.classList.add('is-error'));
  }

  async function renderMajors(instant = false, data) {
    const j = data || await Site.json('data/jurusan.json');
    const box = document.getElementById('majors');
    if (!box) return;
    box.innerHTML = (j || []).map(m => `<article class="card major reveal">
    <!-- FOTO: ${m.id}.jpg | 800x600 | kegiatan jurusan ${String(m.id || '').toUpperCase()} -->
    <img src="${m.foto}" alt="${L(m.nama)}" width="800" height="600" loading="lazy" decoding="async" onerror="${PH}"><div><h3>${L(m.nama)}</h3><p>${L(m.deskripsi)}</p>
    <a class="btn" href="${m.link}" data-i18n="prog.more"></a></div></article>`).join('');
    // render ulang (ganti bahasa): tampilkan kartu langsung, jangan tunggu efek scroll
    if (instant) box.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    applyI18N(box);
  }

  document.addEventListener('components:ready', renderHome);
  document.addEventListener('i18n:change', () => {
    if (document.getElementById('majors')?.children.length) renderMajors(true).catch(e => console.error('home.js:', e));
  });
})();