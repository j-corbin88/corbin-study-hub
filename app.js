(() => {
  "use strict";

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const LETTERS = "ABCDE";

  // read words aloud with the device's built-in voice (slow and clear for young speakers)
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  function speak(text) {
    if (!canSpeak || !text) return;
    const note = msg => { const el = document.getElementById("speakNote"); if (el) el.textContent = msg; };
    try {
      const ss = speechSynthesis;
      // cancel only when something is playing (cancel-then-speak silently fails on iPad)
      if (ss.speaking || ss.pending) ss.cancel();
      if (ss.paused) ss.resume();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.5;
      const vs = ss.getVoices();
      // Samantha is the clearest voice on iPad/iPhone; fall back to any US English voice
      const v = vs.find(v => /^samantha/i.test(v.name)) || vs.find(v => /^en[-_]US/i.test(v.lang));
      if (v) u.voice = v;
      u.onstart = () => note("");
      u.onerror = e => { if (e.error !== "canceled" && e.error !== "interrupted") note("Sound didn't play (" + (e.error || "unknown") + "). Check the volume and that the ringer switch is not on silent."); };
      ss.speak(u);
    } catch (e) { note("Sound isn't available on this device."); }
  }
  // iPad/iPhone only allow speech after a tap: unlock it on the first touch with a silent word
  if (canSpeak) {
    const unlock = () => {
      try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}
      document.removeEventListener("pointerdown", unlock, true);
    };
    document.addEventListener("pointerdown", unlock, true);
    try { speechSynthesis.getVoices(); } catch (e) {}
  }

  const S = STUDY;
  const state = {
    profile: store.get("sh:profile") || S.profiles[0].id,
    subject: store.get("sh:subject") || S.subjects[0].id,
    setId: null,
    mode: null,
    parent: false
  };
  if (!S.profiles.some(p => p.id === state.profile)) state.profile = S.profiles[0].id;

  const profile = () => S.profiles.find(p => p.id === state.profile);
  // each kid can have their own subject list (profile.subjects); no list means all subjects
  const allowedSubjects = () => { const p = profile(); return p.subjects ? S.subjects.filter(s => p.subjects.includes(s.id)) : S.subjects; };
  const fixSubject = () => { if (!allowedSubjects().some(s => s.id === state.subject)) state.subject = allowedSubjects()[0].id; };
  fixSubject();
  const subject = () => S.subjects.find(s => s.id === state.subject);
  const sets = () => ((S.content[state.profile] || {})[state.subject]) || [];
  const curSet = () => state.setId === REVIEW_ID ? reviewSet() : sets().find(x => x.id === state.setId);
  const bestKey = id => `sh:best:${state.profile}:${id}`;

  // words a kid missed are remembered on this device so the mixed review can bring them back
  const missKey = () => `sh:miss:${state.profile}`;
  const getMiss = () => { try { return JSON.parse(store.get(missKey()) || "{}"); } catch (e) { return {}; } };
  function recordMiss(w, setId, ok) {
    if (!w || !w.word || !setId) return;
    const m = getMiss(), k = setId + "|" + w.word;
    if (ok) delete m[k]; else m[k] = (m[k] || 0) + 1;
    store.set(missKey(), JSON.stringify(m));
  }
  const REVIEW_ID = "__review";
  // a "virtual" set built fresh each time: missed words first, then random words from the subject's other sets
  function reviewSet() {
    const pool = [];
    sets().filter(x => x.type === "vocab" || x.type === "spelling").forEach(x => x.words.forEach(w => pool.push(Object.assign({}, w, { _set: x.id }))));
    if (pool.length < 4) return null;
    const m = getMiss();
    const missed = shuffle(pool.filter(w => m[w._set + "|" + w.word]));
    const rest = shuffle(pool.filter(w => !m[w._set + "|" + w.word]));
    const words = missed.slice(0, 12).concat(rest).slice(0, 12);
    return { id: REVIEW_ID, type: "review", title: "Mixed review", unit: "", words, missedCount: Math.min(missed.length, 12) };
  }

  // tabs shown for each kind of study set (the first one is the default)
  const TABS = {
    vocab: [["cards", "Flashcards"], ["quiz", "Quiz"], ["list", "Word list"]],
    test: [["test", "Practice test"], ["cards", "Flashcards"], ["order", "Story order"], ["guide", "Study guide"]],
    spelling: [["spell", "Spelling quiz"], ["cards", "Flashcards"], ["list", "Word list"]],
    review: [["quiz", "Mixed quiz"], ["cards", "Flashcards"]],
    verse: [["vrecall", "Practice"], ["vtype", "Type it"], ["vorder", "Put in order"]]
  };
  // flashcards (and printed cards) come from the words of a vocab set, or the key terms of a test set
  const cardWords = x => (x.type === "test" ? x.terms : x.words);

  // load a kid's content file on demand (works from file:// and Netlify)
  function loadContent(id) {
    return new Promise(res => {
      if (S.content[id]) return res();
      const el = document.createElement("script");
      el.src = `data/${id}.js`;
      el.onload = el.onerror = () => res();
      document.head.appendChild(el);
    });
  }

  // ---------- chrome: profile menu + sidebar ----------
  function renderProfile() {
    const p = profile();
    $("#profileBtn").innerHTML = state.parent
      ? `<span class="avatar" style="background:#495057">P</span><span>Parent</span> <span aria-hidden="true">▾</span>`
      : `<span class="avatar" style="background:${p.color}">${esc(p.name[0])}</span><span>${esc(p.name)}</span> <span aria-hidden="true">▾</span>`;
    $("#profileMenu").innerHTML = S.profiles.map(x =>
      `<li><button data-id="${x.id}" ${!state.parent && x.id === p.id ? 'aria-current="true"' : ""}><span class="avatar" style="background:${x.color}">${esc(x.name[0])}</span>${esc(x.name)}</button></li>`
    ).join("") + `<li class="menu-sep"><button data-parent="1" ${state.parent ? 'aria-current="true"' : ""}><span class="avatar" style="background:#495057">P</span>Parent dashboard</button></li>`;
  }

  function renderSidebar() {
    if (state.parent) {
      $("#sidebar").innerHTML = `<h2>Parent</h2>` + S.profiles.map(x =>
        `<button class="nav-item" data-jump="${x.id}"><span class="avatar" style="background:${x.color};width:20px;height:20px;font-size:11px">${esc(x.name[0])}</span>${esc(x.name)}</button>`).join("");
      return;
    }
    $("#sidebar").innerHTML = `<h2>Subjects</h2>` + allowedSubjects().map(s =>
      `<button class="nav-item" data-id="${s.id}" ${s.id === state.subject ? 'aria-current="true"' : ""}><span>${s.icon}</span>${esc(s.name)}</button>`
    ).join("");
  }

  function setSide(open) {
    document.body.classList.toggle("side-hidden", !open);
    $("#menuBtn").setAttribute("aria-expanded", open);
    $("#scrim").hidden = !(open && window.innerWidth <= 800);
    store.set("sh:side", open ? "1" : "0");
  }

  // ---------- parent dashboard ----------
  const loadAll = () => Promise.all(S.profiles.map(p => loadContent(p.id)));
  const nice = d => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); };
  const subjName = id => { const x = S.subjects.find(s => s.id === id); return x ? `${x.icon} ${x.name}` : "General"; };

  // ---------- week plan (parent dashboard) ----------
  const pad2 = n => String(n).padStart(2, "0");
  const isoD = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const parseD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addD = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const short = d => `${MON[d.getMonth()]} ${d.getDate()}`;

  // spread study sessions over the evenings before each test, quiz or verse, and pull light review forward on quiet nights
  function planSessions(plan, fromISO) {
    const sessions = {}, load = {};
    const ev = d => plan.evenings[d.getDay()];
    const skip = new Set(); // no-class days
    (plan.coming || []).forEach(c => { /* text only */ });
    const room = (d, mins, free) => { const e = ev(d); return e && e.cap > 0 && (!free || e.free) && (load[isoD(d)] || 0) + mins <= e.cap; };
    const add = (d, s) => { const k = isoD(d); (sessions[k] = sessions[k] || []).push(s); load[k] = (load[k] || 0) + s.min; };
    const groups = {};
    plan.due.filter(x => x.kind !== "task").forEach(x => {
      const k = x.studyKey || (x.date + "|" + x.title);
      (groups[k] = groups[k] || Object.assign({}, x));
    });
    const prio = { test: 0, quiz: 1, verse: 2 };
    Object.values(groups).sort((a, b) => prio[a.kind] - prio[b.kind] || (a.date < b.date ? -1 : 1)).forEach(t => {
      const mins = t.kind === "test" ? [25, 20] : t.kind === "verse" ? [10, 10, 10] : [15, 15];
      const free = t.kind === "verse";
      const days = [];
      for (let d = addD(parseD(t.date), -1), n = 0; n < 21 && days.length < mins.length && isoD(d) >= fromISO; d = addD(d, -1), n++) {
        if (room(d, mins[0], free)) days.push(d);
      }
      days.reverse().forEach((d, i) => add(d, {
        label: t.studyLabel || t.title, min: mins[i], setId: t.setId, subject: t.subject,
        sub: t.setId ? t.practice : (t.studyNeeds || t.needs)
      }));
    });
    // quiet free evenings: add one short review from what already exists
    let f = 0;
    const last = addD(parseD(fromISO), 14);
    for (let d = parseD(fromISO); d <= last; d = addD(d, 1)) {
      const e = ev(d);
      if (!e || !e.free || (load[isoD(d)] || 0) >= 20 || !(plan.fillers || []).length) continue;
      const fl = plan.fillers[f++ % plan.fillers.length];
      add(d, { label: fl.label, min: 10, setId: fl.setId, subject: fl.subject, sub: fl.practice, filler: true });
    }
    return { sessions, load };
  }

  function weekCard(profileId, which) {
    const plan = (S.plan || {})[profileId];
    if (!plan) return "";
    const now = new Date(), dow = now.getDay();
    const today = isoD(now);
    const base = dow === 0 ? addD(now, 1) : dow === 6 ? addD(now, 2) : addD(now, 1 - dow);
    const start = addD(base, which * 7), fri = addD(start, 4);
    const { sessions, load } = planSessions(plan, dow === 0 || dow === 6 ? isoD(base) : today);
    const cardH = (cls, title, sub, open) => {
      const body = `<b>${esc(title)}</b><small>${sub}</small>`;
      return open ? `<button class="it ${cls}" data-open="${esc(JSON.stringify(open))}">${body}</button>` : `<div class="it ${cls}">${body}</div>`;
    };
    const openOf = (setId, subject) => setId ? { p: profileId, s: subject, set: setId } : null;
    const days = [0, 1, 2, 3, 4].map(i => {
      const d = addD(start, i), k = isoD(d), e = plan.evenings[d.getDay()] || {};
      const due = plan.due.filter(x => x.date === k).map(x =>
        cardH(x.setId ? "ok" : "need", x.title, esc(x.subj) + " &middot; " + esc(x.setId ? (x.ready || "ready") : (x.needs || "")), openOf(x.setId, x.subject))).join("");
      const ses = (sessions[k] || []).map(s =>
        cardH((s.setId ? "ok" : "need") + " dash", s.label, `${s.min} min &middot; ${esc(s.sub || "")}`, openOf(s.setId, s.subject))).join("");
      const tot = load[k] || 0;
      return `<div class="wday${k === today ? " today" : ""}"><p class="wdh">${DOW[d.getDay()]}<span>${short(d)}${k === today ? " &middot; today" : ""} &middot; ${esc(e.label || "")}</span></p>
        <div class="wblk"><p class="wsec">Due</p>${due || '<p class="wnone">Nothing due</p>'}</div>
        <div class="wblk"><p class="wsec">Study</p>${ses || '<p class="wnone">No study</p>'}</div>
        <p class="wtot">${tot ? tot + " min study" : "No study"}</p></div>`;
    }).join("");
    // what still needs to be sent for this week
    const missing = plan.due.filter(x => !x.setId && x.send && x.date >= isoD(start) && x.date <= isoD(fri) && x.date >= today);
    let bar;
    if (missing.length) {
      const gated = missing.filter(x => x.kind !== "task"), first = parseD((gated.length ? gated : missing).map(x => x.date).sort()[0]);
      bar = `<div class="wbar warn"><b>Needed before ${DOW[first.getDay()]}:</b> ${esc(missing.map(x => x.send).join(", "))}</div>`;
    } else {
      bar = `<div class="wbar good"><b>Nothing needed from you${which ? " yet" : " this week"}.</b> ${which ? "Nothing graded is on the calendar for this week so far. New quizzes get added as teachers post them." : "Everything due has study material."}</div>`;
    }
    const coming = (plan.coming || []).filter(c => c.date > isoD(fri)).slice(0, 5)
      .map(c => `${DOW[parseD(c.date).getDay()]} ${short(parseD(c.date))} ${esc(c.text)}`).join(" &middot; ");
    return `<section class="card" id="parent-week">
      <div class="wtop"><h2 style="margin:0">${esc(S.profiles.find(p => p.id === profileId).name)}'s week</h2>
        <div class="seg" role="group" aria-label="Week">
          <button data-week="0" aria-pressed="${which === 0}">This week</button><button data-week="1" aria-pressed="${which === 1}">Next week</button></div>
        <span class="sub" style="margin:0">${short(start)} - ${short(fri)}${plan.updated ? " &middot; updated " + esc(short(parseD(plan.updated))) : ""}</span></div>
      ${bar}
      <div class="wscroll"><div class="wwk">${days}</div></div>
      <div class="wleg"><span><i style="background:#ebfbee"></i>Ready (tap to open)</span><span><i style="background:#fff4e6"></i>Needs material from you</span><span><i class="d"></i>Dashed = study session</span></div>
      ${coming ? `<div class="wsoon"><b>Coming up</b> &nbsp; ${coming}</div>` : ""}
    </section>`;
  }
  let weekWhich = 0;
  function viewParent() {
    const N = S.needs || {};
    const blocks = S.profiles.map(p => {
      const subs = p.subjects ? S.subjects.filter(s => p.subjects.includes(s.id)) : S.subjects;
      const content = S.content[p.id] || {};
      const rows = subs.map(s => {
        const n = (content[s.id] || []).length;
        return `<tr><td>${s.icon} ${esc(s.name)}</td><td>${n ? `<span class="ok">${n} set${n > 1 ? "s" : ""}</span>` : `<span class="wait">Placeholder</span>`}</td></tr>`;
      }).join("");
      const needs = (N[p.id] || []).slice().sort((a, b) => (a.due || "9999") < (b.due || "9999") ? -1 : 1);
      const list = needs.length ? needs.map(n => `<li><b>${esc(subjName(n.subject))}</b>${n.due ? ` <span class="due">due ${esc(nice(n.due))}</span>` : ""}<br>${esc(n.what)}<br><small>${esc(n.why || "")}</small></li>`).join("")
        : `<li>Nothing needed right now.</li>`;
      return `<section class="card" id="parent-${p.id}">
        <h2 style="margin-top:0"><span class="avatar" style="background:${p.color}">${esc(p.name[0])}</span> ${esc(p.name)}</h2>
        <h3>Send me</h3><ul class="needs">${list}</ul>
        <h3>Subjects</h3><table class="guide"><tbody>${rows}</tbody></table>
      </section>`;
    }).join("");
    $("#main").innerHTML = `<div class="crumbs">Parent</div><h1>Parent dashboard</h1>
      <p class="sub">What I still need from you, by kid. ${N.updated ? "Last updated " + esc(nice(N.updated)) + "." : ""} Photos of lists and study guides work fine.</p>${weekCard("cole", weekWhich)}${blocks}`;
  }

  // ---------- views ----------
  function viewHome() {
    if (state.parent) return viewParent();
    state.setId = null;
    const list = sets();
    $("#main").innerHTML = `
      <div class="crumbs">${esc(profile().name)}</div>
      <h1>${subject().icon} ${esc(subject().name)}</h1>
      <p class="sub">Pick a study set to practice.</p>
      ${reviewCard()}
      ${list.length ? unitGroups(list) :
        `<div class="card">Nothing here yet for ${esc(profile().name)}. Waiting on material. The Parent dashboard lists what to send.</div>`}
    `;
  }

  function reviewCard() {
    const r = reviewSet();
    if (!r) return "";
    return `<div class="grid" style="margin-bottom:8px"><button class="card set-card" data-set="${REVIEW_ID}">
      <div><span class="tag">Review</span></div><h3 style="margin-top:10px">🔁 Mixed review</h3>
      <div class="sub" style="margin:0">${r.words.length} words from all lists${r.missedCount ? ` &middot; includes ${r.missedCount} you missed` : ""}</div></button></div>`;
  }

  // group sets under their "unit" heading (e.g. a book); sets with no unit come last under "Other"
  function unitGroups(list) {
    const order = [];
    const by = {};
    list.forEach(x => { const u = x.unit || ""; if (!by[u]) { by[u] = []; order.push(u); } by[u].push(x); });
    order.sort((a, b) => (a === "") - (b === ""));
    const multi = order.length > 1 || order[0] !== "";
    return order.map(u => `
      ${multi ? `<h2 class="unit-head">${u ? "📘 " + esc(u) : "Other"}</h2>` : ""}
      <div class="grid">${by[u].map(setCard).join("")}</div>`).join("");
  }

  function setCard(x) {
    const best = store.get(bestKey(x.id));
    const isTest = x.type === "test";
    return `<button class="card set-card" data-set="${x.id}">
      <div>${x.sample ? '<span class="tag sample">SAMPLE</span>' : ""}<span class="tag">${isTest ? "Chapter review" : x.type === "spelling" ? "Spelling" : x.type === "verse" ? "Memory verse" : "Vocabulary"}</span></div>
      <h3 style="margin-top:10px">${esc(x.title)}</h3>
      <div class="sub" style="margin:0">${x.type === "verse" ? esc(x.ref) + (x.due ? " &middot; due " + esc(nice(x.due)) : "") : isTest ? x.questions.length + " questions" : x.words.length + " words"}${best ? ` &middot; best ${esc(best)}` : ""}</div>
    </button>`;
  }

  function viewSet() {
    const x = curSet();
    if (!x) return viewHome();
    const tabs = TABS[x.type] || TABS.vocab;
    if (!tabs.some(t => t[0] === state.mode)) state.mode = tabs[0][0];
    const tab = ([id, label]) => `<button class="tab" role="tab" data-mode="${id}" aria-selected="${state.mode === id}">${label}</button>`;
    $("#main").innerHTML = `
      <div class="crumbs"><a href="#" data-home style="color:inherit">${esc(subject().name)}</a> / ${esc(profile().name)}${x.unit ? " / " + esc(x.unit) : ""}</div>
      <h1>${esc(x.title)}</h1>
      ${x.sample ? `<div class="banner">These are <b>sample words</b> so you can try the tool. Send me the real list and I'll swap it in.</div>` : ""}
      <div class="tabs" role="tablist">${tabs.map(tab).join("")}</div>
      <div id="panel"></div>`;
    ({
      cards: () => startCards(x),
      quiz: () => startQuiz(x),
      list: () => viewList(x),
      spell: () => startSpelling(x),
      vrecall: () => viewVerseRecall(x),
      vtype: () => viewVerseType(x),
      vorder: () => viewVerseOrder(x),
      test: () => viewTestHome(x),
      order: () => viewOrder(x),
      guide: () => viewGuide(x)
    })[state.mode]();
  }

  // ---------- word list (vocab) ----------
  function viewList(x) {
    $("#panel").innerHTML = `
      <div class="row no-print" style="margin-bottom:14px"><button class="btn" id="printBtn">Print list</button>
      <span class="sub" style="margin:0">Handy for writing the index cards by hand.</span></div>
      <table class="words"><thead><tr><th>Word</th><th>Type</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
      ${x.words.map(w => `<tr><td>${esc(w.word)}</td><td>${esc((w.pic ? w.pic + " " : "") + (w.pos || ""))}</td><td>${esc(w.def)}</td><td>${esc(w.sentence || "")}</td></tr>`).join("")}
      </tbody></table>`;
    $("#printBtn").onclick = () => window.print();
  }

  // ---------- print cards ----------
  // Letter pages, 2 x 4 grid (3.5in x 2.5in cards). Word pages come first, then a matching meaning page
  // for each. Back pages are mirrored left/right so the two sides line up when printed double-sided
  // (flip on the long edge).
  function printCards(x) {
    const COLS = 2, PER = 8;
    const words = cardWords(x).slice();
    const cell = (w, side) => !w ? `<div class="pcard empty"></div>` : side === "front"
      ? `<div class="pcard">${w.pic ? `<div style="font-size:44px;line-height:1.1">${w.pic}</div>` : ""}<div class="pw">${esc(w.word)}</div>${w.pos ? `<div class="pp">${esc(w.pos)}</div>` : ""}</div>`
      : `<div class="pcard"><div class="pd">${esc(w.def)}</div>${w.sentence ? `<div class="pe">&ldquo;${esc(w.sentence)}&rdquo;</div>` : ""}</div>`;
    let html = "";
    for (let i = 0; i < words.length; i += PER) {
      const chunk = words.slice(i, i + PER);
      while (chunk.length < PER) chunk.push(null);
      html += `<section class="psheet">${chunk.map(w => cell(w, "front")).join("")}</section>`;
      const mirrored = [];
      for (let r = 0; r < PER / COLS; r++) {
        const row = chunk.slice(r * COLS, r * COLS + COLS).reverse();
        mirrored.push(...row);
      }
      html += `<section class="psheet">${mirrored.map(w => cell(w, "back")).join("")}</section>`;
    }
    const sheet = document.createElement("div");
    sheet.id = "printSheet";
    sheet.innerHTML = html;
    document.body.appendChild(sheet);
    document.body.classList.add("printing-cards");
    const cleanup = () => { document.body.classList.remove("printing-cards"); sheet.remove(); window.removeEventListener("afterprint", cleanup); };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }
  const printRow = `<div class="row no-print" style="justify-content:center;margin-top:20px">
      <button class="btn" id="printCards">🖨 Print cards</button>
      <span class="sub" style="margin:0;font-size:13px">Print double-sided (flip on long edge), then cut apart.</span></div>`;

  // ---------- flashcards ----------
  let fc = null;
  function startCards(x, words) {
    const base = words || cardWords(x);
    fc = { deck: shuffle(base), i: 0, flipped: false, missed: [], known: 0, total: base.length, set: x };
    drawCard();
  }
  function drawCard() {
    const p = $("#panel");
    if (fc.i >= fc.deck.length) {
      const hasQuiz = fc.set.type === "test" ? "Take the practice test" : fc.set.type === "spelling" ? "Take the spelling quiz" : "Take the quiz";
      p.innerHTML = `<div class="card" style="text-align:center">
        <h2>Deck complete</h2>
        <p class="sub">You knew ${fc.known} of ${fc.total}.</p>
        <div class="row" style="justify-content:center">
          ${fc.missed.length ? `<button class="btn primary" id="again">Study the ${fc.missed.length} I missed</button>` : ""}
          <button class="btn" id="restart">Start over</button>
          <button class="btn" data-goquiz>${hasQuiz}</button>
        </div></div>${printRow}`;
      $("#printCards").onclick = () => printCards(fc.set);
      const a = $("#again"); if (a) a.onclick = () => startCards(fc.set, fc.missed);
      $("#restart").onclick = () => startCards(fc.set);
      return;
    }
    const w = fc.deck[fc.i];
    p.innerHTML = `
      <div class="sub" style="margin-bottom:0">Card ${fc.i + 1} of ${fc.deck.length}</div>
      <div class="progress"><i style="width:${(fc.i / fc.deck.length) * 100}%"></i></div>
      <div class="flash-wrap">
        <div class="flash ${fc.flipped ? "flipped" : ""}" id="flash" role="button" tabindex="0" aria-label="Flip card">
          <div class="face">${w.pic ? `<div class="pic" aria-hidden="true">${w.pic}</div>` : ""}<div class="big ${w.word.length > 22 ? "long" : ""}">${esc(w.word)}</div>${w.pos ? `<div class="pos">${esc(w.pos)}</div>` : ""}<div class="hint">tap to flip &middot; space</div></div>
          <div class="face back"><div class="def">${esc(w.def)}</div>${w.sentence ? `<div class="ex">&ldquo;${esc(w.sentence)}&rdquo;</div>` : ""}</div>
        </div>
      </div>
      <div class="flash-controls">
        <button class="btn bad" id="miss">✗ Still learning</button>
        <button class="btn" id="flip">Flip</button>
        ${canSpeak && fc.set.type === "spelling" ? `<button class="btn" id="hearCard">🔊 Hear it</button>` : ""}
        <button class="btn good" id="know">✓ I know it</button>
      </div>${printRow}`;
    $("#printCards").onclick = () => printCards(fc.set);
    const hc = $("#hearCard"); if (hc) hc.onclick = () => speak(w.word);
    const flip = () => { fc.flipped = !fc.flipped; $("#flash").classList.toggle("flipped", fc.flipped); };
    $("#flash").onclick = flip; $("#flip").onclick = flip;
    $("#know").onclick = () => { fc.known++; nextCard(); };
    $("#miss").onclick = () => { fc.missed.push(w); nextCard(); };
  }
  function nextCard() { fc.i++; fc.flipped = false; drawCard(); }

  // ---------- quiz engine (shared by vocab quiz, practice test, and story order) ----------
  let qz = null;
  function buildQuestions(words) {
    return shuffle(words).map(w => {
      const kinds = ["word-to-def", "def-to-word"];
      if (w.sentence && new RegExp(w.word, "i").test(w.sentence)) kinds.push("blank");
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const others = shuffle(words.filter(o => o !== w)).slice(0, 3);
      let prompt, label, correct, opts;
      if (kind === "word-to-def") {
        label = "What does this word mean?"; prompt = cap(w.word);
        correct = w.def; opts = [w, ...others].map(o => o.def);
      } else if (kind === "def-to-word") {
        label = "Which word fits this meaning?"; prompt = cap(w.def);
        correct = w.word; opts = [w, ...others].map(o => o.word);
      } else {
        label = "Fill in the blank";
        prompt = w.sentence.replace(new RegExp(w.word, "i"), "_______");
        correct = w.word; opts = [w, ...others].map(o => o.word);
      }
      return { w, kind, label, prompt, correct, opts: shuffle(opts) };
    });
  }
  function startQuiz(x, words) {
    const w = words || x.words;
    if (w.length < 2) { $("#panel").innerHTML = `<div class="card">Need at least 2 words for a quiz.</div>`; return; }
    qz = { set: x, qs: buildQuestions(w), i: 0, score: 0, missed: [], missedQs: [], answered: false, record: true, regen: null };
    drawQ();
  }
  // run an already-built list of questions (used by the practice test and story order)
  function runQs(x, qs, opts) {
    qz = { set: x, qs, i: 0, score: 0, missed: [], missedQs: [], answered: false, record: !!opts.record, regen: opts.regen };
    drawQ();
  }
  function drawQ() {
    const p = $("#panel");
    if (qz.i >= qz.qs.length) return endQuiz();
    const q = qz.qs[qz.i];
    qz.answered = false;
    p.innerHTML = `
      <div class="sub" style="margin-bottom:0">Question ${qz.i + 1} of ${qz.qs.length} &middot; ${qz.score} correct</div>
      <div class="progress"><i style="width:${(qz.i / qz.qs.length) * 100}%"></i></div>
      <div class="card">
        <div class="q-kind">${esc(q.label)}</div>
        <div class="q-prompt">${esc(q.prompt)}</div>
        <div class="opts">${q.opts.map((o, n) => `<button class="opt" data-n="${n}"><span class="k">${LETTERS[n]}</span><span>${esc(o)}</span></button>`).join("")}</div>
        <div id="fb"></div>
      </div>`;
    p.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(+b.dataset.n));
  }
  function answer(n) {
    if (qz.answered) return;
    qz.answered = true;
    const q = qz.qs[qz.i];
    const ok = q.opts[n] === q.correct;
    document.querySelectorAll(".opt").forEach((b, i) => {
      b.disabled = true;
      if (q.opts[i] === q.correct) b.classList.add("correct");
      else if (i === n) b.classList.add("wrong");
    });
    if (ok) qz.score++; else { qz.missed.push(q.w); qz.missedQs.push(q); }
    if (q.kind === "word-to-def" || q.kind === "def-to-word" || q.kind === "blank") recordMiss(q.w, q.w._set || qz.set.id, ok);
    const last = qz.i === qz.qs.length - 1;
    $("#fb").innerHTML = `<div class="feedback ${ok ? "good" : "bad"}">${ok ? "Correct!" : "Not quite."}
      <small><b>${esc(q.w.word)}</b>: ${esc(q.w.def)}</small>${q.note ? `<small class="note">${esc(q.note)}</small>` : ""}</div>
      <div style="margin-top:14px"><button class="btn primary" id="next">${last ? "See results" : "Next"} &rarr;</button></div>`;
    $("#next").onclick = () => { qz.i++; drawQ(); };
    $("#next").focus();
  }
  function endQuiz() {
    const total = qz.qs.length, pct = Math.round((qz.score / total) * 100);
    if (qz.record) {
      const prev = parseInt((store.get(bestKey(qz.set.id)) || "0").split("/")[0], 10) || 0;
      if (qz.score >= prev) store.set(bestKey(qz.set.id), `${qz.score}/${total}`);
    }
    $("#panel").innerHTML = `<div class="card" style="text-align:center">
      <p class="score">${qz.score}/${total}</p>
      <p class="sub">${pct}% &middot; ${pct === 100 ? "Perfect!" : pct >= 80 ? "Great work!" : pct >= 60 ? "Getting there - review the ones you missed." : "Keep practicing - flashcards will help."}</p>
      ${qz.missed.length ? `<div style="text-align:left;max-width:560px;margin:0 auto 18px"><b>Review these:</b><ul class="missed">${qz.missed.map(w => `<li><b>${esc(w.word)}</b> - ${esc(w.def)}</li>`).join("")}</ul></div>` : ""}
      <div class="row" style="justify-content:center">
        ${qz.missed.length ? `<button class="btn primary" id="retry">Quiz me on the ${qz.missed.length} I missed</button>` : ""}
        <button class="btn" id="newq">${qz.regen ? "Try again" : "New quiz"}</button>
        <button class="btn" id="tocards">Flashcards</button>
      </div></div>`;
    const r = $("#retry");
    if (r) r.onclick = () => {
      if (qz.regen) return runQs(qz.set, qz.missedQs.slice(), { regen: qz.regen });
      const words = qz.missed.length >= 2 ? qz.missed.concat(shuffle(qz.set.words.filter(w => !qz.missed.includes(w))).slice(0, 1)) : qz.set.words;
      startQuiz(qz.set, words);
    };
    $("#newq").onclick = () => qz.regen ? qz.regen() : startQuiz(qz.set);
    $("#tocards").onclick = () => { state.mode = "cards"; viewSet(); };
  }

  // ---------- spelling: hear the word, see the picture, type it ----------
  const normWord = s => String(s).trim().toLowerCase().replace(/[’‘]/g, "'");
  // color the part of the word the lesson is about (a blend like "fl", or the apostrophe)
  const hiWord = w => {
    const i = w.hl ? w.word.toLowerCase().indexOf(w.hl.toLowerCase()) : -1;
    if (i < 0) return esc(w.word);
    return esc(w.word.slice(0, i)) + `<span class="hl">${esc(w.word.slice(i, i + w.hl.length))}</span>` + esc(w.word.slice(i + w.hl.length));
  };
  const blanksFor = word => [...word].map(c => (c === "'" || c === "’") ? "'" : "_").join(" ");
  let sp = null;
  function startSpelling(x, words) {
    const base = words || x.words;
    sp = { set: x, qs: shuffle(base), i: 0, score: 0, missed: [], full: !words };
    drawSpell();
  }
  function drawSpell() {
    if (sp.i >= sp.qs.length) return endSpell();
    const w = sp.qs[sp.i];
    $("#panel").innerHTML = `
      <div class="sub" style="margin-bottom:0">Word ${sp.i + 1} of ${sp.qs.length} &middot; ${sp.score} right</div>
      <div class="progress"><i style="width:${(sp.i / sp.qs.length) * 100}%"></i></div>
      <div class="card" style="text-align:center">
        ${w.pic ? `<div class="sp-pic" aria-hidden="true">${w.pic}</div>` : ""}
        <div class="row" style="justify-content:center;margin:6px 0 14px">
          ${canSpeak ? `<button class="btn primary" id="hear">🔊 Hear it</button><button class="btn" id="hearS">Hear it in a sentence</button>`
                     : `<span class="sub" style="margin:0">No sound on this device. It means: ${esc(w.def)}</span>`}
        </div>
        <div class="blanks" aria-hidden="true">${blanksFor(w.word)}</div>
        <div style="margin:14px 0 4px"><input id="spIn" class="sp-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word"></div>
        <div id="spErr" class="sp-err"></div><div id="speakNote" class="sp-err"></div>
        <div class="row" style="justify-content:center"><button class="btn primary" id="spCheck">Check</button></div>
        <div id="spFb"></div>
      </div>`;
    const input = $("#spIn");
    input.focus();
    const hear = $("#hear"); if (hear) hear.onclick = () => speak(w.word);
    const hearS = $("#hearS"); if (hearS) hearS.onclick = () => speak(w.sentence);
    const check = () => {
      if (!input.value.trim()) { $("#spErr").textContent = "Type the word first."; return; }
      $("#spErr").textContent = "";
      const typed = input.value;
      input.disabled = true;
      $("#spCheck").remove();
      const ok = normWord(typed) === normWord(w.word);
      if (ok) sp.score++; else sp.missed.push(w);
      recordMiss(w, sp.set.id, ok);
      spellFeedback(w, ok, typed);
    };
    $("#spCheck").onclick = check;
    input.onkeydown = e => { if (e.key === "Enter") check(); };
  }
  function spellFeedback(w, ok, typed) {
    const nextBtn = `<div style="margin-top:14px"><button class="btn primary" id="spNext">Next &rarr;</button></div>`;
    const goNext = () => { sp.i++; drawSpell(); };
    const fb = $("#spFb");
    const note = w.note ? `<small>${esc(w.note)}</small>` : "";
    if (ok) {
      fb.innerHTML = `<div class="feedback good" style="margin-top:14px"><div class="sp-word">${hiWord(w)}</div>Nice spelling!${note}<small>${esc(w.sentence)}</small></div>${nextBtn}`;
      $("#spNext").onclick = goNext; $("#spNext").focus();
      return;
    }
    fb.innerHTML = `<div class="feedback bad" style="margin-top:14px">Not quite. You typed &ldquo;${esc(typed)}&rdquo;. Here is the word:
        <div class="sp-word">${hiWord(w)}</div>${note}</div>
      <p class="sub" style="margin:14px 0 6px">Type it one more time:</p>
      <input id="spIn2" class="sp-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word again">
      <div id="spErr2" class="sp-err"></div>
      <div class="row" style="justify-content:center"><button class="btn primary" id="spAgain">Check</button><button class="btn" id="spSkip">Skip</button></div>`;
    const in2 = $("#spIn2"); in2.focus();
    const again = () => {
      if (normWord(in2.value) === normWord(w.word)) {
        fb.insertAdjacentHTML("beforeend", "");
        $("#spErr2").textContent = "";
        in2.disabled = true; $("#spAgain").remove(); $("#spSkip").remove();
        fb.insertAdjacentHTML("beforeend", `<div class="feedback good" style="margin-top:12px">That's it!</div>${nextBtn}`);
        $("#spNext").onclick = goNext; $("#spNext").focus();
      } else $("#spErr2").textContent = "Look at the word and try again.";
    };
    $("#spAgain").onclick = again;
    in2.onkeydown = e => { if (e.key === "Enter") again(); };
    $("#spSkip").onclick = goNext;
  }
  function endSpell() {
    const total = sp.qs.length, pct = Math.round((sp.score / total) * 100);
    if (sp.full) {
      const prev = parseInt((store.get(bestKey(sp.set.id)) || "0").split("/")[0], 10) || 0;
      if (sp.score >= prev) store.set(bestKey(sp.set.id), `${sp.score}/${total}`);
    }
    $("#panel").innerHTML = `<div class="card" style="text-align:center">
      <p class="score">${sp.score}/${total}</p>
      <p class="sub">${pct === 100 ? "Perfect spelling!" : pct >= 80 ? "Great job!" : pct >= 60 ? "Good try - practice the ones you missed." : "Keep practicing - flashcards will help."}</p>
      ${sp.missed.length ? `<div style="max-width:420px;margin:0 auto 18px;text-align:left"><b>Practice these:</b><ul class="missed">${sp.missed.map(w => `<li>${w.pic ? w.pic + " " : ""}<b>${hiWord(w)}</b></li>`).join("")}</ul></div>` : ""}
      <div class="row" style="justify-content:center">
        ${sp.missed.length ? `<button class="btn primary" id="spRetry">Practice the ${sp.missed.length} I missed</button>` : ""}
        <button class="btn" id="spAll">Try again</button>
        <button class="btn" id="spCards">Flashcards</button>
      </div></div>`;
    const r = $("#spRetry"); if (r) r.onclick = () => startSpelling(sp.set, sp.missed.slice());
    $("#spAll").onclick = () => startSpelling(sp.set);
    $("#spCards").onclick = () => { state.mode = "cards"; viewSet(); };
  }

  // ---------- memory verses: hide more words each level, type it, put it in order ----------
  const vWords = x => x.text.trim().split(/\s+/);
  const vNorm = w => w.toLowerCase().replace(/[^a-z0-9']/g, "");
  let vr = null;
  function viewVerseRecall(x) {
    vr = { x, level: vr && vr.x === x ? vr.level : 1, shown: {} };
    drawVerse();
  }
  function drawVerse() {
    const x = vr.x, W = vWords(x), n = W.length, fr = [0, .25, .5, .75, 1][vr.level];
    // fixed scramble so the same words hide at each level (and harder levels hide a superset)
    const rank = W.map((_, i) => i).sort((a, b) => ((a * 7919 + 13) % n) - ((b * 7919 + 13) % n));
    const hide = new Set(rank.slice(0, Math.round(n * fr)));
    const body = W.map((w, i) => {
      if (!hide.has(i) || vr.shown[vr.level + ":" + i]) return `<span class="vw">${esc(w)}</span>`;
      const mm = w.match(/^(.*?)([^A-Za-z0-9']*)$/), core = mm[1], tail = mm[2];
      return `<button class="vw hid" data-vi="${i}" aria-label="Hidden word, tap to show">${esc(core[0] || "")}${"_".repeat(Math.max(2, core.length - 1))}</button>${esc(tail)}`;
    }).join(" ");
    $("#panel").innerHTML = `<div class="card">
      <div class="sub" style="margin:0 0 6px">${esc(x.ref)} &middot; Level ${vr.level} of 4. Say the verse out loud, then tap a blank to check it.</div>
      <div class="verse">${body}</div><div id="speakNote" class="sp-err"></div>
      <div class="row" style="margin-top:14px">
        <button class="btn" id="vEasy" ${vr.level <= 0 ? "disabled" : ""}>Easier</button>
        <button class="btn" id="vHard" ${vr.level >= 4 ? "disabled" : ""}>Hide more</button>
        <button class="btn" id="vShow">Show all</button>
        ${canSpeak ? `<button class="btn" id="vSay">🔊 Read it to me</button>` : ""}
      </div></div>`;
    $("#panel").querySelectorAll("[data-vi]").forEach(b => b.onclick = () => { vr.shown[vr.level + ":" + b.dataset.vi] = 1; drawVerse(); });
    $("#vEasy").onclick = () => { vr.level = Math.max(0, vr.level - 1); drawVerse(); };
    $("#vHard").onclick = () => { vr.level = Math.min(4, vr.level + 1); drawVerse(); };
    $("#vShow").onclick = () => { vr.level = 0; drawVerse(); };
    const say = $("#vSay"); if (say) say.onclick = () => speak(x.text);
  }
  // longest common subsequence of two word lists, to mark which verse words were typed right
  function lcsMask(ref, typed) {
    const a = ref.length, b = typed.length, t = Array.from({ length: a + 1 }, () => new Array(b + 1).fill(0));
    for (let i = a - 1; i >= 0; i--) for (let j = b - 1; j >= 0; j--)
      t[i][j] = ref[i] === typed[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    const ok = new Array(a).fill(false), extra = [];
    let i = 0, j = 0;
    while (i < a && j < b) {
      if (ref[i] === typed[j]) { ok[i] = true; i++; j++; }
      else if (t[i + 1][j] >= t[i][j + 1]) i++;
      else { extra.push(typed[j]); j++; }
    }
    while (j < b) extra.push(typed[j++]);
    return { ok, extra };
  }
  function viewVerseType(x) {
    $("#panel").innerHTML = `<div class="card">
      <p class="sub" style="margin-top:0">${esc(x.ref)}. Type the verse from memory, then check it.</p>
      <textarea id="vIn" class="v-input" rows="6" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the verse"></textarea>
      <div id="vErr" class="sp-err"></div>
      <div class="row"><button class="btn primary" id="vCheck">Check</button></div>
      <div id="vRes"></div></div>`;
    $("#vCheck").onclick = () => {
      const typed = $("#vIn").value.trim();
      if (!typed) { $("#vErr").textContent = "Type the verse first."; return; }
      $("#vErr").textContent = "";
      const W = vWords(x), T = typed.split(/\s+/).map(vNorm).filter(Boolean);
      const m = lcsMask(W.map(vNorm), T), right = m.ok.filter(Boolean).length, pct = Math.round(right / W.length * 100);
      $("#vRes").innerHTML = `<div class="feedback ${pct === 100 && !m.extra.length ? "good" : "bad"}" style="margin-top:14px">
        <b>${pct === 100 && !m.extra.length ? "Perfect! Word for word." : right + " of " + W.length + " words right (" + pct + "%)"}</b>
        <div class="verse" style="margin-top:8px">${W.map((w, i) => `<span class="vw ${m.ok[i] ? "vok" : "vno"}">${esc(w)}</span>`).join(" ")}</div>
        ${m.extra.length ? `<small>Extra or wrong words you typed: ${esc(m.extra.join(", "))}</small>` : ""}
        <small>Green = right. Red = missing or different.</small></div>`;
    };
  }
  function verseChunks(text) {
    const parts = text.trim().split(/(?<=[.,;:])\s+/), out = [];
    parts.forEach(p => {
      const w = p.split(/\s+/);
      if (w.length > 7) { const h = Math.ceil(w.length / 2); out.push(w.slice(0, h).join(" "), w.slice(h).join(" ")); }
      else out.push(p);
    });
    return out;
  }
  function viewVerseOrder(x) {
    const chunks = verseChunks(x.text);
    let bank = shuffle(chunks.map((c, i) => ({ c, i }))), picked = [];
    if (chunks.length > 1 && bank.every((b, k) => b.i === k)) bank = bank.reverse();
    const draw = () => {
      const done = !bank.length, right = done && picked.every((p, k) => p.i === k);
      $("#panel").innerHTML = `<div class="card">
        <p class="sub" style="margin-top:0">${esc(x.ref)}. Tap the pieces in the right order.</p>
        <div class="verse order-line">${picked.length ? picked.map(p => `<span class="vw">${esc(p.c)}</span>`).join(" ") : '<span class="sub">Your verse goes here</span>'}</div>
        <div class="row" style="margin:12px 0">${bank.map((b, k) => `<button class="btn" data-bk="${k}">${esc(b.c)}</button>`).join("")}</div>
        ${done ? `<div class="feedback ${right ? "good" : "bad"}">${right ? "Perfect order!" : "Not quite. The right order:"}${right ? "" : `<div class="verse" style="margin-top:8px">${esc(x.text)}</div>`}</div>` : ""}
        <div class="row"><button class="btn" id="oUndo" ${picked.length ? "" : "disabled"}>Undo</button><button class="btn" id="oAgain">${done ? "Try again" : "Start over"}</button></div></div>`;
      $("#panel").querySelectorAll("[data-bk]").forEach(b => b.onclick = () => { picked.push(bank.splice(+b.dataset.bk, 1)[0]); draw(); });
      $("#oUndo").onclick = () => { if (picked.length) { bank.push(picked.pop()); draw(); } };
      $("#oAgain").onclick = () => viewVerseOrder(x);
    };
    draw();
  }

  // ---------- practice test (theology and other "test" sets) ----------
  const isMissed = q => q.cole != null && q.cole !== q.ans;
  function viewTestHome(x) {
    const missed = x.questions.filter(isMissed);
    const chapters = [...new Set(x.questions.map(q => q.ch))].sort((a, b) => a - b);
    const best = store.get(bestKey(x.id));
    $("#panel").innerHTML = `
      <div class="card">
        <h2>${x.questions.length} questions</h2>
        <p class="sub">Same questions and answer letters as the study guide.${best ? ` Best score so far: ${esc(best)}.` : ""}</p>
        <div class="row">
          <button class="btn primary" data-t="all">Start in order</button>
          <button class="btn" data-t="shuffle">Shuffle the questions</button>
          ${missed.length ? `<button class="btn" data-t="missed">Review the ${missed.length} I missed</button>` : ""}
        </div>
        <p class="sub" style="margin:18px 0 8px">Or practice one chapter at a time:</p>
        <div class="row">${chapters.map(c => `<button class="btn" data-t="ch${c}">Chapter ${c} (${x.questions.filter(q => q.ch === c).length})</button>`).join("")}</div>
      </div>`;
    $("#panel").querySelectorAll("[data-t]").forEach(b => b.onclick = () => startTest(x, b.dataset.t));
  }
  function startTest(x, which) {
    let qs = x.questions;
    if (which === "shuffle") qs = shuffle(qs);
    else if (which === "missed") qs = qs.filter(isMissed);
    else if (which.startsWith("ch")) qs = qs.filter(q => "ch" + q.ch === which);
    const built = qs.map(q => ({
      w: { word: "Question " + q.n, def: q.why }, kind: "test",
      label: `Chapter ${q.ch} · Question ${q.n}`, prompt: q.q,
      correct: q.opts[q.ans], opts: q.opts.slice(), note: q.note || ""
    }));
    runQs(x, built, { record: which === "all" || which === "shuffle", regen: () => startTest(x, which) });
  }

  // ---------- story order ----------
  function viewOrder(x) {
    $("#panel").innerHTML = `
      <div class="card">
        <h2>The story in order</h2>
        <ol class="timeline">${x.events.map(e => `<li>${esc(e)}</li>`).join("")}</ol>
        <div class="row no-print"><button class="btn primary" id="ordq">Quiz me on the order</button></div>
      </div>`;
    $("#ordq").onclick = () => startOrder(x);
  }
  function startOrder(x) {
    const E = x.events, qs = [];
    for (let i = 0; i < E.length - 1; i++) {
      const others = shuffle(E.filter((_, j) => j !== i && j !== i + 1)).slice(0, 3);
      qs.push({
        w: { word: "Story order", def: `${E[i]}, and then: ${E[i + 1]}` }, kind: "order",
        label: "What happened next?", prompt: E[i], correct: E[i + 1], opts: shuffle([E[i + 1], ...others]), note: ""
      });
    }
    runQs(x, shuffle(qs), { regen: () => startOrder(x) });
  }

  // ---------- study guide (answers + how he did) ----------
  function viewGuide(x) {
    const hasCole = x.questions.some(q => q.cole != null);
    const right = x.questions.filter(q => q.cole === q.ans).length;
    const row = q => {
      const ok = q.cole === q.ans;
      const extra = q.written != null ? `<tr class="sub-row"><td></td><td colspan="4">Cole wrote: &ldquo;${esc(q.written)}&rdquo; &middot; ${esc(q.better)}</td></tr>` : "";
      return `<tr><td>${q.n}</td><td>${esc(q.q)}</td>
        <td><b>${LETTERS[q.ans]}.</b> ${esc(q.opts[q.ans])}</td>
        <td>${q.cole == null ? "" : `<b>${LETTERS[q.cole]}.</b> ${esc(q.opts[q.cole])}`}</td>
        <td class="${ok ? "ok" : "no"}">${q.cole == null ? "" : ok ? "✓" : "✗"}</td></tr>${extra}`;
    };
    const e = x.extra;
    $("#panel").innerHTML = `
      <div class="row no-print" style="margin-bottom:14px"><button class="btn" id="printBtn">Print guide</button>
      ${hasCole ? `<span class="sub" style="margin:0">Cole's circled answers: ${right} of ${x.questions.length} match.</span>` : ""}</div>
      <table class="words guide"><thead><tr><th>#</th><th>Question</th><th>Correct answer</th><th>Cole circled</th><th></th></tr></thead><tbody>
      ${x.questions.map(row).join("")}
      ${e ? `<tr><td>EC</td><td>${esc(e.q)}</td><td colspan="3">${esc(e.better)}<br><span class="sub" style="margin:0;font-size:13px">Cole wrote: &ldquo;${esc(e.cole)}&rdquo;</span></td></tr>` : ""}
      </tbody></table>`;
    $("#printBtn").onclick = () => window.print();
  }

  // ---------- events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("button, a");
    // close profile menu when clicking elsewhere
    if (!e.target.closest("#profile")) { $("#profileMenu").hidden = true; $("#profileBtn").setAttribute("aria-expanded", "false"); }
    if (!t) return;
    if (t.id === "menuBtn") return setSide(document.body.classList.contains("side-hidden"));
    if (t.id === "profileBtn") { const m = $("#profileMenu"); m.hidden = !m.hidden; t.setAttribute("aria-expanded", !m.hidden); return; }
    if (t.closest("#profileMenu") && t.dataset.parent) {
      state.parent = true; $("#profileMenu").hidden = true; renderProfile(); renderSidebar();
      loadAll().then(viewParent); return;
    }
    if (t.dataset.week) { weekWhich = +t.dataset.week; return viewParent(); }
    if (t.dataset.open) {
      const o = JSON.parse(t.dataset.open);
      state.parent = false; state.profile = o.p; state.subject = o.s; state.setId = o.set; state.mode = null;
      store.set("sh:profile", state.profile); store.set("sh:subject", state.subject);
      renderProfile(); renderSidebar();
      loadContent(state.profile).then(viewSet); return;
    }
    if (t.dataset.jump) {
      const el = document.getElementById("parent-" + t.dataset.jump); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.innerWidth <= 800) setSide(false);
      return;
    }
    if (t.closest("#profileMenu") && t.dataset.id) {
      state.parent = false;
      state.profile = t.dataset.id; store.set("sh:profile", state.profile);
      $("#profileMenu").hidden = true; renderProfile();
      fixSubject(); renderSidebar();
      loadContent(state.profile).then(viewHome); return;
    }
    if (t.classList.contains("nav-item") && !t.disabled && !t.dataset.jump) {
      state.subject = t.dataset.id; store.set("sh:subject", state.subject);
      renderSidebar(); viewHome();
      if (window.innerWidth <= 800) setSide(false);
      return;
    }
    if (t.dataset.set) { state.setId = t.dataset.set; state.mode = null; return viewSet(); }
    if (t.dataset.mode) { state.mode = t.dataset.mode; return viewSet(); }
    if (t.hasAttribute("data-home")) { e.preventDefault(); return viewHome(); }
    if (t.hasAttribute("data-goquiz")) { const x = curSet(); state.mode = x && x.type === "test" ? "test" : x && x.type === "spelling" ? "spell" : "quiz"; return viewSet(); }
  });
  $("#scrim").addEventListener("click", () => setSide(false));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { $("#profileMenu").hidden = true; return; }
    if (!state.setId) return;
    if (state.mode === "cards" && fc && fc.i < fc.deck.length) {
      if (e.key === " " || e.key === "Enter") { if (e.target.tagName === "BUTTON") return; e.preventDefault(); $("#flash").click(); }
      if (e.key === "ArrowRight") $("#know").click();
      if (e.key === "ArrowLeft") $("#miss").click();
    }
    if (qz && qz.i < qz.qs.length && !qz.answered && $("#panel .opt:not(:disabled)")) {
      const k = e.key.toLowerCase();
      let n = "abcde".indexOf(k);
      if (n < 0) n = "12345".indexOf(k);
      if (n >= 0 && n < qz.qs[qz.i].opts.length) answer(n);
    }
  });

  // ---------- boot ----------
  renderProfile();
  renderSidebar();
  const sideOpen = window.innerWidth > 800 && store.get("sh:side") !== "0";
  setSide(sideOpen);
  loadContent(state.profile).then(viewHome);
})();
