// Renders a full Python topic page from the PAGE_DATA object defined inline
// in each topics/python/<topic>.html file. Parallel to js/pattern-page.js
// but with a schema suited to syntax/idiom content instead of algorithms
// (no complexity line; adds Java-comparison and gotchas sections).
document.addEventListener("DOMContentLoaded", () => {
  if (typeof PAGE_DATA === "undefined" || typeof PYTHON_TOPICS === "undefined") return;

  const meta = PYTHON_TOPICS.find((p) => p.id === PAGE_DATA.id);
  document.title = `${meta.title} — Becoming FDE`;

  renderPySidebar(meta.id);
  renderPyContent(meta);
  renderPyPagination(meta.id);
  initPyMobileSidebarToggle();

  initQuiz({
    containerId: "quiz-container",
    questions: PAGE_DATA.quiz,
    topicId: PY_TOPIC_ID,
    patternId: PAGE_DATA.id,
  });

  document.addEventListener("quiz-complete", (e) => {
    if (e.detail.topicId === PY_TOPIC_ID) renderPySidebar(meta.id);
  });
});

function pyCodeBlock(label, code) {
  return `
    <div class="code-block">
      <div class="code-label">${label}</div>
      <pre><code>${highlightPython(code)}</code></pre>
    </div>
  `;
}

function renderPyContent(meta) {
  const el = document.getElementById("content");
  if (!el) return;

  const keyDifferences = (PAGE_DATA.keyDifferences || [])
    .map((r) => `<li>${r}</li>`)
    .join("");

  const examples = (PAGE_DATA.examples || [])
    .map(
      (ex) => `
      <h3>${ex.title}</h3>
      <p>${ex.prompt}</p>
      ${pyCodeBlock(ex.label || "python", ex.code)}
      <p>${ex.explanation}</p>
      ${ex.output ? `<div class="complexity-line">Output: ${ex.output}</div>` : ""}
    `
    )
    .join("");

  const gotchasBlock = PAGE_DATA.gotchas
    ? `
      <div class="callout">
        <div class="callout-title">Common gotchas coming from Java</div>
        <ul>${PAGE_DATA.gotchas.map((g) => `<li>${g}</li>`).join("")}</ul>
      </div>
    `
    : "";

  const practice = (PAGE_DATA.practiceExercises || [])
    .map((p) => `<li>${p}</li>`)
    .join("");

  el.innerHTML = `
    <div class="breadcrumb"><a href="../../index.html">Becoming FDE</a> / <a href="index.html">Python</a> / ${meta.title}</div>
    <span class="badge ${pyTierBadgeClass(meta.tier)} tier-tag">${meta.tier}</span>
    <h1>${meta.title}</h1>
    <p>${PAGE_DATA.summary}</p>

    <div class="callout">
      <div class="callout-title">Key differences from Java</div>
      <ul>${keyDifferences}</ul>
    </div>

    <h2>${PAGE_DATA.template.heading || "Core syntax"}</h2>
    ${PAGE_DATA.template.note ? `<p>${PAGE_DATA.template.note}</p>` : ""}
    ${pyCodeBlock(PAGE_DATA.template.label || "python — template", PAGE_DATA.template.code)}

    <h2>Example${PAGE_DATA.examples.length > 1 ? "s" : ""}</h2>
    ${examples}

    ${gotchasBlock}

    <h2>Try it yourself</h2>
    <ul class="practice-list">${practice}</ul>
  `;
}
