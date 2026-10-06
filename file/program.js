/* Halaman Program Keahlian — SMK Telkom Malang
 * Teks (ID/EN) ada di lang-id.json dan lang-en.json, di bawah kunci "program".
 * File ini hanya berisi struktur (ikon, tautan, id program) dan proses render.
 * Daftar program: RPL, TKJ, PG disusun dari sumber umum; cek dengan kurikulum sekolah.
 */
(function () {
  'use strict';
  // Lokasi lang-id.json / lang-en.json: dicoba berurutan, yang pertama ditemukan dipakai.
  // Tambah path di sini kalau foldermu berbeda.
  var LANG_URLS = ['lang-{l}.json', 'data/lang-{l}.json', 'lang/lang-{l}.json', 'json/lang-{l}.json', 'js/lang-{l}.json', 'i18n/lang-{l}.json', 'assets/lang-{l}.json'];
  var IMG_DIR = 'img/';           // folder gambar hero
  var S = {
    hero: { img: 'DSC04962.jpg', icons: ['💻', '🌐', '🎮', '🔐'] },
    stats: [{ ico: '💻', count: 3 }, { ico: '✅', val: 'A' }, { ico: '📅', val: '1992' }, { ico: '🏫', val: 'Telkom' }],
    jurusan: [
      { id: 'rpl', kode: 'RPL', ico: '💻', ekskul: ['Web Design', 'IT Software Solution for Bussiness Kelas X', 'IT Software Solution for Bussiness Kelas XI', 'Artificial Intelligence Kelas X'] },
      { id: 'tkj', kode: 'TKJ', ico: '🌐', ekskul: ['Cyber Security Kelas X', 'Cyber Security Kelas XI', 'Cloud Computing', 'Internet Network Cabling', 'IT Network Systems Administration'] },
      { id: 'pg', kode: 'PG', ico: '🎮', ekskul: ['Graphic Design Kelas X', 'Graphic Design Kelas XI', 'Fotografi', 'Artificial Intelligence Kelas XI'] }
    ],
    dukung: ['🖥️', '👩‍🏫', '🏫', '🏆'],
    terkait: [{ ico: '🎯', link: 'ekstrakurikuler.html' }, { ico: '🏆', link: 'prestasi.html' }, { ico: '🔬', link: 'lab-tour.html' }, { ico: '📝', link: 'ppdb.html' }],
    alur: 4
  };

  var main = document.getElementById('main');
  if (!main) return;
  var LANGS = {}, lang = detectLang(), first = true, P = {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  function detectLang() {
    if (window.I18N && (I18N.lang === 'id' || I18N.lang === 'en')) return I18N.lang;
    try { var s = localStorage.getItem('lang'); if (s === 'id' || s === 'en') return s; } catch (e) {}
    return (document.documentElement.lang || 'id').slice(0, 2) === 'en' ? 'en' : 'id';
  }
  // ambil teks dari lang-xx.json -> "program.<path>"
  function p(path) {
    var o = P, k = path.split('.');
    for (var i = 0; i < k.length; i++) { if (o == null) return ''; o = o[k[i]]; }
    return o == null ? '' : o;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function add(par) {
    for (var i = 1; i < arguments.length; i++) if (arguments[i]) par.appendChild(arguments[i]);
    return par;
  }
  function link(href, cls, text) { var a = el('a', cls, text); a.href = href; return a; }
  function head(label, title, sub) {
    var w = el('div', 'sec-head reveal');
    if (label) add(w, el('p', 'eyebrow', label));
    if (title) add(w, el('h2', 'sec-title', title));
    if (sub) add(w, el('p', 'sec-sub', sub));
    return w;
  }
  function section(cls, id) {
    var s = el('section', 'section' + (cls ? ' ' + cls : '')), c = el('div', 'container');
    if (id) s.id = id;
    s.appendChild(c);
    return { s: s, c: c };
  }
  function ul(items, cls) {
    var u = el('ul', cls);
    (items || []).forEach(function (t) { add(u, el('li', cls === 'pk-chips' ? 'pk-chip' : '', t)); });
    return u;
  }

  function hero() {
    var s = el('section', 'pk-hero'), im = el('img', 'pk-hero__bg');
    im.src = IMG_DIR + S.hero.img; im.alt = p('hero.alt');
    im.onerror = function () { im.style.display = 'none'; };
    s.appendChild(im);
    var c = el('div', 'container pk-hero__inner'), nav = el('nav', 'pk-crumb'), ol = el('ol');
    nav.setAttribute('aria-label', 'Breadcrumb');
    [['crumb_home', 'index.html'], ['crumb_program', 'program.html'], ['crumb_current']].forEach(function (x) {
      var li = el('li');
      if (x[1]) li.appendChild(link(x[1], '', p('hero.' + x[0])));
      else { li.textContent = p('hero.' + x[0]); li.setAttribute('aria-current', 'page'); }
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    var t = el('h1', 'pk-hero__title');
    t.appendChild(document.createTextNode(p('hero.title_start') + ' '));
    add(t, el('span', '', p('hero.title_hl')));
    t.appendChild(document.createTextNode(' ' + p('hero.title_end')));
    var cta = add(el('div', 'pk-hero__cta'), link('#jurusan', 'btn', p('hero.cta1')), link('ppdb.html', 'btn btn--ghost', p('hero.cta2')));
    add(c, nav, el('p', 'pk-hero__label', p('hero.label')), t, el('p', 'pk-hero__desc', p('hero.desc')), cta);
    s.appendChild(c);
    var ic = el('div', 'pk-hero__icons'); ic.setAttribute('aria-hidden', 'true');
    S.hero.icons.forEach(function (i) { add(ic, el('span', '', i)); });
    s.appendChild(ic);
    return s;
  }

  function stats() {
    var w = el('div', 'container pk-statswrap'), g = el('div', 'pk-stats');
    S.stats.forEach(function (i, n) {
      var d = el('div', 'pk-stat reveal'), b = el('b', '', String(i.count != null ? i.count : i.val));
      if (i.count != null) b.setAttribute('data-count', i.count);
      add(d, el('span', 'pk-stat__ico', i.ico), b, el('small', '', p('stats.s' + (n + 1))));
      g.appendChild(d);
    });
    return add(w, g);
  }

  function jurusan() {
    var o = section('pk-soft', 'jurusan'), g = el('div', 'pk-majors');
    add(o.c, head(p('jurusan.label'), p('jurusan.title'), p('jurusan.sub')), g);
    S.jurusan.forEach(function (j) {
      var c = el('article', 'pk-major reveal'), top = el('div', 'pk-major__top'), b = el('div', 'pk-major__body');
      add(top, el('span', 'pk-major__code', j.kode), el('span', 'pk-major__ico', j.ico));
      add(b, el('h3', '', p(j.id + '.nama')), el('p', '', p(j.id + '.singkat')), ul(p(j.id + '.tag'), 'pk-chips'), link('#' + j.id, 'btn btn--outline', p('jurusan.more')));
      add(c, top, b); g.appendChild(c);
    });
    return o.s;
  }

  function detail() {
    var f = document.createDocumentFragment();
    S.jurusan.forEach(function (j, i) {
      var o = section(i % 2 ? 'pk-soft' : '', j.id), g = el('div', 'pk-detail'), side = el('aside', 'pk-side reveal');
      side.setAttribute('data-code', j.kode);
      add(side, el('span', 'pk-side__code', j.kode), el('div', 'pk-side__ico', j.ico), el('h2', '', p(j.id + '.nama')), el('p', '', p(j.id + '.singkat')),
        ul(p(j.id + '.tag'), 'pk-chips'), link('ppdb.html', 'btn', p('ui.apply')));
      var m = el('div', 'pk-main');
      [['learn', 'belajar'], ['career', 'karier'], ['study', 'lanjut']].forEach(function (x) {
        add(m, add(el('div', 'pk-block reveal'), el('h3', '', p('ui.' + x[0])), ul(p(j.id + '.' + x[1]), 'pk-list')));
      });
      var ek = el('ul', 'pk-chips');
      j.ekskul.forEach(function (n) { add(ek, add(el('li'), link('ekstrakurikuler.html#daftar-ekskul', 'pk-chip', n))); });
      add(m, add(el('div', 'pk-block reveal'), el('h3', '', p('ui.extra')), ek));
      add(g, side, m); o.c.appendChild(g); f.appendChild(o.s);
    });
    return f;
  }

  function alur() {
    var o = section('jrn', 'alur-belajar'), l = el('div', 'jrn__list');
    l.style.setProperty('--n', S.alur);
    add(o.c, head(p('alur.label'), p('alur.title')), l);
    for (var i = 1; i <= S.alur; i++) {
      add(l, add(el('div', 'jrn__step reveal'), el('div', 'jrn__num', String(i)), el('h3', '', p('alur.s' + i + '.t')), el('p', '', p('alur.s' + i + '.d'))));
    }
    return o.s;
  }

  function dukung() {
    var o = section('fac', 'keunggulan'), g = el('div', 'fac__grid');
    add(o.c, head(p('dukung.label'), p('dukung.title')), g);
    S.dukung.forEach(function (ic, i) {
      var k = 'dukung.i' + (i + 1), e = el('div', 'fac__ico', ic); e.setAttribute('aria-hidden', 'true');
      add(g, add(el('div', 'fac__card reveal'), e, el('h3', '', p(k + '.t')), el('p', '', p(k + '.d'))));
    });
    return o.s;
  }

  function terkait() {
    var o = section('', 'terkait'), g = el('div', 'pk-links');
    add(o.c, head(p('terkait.label'), p('terkait.title')), g);
    S.terkait.forEach(function (it, i) {
      var k = 'terkait.l' + (i + 1), a = link(it.link, 'pk-link reveal');
      add(a, el('span', 'pk-ico', it.ico), el('h3', '', p(k + '.t')), el('p', '', p(k + '.d')), el('span', 'pk-link__go', '→'));
      g.appendChild(a);
    });
    return o.s;
  }

  function render() {
    var y = window.scrollY;
    P = (LANGS[lang] || {}).program || {};
    main.textContent = '';
    var f = document.createDocumentFragment();
    [hero, stats, jurusan, detail, alur, dukung, terkait].forEach(function (fn) { f.appendChild(fn()); });
    main.appendChild(f);
    if (p('meta_title')) document.title = p('meta_title');
    reveal();
    if (!first) window.scrollTo(0, y);
  }

  function reveal() {
    var items = main.querySelectorAll('.reveal');
    if (!first || reduce || !('IntersectionObserver' in window)) {
      [].forEach.call(items, function (e) { e.classList.add('in'); });
      return;
    }
    [].forEach.call(main.querySelectorAll('[data-count]'), function (n) { n.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        var e = x.target, n = e.querySelector('[data-count]');
        e.classList.add('in'); io.unobserve(e);
        if (n) count(n);
      });
    }, { threshold: .15 });
    [].forEach.call(items, function (e) { io.observe(e); });
  }
  function count(n) {
    var to = +n.getAttribute('data-count'), t0 = null;
    (function step(t) {
      if (t0 === null) t0 = t;
      var q = Math.min((t - t0) / 900, 1);
      n.textContent = Math.round(to * q);
      if (q < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  // Coba path yang pernah berhasil dulu; kalau gagal, coba semua path sekaligus (bukan satu per satu).
  function tryUrl(l, u) {
    return fetch(u.replace('{l}', l)).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) {
      if (!d || !d.program) throw new Error('no program block');
      return { d: d, u: u };
    });
  }
  function anyOf(ps) {
    return new Promise(function (res, rej) {
      var n = ps.length;
      ps.forEach(function (p) { p.then(res, function () { if (--n === 0) rej(new Error('lang file not found')); }); });
    });
  }
  function fetchLang(l) {
    var saved = null;
    try { saved = sessionStorage.getItem('pkLangUrl'); } catch (e) {}
    var pre = saved ? tryUrl(l, saved).catch(function () { return null; }) : Promise.resolve(null);
    return pre.then(function (r) {
      if (r) return r.d;
      return anyOf(LANG_URLS.map(function (u) { return tryUrl(l, u); })).then(function (r2) {
        try { sessionStorage.setItem('pkLangUrl', r2.u); } catch (e) {}
        return r2.d;
      });
    });
  }
  function load(l) {
    if (LANGS[l]) return Promise.resolve();
    return fetchLang(l).then(function (d) { LANGS[l] = d; });
  }
  function fail() {
    main.textContent = '';
    main.appendChild(el('p', 'container pk-error', 'Konten gagal dimuat. Buka lewat server (bukan file://) dan pastikan lang-id.json / lang-en.json memuat blok "program".'));
  }
  function setLang(l) {
    if ((l !== 'id' && l !== 'en') || l === lang) return;
    lang = l;
    load(l).then(function () { if (lang === l) { first = false; render(); } }).catch(fail);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang]');
    if (b) setLang(b.getAttribute('data-lang'));
  });
  document.addEventListener('i18n:change', function () { setLang((window.I18N && I18N.lang) || (document.documentElement.lang || '').slice(0, 2)); });
  document.addEventListener('langchange', function (e) { setLang(e.detail && (e.detail.lang || e.detail)); });
  new MutationObserver(function () { setLang((document.documentElement.lang || '').slice(0, 2)); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function init() {
    load(lang).catch(function () { return load(lang); }).then(function () {
      render();
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    }).catch(fail);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();