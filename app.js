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

  const S = STUDY;
  const state = {
    profile: store.get("sh:profile") || S.profiles[0].id,
    subject: store.get("sh:subject") || S.subjects[0].id,
    setId: null,
    mode: "cards"
  };
  if (!S.profiles.some(p => p.id === state.profile)) state.profile = S.profiles[0].id;
  if (!S.subjects.some(s => s.id === state.subject)) state.subject = S.subjects[0].id;

  const profile = () => S.profiles.find(p => p.id === state.profile);
  const subject = () => S.subjects.find(s => s.id === state.subject);
  const sets = () => ((S.content[state.profile] || {})[state.subject]) || [];
  const curSet = () => sets().find(x => x.id === state.setId);
  const bestKey = id => `sh:best:${state.profile}:${id}`;

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
    $("#profileBtn").innerHTML = `<span class="avatar" style="background:${p.color}">${esc(p.name[0])}</span><span>${esc(p.name)}</span> <span aria-hidden="true">▾</span>`;
    $("#profileMenu").innerHTML = S.profiles.map(x =>
      `<li><button data-id="${x.id}" ${x.id === p.id ? 'aria-current="true"' : ""}><span class="avatar" style="background:${x.color}">${esc(x.name[0])}</span>${esc(x.name)}</button></li>`
    ).join("");
  }

  function renderSidebar() {
    $("#sidebar").innerHTML = `<h2>Subjects</h2>` + S.subjects.map(s =>
      `<button class="nav-item" data-id="${s.id}" ${s.id === state.subject ? 'aria-current="true"' : ""}><span>${s.icon}</span>${esc(s.name)}</button>`
    ).join("");
  }

  function setSide(open) {
    document.body.classList.toggle("side-hidden", !open);
    $("#menuBtn").setAttribute("aria-expanded", open);
    $("#scrim").hidden = !(open && window.innerWidth <= 800);
    store.set("sh:side", open ? "1" : "0");
  }

  // ---------- views ----------
  function viewHome() {
    state.setId = null;
    const list = sets();
    $("#main").innerHTML = `
      <div class="crumbs">${esc(profile().name)}</div>
      <h1>${subject().icon} ${esc(subject().name)}</h1>
      <p class="sub">Pick a study set to practice.</p>
      ${list.length ? unitGroups(list) :
        `<div class="card">Nothing here yet for ${esc(profile().name)}. New study sets will show up here.</div>`}
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
    return `<button class="card set-card" data-set="${x.id}">
      <div>${x.sample ? '<span class="tag sample">SAMPLE</span>' : ""}<span class="tag">${x.type === "vocab" ? "Vocabulary" : esc(x.type)}</span></div>
      <h3 style="margin-top:10px">${esc(x.title)}</h3>
      <div class="sub" style="margin:0">${x.words.length} words${best ? ` &middot; best quiz ${esc(best)}` : ""}</div>
    </button>`;
  }

  function viewSet() {
    const x = curSet();
    if (!x) return viewHome();
    const tab = (id, label) => `<button class="tab" role="tab" data-mode="${id}" aria-selected="${state.mode === id}">${label}</button>`;
    $("#main").innerHTML = `
      <div class="crumbs"><a href="#" data-home style="color:inherit">${esc(subject().name)}</a> / ${esc(profile().name)}${x.unit ? " / " + esc(x.unit) : ""}</div>
      <h1>${esc(x.title)}</h1>
      ${x.sample ? `<div class="banner">These are <b>sample words</b> so you can try the tool. Send me the real list and I'll swap it in.</div>` : ""}
      <div class="tabs" role="tablist">${tab("cards", "Flashcards")}${tab("quiz", "Quiz")}${tab("list", "Word list")}</div>
      <div id="panel"></div>`;
    if (state.mode === "cards") startCards(x);
    else if (state.mode === "quiz") startQuiz(x);
    else viewList(x);
  }

  // ---------- word list ----------
  function viewList(x) {
    $("#panel").innerHTML = `
      <div class="row no-print" style="margin-bottom:14px"><button class="btn" id="printBtn">Print list</button>
      <span class="sub" style="margin:0">Handy for writing the index cards by hand.</span></div>
      <table class="words"><thead><tr><th>Word</th><th>Type</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
      ${x.words.map(w => `<tr><td>${esc(w.word)}</td><td>${esc(w.pos || "")}</td><td>${esc(w.def)}</td><td>${esc(w.sentence || "")}</td></tr>`).join("")}
      </tbody></table>`;
    $("#printBtn").onclick = () => window.print();
  }

  // ---------- flashcards ----------
  let fc = null;
  function startCards(x, words) {
    fc = { deck: shuffle(words || x.words), i: 0, flipped: false, missed: [], known: 0, total: (words || x.words).length, set: x };
    drawCard();
  }
  function drawCard() {
    const p = $("#panel");
    if (fc.i >= fc.deck.length) {
      p.innerHTML = `<div class="card" style="text-align:center">
        <h2>Deck complete</h2>
        <p class="sub">You knew ${fc.known} of ${fc.total}.</p>
        <div class="row" style="justify-content:center">
          ${fc.missed.length ? `<button class="btn primary" id="again">Study the ${fc.missed.length} I missed</button>` : ""}
          <button class="btn" id="restart">Start over</button>
          <button class="btn" data-goquiz>Take the quiz</button>
        </div></div>`;
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
          <div class="face"><div class="big">${esc(w.word)}</div>${w.pos ? `<div class="pos">${esc(w.pos)}</div>` : ""}<div class="hint">tap to flip &middot; space</div></div>
          <div class="face back"><div class="def">${esc(w.def)}</div>${w.sentence ? `<div class="ex">&ldquo;${esc(w.sentence)}&rdquo;</div>` : ""}</div>
        </div>
      </div>
      <div class="flash-controls">
        <button class="btn bad" id="miss">✗ Still learning</button>
        <button class="btn" id="flip">Flip</button>
        <button class="btn good" id="know">✓ I know it</button>
      </div>`;
    const flip = () => { fc.flipped = !fc.flipped; $("#flash").classList.toggle("flipped", fc.flipped); };
    $("#flash").onclick = flip; $("#flip").onclick = flip;
    $("#know").onclick = () => { fc.known++; nextCard(); };
    $("#miss").onclick = () => { fc.missed.push(w); nextCard(); };
  }
  function nextCard() { fc.i++; fc.flipped = false; drawCard(); }

  // ---------- quiz ----------
  let qz = null;
  function buildQuestions(words) {
    const qs = shuffle(words).map(w => {
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
    return qs;
  }
  function startQuiz(x, words) {
    const w = words || x.words;
    if (w.length < 2) { $("#panel").innerHTML = `<div class="card">Need at least 2 words for a quiz.</div>`; return; }
    qz = { set: x, qs: buildQuestions(w), i: 0, score: 0, missed: [], answered: false };
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
        <div class="q-kind">${q.label}</div>
        <div class="q-prompt">${esc(q.prompt)}</div>
        <div class="opts">${q.opts.map((o, n) => `<button class="opt" data-n="${n}"><span class="k">${"ABCD"[n]}</span><span>${esc(o)}</span></button>`).join("")}</div>
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
    if (ok) qz.score++; else qz.missed.push(q.w);
    const last = qz.i === qz.qs.length - 1;
    $("#fb").innerHTML = `<div class="feedback ${ok ? "good" : "bad"}">${ok ? "Correct!" : "Not quite."}
      <small><b>${esc(q.w.word)}</b>: ${esc(q.w.def)}</small></div>
      <div style="margin-top:14px"><button class="btn primary" id="next">${last ? "See results" : "Next"} &rarr;</button></div>`;
    $("#next").onclick = () => { qz.i++; drawQ(); };
    $("#next").focus();
  }
  function endQuiz() {
    const total = qz.qs.length, pct = Math.round((qz.score / total) * 100);
    const prev = parseInt((store.get(bestKey(qz.set.id)) || "0").split("/")[0], 10) || 0;
    if (qz.score >= prev) store.set(bestKey(qz.set.id), `${qz.score}/${total}`);
    $("#panel").innerHTML = `<div class="card" style="text-align:center">
      <p class="score">${qz.score}/${total}</p>
      <p class="sub">${pct}% &middot; ${pct === 100 ? "Perfect!" : pct >= 80 ? "Great work!" : pct >= 60 ? "Getting there - review the ones you missed." : "Keep practicing - flashcards will help."}</p>
      ${qz.missed.length ? `<div style="text-align:left;max-width:520px;margin:0 auto 18px"><b>Review these:</b><ul class="missed">${qz.missed.map(w => `<li><b>${esc(w.word)}</b> - ${esc(w.def)}</li>`).join("")}</ul></div>` : ""}
      <div class="row" style="justify-content:center">
        ${qz.missed.length ? `<button class="btn primary" id="retry">Quiz me on the ${qz.missed.length} I missed</button>` : ""}
        <button class="btn" id="newq">New quiz</button>
        <button class="btn" id="tocards">Flashcards</button>
      </div></div>`;
    const r = $("#retry"); if (r) r.onclick = () => startQuiz(qz.set, qz.missed.length >= 2 ? qz.missed.concat(shuffle(qz.set.words.filter(w => !qz.missed.includes(w))).slice(0, 1)) : qz.set.words);
    $("#newq").onclick = () => startQuiz(qz.set);
    $("#tocards").onclick = () => { state.mode = "cards"; viewSet(); };
  }

  // ---------- events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("button, a");
    // close profile menu when clicking elsewhere
    if (!e.target.closest("#profile")) { $("#profileMenu").hidden = true; $("#profileBtn").setAttribute("aria-expanded", "false"); }
    if (!t) return;
    if (t.id === "menuBtn") return setSide(document.body.classList.contains("side-hidden"));
    if (t.id === "profileBtn") { const m = $("#profileMenu"); m.hidden = !m.hidden; t.setAttribute("aria-expanded", !m.hidden); return; }
    if (t.closest("#profileMenu") && t.dataset.id) {
      state.profile = t.dataset.id; store.set("sh:profile", state.profile);
      $("#profileMenu").hidden = true; renderProfile();
      loadContent(state.profile).then(viewHome); return;
    }
    if (t.classList.contains("nav-item") && !t.disabled) {
      state.subject = t.dataset.id; store.set("sh:subject", state.subject);
      renderSidebar(); viewHome();
      if (window.innerWidth <= 800) setSide(false);
      return;
    }
    if (t.dataset.set) { state.setId = t.dataset.set; state.mode = "cards"; return viewSet(); }
    if (t.dataset.mode) { state.mode = t.dataset.mode; return viewSet(); }
    if (t.hasAttribute("data-home")) { e.preventDefault(); return viewHome(); }
    if (t.hasAttribute("data-goquiz")) { state.mode = "quiz"; return viewSet(); }
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
    if (state.mode === "quiz" && qz && qz.i < qz.qs.length && !qz.answered) {
      const n = "abcd1234".indexOf(e.key.toLowerCase()) % 4;
      if (n >= 0 && n < qz.qs[qz.i].opts.length && "abcd1234".includes(e.key.toLowerCase())) answer(n);
    }
  });

  // ---------- boot ----------
  renderProfile();
  renderSidebar();
  const sideOpen = window.innerWidth > 800 && store.get("sh:side") !== "0";
  setSide(sideOpen);
  loadContent(state.profile).then(viewHome);
})();
