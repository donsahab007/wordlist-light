// WordList Lite — vanilla JS, no build step, no backend.
// Edit mode password gate is a client-side UI convenience only — NOT real
// security. See README for details and how to change the password.

(function () {
  "use strict";

  // ---- Configuration ------------------------------------------------
  // Edit-mode password check uses PBKDF2 (SHA-256, 150,000 iterations) with
  // a random salt, instead of a single fast hash — this makes offline
  // brute-forcing meaningfully slower even though the salt/hash are visible
  // in this file. It is still a client-side convenience gate, NOT real
  // security (see README). There is NO recovery if the password is
  // forgotten — you must regenerate these values and redeploy.
  //
  // To change the password, run this in Node (or adapt for a browser
  // console using the same crypto.subtle APIs) and replace the three
  // constants below with the printed values:
  //
  //   node -e "
  //   const crypto = require('crypto').webcrypto;
  //   (async () => {
  //     const password = 'yourNewPassword';
  //     const salt = crypto.getRandomValues(new Uint8Array(16));
  //     const enc = new TextEncoder();
  //     const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  //     const iterations = 150000;
  //     const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256);
  //     const hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  //     console.log('SALT_HEX =', hex(salt));
  //     console.log('ITERATIONS =', iterations);
  //     console.log('HASH_HEX =', hex(bits));
  //   })();
  //   "
  const PASSWORD_SALT_HEX = "41ffabddd4f63cc264bd2de0f4c3f9e0";
  const PASSWORD_ITERATIONS = 150000;
  const PASSWORD_HASH_HEX =
    "b6c68f32012e4817b415570685a843ac4281e81f376b0b315504836f81d4c150";

  // ---- State ----------------------------------------------------------
  let words = [];
  let searchTerm = "";
  let letterFilter = null; // e.g. "A" or null for all
  let difficultyFilter = "all";
  let currentView = "list"; // "list" | "flashcard"
  let deck = [];
  let deckIndex = 0;
  let editMode = false;
  let unsavedChanges = false;
  let editingOriginalWord = null; // set when editing an existing word

  // ---- DOM refs ---------------------------------------------------------
  const els = {
    viewToggleBtn: document.getElementById("viewToggleBtn"),
    editModeBtn: document.getElementById("editModeBtn"),
    searchInput: document.getElementById("searchInput"),
    alphabetFilter: document.getElementById("alphabetFilter"),
    resultCount: document.getElementById("resultCount"),
    errorBanner: document.getElementById("errorBanner"),
    listView: document.getElementById("listView"),
    wordList: document.getElementById("wordList"),
    flashcardView: document.getElementById("flashcardView"),
    difficultyFilter: document.getElementById("difficultyFilter"),
    deckPosition: document.getElementById("deckPosition"),
    flashcard: document.getElementById("flashcard"),
    cardWord: document.getElementById("cardWord"),
    cardDetails: document.getElementById("cardDetails"),
    prevCardBtn: document.getElementById("prevCardBtn"),
    nextCardBtn: document.getElementById("nextCardBtn"),
    passwordModal: document.getElementById("passwordModal"),
    passwordInput: document.getElementById("passwordInput"),
    passwordError: document.getElementById("passwordError"),
    passwordCancelBtn: document.getElementById("passwordCancelBtn"),
    passwordSubmitBtn: document.getElementById("passwordSubmitBtn"),
    editToolbar: document.getElementById("editToolbar"),
    unsavedIndicator: document.getElementById("unsavedIndicator"),
    addWordBtn: document.getElementById("addWordBtn"),
    exportBtn: document.getElementById("exportBtn"),
    exitEditModeBtn: document.getElementById("exitEditModeBtn"),
    wordFormModal: document.getElementById("wordFormModal"),
    wordFormTitle: document.getElementById("wordFormTitle"),
    wordForm: document.getElementById("wordForm"),
    formError: document.getElementById("formError"),
    wordFormCancelBtn: document.getElementById("wordFormCancelBtn"),
    originalWord: document.getElementById("originalWord"),
    fWord: document.getElementById("fWord"),
    fMeaning: document.getElementById("fMeaning"),
    fPartOfSpeech: document.getElementById("fPartOfSpeech"),
    fExample: document.getElementById("fExample"),
    fSynonyms: document.getElementById("fSynonyms"),
    fAntonyms: document.getElementById("fAntonyms"),
    fHindiMeaning: document.getElementById("fHindiMeaning"),
    fCategory: document.getElementById("fCategory"),
    fDifficulty: document.getElementById("fDifficulty"),
  };

  // ---- Utilities --------------------------------------------------------
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  async function derivePasswordHash(password) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: hexToBytes(PASSWORD_SALT_HEX),
        iterations: PASSWORD_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    return Array.from(new Uint8Array(bits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getFilteredWords() {
    const term = searchTerm.trim().toLowerCase();
    return words.filter((w) => {
      if (letterFilter && !w.word.toUpperCase().startsWith(letterFilter)) {
        return false;
      }
      if (!term) return true;
      return (
        w.word.toLowerCase().includes(term) ||
        (w.meaning || "").toLowerCase().includes(term) ||
        (w.hindiMeaning || "").toLowerCase().includes(term)
      );
    });
  }

  // ---- Data loading -------------------------------------------------------
  async function loadWords() {
    try {
      const res = await fetch("words.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("words.json is not an array");
      words = data;
      renderAll();
    } catch (err) {
      els.errorBanner.textContent =
        "Failed to load word data (words.json). " + err.message;
      els.errorBanner.classList.remove("hidden");
    }
  }

  // ---- Rendering: alphabet filter -----------------------------------------
  function renderAlphabet() {
    const letters = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
    els.alphabetFilter.innerHTML = "";
    letters.forEach((letter) => {
      const btn = document.createElement("button");
      btn.textContent = letter;
      const value = letter === "All" ? null : letter;
      if (letterFilter === value) btn.classList.add("active");
      btn.addEventListener("click", () => {
        letterFilter = value;
        renderAlphabet();
        renderList();
      });
      els.alphabetFilter.appendChild(btn);
    });
  }

  // ---- Rendering: list view -------------------------------------------------
  function renderList() {
    const filtered = getFilteredWords();
    els.resultCount.textContent = `${filtered.length} word${filtered.length === 1 ? "" : "s"}`;
    els.wordList.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "result-count";
      empty.textContent = "No words match your search/filter.";
      els.wordList.appendChild(empty);
      return;
    }

    filtered.forEach((w) => {
      const card = document.createElement("div");
      card.className = "word-card";

      const head = document.createElement("div");
      head.className = "word-card-head";
      head.innerHTML = `
        <span class="word-title">${escapeHtml(w.word)}</span>
        <span class="difficulty-badge ${escapeHtml(w.difficulty || "medium")}">${escapeHtml(w.difficulty || "medium")}</span>
      `;
      head.addEventListener("click", () => card.classList.toggle("expanded"));

      const body = document.createElement("div");
      body.className = "word-card-body";
      body.innerHTML = `
        <div><span class="label">Meaning:</span> ${escapeHtml(w.meaning)}</div>
        ${w.partOfSpeech ? `<div><span class="label">Part of speech:</span> ${escapeHtml(w.partOfSpeech)}</div>` : ""}
        ${w.example ? `<div><span class="label">Example:</span> ${escapeHtml(w.example)}</div>` : ""}
        ${w.synonyms ? `<div><span class="label">Synonyms:</span> ${escapeHtml(w.synonyms)}</div>` : ""}
        ${w.antonyms ? `<div><span class="label">Antonyms:</span> ${escapeHtml(w.antonyms)}</div>` : ""}
        ${w.hindiMeaning ? `<div><span class="label">Hindi:</span> ${escapeHtml(w.hindiMeaning)}</div>` : ""}
        ${w.category ? `<div><span class="label">Category:</span> ${escapeHtml(w.category)}</div>` : ""}
      `;

      if (editMode) {
        const actions = document.createElement("div");
        actions.className = "word-card-actions";
        const editBtn = document.createElement("button");
        editBtn.className = "btn";
        editBtn.textContent = "✏️ Edit";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openWordForm(w);
        });
        actions.appendChild(editBtn);
        body.appendChild(actions);
      }

      card.appendChild(head);
      card.appendChild(body);
      els.wordList.appendChild(card);
    });
  }

  // ---- Rendering: flashcard view ---------------------------------------------
  function rebuildDeck() {
    let filtered = getFilteredWords();
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((w) => (w.difficulty || "medium") === difficultyFilter);
    }
    deck = filtered;
    deckIndex = 0;
    renderFlashcard();
  }

  function renderFlashcard() {
    els.flashcard.classList.remove("flipped");
    if (deck.length === 0) {
      els.cardWord.textContent = "No words match current filters";
      els.cardDetails.innerHTML = "";
      els.deckPosition.textContent = "";
      return;
    }
    const w = deck[deckIndex];
    els.cardWord.textContent = w.word;
    els.cardDetails.innerHTML = `
      <div><span class="label">Meaning:</span> ${escapeHtml(w.meaning)}</div>
      ${w.partOfSpeech ? `<div><span class="label">Part of speech:</span> ${escapeHtml(w.partOfSpeech)}</div>` : ""}
      ${w.example ? `<div><span class="label">Example:</span> ${escapeHtml(w.example)}</div>` : ""}
      ${w.synonyms ? `<div><span class="label">Synonyms:</span> ${escapeHtml(w.synonyms)}</div>` : ""}
      ${w.antonyms ? `<div><span class="label">Antonyms:</span> ${escapeHtml(w.antonyms)}</div>` : ""}
      ${w.hindiMeaning ? `<div><span class="label">Hindi:</span> ${escapeHtml(w.hindiMeaning)}</div>` : ""}
      ${w.category ? `<div><span class="label">Category:</span> ${escapeHtml(w.category)}</div>` : ""}
    `;
    els.deckPosition.textContent = `${deckIndex + 1} / ${deck.length}`;
  }

  function renderAll() {
    renderAlphabet();
    renderList();
    rebuildDeck();
  }

  // ---- View toggle ------------------------------------------------------
  function setView(view) {
    currentView = view;
    if (view === "list") {
      els.listView.classList.remove("hidden");
      els.flashcardView.classList.add("hidden");
      els.viewToggleBtn.textContent = "🔀 Flashcards";
    } else {
      els.listView.classList.add("hidden");
      els.flashcardView.classList.remove("hidden");
      els.viewToggleBtn.textContent = "📖 List";
      rebuildDeck();
    }
  }

  // ---- Edit mode ---------------------------------------------------------
  function openPasswordModal() {
    els.passwordInput.value = "";
    els.passwordError.classList.add("hidden");
    els.passwordModal.classList.remove("hidden");
    els.passwordInput.focus();
  }

  function closePasswordModal() {
    els.passwordModal.classList.add("hidden");
  }

  async function submitPassword() {
    const hash = await derivePasswordHash(els.passwordInput.value);
    if (hash === PASSWORD_HASH_HEX) {
      editMode = true;
      unsavedChanges = false;
      els.editToolbar.classList.remove("hidden");
      closePasswordModal();
      renderList();
    } else {
      els.passwordError.classList.remove("hidden");
    }
  }

  function exitEditMode() {
    if (unsavedChanges) {
      const ok = confirm(
        "You have unsaved changes that have not been exported. Exit edit mode anyway?"
      );
      if (!ok) return;
    }
    editMode = false;
    unsavedChanges = false;
    els.editToolbar.classList.add("hidden");
    els.unsavedIndicator.classList.add("hidden");
    renderList();
  }

  function markUnsaved() {
    unsavedChanges = true;
    els.unsavedIndicator.classList.remove("hidden");
  }

  // ---- Add / edit word form -----------------------------------------------
  function openWordForm(word) {
    els.formError.classList.add("hidden");
    if (word) {
      editingOriginalWord = word.word;
      els.wordFormTitle.textContent = "Edit Word";
      els.originalWord.value = word.word;
      els.fWord.value = word.word;
      els.fMeaning.value = word.meaning || "";
      els.fPartOfSpeech.value = word.partOfSpeech || "";
      els.fExample.value = word.example || "";
      els.fSynonyms.value = word.synonyms || "";
      els.fAntonyms.value = word.antonyms || "";
      els.fHindiMeaning.value = word.hindiMeaning || "";
      els.fCategory.value = word.category || "";
      els.fDifficulty.value = word.difficulty || "medium";
    } else {
      editingOriginalWord = null;
      els.wordFormTitle.textContent = "Add Word";
      els.wordForm.reset();
      els.originalWord.value = "";
      els.fDifficulty.value = "medium";
    }
    els.wordFormModal.classList.remove("hidden");
    els.fWord.focus();
  }

  function closeWordForm() {
    els.wordFormModal.classList.add("hidden");
  }

  function handleWordFormSubmit(e) {
    e.preventDefault();
    els.formError.classList.add("hidden");

    const newWord = els.fWord.value.trim();
    const newEntry = {
      word: newWord,
      meaning: els.fMeaning.value.trim(),
      partOfSpeech: els.fPartOfSpeech.value.trim(),
      example: els.fExample.value.trim(),
      synonyms: els.fSynonyms.value.trim(),
      antonyms: els.fAntonyms.value.trim(),
      hindiMeaning: els.fHindiMeaning.value.trim(),
      category: els.fCategory.value.trim(),
      difficulty: els.fDifficulty.value,
    };

    if (!newWord || !newEntry.meaning) {
      els.formError.textContent = "Word and Meaning are required.";
      els.formError.classList.remove("hidden");
      return;
    }

    const duplicate = words.find(
      (w) =>
        w.word.toLowerCase() === newWord.toLowerCase() &&
        w.word.toLowerCase() !== (editingOriginalWord || "").toLowerCase()
    );
    if (duplicate) {
      els.formError.textContent = `"${newWord}" already exists in the dataset.`;
      els.formError.classList.remove("hidden");
      return;
    }

    if (editingOriginalWord) {
      const idx = words.findIndex(
        (w) => w.word.toLowerCase() === editingOriginalWord.toLowerCase()
      );
      if (idx !== -1) words[idx] = newEntry;
    } else {
      words.push(newEntry);
    }

    markUnsaved();
    closeWordForm();
    renderList();
    rebuildDeck();
  }

  // ---- Export ------------------------------------------------------------
  function exportWords() {
    const blob = new Blob([JSON.stringify(words, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    unsavedChanges = false;
    els.unsavedIndicator.classList.add("hidden");
  }

  // ---- Event wiring --------------------------------------------------------
  els.viewToggleBtn.addEventListener("click", () =>
    setView(currentView === "list" ? "flashcard" : "list")
  );

  els.searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderList();
    if (currentView === "flashcard") rebuildDeck();
  });

  els.difficultyFilter.addEventListener("change", (e) => {
    difficultyFilter = e.target.value;
    rebuildDeck();
  });

  els.flashcard.addEventListener("click", () => {
    els.flashcard.classList.toggle("flipped");
  });

  els.prevCardBtn.addEventListener("click", () => {
    if (deck.length === 0) return;
    deckIndex = (deckIndex - 1 + deck.length) % deck.length;
    renderFlashcard();
  });

  els.nextCardBtn.addEventListener("click", () => {
    if (deck.length === 0) return;
    deckIndex = (deckIndex + 1) % deck.length;
    renderFlashcard();
  });

  els.editModeBtn.addEventListener("click", () => {
    if (editMode) {
      exitEditMode();
    } else {
      openPasswordModal();
    }
  });

  els.passwordCancelBtn.addEventListener("click", closePasswordModal);
  els.passwordSubmitBtn.addEventListener("click", submitPassword);
  els.passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitPassword();
  });

  els.exitEditModeBtn.addEventListener("click", exitEditMode);
  els.addWordBtn.addEventListener("click", () => openWordForm(null));
  els.exportBtn.addEventListener("click", exportWords);
  els.wordFormCancelBtn.addEventListener("click", closeWordForm);
  els.wordForm.addEventListener("submit", handleWordFormSubmit);

  window.addEventListener("beforeunload", (e) => {
    if (unsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // ---- Init ---------------------------------------------------------------
  loadWords();
})();
