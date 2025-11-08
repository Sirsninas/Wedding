// =============== Konstantes un palīgi ===============
const BASE_URL =
  "https://script.google.com/macros/s/AKfycbwICZRQ3SSzIHi3_pVvromAYMnC7_Fz9S4TB7ftxel31bbYj7prsoQRbzZ_itraI0jj/exec";

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function getUid() {
  const params = new URLSearchParams(window.location.search);
  return params.get("uid") || "";
}
function withUidParam(url) {
  const uid = getUid();
  return uid ? `${url}?uid=${encodeURIComponent(uid)}` : url;
}
function getUidQuery() {
  const uid = getUid();
  return uid ? `?uid=${encodeURIComponent(uid)}` : "";
}

function navigateWithCloud(targetHref) {
  document.body.classList.add("cloud-dissolve");
  window.setTimeout(() => {
    window.location.assign(targetHref + getUidQuery());
  }, 1000);
}

async function fetchJSON(url, opts = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal, ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      // mēģinām interpretēt kā tekstu un JSON.parse, ja iespējams
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error("Nederīgs JSON no servera");
      }
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function postJSONNoCors(url, obj) {
  // GAS ContentService bez CORS — izmantojam no-cors režīmu
  return fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  });
}

// =============== Index lapa ===============
async function initIndex() {
  const introEl = qs("#intro-text");
  // Teksts no Sheets
  try {
    const text = await fetch(`${BASE_URL}?action=getIndexText`).then((r) => r.text());
    introEl.textContent = text || "—";
  } catch (err) {
    introEl.textContent = "Neizdevās ielādēt tekstu.";
    console.error(err);
  }

  // Pogu loģika
  const yesBtn = qs("#ja-button");
  const noBtn = qs("#ne-button");
  if (yesBtn) {
    yesBtn.addEventListener("click", () => navigateWithCloud("play.html"));
    yesBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigateWithCloud("play.html");
      }
    });
  }
  if (noBtn) {
    noBtn.addEventListener("click", () => {
      const neEmoji = qs("#ne-button .ne-emoji");
      if (neEmoji) {
        neEmoji.textContent = "😢";
        neEmoji.classList.add("collapsed");
      }
      window.setTimeout(() => navigateWithCloud("sad.html"), 1000);
    });
  }
}

// =============== Play lapa ===============
const state = {
  questions: [],
  activeIndex: 0,
};

async function initPlay() {
  await loadQuestions();
  annotateOriginalIndexes();
  computeActiveIndexFromFirstUnanswered();
  renderAll();
  attachGlobalHandlers();
}

function annotateOriginalIndexes() {
  state.questions.forEach((q, i) => (q._i = i));
}

function computeActiveIndexFromFirstUnanswered() {
  const idx = state.questions.findIndex((q) => !q.selected);
  state.activeIndex = idx === -1 ? state.questions.length : idx;
}

async function loadQuestions() {
  const uid = getUid();
  const url = `${BASE_URL}?action=getQuestions&uid=${encodeURIComponent(uid)}`;
  try {
    const data = await fetchJSON(url);
    state.questions = Array.isArray(data?.questions) ? data.questions : [];
  } catch (err) {
    console.error("Kļūda ielādējot jautājumus:", err);
    state.questions = [];
  }
}

function attachGlobalHandlers() {
  const finishBtn = qs("#finish-btn");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      window.location.assign("results.html" + getUidQuery());
    });
  }
}

function renderAll() {
  renderActiveCard();
  renderDeck();
  reflectFinishVisibility();
}

function renderActiveCard() {
  const wrap = qs("#active-card-container");
  if (!wrap) return;
  wrap.innerHTML = "";

  if (state.activeIndex >= state.questions.length) return;

  const q = state.questions[state.activeIndex];
  const card = buildCard(q, { isActive: true });
  card.classList.add("card-fade-in");
  wrap.appendChild(card);
}

function renderDeck() {
  const wrap = qs("#deck-container");
  if (!wrap) return;
  wrap.innerHTML = "";

  // tikai tās, kurām ir atbildes
  const answered = state.questions.filter((q) => q.selected);
  answered.forEach((q) => {
    const card = buildCard(q, { isActive: false });
    card.dataset.idx = q._i; // oriģinālais indekss
    wrap.appendChild(card);
  });
}

function buildCard(q, { isActive }) {
  const card = document.createElement("article");
  card.className = "question-card " + (isActive ? "active-card" : "deck-card");
  card.tabIndex = isActive ? -1 : 0;
  card.setAttribute("role", "group");
  card.setAttribute("aria-label", "Jautājums");

  const qText = document.createElement("p");
  qText.className = "card-question-text";
  qText.textContent = q.text || "";
  if (!isActive) qText.style.fontSize = "1.1rem";
  card.appendChild(qText);

  const answers = document.createElement("div");
  answers.className = "card-answer-container";

  (q.answers || []).forEach((a) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-answer-btn";
    btn.textContent = a;
    if (q.selected === a) btn.innerHTML = `❤️ ${a}`;

    if (isActive) {
      btn.addEventListener("click", () => selectAnswer(q, a, btn));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectAnswer(q, a, btn);
        }
      });
    } else {
      // Deck kartīte: klikšķis aktivizē oriģinālo jautājumu
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
    }

    answers.appendChild(btn);
  });

  card.appendChild(answers);

  if (!isActive) {
    // mazā, lifta animācija/aktivizācija
    card.addEventListener("mouseenter", () => card.classList.add("deck-card-lift"));
    card.addEventListener("mouseleave", () => card.classList.remove("deck-card-lift"));
    card.addEventListener("click", () => {
      const idx = Number(card.dataset.idx);
      if (!Number.isNaN(idx)) {
        state.activeIndex = idx;
        renderAll();
        // ritinām uz augšu pie aktīvās
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    });
  }

  return card;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function selectAnswer(question, selectedAnswer, btnEl) {
  // UI atjaunojums
  const active = qs("#active-card-container .question-card");
  if (active) {
    qsa(".card-answer-btn", active).forEach((b) => (b.innerHTML = b.textContent));
  }
  btnEl.innerHTML = `❤️ ${selectedAnswer}`;

  // Modelis
  question.selected = selectedAnswer;

  // Sūtām uz GAS (no-cors)
  postJSONNoCors(BASE_URL, {
    action: "updateAnswer",
    uid: getUid(),
    row: question.row,
    answer: selectedAnswer,
  }).catch((e) => console.error("Neizdevās atjaunināt atbildi:", e));

  // Animācija + nākamais
  if (active && !prefersReducedMotion()) active.classList.add("card-slide-down-out");

  window.setTimeout(() => {
    if (state.activeIndex < state.questions.length - 1) state.activeIndex += 1;
    renderAll();
  }, prefersReducedMotion() ? 0 : 1000);
}

function reflectFinishVisibility() {
  const allAnswered = state.questions.length > 0 && state.questions.every((q) => !!q.selected);
  const box = qs("#finish-container");
  if (!box) return;
  box.hidden = !allAnswered;
}

// =============== Boot ===============
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (body.classList.contains("page-index")) initIndex();
  if (body.classList.contains("page-play")) initPlay();
});
