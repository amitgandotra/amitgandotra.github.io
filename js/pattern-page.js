// Renders a full DSA pattern page from the PAGE_DATA object defined inline
// in each topics/dsa/<pattern>.html file. Sidebar/pagination/mobile-toggle
// come from js/dsa-nav.js so behavior changes happen once, not per-file.
document.addEventListener("DOMContentLoaded", () => {
  if (typeof PAGE_DATA === "undefined" || typeof DSA_PATTERNS === "undefined") return;

  const meta = DSA_PATTERNS.find((p) => p.id === PAGE_DATA.id);
  document.title = `${meta.title} — Becoming FDE`;

  renderSidebar(meta.id);
  renderContent(meta);
  renderPagination(meta.id);
  initMobileSidebarToggle();

  initQuiz({
    containerId: "quiz-container",
    questions: PAGE_DATA.quiz,
    topicId: TOPIC_ID,
    patternId: PAGE_DATA.id,
  });

  document.addEventListener("quiz-complete", (e) => {
    if (e.detail.topicId === TOPIC_ID) renderSidebar(meta.id);
  });
});

function codeBlock(label, code) {
  return `
    <div class="code-block">
      <div class="code-label">${label}</div>
      <pre><code>${highlightPython(code)}</code></pre>
    </div>
  `;
}

function renderContent(meta) {
  const el = document.getElementById("content");
  if (!el) return;

  const recognize = (PAGE_DATA.recognize || [])
    .map((r) => `<li>${r}</li>`)
    .join("");

  const examples = (PAGE_DATA.examples || [])
    .map(
      (ex) => `
      <h3>${ex.title}</h3>
      <p>${ex.prompt}</p>
      ${codeBlock("python", ex.code)}
      <p>${ex.explanation}</p>
      <div class="complexity-line">${ex.complexity}</div>
      ${ex.complexityWhy ? `<p class="complexity-detail">${ex.complexityWhy}</p>` : ""}
    `
    )
    .join("");

  const practice = (PAGE_DATA.practiceProblems || [])
    .map((p) => `<li>${p}</li>`)
    .join("");

  el.innerHTML = `
    <div class="breadcrumb"><a href="../../index.html">Becoming FDE</a> / <a href="index.html">DSA</a> / ${meta.title}</div>
    <span class="badge ${tierBadgeClass(meta.tier)} tier-tag">${meta.tier}</span>
    <h1>${meta.title}</h1>
    <p>${PAGE_DATA.summary}</p>

    <div class="callout">
      <div class="callout-title">Pattern recognition</div>
      <ul>${recognize}</ul>
    </div>

    <h2>Core template</h2>
    ${PAGE_DATA.template.note ? `<p>${PAGE_DATA.template.note}</p>` : ""}
    ${codeBlock("python — template", PAGE_DATA.template.code)}

    <h2>Worked example${PAGE_DATA.examples.length > 1 ? "s" : ""}</h2>
    ${examples}

    <h2>Practice problems</h2>
    <ul class="practice-list">${practice}</ul>
  `;
}
