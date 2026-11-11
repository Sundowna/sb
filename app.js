(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE = location.origin + location.pathname;

  /* ---------- intro ---------- */
  const intro = $("#intro");
  let seen = false;
  try { seen = sessionStorage.getItem("sb-intro") === "1"; sessionStorage.setItem("sb-intro", "1"); } catch (e) {}
  if (reduce || seen || location.hash) intro.classList.add("skip");
  else setTimeout(() => intro.classList.add("done"), 1250);

  /* ---------- toast ---------- */
  const toast = $("#toast");
  let tt;
  const say = (msg) => { toast.textContent = msg; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2200); };

  /* ---------- copy & share ---------- */
  async function copy(text, msg = "Link copied") {
    try { await navigator.clipboard.writeText(text); say(msg); }
    catch (e) { window.prompt("Copy this link:", text); }
  }
  const shareText = "Check out these Second Brain apps: save your AI chats, make Obsidian feel like OneNote, and capture voice notes.";
  function wireShare(el, url = PAGE, text = shareText) {
    const kind = el.dataset.share;
    if (kind === "whatsapp") el.href = "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
    if (kind === "telegram") el.href = "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(text);
    if (kind === "email") el.href = "mailto:?subject=" + encodeURIComponent("Second Brain apps") + "&body=" + encodeURIComponent(text + "\n\n" + url);
    if (kind === "copy") el.addEventListener("click", () => copy(url));
    if (kind === "native") el.addEventListener("click", async () => {
      if (navigator.share) { try { await navigator.share({ title: "Second Brain Apps", text, url }); } catch (e) {} }
      else copy(url, "Link copied: paste it in a message");
    });
  }
  $$("[data-share]").forEach((el) => wireShare(el));

  /* ---------- mobile menu ---------- */
  const menuBtn = $("#menuBtn"), menu = $("#mobileMenu");
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); } });

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => {
    const sibs = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 6) * 0.07 + "s");
    io.observe(el);
  });

  /* ---------- section tracking (nav, rail, ruler) ---------- */
  const sections = $$("main .section");
  const railBig = $("#railBig"), rulerMark = $("#rulerMark"), ruler = $("#ruler");
  let current = "";
  function setActive(id) {
    if (id === current) return;
    current = id;
    $$(".nav-link").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
    $$("#railIndex li").forEach((li) => li.classList.toggle("on", li.dataset.for === id));
    const sec = document.getElementById(id);
    railBig.classList.add("swap");
    setTimeout(() => { railBig.textContent = sec.dataset.title; railBig.classList.remove("swap"); }, 180);
  }
  function onScroll() {
    const y = window.scrollY + innerHeight * 0.35;
    let id = sections[0].id;
    for (const s of sections) if (s.offsetTop <= y) id = s.id;
    setActive(id);
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    rulerMark.style.top = p * (ruler.clientHeight - 2) + "px";
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- pointer effects ---------- */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    const grid = $(".grid-bg");
    $("#apps").addEventListener("pointermove", (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      grid.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
      grid.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
    $$(".card").forEach((c) => c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    }));
    $$(".tile-face").forEach((f) => {
      f.addEventListener("pointermove", (e) => {
        const r = f.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        f.style.setProperty("--ry", (x - 0.5) * 22 + "deg");
        f.style.setProperty("--rx", (0.5 - y) * 22 + "deg");
        f.style.setProperty("--lx", x * 100 + "%");
        f.style.setProperty("--ly", y * 100 + "%");
      });
      f.addEventListener("pointerleave", () => { f.style.setProperty("--rx", "0deg"); f.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ---------- live mocks ---------- */
  const visible = new Set();
  const vio = new IntersectionObserver((ents) => ents.forEach((en) => en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
  $$(".shot").forEach((s) => vio.observe(s));
  const live = (sel) => visible.has($(sel)) && !document.hidden;

  // ChatBridge sync list
  const chats = [
    ["CLAUDE", "#d97757", "Trip to Lisbon"],
    ["GPT", "#10a37f", "Sourdough starter tips"],
    ["GEMINI", "#6f9cff", "Birthday gift ideas"],
    ["LUMO", "#a98bff", "Rewrite my CV intro"],
    ["CLAUDE", "#d97757", "Plan the garden beds"],
    ["GPT", "#10a37f", "Explain my electricity bill"],
  ];
  const list = $("#syncList"), bar = $("#syncBar"), count = $("#syncCount");
  let ci = 0;
  function syncStep() {
    if (!live(".shot-bridge")) return;
    if (ci >= chats.length) { ci = 0; list.innerHTML = ""; bar.style.width = "0"; count.textContent = "0 / 6"; return; }
    const [p, c, t] = chats[ci++];
    const li = document.createElement("li");
    li.innerHTML = `<b style="background:${c}">${p}</b><span>${t}.md</span><em>✓</em>`;
    list.prepend(li);
    while (list.children.length > 4) list.lastChild.remove();
    bar.style.width = (ci / chats.length) * 100 + "%";
    count.textContent = `${ci} / ${chats.length}`;
  }
  if (reduce) {
    list.innerHTML = chats.slice(0, 4).map(([p, c, t]) => `<li><b style="background:${c}">${p}</b><span>${t}.md</span><em>✓</em></li>`).join("");
    bar.style.width = "66%"; count.textContent = "4 / 6";
  } else setInterval(syncStep, 1100);

  // Brain Capture: levels, timer, typing
  const levels = $("#levels");
  for (let i = 0; i < 22; i++) levels.appendChild(document.createElement("i"));
  const bars = $$("i", levels);
  const recTime = $("#recTime"), typeEl = $("#typeText");
  const phrases = [
    "Remind me to call the plumber on Monday, and buy oat milk.",
    "Idea for the garden: tomatoes along the south fence this year.",
    "Book title Anna mentioned: The Overstory. Sounds great.",
  ];
  let sec = 0, pi = 0, chi = 0, hold = 0;
  if (reduce) { typeEl.textContent = phrases[0]; recTime.textContent = "0:42"; bars.forEach((b, i) => b.style.height = 6 + Math.abs(Math.sin(i)) * 18 + "px"); }
  else {
    setInterval(() => {
      if (!live(".shot-voice")) return;
      bars.forEach((b, i) => { b.style.height = 4 + Math.random() * (10 + 14 * Math.abs(Math.sin(Date.now() / 400 + i / 3))) + "px"; });
    }, 120);
    setInterval(() => { if (!live(".shot-voice")) return; sec = (sec + 1) % 600; recTime.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }, 1000);
    setInterval(() => {
      if (!live(".shot-voice")) return;
      const p = phrases[pi];
      if (chi < p.length) { typeEl.textContent = p.slice(0, ++chi); }
      else if (++hold > 40) { hold = 0; chi = 0; pi = (pi + 1) % phrases.length; typeEl.textContent = ""; }
    }, 45);
  }

  /* ---------- app details ---------- */
  const GH = "https://github.com/Sundowna/";
  const APPS = {
    chatbridge: {
      name: ["Chat", "Bridge"], title: "ChatBridge", plugin: "AI ChatBridge", kind: "AI chat archive · Obsidian plugin", accent: "#5b8cff", accent2: "#8a6bff", glyph: "g-bridge",
      tag: "Every conversation you've had with AI, saved as a note you can search forever.",
      what: "You've probably asked ChatGPT, Claude or Gemini hundreds of things by now: recipes, letters, advice, plans. Those answers are scattered across websites, and finding one again is a pain. ChatBridge quietly copies all of them into your Obsidian notes, in the same folders you see in the apps, with pictures and files included. It only reads; it never changes anything in your AI accounts.",
      feats: [
        ["All the big ones", "Claude, ChatGPT, Gemini, Google AI Studio and Proton Lumo, plus Claude Code and Codex."],
        ["Files come along", "Images, uploads, artifacts and generated files are saved next to the chat."],
        ["Same folders", "Projects and recent chats land in the same structure as in the apps."],
        ["Never overwrites", "If a chat changes, the new version is saved beside the old one."],
        ["Runs by itself", "Set a timer and it syncs in the background. A stop button is always there."],
        ["Several accounts", "Two Claude accounts? Both sync, and each note says which one it came from."],
      ],
      repo: GH + "obsidian-ai-chatbridge", release: GH + "obsidian-ai-chatbridge/releases/latest",
      folder: "ai-chatbridge", brat: "Sundowna/obsidian-ai-chatbridge",
      after: [
        "Open <b>Settings → AI ChatBridge</b>.",
        "Pick a tab (Claude, ChatGPT, Gemini or Lumo) and click <b>Log in</b>. Sign in like you normally would; the window closes by itself.",
        "Click <b>Sync now</b>. The first run saves just 3 chats as a test. Happy? Set <b>Max chats per run</b> to 0 to get them all.",
      ],
      note: "Unofficial: it reads the same pages your browser does. If a website changes, syncing may pause until an update is out. Computers only (Windows, macOS, Linux).",
      version: "0.25.0",
    },
    onenote: {
      name: ["OneNote", "Style"], title: "OneNote Style", plugin: "OneNote Style", kind: "Notebook look & feel · Obsidian plugin + theme", accent: "#b067ff", accent2: "#e05ad6", glyph: "g-note",
      tag: "Obsidian that looks and works like the OneNote you already know.",
      what: "Love OneNote's notebooks and coloured tabs, but want your notes as simple files you own? OneNote Style turns Obsidian into something that feels instantly familiar: notebooks on the left, section tabs across the top, a page list on the side and the purple ribbon with all the buttons where you expect them. Your notes stay plain text underneath.",
      feats: [
        ["Notebooks & sections", "Folders become notebooks, subfolders become coloured section tabs."],
        ["Page list", "Add pages, drag to reorder, make subpages, just like OneNote."],
        ["The ribbon", "Home, Insert and View tabs with fonts, highlights, tables, dates and more."],
        ["Note tags", "To Do, Important, Question, Idea… with a Tags Summary of everything tagged."],
        ["Same shortcuts", "Ctrl+1 for To Do, Alt+Shift+D for the date, and the rest you know."],
        ["Theme too", "Prefer just the look? A separate OneNote theme gives the colours and fonts."],
      ],
      repo: GH + "obsidian-onenote-style", release: GH + "obsidian-onenote-style/releases/latest",
      folder: "onenote-style", brat: "Sundowna/obsidian-onenote-style",
      extra: { label: "OneNote theme", href: GH + "obsidian-onenote-theme" },
      after: [
        "The Notebooks and Pages panes open by themselves the first time.",
        "Your top-level folders show up as notebooks. Click <b>+</b> next to the tabs for a new section.",
        "For the date under each page title, keep <b>Settings → Appearance → Show inline title</b> on.",
      ],
      note: "Computers only (Windows, macOS, Linux). OneNote's click-anywhere canvas and ink drawing aren't included; use Insert → Free-form Page for a canvas.",
      version: "1.1.0",
    },
    capture: {
      name: ["Brain", "Capture"], title: "Brain Capture", kind: "Voice & quick capture · Android app", accent: "#ff8a3d", accent2: "#ff4f6d", glyph: "g-voice",
      tag: "Tap, talk, done. Your phone types it up and files it in your notes.",
      what: "The best ideas show up when you're walking, driving or half asleep. Brain Capture is one big record button: talk, and the phone turns your words into text right there on the device, then drops the note and the audio into your second brain. Share a link, photo or PDF from any app and it lands there too. It has no internet access at all, so your voice never leaves your phone.",
      feats: [
        ["One big button", "Open, tap, talk. Start a new recording while the last one is still being typed up."],
        ["Types it for you", "Speech-to-text runs on the phone itself. Long recordings (20+ minutes) are fine."],
        ["Share anything", "Links, text, photos and PDFs from any app, saved in about a second."],
        ["Truly private", "No internet permission, no account, no tracking. Nothing to leak."],
        ["Keeps the audio", "The original recording is saved too, compact enough not to fill your phone."],
        ["Straight to your notes", "Notes go into your vault's inbox folder, ready in Obsidian."],
      ],
      repo: null, preview: true,
      note: "Brain Capture is in private testing on Android and can't be downloaded yet. A download button will appear here once it's ready.",
    },
  };

  const sheet = $("#sheet"), body = $("#sheetBody");
  let lastFocus = null;

  function codeChip(text) { return `<code class="copy-code" data-copy="${text}" title="Click to copy">${text}</code>`; }

  function render(id) {
    const a = APPS[id];
    const url = PAGE + "#app/" + id;
    const install = a.preview ? `
      <section class="sh-sec"><h3>Availability</h3><p>${a.note}</p></section>` : `
      <section class="sh-sec">
        <h3>Install it</h3>
        <div class="how-tabs" role="tablist">
          <button role="tab" aria-selected="true" data-tab="easy">Easy way</button>
          <button role="tab" aria-selected="false" data-tab="hand">By hand</button>
        </div>
        <div data-pane="easy">
          <ol class="ol">
            <li>In Obsidian open <b>Settings → Community plugins</b>. If it says Restricted mode, click <b>Turn on community plugins</b>.</li>
            <li>Click <b>Browse</b>, search for <b>BRAT</b>, then <b>Install</b> and <b>Enable</b>. BRAT is a helper that installs plugins from GitHub for you.</li>
            <li>Open <b>Settings → BRAT → Add beta plugin</b> and paste ${codeChip(a.brat)}</li>
            <li>Click <b>Add plugin</b>, then switch on <b>${a.plugin}</b> in Community plugins. BRAT keeps it up to date from now on.</li>
          </ol>
        </div>
        <div data-pane="hand" hidden>
          <ol class="ol">
            <li>Download these three files:
              <div class="dl-row">
                <a class="sh-btn" href="${a.repo}/releases/latest/download/main.js">main.js</a>
                <a class="sh-btn" href="${a.repo}/releases/latest/download/manifest.json">manifest.json</a>
                <a class="sh-btn" href="${a.repo}/releases/latest/download/styles.css">styles.css</a>
              </div></li>
            <li>In your vault folder, open the hidden <b>.obsidian</b> folder, then <b>plugins</b>, and make a new folder called ${codeChip(a.folder)}</li>
            <li>Put the three files in it, restart Obsidian, and switch on <b>${a.plugin}</b> in <b>Settings → Community plugins</b>.</li>
          </ol>
        </div>
      </section>
      <section class="sh-sec"><h3>Then</h3><ol class="ol">${a.after.map((s) => `<li>${s}</li>`).join("")}</ol>
        <p class="note">${a.note}</p></section>`;

    body.innerHTML = `
      <div class="sh-head"><span>Second Brain / ${a.name.join("")}</span><span class="sp"></span>
        <button class="sh-btn" data-copy="${url}" data-msg="Link to ${a.title} copied"><svg><use href="#i-link"/></svg>Copy link</button>
        <button class="sh-btn" data-close aria-label="Close">✕</button></div>
      <div class="sh-hero">
        <div class="sh-icon"><svg><use href="#${a.glyph}"/></svg></div>
        <p class="sh-kind">${a.kind}</p>
        <h2 id="sheetTitle">${a.name[0]}<span>${a.name[1]}</span></h2>
        <p class="sh-tag">${a.tag}</p>
        <ul class="tags">${a.preview ? '<li class="t-warn">Private preview</li><li>Android</li><li>Works offline</li>' : `<li class="t-ok">Available</li><li>v${a.version}</li><li>Free</li><li>Windows · macOS · Linux</li>`}</ul>
        <div class="sh-actions">
          ${a.repo ? `<a class="btn btn-solid" href="${a.release}" target="_blank" rel="noopener"><svg viewBox="0 0 16 16"><path d="M8 2v10M3.5 7.5 8 12l4.5-4.5M3 14h10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Latest release</a>
          <a class="btn" href="${a.repo}" target="_blank" rel="noopener"><svg><use href="#i-gh"/></svg>Source on GitHub</a>` : `<button class="btn" data-copy="${url}" data-msg="Link copied"><svg><use href="#i-link"/></svg>Share this app</button>`}
          ${a.extra ? `<a class="btn" href="${a.extra.href}" target="_blank" rel="noopener">${a.extra.label} <svg><use href="#i-arrow"/></svg></a>` : ""}
        </div>
      </div>
      <section class="sh-sec"><h3>In plain words</h3><p>${a.what}</p></section>
      <section class="sh-sec"><h3>What it does</h3><ul class="feat">${a.feats.map(([t, d]) => `<li><b>${t}</b>${d}</li>`).join("")}</ul></section>
      ${a.preview ? "" : `<section class="sh-sec"><h3>You'll need</h3><p>The free <a class="text-link" href="https://obsidian.md/download" target="_blank" rel="noopener">Obsidian app</a> on a Windows, Mac or Linux computer, and a vault (a folder for your notes). Obsidian will ask you to make one the first time.</p></section>`}
      ${install}
      <div class="sh-foot">${Object.keys(APPS).filter((k) => k !== id).map((k) => `<a class="sh-btn" href="#app/${k}">Next: ${APPS[k].title} →</a>`).join("")}</div>`;
    sheet.style.setProperty("--accent", a.accent);
    sheet.style.setProperty("--accent2", a.accent2);
    sheet.scrollTop = 0;
  }

  function openApp(id, push = true) {
    if (!APPS[id]) return;
    render(id);
    if (!sheet.open) { lastFocus = document.activeElement; sheet.showModal(); document.body.style.overflow = "hidden"; }
    if (push && location.hash !== "#app/" + id) history.pushState(null, "", "#app/" + id);
    $("[data-close]", sheet).focus({ preventScroll: true });
  }
  function closeApp(push = true) {
    if (!sheet.open) return;
    const finish = () => { sheet.classList.remove("closing"); sheet.close(); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus({ preventScroll: true }); };
    if (reduce) finish(); else { sheet.classList.add("closing"); setTimeout(finish, 280); }
    if (push && location.hash.startsWith("#app/")) history.pushState(null, "", location.pathname + location.search + "#lineup");
  }

  sheet.addEventListener("cancel", (e) => { e.preventDefault(); closeApp(); });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) return closeApp();
    const c = e.target.closest("[data-copy]");
    if (c) return copy(c.dataset.copy, c.dataset.msg || "Copied");
    if (e.target.closest("[data-close]")) return closeApp();
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      $$("[data-tab]", sheet).forEach((b) => b.setAttribute("aria-selected", String(b === tab)));
      $$("[data-pane]", sheet).forEach((p) => p.hidden = p.dataset.pane !== tab.dataset.tab);
      return;
    }
    const next = e.target.closest('a[href^="#app/"]');
    if (next) { e.preventDefault(); openApp(next.getAttribute("href").slice(5)); }
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open], a[href^='#app/']");
    if (!t || sheet.contains(t)) return;
    e.preventDefault();
    openApp(t.dataset.open || t.getAttribute("href").slice(5));
  });

  function fromHash(push) {
    const m = location.hash.match(/^#app\/(\w+)/);
    if (m) openApp(m[1], false); else closeApp(push);
  }
  addEventListener("popstate", () => fromHash(false));
  fromHash(false);
})();
