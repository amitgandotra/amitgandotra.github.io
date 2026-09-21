// Renders the body of a lesson page from its inline PAGE_DATA, and starts its quiz.
// One renderer for every topic. It accepts the three field vocabularies used so far:
//   DSA:              recognize, template, examples[].complexity/complexityWhy, practiceProblems
//   Python:           keyDifferences, template, examples[].output, gotchas, practiceExercises
//   Patterns/others:  keyPoints (+ keyHeading), gotchasHeading, practiceExercises
// Sidebar, prev/next, prerequisites and the top bar come from js/site-shell.js.
document.addEventListener("DOMContentLoaded", () => {
  if (typeof PAGE_DATA === "undefined" || typeof SiteNav === "undefined") return;
  const cur = SiteNav.current();
  if (!cur.entry) return;

  document.title = `${cur.entry.page.title} — Becoming FDE`;
  renderLesson(cur.topic, cur.entry);

  initQuiz({
    containerId: "quiz-container",
    questions: PAGE_DATA.quiz,
    topicId: cur.topic.id,
    patternId: cur.entry.page.id,
  });
});

function lessonCode(label, code) {
  return `
    <div class="code-block">
      <div class="code-label">${label}</div>
      <pre><code>${highlightPython(code)}</code></pre>
    </div>
  `;
}

function renderLesson(topic, entry) {
  const el = document.getElementById("content");
  if (!el) return;

  const d = PAGE_DATA;
  const kind = d.recognize ? "dsa" : d.keyDifferences ? "python" : "generic";
  const pick = (dsa, py, gen) => (kind === "dsa" ? dsa : kind === "python" ? py : gen);

  const keyItems = d.keyPoints || d.keyDifferences || d.recognize || [];
  const keyHeading = d.keyHeading || pick("Pattern recognition", "Key differences from Java", "Key points");
  const tplHeading = d.template.heading || pick("Core template", "Core syntax", "Core shape");
  const tplLabel = d.template.label || pick("python — template", "python — template", "python");
  const exHeading = pick("Worked example", "Example", "Example") + (d.examples.length > 1 ? "s" : "");
  const gotchasHeading = d.gotchasHeading || pick("Common pitfalls", "Common gotchas coming from Java", "Common pitfalls");
  const practiceHeading = pick("Practice problems", "Try it yourself", "Try it yourself");
  const practiceItems = d.practiceProblems || d.practiceExercises || [];
  const numbered = practiceItems.length > 0 && typeof practiceItems[0] === "object";

  const examples = d.examples
    .map(
      (ex) => `
      <h3>${ex.title}</h3>
      <p>${ex.prompt}</p>
      ${lessonCode(ex.label || "python", ex.code)}
      <p>${ex.explanation}</p>
      ${ex.complexity ? `<div class="complexity-line">${ex.complexity}</div>` : ""}
      ${ex.complexityWhy ? `<p class="complexity-detail">${ex.complexityWhy}</p>` : ""}
      ${ex.output ? `<div class="complexity-line">Output: ${ex.output}</div>` : ""}
    `
    )
    .join("");

  const gotchas = d.gotchas
    ? `<div class="callout"><div class="callout-title">${gotchasHeading}</div><ul>${d.gotchas.map((g) => `<li>${g}</li>`).join("")}</ul></div>`
    : "";

  el.innerHTML = `
    <div class="breadcrumb"><a href="${SiteNav.ROOT}index.html">Becoming FDE</a> / <a href="index.html">${SiteNav.esc(topic.title)}</a> / ${SiteNav.esc(entry.section.name)} / ${SiteNav.esc(entry.page.title)}</div>
    <span class="badge badge-${entry.page.tier.toLowerCase()} tier-tag">${entry.page.tier}</span>
    <h1>${entry.page.title}</h1>
    <p>${d.summary}</p>

    <div class="callout">
      <div class="callout-title">${keyHeading}</div>
      <ul>${keyItems.map((r) => `<li>${r}</li>`).join("")}</ul>
    </div>

    <h2>${tplHeading}</h2>
    ${d.template.note ? `<p>${d.template.note}</p>` : ""}
    ${lessonCode(tplLabel, d.template.code)}

    <h2>${exHeading}</h2>
    ${examples}

    ${gotchas}

    <h2>${practiceHeading}</h2>
    ${numbered ? '<p class="lc-note">Ordered easy to hard. Links open leetcode.com in a new tab; problems marked Premium need a LeetCode subscription.</p>' : ""}
    <ul class="practice-list${numbered ? " lc-list" : ""}">${practiceItems.map(practiceItem).join("")}</ul>
  `;
}

// A practice item is either a plain string, or a numbered LeetCode problem {n, title, slug, level, premium}.
function practiceItem(p) {
  if (typeof p === "string") return `<li>${p}</li>`;
  const url = `https://leetcode.com/problems/${p.slug}/`;
  return `<li class="lc"><a href="${url}" target="_blank" rel="noopener noreferrer"><span class="lc-num">#${p.n}</span> ${SiteNav.esc(p.title)}</a>` +
    `<span class="lc-level ${p.level.toLowerCase()}">${p.level}</span>${p.premium ? '<span class="lc-premium">Premium</span>' : ""}</li>`;
}
