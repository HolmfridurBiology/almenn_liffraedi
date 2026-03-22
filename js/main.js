/* ============================================================
   main.js — Almenn Líffræði
   ============================================================ */

const BUILD_DATE = new Date().toLocaleDateString("is-IS",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});

/* ---- Theme ---- */
function initTheme(){
  const btn = document.getElementById("theme-btn");
  const saved = (() => { try { return localStorage.getItem("bio-theme"); } catch(e){ return null; } })();
  const pref = window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light";
  setTheme(saved || pref);
  btn?.addEventListener("click", () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
}
function setTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("theme-btn");
  if(btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem("bio-theme", t); } catch(e){}
}

/* ---- Font size ---- */
let fz = 16;
function initFont(){
  try { fz = parseInt(localStorage.getItem("bio-fz") || "16"); } catch(e){}
  document.documentElement.style.fontSize = fz + "px";
  document.getElementById("fz-up")?.addEventListener("click", () => setFz(fz+1));
  document.getElementById("fz-dn")?.addEventListener("click", () => setFz(fz-1));
}
function setFz(n){
  fz = Math.max(12, Math.min(24, n));
  document.documentElement.style.fontSize = fz + "px";
  try { localStorage.setItem("bio-fz", fz); } catch(e){}
}

/* ---- Language ---- */
function initLang(){
  const saved = (() => { try { return localStorage.getItem("bio-lang") || "is"; } catch(e){ return "is"; } })();
  applyLang(saved);
  document.querySelectorAll(".lang-btn").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
}

/* ---- Mobile menu ---- */
function initMenu(){
  const btn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const close = () => { sidebar.classList.remove("open"); overlay.classList.remove("active"); btn?.setAttribute("aria-expanded","false"); };
  btn?.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    overlay.classList.toggle("active", open);
    btn.setAttribute("aria-expanded", open);
  });
  overlay?.addEventListener("click", close);
  sidebar?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { if(window.innerWidth<=768) close(); }));
}

/* ---- Active nav ---- */
function initNav(){
  const secs = document.querySelectorAll(".chapter[id]");
  const links = document.querySelectorAll("#sidebar a[href^='#']");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#"+e.target.id));
      }
    });
  }, { threshold: 0.25, rootMargin: "-62px 0px 0px 0px" });
  secs.forEach(s => obs.observe(s));
}

/* ---- Scroll reveal ---- */
function initReveal(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

/* ============================================================
   QUIZ ENGINE
   ============================================================ */
const QUIZDATA = {
  ch1:[
    { q:"Hvaða lífræn efnasambönd eru aðal orkugjafar líkamans?", opts:["Fita og prótín","Sykrur (kolvetni) og fita","Vítamín og steinefni","Prótín og vatn"], a:1 },
    { q:"Hverjar eru byggingareiningar prótína?", opts:["Fitusýrur","Glúkósi","Amínósýrur","Fósfat"], a:2 },
    { q:"Hvaða vítamín þarf fitu til frásogs?", opts:["B-vítamín","C-vítamín","Fituleysanleg vítamín (A,D,E,K)","Vatnsbætt vítamín"], a:2 },
    { q:"Hvert er hlutverk meltingarkerfisins?", opts:["Súrefnisflutningur","Hormónaframleiðsla","Sundrun matar og frásog næringarefna","Taugaboðflutningur"], a:2 },
    { q:"Hvaðan fær líkaminn mest súrefni?", opts:["Meltingarkerfi","Lungu — öndun","Nýru","Lifur"], a:1 }
  ],
  ch2:[
    { q:"Hvert er hlutverk hvatbera (mitókondría)?", opts:["Ljóstillífun","Prótínmyndun","Orkuframleiðsla (ATP)","Efnaflutningur"], a:2 },
    { q:"Hvað á við um dreifkjarnafrumur?", opts:["Hafa afmarkaðan kjarna","Hafa ekki afmarkaðan kjarna","Eru stærri en kjarnafrumur","Hafa grænukorn"], a:1 },
    { q:"Hvað einkennir plöntufrumur en finnst EKKI í dýrafrumum?", opts:["Hvatberi","Kjarni","Frumuveggur og grænukorn","Frymisnet"], a:2 },
    { q:"Frumukenningin segir að:", opts:["Allar frumur hafi kjarna","Allar lífverur séu gerðar úr einni eða fleiri frumum","Frumur geti myndast sjálfkrafa","Bakteríur séu ekki lífverur"], a:1 },
    { q:"Hvert geymir DNA í kjarnafrumum?", opts:["Hvatberi","Safabóla","Kjarni","Grænukorn"], a:2 }
  ],
  ch3:[
    { q:"Hvernig fjölga bakteríur sér?", opts:["Kynæxlun","Gróæxlun","Skiptingu","Með veirum"], a:2 },
    { q:"Hvað á við um veirur?", opts:["Eru frumur","Geta fjölgað sér án hýsils","Eru lífvana smitefni sem þurfa hýsil","Eru stærri en bakteríur"], a:2 },
    { q:"Hvað eru skilyrði rotnunar?", opts:["Kuldi, þurrki, UV","Raki, hiti og súrefni","Saltvatn og sýra","Frysting og geislun"], a:1 },
    { q:"Hvaða kynsjúkdóm má meðhöndla með sýklalyfjum?", opts:["HIV","HPV","Klamýdía","Herpes"], a:2 },
    { q:"Sveppir fjölga sér með:", opts:["Skiptingu","Veirusmiti","Gróum (spórum)","Ljóstillífun"], a:2 }
  ],
  ch4:[
    { q:"Hvaða basepar mynda hvort annað í DNA?", opts:["A-G og T-C","A-T og G-C","A-C og T-G","A-A og T-T"], a:1 },
    { q:"Hvað er gen?", opts:["Gerð prótíns","Hluti af DNA sem kóðar eiginleika","Tegund frumuhimnu","Litni í kjarna"], a:1 },
    { q:"Hvaðan koma stökkbreytingar?", opts:["Aðeins erfðir","UV, geislun, tóbak, tilviljun","Aðeins af vírusum","Alltaf skaðlegar"], a:1 },
    { q:"Mendels lög fjalla um:", opts:["Þróun tegunda","Erfðir eininga (gen) og aðskilnað þeirra","Stökkbreytingar","Krabbamein"], a:1 },
    { q:"Hvað er munurinn á genótýpu og fenótýpu?", opts:["Enginn munur","Genótýpa = erfðasamsett; Fenótýpa = útlit","Fenótýpa = DNA; Genótýpa = útlit","Báðar lýsa DNA-röð"], a:1 }
  ],
  ch5:[
    { q:"Hvar á sér frjóvgun stað hjá mönnum?", opts:["Legorð","Legháls","Eggjaleiðara","Eggjastokkar"], a:2 },
    { q:"Hvaða kynsjúkdómar orsakast af veirum?", opts:["Klamýdía og lekandi","HIV og HPV","Sárasótt og klamýdía","Lekandi og sárasótt"], a:1 },
    { q:"Besta vörn gegn kynsjúkdómum er:", opts:["Sýklalyf","Smokkar","B-vítamín","Hormónameðferð"], a:1 },
    { q:"Kynfæravörtur orsakast af:", opts:["HIV","Klamýdíubaktería","HPV veirunni","Herpesveirunni"], a:2 },
    { q:"Hvað er bólusetning?", opts:["Sýklalyf gegn bakteríum","Inngjöf veiklaðs smitefnis til að virkja ónæmissvörun","Meðferð við HIV","Getnaðarvörn"], a:1 }
  ],
  ch6:[
    { q:"Hvað eru frumframleiðendur í vistkerfi?", opts:["Dýr sem éta önnur dýr","Plöntur sem búa til næringu með ljóstillífun","Sveppir sem sundra dauðum efnum","Bakteríur sem valda sjúkdómum"], a:1 },
    { q:"Hvað er fæðukeðja?", opts:["Líffærakerfi dýra","Röð þar sem nærings flyst frá einni lífveru til annarrar","Net félagslegra tengsla","Hringsól kolefnis"], a:1 },
    { q:"Surtsey er dæmi um:", opts:["Fæðukeðju í lokuðu kerfi","Frumherjun — líf á nýju landi","Hamfarahlýnun","Loftslagsbreytingar"], a:1 },
    { q:"Hamfarahlýnun stafar af:", opts:["Náttúrulegri hlýnun sólkerfisins","Gróðurhúsalofttegundum frá mannlegum aðgerðum","Kólnun á norðurslóðum","Breytingum á sjávarstreymi"], a:1 },
    { q:"Hlutverk rotvera (sundrenda) er:", opts:["Framleiðsla súrefnis","Sundrið lífrænar leifar og skila næringarefnum til jarðvegs","Jafna hitastig hafsins","Binda köfnunarefni úr lofti"], a:1 }
  ]
};

class Quiz {
  constructor(id, key){
    this.el = document.getElementById(id);
    this.data = QUIZDATA[key] || [];
    this.i = 0; this.score = 0; this.answered = false;
    if(this.el && this.data.length) this.render();
  }
  render(){
    if(this.i >= this.data.length){ this.done(); return; }
    const q = this.data[this.i];
    const dots = this.data.map((_,j) => `<div class="quiz-pip${j<this.i?" done":j===this.i?" now":""}"></div>`).join("");
    this.el.innerHTML = `
      <div class="quiz-bar" role="progressbar" aria-valuenow="${this.i+1}" aria-valuemax="${this.data.length}">${dots}</div>
      <p class="quiz-q" id="qq${this.i}">${q.q}</p>
      <div class="quiz-opts" role="group" aria-labelledby="qq${this.i}">
        ${q.opts.map((o,j)=>`<button class="quiz-opt" data-j="${j}">${o}</button>`).join("")}
      </div>
      <div class="quiz-fb" id="qfb" role="alert" aria-live="polite"></div>
      <div class="quiz-actions">
        <button class="btn" id="qnext" disabled>${t("nextQ")}</button>
      </div>`;
    this.answered = false;
    this.el.querySelectorAll(".quiz-opt").forEach(b => b.addEventListener("click", () => this.pick(parseInt(b.dataset.j))));
    this.el.querySelector("#qnext").addEventListener("click", () => { this.i++; this.render(); });
  }
  pick(j){
    if(this.answered) return;
    this.answered = true;
    const q = this.data[this.i];
    const ok = j === q.a;
    if(ok) this.score++;
    this.el.querySelectorAll(".quiz-opt").forEach((b,k) => {
      b.disabled = true;
      if(k === q.a) b.classList.add("opt-correct");
      else if(k === j && !ok) b.classList.add("opt-wrong");
    });
    const fb = this.el.querySelector("#qfb");
    fb.className = "quiz-fb show " + (ok ? "fb-ok" : "fb-bad");
    fb.textContent = ok ? t("correct") : t("wrong") + " " + t("correctWas") + q.opts[q.a];
    this.el.querySelector("#qnext").disabled = false;
  }
  done(){
    const pct = Math.round(this.score/this.data.length*100);
    const em = pct>=80?"🎉":pct>=60?"👍":"📚";
    this.el.innerHTML = `
      <div class="quiz-result show">
        <span class="quiz-score">${pct}%</span>
        <p class="quiz-score-sub">${em} ${t("quizDone")}${this.score}${t("of")}${this.data.length}</p>
        <button class="btn">${t("restartQuiz")}</button>
      </div>`;
    this.el.querySelector(".btn").addEventListener("click", () => { this.i=0; this.score=0; this.render(); });
  }
}

/* ============================================================
   DRAG AND DROP — Næringarflokkun
   ============================================================ */
const DRAG_DATA = {
  items: [
    {n:"🥩 Prótín",   cat:"lif"},
    {n:"🧈 Fita",     cat:"lif"},
    {n:"🍞 Kolvetni", cat:"lif"},
    {n:"💊 C-vítamín",cat:"vit"},
    {n:"💊 D-vítamín",cat:"vit"},
    {n:"💉 B12",      cat:"vit"},
    {n:"🦴 Kalsíum",  cat:"stein"},
    {n:"🩸 Járn",     cat:"stein"},
    {n:"🧂 Joð",      cat:"stein"},
  ],
  cats:{
    lif:   "⚗️ Lífræn efni",
    vit:   "💊 Vítamín",
    stein: "🔩 Steinefni"
  }
};

function initDrag(){
  const el = document.getElementById("drag-zone");
  if(!el) return;
  const items = [...DRAG_DATA.items].sort(()=>Math.random()-.5);
  el.innerHTML = `
    <div class="drag-pool" id="drag-pool">
      ${items.map(i=>`<span class="dtag" draggable="true" data-cat="${i.cat}" tabindex="0" role="button" aria-label="${i.n}">${i.n}</span>`).join("")}
    </div>
    <div class="drag-zones">
      ${Object.entries(DRAG_DATA.cats).map(([k,v])=>`
        <div class="dzone" id="dz-${k}" data-cat="${k}">
          <h4>${v}</h4>
          <div class="dz-items" style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.4rem"></div>
        </div>`).join("")}
    </div>
    <div class="drag-msg" id="drag-msg"></div>`;

  let src = null;
  el.querySelectorAll(".dtag").forEach(tag => {
    tag.addEventListener("dragstart", e => { src=tag; tag.style.opacity=".4"; e.dataTransfer.effectAllowed="move"; });
    tag.addEventListener("dragend", () => { tag.style.opacity=""; src=null; });
  });
  el.querySelectorAll(".dzone").forEach(zone => {
    zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("over"));
    zone.addEventListener("drop", e => {
      e.preventDefault(); zone.classList.remove("over");
      if(!src) return;
      zone.querySelector(".dz-items").appendChild(src);
      src.draggable = false; src.classList.add("placed");
      const ok = src.dataset.cat === zone.dataset.cat;
      src.style.borderColor = ok ? "var(--green)" : "var(--rose)";
      checkDrag(el);
    });
  });
}

function checkDrag(el){
  const all = el.querySelectorAll(".dtag").length;
  const placed = el.querySelectorAll(".dzone .dtag").length;
  if(placed < all) return;
  let correct = 0;
  el.querySelectorAll(".dzone").forEach(z => {
    z.querySelectorAll(".dtag").forEach(t => { if(t.dataset.cat===z.dataset.cat) correct++; });
  });
  const msg = el.querySelector("#drag-msg");
  if(correct === all){
    msg.className="drag-msg show ok"; msg.textContent=t("dragSuccess");
  } else {
    msg.className="drag-msg show bad"; msg.textContent=t("dragRetry")+" ("+correct+"/"+all+")";
  }
}

/* ============================================================
   INTERACTIVE CELL DIAGRAM
   ============================================================ */
const ORGS = {
  kjarni:     { icon:"🧬", name:"Kjarni", en:"Nucleus",      desc:"Geymir DNA og stjórnar frumunni — heilinn hennar.",                     en_desc:"Stores DNA and controls the cell — its brain." },
  hvatberi:   { icon:"⚡", name:"Hvatberi", en:"Mitochondria", desc:"Orkuver frumunnar. Framleiðir ATP með frumöndun.",                    en_desc:"Power plant of the cell. Produces ATP via cellular respiration." },
  graenukorn: { icon:"☘️", name:"Grænukorn", en:"Chloroplast", desc:"Ljóstillífunarvél — AÐEINS í plöntufrumum. Notar sólarljós.",         en_desc:"Photosynthesis organelle — ONLY in plant cells. Uses sunlight." },
  frymisflet: { icon:"📦", name:"Frymisflétta", en:"Golgi",    desc:"Pósthúsið. Meðhöndlar og flytur prótín úr frumunni.",                 en_desc:"The post office. Processes and ships proteins out of the cell." },
  ribosom:    { icon:"🔩", name:"Netkorn", en:"Ribosomes",     desc:"Prótínverksmiðjan. Les mRNA og sameinar amínósýrur.",                  en_desc:"Protein factory. Reads mRNA and assembles amino acids." },
  frymisnet:  { icon:"🌐", name:"Frymisnet", en:"ER",          desc:"Hrjúft ER framleiðir prótín; slétt ER framleiðir fitu.",              en_desc:"Rough ER makes proteins; smooth ER makes lipids." },
  safabola:   { icon:"💧", name:"Safabóla", en:"Vacuole",      desc:"Geymslutankur — mjög stór í plöntufrumum og heldur þrýstingi.",       en_desc:"Storage tank — very large in plant cells, maintains turgor pressure." },
  frumuhimna: { icon:"🚧", name:"Frumuhimna", en:"Cell membrane",desc:"Velvirk himna — stýrir hvað fer inn og út úr frumunni.",            en_desc:"Selectively permeable membrane — controls what enters and exits the cell." },
};

function initCell(){
  const wrap = document.getElementById("cell-diagram");
  if(!wrap) return;
  wrap.innerHTML = `
    <div class="cell-wrap">
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gagnvirkt frumurit">
        <ellipse cx="200" cy="155" rx="188" ry="132" fill="rgba(74,222,128,.03)" stroke="var(--green)" stroke-width="2" stroke-dasharray="7 4"/>
        <ellipse cx="200" cy="152" rx="194" ry="138" fill="none" stroke="var(--green)" stroke-width="1" opacity=".3"/>
        <!-- Nucleus -->
        <g class="org-btn" data-org="kjarni" tabindex="0" role="button" aria-label="Kjarni">
          <ellipse cx="200" cy="150" rx="50" ry="40" fill="rgba(167,139,250,.15)" stroke="#a78bfa" stroke-width="2"/>
          <ellipse cx="200" cy="150" rx="21" ry="17" fill="rgba(167,139,250,.3)" stroke="#a78bfa" stroke-width="1.5"/>
          <text x="200" y="196" text-anchor="middle" font-size="8.5" fill="#a78bfa" font-family="Verdana">Kjarni</text>
        </g>
        <!-- Mitochondria -->
        <g class="org-btn" data-org="hvatberi" tabindex="0" role="button" aria-label="Hvatberi">
          <ellipse cx="88" cy="108" rx="26" ry="14" fill="rgba(240,165,0,.18)" stroke="#d4a843" stroke-width="1.5" transform="rotate(-20,88,108)"/>
          <ellipse cx="330" cy="200" rx="22" ry="12" fill="rgba(240,165,0,.18)" stroke="#d4a843" stroke-width="1.5" transform="rotate(15,330,200)"/>
          <text x="75" y="134" text-anchor="middle" font-size="8" fill="#d4a843" font-family="Verdana">Hvatberi</text>
        </g>
        <!-- Chloroplast -->
        <g class="org-btn" data-org="graenukorn" tabindex="0" role="button" aria-label="Grænukorn">
          <ellipse cx="305" cy="232" rx="30" ry="16" fill="rgba(74,222,128,.2)" stroke="#4ade80" stroke-width="1.5"/>
          <ellipse cx="305" cy="232" rx="18" ry="9" fill="rgba(74,222,128,.3)" stroke="#4ade80"/>
          <text x="305" y="255" text-anchor="middle" font-size="8" fill="#4ade80" font-family="Verdana">Grænukorn ☘️</text>
        </g>
        <!-- Golgi -->
        <g class="org-btn" data-org="frymisflet" tabindex="0" role="button" aria-label="Frymisflétta">
          <path d="M285,118 Q318,118 313,132 Q318,148 285,148" fill="none" stroke="#f472b6" stroke-width="2"/>
          <path d="M285,125 Q313,125 308,138 Q313,150 285,150" fill="none" stroke="#f472b6" stroke-width="1.5"/>
          <text x="308" y="163" text-anchor="middle" font-size="8" fill="#f472b6" font-family="Verdana">Frymisflétta</text>
        </g>
        <!-- Ribosomes -->
        <g class="org-btn" data-org="ribosom" tabindex="0" role="button" aria-label="Netkorn">
          <circle cx="152" cy="105" r="4" fill="#d4a843" opacity=".75"/>
          <circle cx="163" cy="113" r="4" fill="#d4a843" opacity=".75"/>
          <circle cx="143" cy="116" r="4" fill="#d4a843" opacity=".75"/>
          <circle cx="158" cy="123" r="4" fill="#d4a843" opacity=".75"/>
          <text x="108" y="138" text-anchor="middle" font-size="7.5" fill="#d4a843" font-family="Verdana">Netkorn</text>
        </g>
        <!-- ER -->
        <g class="org-btn" data-org="frymisnet" tabindex="0" role="button" aria-label="Frymisnet">
          <path d="M138,73 Q168,62 188,82 Q208,98 232,88" fill="none" stroke="rgba(56,201,176,.8)" stroke-width="2" stroke-dasharray="4 2"/>
          <text x="185" y="60" text-anchor="middle" font-size="8" fill="#38c9b0" font-family="Verdana">Frymisnet</text>
        </g>
        <!-- Vacuole -->
        <g class="org-btn" data-org="safabola" tabindex="0" role="button" aria-label="Safabóla">
          <ellipse cx="115" cy="208" rx="33" ry="26" fill="rgba(56,171,222,.1)" stroke="rgba(56,171,222,.6)" stroke-width="1.5"/>
          <text x="115" y="242" text-anchor="middle" font-size="8" fill="#6aabde" font-family="Verdana">Safabóla</text>
        </g>
        <!-- Cell membrane label -->
        <g class="org-btn" data-org="frumuhimna" tabindex="0" role="button" aria-label="Frumuhimna">
          <text x="22" y="78" font-size="7.5" fill="var(--green)" font-family="Verdana">← Frumuhimna</text>
        </g>
      </svg>
      <div class="org-info" id="org-info">
        <span class="org-icon">🔬</span>
        <div><span class="org-name" data-i18n="clickOrganelle">← Smelltu á hluta</span></div>
      </div>
    </div>`;

  const info = wrap.querySelector("#org-info");
  wrap.querySelectorAll(".org-btn").forEach(el => {
    const show = () => {
      const o = ORGS[el.dataset.org]; if(!o) return;
      const isEn = currentLang === "en";
      info.innerHTML = `<span class="org-icon">${o.icon}</span><div><span class="org-name">${isEn?o.en:o.name}</span>${isEn?o.en_desc:o.desc}</div>`;
      info.style.animation="none"; info.offsetHeight; info.style.animation="fadeIn .3s ease";
    };
    el.addEventListener("click", show);
    el.addEventListener("keydown", e => { if(e.key==="Enter"||e.key===" "){ e.preventDefault(); show(); } });
  });
}

/* ============================================================
   FOOTER
   ============================================================ */
function initFooter(){
  const el = document.getElementById("build-date");
  if(el) el.textContent = BUILD_DATE;
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFont();
  initLang();
  initMenu();
  initNav();
  initReveal();
  initDrag();
  initCell();
  initFooter();
  document.querySelectorAll("[data-quiz]").forEach(el => new Quiz(el.id, el.dataset.quiz));
});
