/* ============================================================
   i18n.js — Þýðingar / Translations
   Til að bæta við tungumáli: Afritaðu "en" blokk og þýddu.
   ============================================================ */

const LANG = {
  is: {
    // Meta
    siteTitle: "Almenn Líffræði",
    subtitle: "LÍFF2LA05 · Flensborgarskóli",
    skipLink: "Fara beint í efni",
    // Controls
    fontUp: "Stækka letur",
    fontDown: "Minnka letur",
    themeToggle: "Skipta um þema",
    langLabel: "Tungumál",
    // Nav
    navHome: "Heim",
    navCh1: "Næringarfræði",
    navCh2: "Frumur",
    navCh3: "Örverur",
    navCh4: "Erfðafræði",
    navCh5: "Æxlun",
    navCh6: "Vistfræði",
    // Hero
    heroTitle: "Lífið — smátt og stórt",
    heroDesc: "Skoðaðu heiminn sem er of lítill til að sjást — en ræður ferðinni.",
    heroBtn: "Byrja nám →",
    // Chapters
    ch1Title: "★ Næringarfræði og mannslíkaminn",
    ch2Title: "★ Frumur — lífseiningar",
    ch3Title: "★ Örverur — bakteríur, sveppir og veirur",
    ch4Title: "★ Erfðafræði og stökkbreytingar",
    ch5Title: "Æxlun og kynheilbrigði",
    ch6Title: "★ Vistfræði og umhverfisfræði",
    // Expandable
    showMore: "Lesa meira ▾",
    showLess: "Loka ▴",
    // Quiz
    quizHeading: "🧪 Prófaðu þig",
    checkAnswer: "Athuga svar",
    nextQ: "Næsta →",
    restartQuiz: "Byrja aftur",
    correct: "✓ Rétt!",
    wrong: "✗ Rangt.",
    correctWas: "Rétt svar: ",
    quizDone: "Lokið! Einkunn þín: ",
    of: " af ",
    // Drag
    dragTitle: "Raðaðu í réttan flokk",
    dragHint: "Dragðu og slepptu",
    dragSuccess: "🎉 Allt rétt!",
    dragRetry: "🔄 Reyndu aftur",
    // Cell
    cellTitle: "Gagnvirkt frumurit",
    cellHint: "Smelltu á hluta til að fá frekari upplýsingar",
    clickOrganelle: "← Smelltu á hluta",
    // Footer
    footerCopy: "© 2026 Hólmfríður Sigþórsdóttir · Flensborgarskóli",
    footerSources: "Heimildir: Vísindavefurinn · MMS · Landlæknisembættið",
    builtOn: "Smíðað",
  },
  en: {
    siteTitle: "General Biology",
    subtitle: "LÍFF2LA05 · Flensborg School",
    skipLink: "Skip to content",
    fontUp: "Increase font",
    fontDown: "Decrease font",
    themeToggle: "Toggle theme",
    langLabel: "Language",
    navHome: "Home",
    navCh1: "Nutrition",
    navCh2: "Cells",
    navCh3: "Microorganisms",
    navCh4: "Genetics",
    navCh5: "Reproduction",
    navCh6: "Ecology",
    heroTitle: "Life — small and large",
    heroDesc: "Explore the world too small to see — yet it controls everything.",
    heroBtn: "Start learning →",
    ch1Title: "★ Nutrition and the human body",
    ch2Title: "★ Cells — units of life",
    ch3Title: "★ Microorganisms — bacteria, fungi and viruses",
    ch4Title: "★ Genetics and mutations",
    ch5Title: "Reproduction and sexual health",
    ch6Title: "★ Ecology and environmental science",
    showMore: "Read more ▾",
    showLess: "Close ▴",
    quizHeading: "🧪 Test yourself",
    checkAnswer: "Check answer",
    nextQ: "Next →",
    restartQuiz: "Restart",
    correct: "✓ Correct!",
    wrong: "✗ Wrong.",
    correctWas: "Correct answer: ",
    quizDone: "Done! Your score: ",
    of: " of ",
    dragTitle: "Sort into the right category",
    dragHint: "Drag and drop",
    dragSuccess: "🎉 All correct!",
    dragRetry: "🔄 Try again",
    cellTitle: "Interactive cell diagram",
    cellHint: "Click on a part to learn more",
    clickOrganelle: "← Click a part",
    footerCopy: "© 2026 Hólmfríður Sigþórsdóttir · Flensborg School",
    footerSources: "Sources: Vísindavefurinn · MMS · Directorate of Health",
    builtOn: "Built on",
  }
};

let currentLang = "is";

function t(key) {
  return (LANG[currentLang] || LANG.is)[key] || key;
}

function applyLang(lang) {
  if (!LANG[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (LANG[lang][k] !== undefined) el.textContent = LANG[lang][k];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const k = el.getAttribute("data-i18n-aria");
    if (LANG[lang][k] !== undefined) el.setAttribute("aria-label", LANG[lang][k]);
  });
  document.querySelectorAll(".lang-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === lang);
    b.setAttribute("aria-pressed", b.dataset.lang === lang);
  });
  try { localStorage.setItem("bio-lang", lang); } catch(e) {}
}
