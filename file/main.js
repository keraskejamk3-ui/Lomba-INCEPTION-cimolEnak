/* main.js: navbar, animasi scroll, counter statistik */
function initNavbar() {
  const nav = document.getElementById('nav'), toggle = document.getElementById('navToggle'), menu = document.getElementById('navMenu');
  if (!nav || nav.dataset.ready) return;       // kosong atau sudah pernah dipasang
  nav.dataset.ready = '1';

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const close = () => {
    if (menu) menu.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  }
  document.querySelectorAll('.sub-toggle').forEach(b => b.addEventListener('click', () => {
    const sub = b.nextElementSibling; if (!sub) return;
    const open = sub.classList.toggle('open'); b.setAttribute('aria-expanded', open);
  }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // layar melebar ke mode desktop (> 1260px, sama dengan navbar.css): tutup menu mobile & kunci scroll
  const desktop = matchMedia('(min-width:1261px)');
  const onDesktop = e => { if (e.matches) { close(); document.querySelectorAll('.sub.open').forEach(s => s.classList.remove('open')); document.querySelectorAll('.sub-toggle').forEach(b => b.setAttribute('aria-expanded', 'false')); } };
  desktop.addEventListener ? desktop.addEventListener('change', onDesktop) : desktop.addListener(onDesktop);

  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  document.querySelectorAll('[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === page));
}

function initReveal() {
  // elemen yang sudah diamati dicatat, jadi aman dipanggil berkali-kali (main.js, home.js, dll)
  const seen = initReveal.seen || (initReveal.seen = new WeakSet());
  const els = [...document.querySelectorAll('.reveal:not(.in)')].filter(e => !seen.has(e));
  els.forEach(e => seen.add(e));
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .01, rootMargin: '0px 0px 160px 0px' });
  els.forEach(e => io.observe(e));
}

function initCounters() {
  const seen = initCounters.seen || (initCounters.seen = new WeakSet());
  const els = [...document.querySelectorAll('[data-count]')].filter(e => !seen.has(e));
  els.forEach(e => seen.add(e));
  if (!els.length) return;

  const loc = () => (typeof I18N !== 'undefined' && I18N.lang === 'en') ? 'en-US' : 'id-ID';
  const show = (el, n) => { el.textContent = n.toLocaleString(loc()); };
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  const run = el => {
    const end = Number(el.dataset.count);
    if (!isFinite(end)) return;                // data-count salah: biarkan teks apa adanya
    if (reduce) return show(el, end);          // OS mematikan animasi: langsung tampilkan angka akhir
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      show(el, Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) return els.forEach(run);
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (!x.isIntersecting) return;
    io.unobserve(x.target); run(x.target);
  }), { threshold: .4 });
  els.forEach(e => io.observe(e));
}

document.addEventListener('components:ready', () => { initNavbar(); initReveal(); initCounters(); });
document.addEventListener('DOMContentLoaded', () => {
  const w = document.getElementById('chatbotWidget');
  if (w && w.parentElement !== document.body) document.body.appendChild(w);
});