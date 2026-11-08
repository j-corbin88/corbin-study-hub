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

  // read words aloud with the device's built-in voice (slow and clear for young spellers)
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  function speak(text) {
    if (!canSpeak || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.5;
      const vs = speechSynthesis.getVoices();
      // Samantha is the clearest voice on iPad/iPhone; fall back to any US English voice
      const v = vs.find(v => /^samantha/i.test(v.name)) || vs.find(v => /^en[-_]US/i.test(v.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
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
  const curSet = () => sets().find(x => x.id === state.setId);
  const bestKey = id => `sh:best:${state.profile}:${id}`;

  // tabs shown for each kind of study set (the first one is the default)
  const TABS = {
    vocab: [["cards", "Flashcards"], ["quiz", "Quiz"], ["list", "Word list"]],
    test: [["test", "Practice test"], ["cards", "Flashcards"], ["order", "Story order"], ["guide", "Study guide"]],
    spelling: [["spell", "Spelling quiz"], ["cards", "Flashcards"], ["list", "Word list"]]
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
      <p class="sub">What I still need from you, by kid. ${N.updated ? "Last updated " + esc(nice(N.updated)) + "." : ""} Photos of lists and study guides work fine.</p>${blocks}`;
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
      ${list.length ? unitGroups(list) :
        `<div class="card">Nothing here yet for ${esc(profile().name)}. Waiting on material. The Parent dashboard lists what to send.</div>`}
    `;
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
      <div>${x.sample ? '<span class="tag sample">SAMPLE</span>' : ""}<span class="tag">${isTest ? "Chapter review" : x.type === "spelling" ? "Spelling" : "Vocabulary"}</span></div>
      <h3 style="margin-top:10px">${esc(x.title)}</h3>
      <div class="sub" style="margin:0">${isTest ? x.questions.length + " questions" : x.words.length + " words"}${best ? ` &middot; best ${esc(best)}` : ""}</div>
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
        <div id="spErr" class="sp-err"></div>
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
      spellFeedback(w, ok, typed);
    };
    $("#spCheck").onclick = check;
    input.onkeydown = e => { if (e.key === "Enter") check(); };
    if (canSpeak) setTimeout(() => speak(w.word), 300);
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
