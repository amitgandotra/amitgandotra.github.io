// Renders a topic's overview page: prerequisites, progress, and page cards
// grouped by subject section (each card carries its difficulty badge).
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("tier-sections");
  if (!root || typeof SiteNav === "undefined") return;
  const topic = SiteNav.current().topic;
  if (!topic) return;

  const st = SiteNav.stats(SiteNav.pagesOf(topic));
  const pct = st.total ? Math.round((st.done / st.total) * 100) : 0;

  const prereq = topic.prereqs
    .map((id) => SiteNav.topicById[id])
    .filter(Boolean)
    .map((t) => {
      const ts = SiteNav.stats(SiteNav.pagesOf(t));
      return `<a class="chip${ts.done === ts.total ? " done" : ""}" href="${SiteNav.topicUrl(t)}">${SiteNav.esc(t.title)} <span class="chip-topic">${ts.done}/${ts.total}</span></a>`;
    })
    .join("");

  const summary = `
    <div class="topic-summary">
      <div class="topic-progress"><div class="topic-progress-fill" style="width:${pct}%"></div></div>
      <span class="topic-progress-label">${st.done}/${st.total} pages complete</span>
    </div>
    ${prereq ? `<div class="conn-row"><span class="conn-label">Recommended first</span><div class="chips">${prereq}</div></div>` : ""}`;

  const sections = topic.sections
    .map((s) => {
      const list = s.pages.map((p) => SiteNav.byKey[`${topic.id}/${p.id}`]);
      const ss = SiteNav.stats(list);
      const cards = list
        .map((e) => {
          const done = SiteNav.isDone(e);
          return `
          <a class="card" href="${e.url}">
            ${done ? '<span class="progress-check">&#10003;</span>' : ""}
            <span class="badge badge-${e.page.tier.toLowerCase()}">${e.page.tier}</span>
            <h3>${SiteNav.esc(e.page.title)}</h3>
            <p>${SiteNav.esc(e.page.blurb)}</p>
          </a>`;
        })
        .join("");
      return `
        <div class="tier-section">
          <div class="tier-heading"><h2>${SiteNav.esc(s.name)}</h2><span class="tier-progress">${ss.done}/${ss.total} complete</span></div>
          <div class="card-grid">${cards}</div>
        </div>`;
    })
    .join("");

  root.innerHTML = summary + sections;
});
