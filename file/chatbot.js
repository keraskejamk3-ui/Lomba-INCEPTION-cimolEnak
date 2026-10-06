/* js/chatbot.js — widget chatbot Bombi (SMK Telkom Malang) */
(function () {
  const SELF = document.currentScript && document.currentScript.src;
  const BASE = window.CHATBOT_BASE || (SELF ? new URL("../", SELF).href : "");
  const DIR = SELF ? new URL("./", SELF).href : "";
  // Lokal (localhost / file://) -> Flask di :5000. Produksi -> /api/chat di domain yang sama.
  const IS_LOCAL = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname) && location.port !== "5000";
  const API_URL = window.CHATBOT_API_URL || (IS_LOCAL ? "http://127.0.0.1:5000/api/chat" : "/api/chat");
  const GAMBAR = BASE + "bombi.jpeg";

  /* ---------- Teks antarmuka ---------- */
  const UI = {
    id: {
      welcome: "Halo! 👋 Saya Asisten AI SMK Telkom Malang. Ada yang ingin Anda tanyakan seputar jurusan, PPDB, atau fasilitas?",
      status: "Online (LLM Powered)", placeholder: "Ketik pertanyaan Anda...",
      open: "Buka Chatbot AI", close: "Tutup percakapan", send: "Kirim Pesan", typing: "Sedang mengetik",
      quick: "Pertanyaan cepat", hide: "Sembunyikan", show: "Tampilkan",
      speak: "Dengarkan jawaban", stop: "Hentikan suara", autoOn: "Baca otomatis: aktif", autoOff: "Baca otomatis: mati",
      noMatch: "Maaf, saya belum menemukan jawaban untuk pertanyaan itu. Silakan pilih salah satu pertanyaan di bawah, atau hubungi sekolah langsung.",
      langLabel: "Bahasa"
    },
    en: {
      welcome: "Hello! 👋 I'm the SMK Telkom Malang AI Assistant. Would you like to ask about majors, admissions, or facilities?",
      status: "Online (LLM Powered)", placeholder: "Type your question...",
      open: "Open AI Chatbot", close: "Close chat", send: "Send message", typing: "Typing",
      quick: "Quick questions", hide: "Hide", show: "Show",
      speak: "Listen to answer", stop: "Stop audio", autoOn: "Auto-read: on", autoOff: "Auto-read: off",
      noMatch: "Sorry, I couldn't find an answer to that. Please pick one of the questions below, or contact the school directly.",
      langLabel: "Language"
    }
  };

  /* ---------- DATA FAQ (FALLBACK LOKAL) ---------- */
  const FAQ = [
    { q: ["Jurusan apa saja?", "Which majors are offered?"],
      a: ["SMK Telkom Malang memiliki 3 jurusan:\n• Software Engineering / RPL (Rekayasa Perangkat Lunak)\n• Computer & Network Engineering / TKJ (Teknik Komputer Jaringan)\n• Game Development / PG (Pengembangan Gim)\n\nDetail dan bidang keahliannya ada di menu Programs → Majors.",
          "SMK Telkom Malang has 3 majors:\n• Software Engineering / RPL\n• Computer & Network Engineering / TKJ\n• Game Development / PG\n\nDetails and skill areas are in the Programs → Majors menu."],
      k: ["jurusan", "program", "keahlian", "se", "rpl", "tkj", "game", "network", "software", "major", "majors", "department"] },
    { q: ["Info PPDB", "Admissions info"],
      a: ["Pendaftaran dilakukan online lewat ppdb.smktelkom-mlg.sch.id atau menu Admissions.\n\nBrosur Kelas Internasional mencantumkan pendaftaran dan tes masuk secara rinci. Untuk jadwal periode terbaru, cek situs PPDB.",
          "Registration is done online at ppdb.smktelkom-mlg.sch.id or via the Admissions menu."],
      k: ["ppdb", "daftar", "pendaftaran", "admission", "admissions", "masuk", "jadwal", "apply", "application", "registration", "schedule"] },
    { q: ["Biaya sekolah", "School fees"],
      a: ["Informasi biaya sekolah dan SPP terbaru dapat diakses di portal resmi PPDB atau dengan menghubungi panitia PPDB.",
          "Latest tuition and fee details are available on the official PPDB portal or by contacting the admissions team."],
      k: ["biaya", "spp", "bayar", "uang", "harga", "tarif", "beasiswa", "fee", "fees", "cost", "tuition", "price", "scholarship"] },
    { q: ["Fasilitas sekolah", "School facilities"],
      a: ["Fasilitas yang tersedia antara lain laboratorium komputer, ruang kelas ber-AC, perpustakaan, dan fasilitas penunjang lainnya.",
          "Facilities include computer laboratories, air-conditioned classrooms, library, and other supporting facilities."],
      k: ["fasilitas", "lab", "laboratorium", "ruang", "kelas", "tour", "asrama", "perpustakaan", "facility", "facilities", "laboratory", "classroom", "library"] },
    { q: ["Lokasi & kontak", "Location & contact"],
      a: ["SMK Telkom Malang berada di Kota Malang, Jawa Timur.\n• Telepon: (0341) 712500\n• Web: smktelkom-mlg.sch.id\n• Media sosial: @smktelkommalang",
          "SMK Telkom Malang is located in Malang, East Java.\n• Phone: (0341) 712500\n• Web: smktelkom-mlg.sch.id\n• Social media: @smktelkommalang"],
      k: ["lokasi", "alamat", "dimana", "di mana", "maps", "kontak", "telepon", "telp", "wa", "whatsapp", "email", "location", "address", "where", "contact", "phone"] }
  ];


  /* ---------- CSS cadangan (dipakai hanya jika ai.css tidak ditemukan) ---------- */
  const FALLBACK_CSS = `
.chatbot-widget{--b-red:#d71920;--b-red-d:#b0141a;--b-ink:#1f2328;--b-mute:#6b7280;--b-line:#e5e7eb;--b-bg:#fff;--b-soft:#f3f4f6;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--b-ink)}
.chatbot-widget *{box-sizing:border-box}
.chatbot-trigger{position:fixed;right:20px;bottom:20px;z-index:9998;width:60px;height:60px;padding:0;border:3px solid #fff;border-radius:50%;
  background:var(--b-red);color:#fff;font-size:26px;cursor:pointer;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.25);display:grid;place-items:center}
.chatbot-trigger:hover{background:var(--b-red-d)}
.chatbot-trigger-img{width:100%;height:100%;object-fit:cover;display:block}
.chatbot-window{position:fixed;right:20px;bottom:92px;z-index:9999;width:min(380px,calc(100vw - 24px));height:min(580px,calc(100vh - 112px));
  background:var(--b-bg);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.28);flex-direction:column;overflow:hidden}
.chatbot-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:var(--b-red);color:#fff}
.chatbot-header-info{display:flex;align-items:center;gap:10px;min-width:0}
.chatbot-avatar{width:38px;height:38px;border-radius:50%;overflow:hidden;background:#fff;flex:none}
.chatbot-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.chatbot-title{margin:0;font-size:15px;font-weight:700;color:#fff}
.chatbot-status{display:flex;align-items:center;gap:6px;font-size:12px;opacity:.95}
.status-dot{width:8px;height:8px;border-radius:50%;background:#4ade80}
.chatbot-tools{display:flex;align-items:center;gap:6px}
.chatbot-lang{display:flex;border:1px solid rgba(255,255,255,.6);border-radius:6px;overflow:hidden}
.chatbot-lang button{border:0;background:transparent;color:#fff;font:600 11px system-ui,sans-serif;padding:3px 7px;cursor:pointer}
.chatbot-lang button.on{background:#fff;color:var(--b-red)}
.chatbot-tool,.chatbot-close{border:0;background:transparent;color:#fff;cursor:pointer;border-radius:6px;width:30px;height:30px;display:grid;place-items:center;font-size:22px;line-height:1}
.chatbot-tool.on{background:#fff;color:var(--b-red)}
.chatbot-tool:hover,.chatbot-close:hover{background:rgba(255,255,255,.2)}
.chatbot-tool.on:hover{background:#fff}
.chatbot-body{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:8px;background:var(--b-soft)}
.chat-bubble{max-width:86%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}
.chat-bubble.bot{align-self:flex-start;background:#fff;border:1px solid var(--b-line);border-bottom-left-radius:4px}
.chat-bubble.user{align-self:flex-end;background:var(--b-red);color:#fff;border-bottom-right-radius:4px}
.chat-bubble.typing{display:flex;gap:4px;align-items:center;padding:12px 14px}
.chat-bubble.typing span{width:7px;height:7px;border-radius:50%;background:var(--b-mute);animation:bombi-dot 1.2s infinite ease-in-out}
.chat-bubble.typing span:nth-child(2){animation-delay:.15s}
.chat-bubble.typing span:nth-child(3){animation-delay:.3s}
@keyframes bombi-dot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.chat-speak{display:inline-flex;align-items:center;margin:6px 0 0;padding:2px 6px;border:1px solid var(--b-line);border-radius:6px;background:transparent;color:var(--b-mute);cursor:pointer}
.chat-speak:hover,.chat-speak.on{color:var(--b-red);border-color:var(--b-red)}
.chatbot-suggest{border-top:1px solid var(--b-line);background:#fff;padding:6px 10px}
.chatbot-suggest__bar{display:flex;justify-content:space-between;align-items:center}
.chatbot-suggest__label{font-size:12px;color:var(--b-mute)}
.chatbot-suggest__toggle{border:0;background:transparent;color:var(--b-red);font-size:12px;cursor:pointer;padding:2px 4px}
.chatbot-suggest__list{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 4px}
.chatbot-suggest.collapsed .chatbot-suggest__list{display:none}
.chatbot-chip{border:1px solid var(--b-red);background:#fff;color:var(--b-red);border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer}
.chatbot-chip:hover{background:var(--b-red);color:#fff}
.chatbot-footer{display:flex;gap:8px;padding:10px;border-top:1px solid var(--b-line);background:#fff}
.chatbot-input{flex:1;min-width:0;border:1px solid var(--b-line);border-radius:999px;padding:9px 14px;font:inherit;color:var(--b-ink);background:#fff}
.chatbot-input:focus{outline:2px solid var(--b-red);outline-offset:1px;border-color:transparent}
.chatbot-input:disabled{background:var(--b-soft)}
.chatbot-send{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:var(--b-red);color:#fff;cursor:pointer;display:grid;place-items:center}
.chatbot-send:hover{background:var(--b-red-d)}
.chatbot-widget button:focus-visible{outline:2px solid #1d4ed8;outline-offset:2px}
@media (max-width:480px){.chatbot-window{right:12px;bottom:84px}.chatbot-trigger{right:12px;bottom:12px}}
@media (prefers-reduced-motion:reduce){.chat-bubble.typing span{animation:none}}
`;
  function injectFallbackCss() {
    if (document.getElementById("bombi-fallback-css")) return;
    const st = document.createElement("style");
    st.id = "bombi-fallback-css";
    st.textContent = FALLBACK_CSS;
    document.head.appendChild(st);
  }

  /* ---------- Bahasa ---------- */
  const siteLang = () => {
    const s = (window.I18N && window.I18N.lang) || document.documentElement.lang || "id";
    return String(s).slice(0, 2) === "en" ? "en" : "id";
  };
  let lang = siteLang();
  const li = () => (lang === "en" ? 1 : 0);
  const t = (k) => UI[lang][k];

  function cariJawaban(teks) {
    const s = " " + teks.toLowerCase().replace(/[^a-z0-9\s]/g, " ") + " ";
    let best = null, bestScore = 0;
    for (const item of FAQ) {
      let score = 0;
      for (const k of item.k) if (s.includes(" " + k + " ") || (k.length > 3 && s.includes(k))) score++;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return best ? best.a[li()] : null;
  }

  /* ---------- TTS Suara ---------- */
  const TTS = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let voices = [];
  if (TTS) {
    const lv = () => { voices = speechSynthesis.getVoices(); };
    lv();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", lv);
  }
  const pickVoice = (l) => {
    const pref = l === "en" ? ["en-US", "en-GB"] : ["id-ID"];
    const norm = (v) => v.lang.replace("_", "-");
    return voices.find((v) => pref.includes(norm(v))) || voices.find((v) => norm(v).toLowerCase().startsWith(l)) || null;
  };
  const speakable = (s) => s
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[•→]/g, ",").replace(/https?:\/\/\S+/g, "")
    .replace(/\n+/g, ". ").replace(/\s+/g, " ").trim();
  const chunks = (s) => {
    const out = []; let cur = "";
    (s.match(/[^.!?]+[.!?]*/g) || []).forEach((p) => {
      if ((cur + p).length > 180 && cur) { out.push(cur.trim()); cur = ""; }
      cur += p + " ";
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  function stopSpeak() {
    if (!TTS) return;
    speechSynthesis.cancel();
    document.querySelectorAll(".chat-speak.on").forEach((b) => { b.classList.remove("on"); b.setAttribute("aria-label", t("speak")); });
  }
  function speak(text, l, btn) {
    if (!TTS) return;
    stopSpeak();
    const parts = chunks(speakable(text));
    if (!parts.length) return;
    if (btn) { btn.classList.add("on"); btn.setAttribute("aria-label", t("stop")); }
    const v = pickVoice(l);
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.lang = v ? v.lang : (l === "en" ? "en-US" : "id-ID");
      if (v) u.voice = v;
      if (i === parts.length - 1) u.onend = u.onerror = () => { if (btn) { btn.classList.remove("on"); btn.setAttribute("aria-label", t("speak")); } };
      speechSynthesis.speak(u);
    });
  }

  const SPK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path class="w" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w" d="M19 5a10 10 0 0 1 0 14"/></svg>';

  const HTML = `
    <button type="button" class="chatbot-trigger" id="bombiTrigger" aria-expanded="false" aria-controls="bombiWindow">
      <img src="${GAMBAR}" alt="" class="chatbot-trigger-img">
    </button>
    <div class="chatbot-window" id="bombiWindow" hidden role="dialog" aria-label="Bombi AI">
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar"><img src="${GAMBAR}" alt=""></div>
          <div>
            <h3 class="chatbot-title">Bombi AI Service</h3>
            <span class="chatbot-status"><span class="status-dot"></span><span id="bombiStatus"></span></span>
          </div>
        </div>
        <div class="chatbot-tools">
          <div class="chatbot-lang" role="group" id="bombiLang"><button type="button" data-l="id">ID</button><button type="button" data-l="en">EN</button></div>
          <button type="button" class="chatbot-tool" id="bombiVoice" aria-pressed="false">${SPK}</button>
          <button type="button" class="chatbot-close" id="bombiClose">&times;</button>
        </div>
      </div>
      <div class="chatbot-body" id="bombiBody"></div>
      <div class="chatbot-suggest" id="bombiSuggest">
        <div class="chatbot-suggest__bar"><span class="chatbot-suggest__label" id="bombiQuick"></span><button type="button" class="chatbot-suggest__toggle" id="bombiToggle" aria-expanded="true"></button></div>
        <div class="chatbot-suggest__list" id="bombiChips"></div>
      </div>
      <form class="chatbot-footer" id="bombiForm">
        <input type="text" class="chatbot-input" id="bombiInput" required autocomplete="off" maxlength="500">
        <button type="submit" class="chatbot-send" id="bombiSend">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>`;

  function init() {
    if (window.__bombiReady) return;
    window.__bombiReady = true;
    document.querySelectorAll(".chatbot-widget, .chatbot-trigger, .chatbot-window").forEach((el) => el.remove());
    const widget = document.createElement("div");
    widget.className = "chatbot-widget";
    widget.id = "chatbotWidget";
    widget.innerHTML = HTML;
    document.body.appendChild(widget);

    const $ = (id) => document.getElementById(id);
    const trigger = $("bombiTrigger"), win = $("bombiWindow"), body = $("bombiBody");
    const form = $("bombiForm"), input = $("bombiInput"), suggest = $("bombiSuggest"), chips = $("bombiChips");
    const voiceBtn = $("bombiVoice"), toggleBtn = $("bombiToggle");

    win.style.display = "none"; // pastikan tertutup saat halaman dimuat, apa pun CSS-nya
    widget.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.parentNode === trigger) { img.remove(); trigger.textContent = "💬"; } else { img.remove(); }
      }, { once: true });
    });

    const styled = () => getComputedStyle(win).position !== "static";
    const cands = [...new Set([BASE + "ai.css", BASE + "css/ai.css", DIR + "ai.css", DIR + "../css/ai.css"])];
    (function loadCss(i) {
      if (styled()) return;
      if (i >= cands.length) { console.info("[Bombi] ai.css tidak ditemukan, memakai gaya bawaan"); return injectFallbackCss(); }
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = cands[i];
      l.onload = () => { if (!styled()) { l.remove(); loadCss(i + 1); } };
      l.onerror = () => { l.remove(); loadCss(i + 1); };
      document.head.appendChild(l);
    })(0);

    let activeCtrl = null, welcomeEl = null, hist = [], auto = false;
    try { auto = localStorage.getItem("bombiAuto") === "1"; } catch (e) {}
    if (!TTS) voiceBtn.hidden = true;

    function decorate(el, text, l) {
      if (!TTS) return null;
      const b = document.createElement("button");
      b.type = "button"; b.className = "chat-speak"; b.innerHTML = SPK + "<span></span>";
      b.setAttribute("aria-label", t("speak"));
      b.addEventListener("click", () => (b.classList.contains("on") ? stopSpeak() : speak(text, l, b)));
      el.appendChild(b);
      return b;
    }
    function addBubble(text, who) {
      const el = document.createElement("div");
      el.className = "chat-bubble " + who;
      el.textContent = text;
      if (who === "bot") decorate(el, text, lang);
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }
    function addTyping() {
      const el = document.createElement("div");
      el.className = "chat-bubble bot typing";
      el.setAttribute("aria-label", t("typing"));
      el.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }
    function setText(el, text) {
      el.classList.remove("typing");
      el.removeAttribute("aria-label");
      el.textContent = text;
      const b = decorate(el, text, lang);
      body.scrollTop = body.scrollHeight;
      if (auto && b) speak(text, lang, b);
    }

    function buildChips() {
      chips.innerHTML = "";
      FAQ.forEach((item) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "chatbot-chip"; b.textContent = item.q[li()];
        b.addEventListener("click", () => {
          const q = item.q[li()];
          input.value = q;
          form.dispatchEvent(new Event("submit", { cancelable: true }));
        });
        chips.appendChild(b);
      });
    }
    function collapse(on) {
      suggest.classList.toggle("collapsed", on);
      toggleBtn.setAttribute("aria-expanded", String(!on));
      toggleBtn.textContent = on ? t("show") : t("hide");
    }
    function paintAuto() {
      voiceBtn.classList.toggle("on", auto);
      voiceBtn.setAttribute("aria-pressed", String(auto));
      const lb = auto ? t("autoOn") : t("autoOff");
      voiceBtn.title = lb; voiceBtn.setAttribute("aria-label", lb);
    }
    function applyLang() {
      document.documentElement.setAttribute("data-bombi-lang", lang);
      $("bombiStatus").textContent = t("status");
      $("bombiQuick").textContent = t("quick");
      input.placeholder = t("placeholder");
      trigger.setAttribute("aria-label", t("open"));
      $("bombiClose").setAttribute("aria-label", t("close"));
      $("bombiSend").setAttribute("aria-label", t("send"));
      $("bombiLang").setAttribute("aria-label", t("langLabel"));
      win.setAttribute("aria-label", "Bombi AI");
      toggleBtn.textContent = suggest.classList.contains("collapsed") ? t("show") : t("hide");
      $("bombiLang").querySelectorAll("button").forEach((b) => {
        const on = b.dataset.l === lang;
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      });
      paintAuto();
      buildChips();
      if (welcomeEl && welcomeEl.isConnected) {
        const old = welcomeEl.querySelector(".chat-speak");
        welcomeEl.textContent = t("welcome");
        if (old) decorate(welcomeEl, t("welcome"), lang);
      }
    }
    function setLang(l) {
      if (l === lang) return;
      lang = l; stopSpeak(); applyLang();
    }
    $("bombiLang").addEventListener("click", (e) => { const b = e.target.closest("[data-l]"); if (b) setLang(b.dataset.l); });
    document.addEventListener("i18n:change", () => setLang(siteLang()));
    voiceBtn.addEventListener("click", () => {
      auto = !auto;
      try { localStorage.setItem("bombiAuto", auto ? "1" : "0"); } catch (e) {}
      if (!auto) stopSpeak();
      paintAuto();
    });
    toggleBtn.addEventListener("click", () => collapse(!suggest.classList.contains("collapsed")));

    function resetChat() {
      if (activeCtrl) { activeCtrl.abort(); activeCtrl = null; }
      stopSpeak();
      hist = [];
      body.innerHTML = "";
      welcomeEl = addBubble(t("welcome"), "bot");
      input.value = ""; input.disabled = false;
      collapse(false);
    }
    function toggle(open) {
      const wasOpen = !win.hidden;
      if (wasOpen && !open) resetChat();
      win.hidden = !open;
      win.style.display = open ? "flex" : "none";
      trigger.setAttribute("aria-expanded", String(open));
      if (open) input.focus();
    }
    trigger.addEventListener("click", () => toggle(win.hidden));
    $("bombiClose").addEventListener("click", () => toggle(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !win.hidden) toggle(false); });

    welcomeEl = addBubble(t("welcome"), "bot");
    applyLang();

    /* ---------- Pengiriman Pesan Ke Server ---------- */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      
      addBubble(message, "user");
      
      // Mengirimkan payload yang sesuai ke ai.py
      const historyToSend = hist.slice(-6);
      hist.push({ role: "user", content: message });
      
      input.value = ""; input.disabled = true;
      collapse(true);
      
      const loading = addTyping();
      const ctrl = new AbortController();
      activeCtrl = ctrl;
      const timer = setTimeout(() => ctrl.abort(), 30000);
      let reply;
      
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message, lang: lang, history: historyToSend,   // format ai.py (Flask)
            messages: [...historyToSend, { role: "user", content: message }], // format api/chat.js (Node)
          }),
          signal: ctrl.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.reply) reply = data.reply;
        else if ((res.status === 400 || res.status === 429) && (data.reply || data.error)) reply = data.reply || data.error; // pesan validasi / batas laju dari server
        else throw new Error("HTTP " + res.status);
      } catch (err) {
        if (ctrl.signal.aborted && activeCtrl !== ctrl) return;
        console.warn("[Bombi] server AI tidak merespons (" + API_URL + "), memakai FAQ lokal:", err.message || err);
        reply = cariJawaban(message) || t("noMatch");
      } finally {
        clearTimeout(timer);
      }
      
      if (activeCtrl !== ctrl) return;
      hist.push({ role: "assistant", content: reply });
      setText(loading, reply);
      input.disabled = false; input.focus();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();