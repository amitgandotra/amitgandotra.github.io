// Homepage: resume banner, learning-path tracks with progress, collapsed roadmap.
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("home");
  if (!root || typeof SiteNav === "undefined") return;
  const esc = SiteNav.esc;

  // ----- resume / start banner -----
  const r = SiteNav.resumeTarget();
  const all = SiteNav.stats(SiteNav.pageList);
  const e = r.entry;
  const label = r.fresh ? "Start here" : r.resume ? "Continue where you left off" : "Up next";
  const banner = `
    <section class="resume">
      <div>
        <div class="resume-label">${label}</div>
        <div class="resume-title">${esc(e.page.title)}</div>
        <div class="resume-meta">${esc(e.topic.title)} &rsaquo; ${esc(e.section.name)}</div>
      </div>
      <a class="btn" href="${e.url}">${r.fresh ? "Begin" : r.resume ? "Resume" : "Open"} &rarr;</a>
    </section>
    <div class="overall">
      <div class="topic-progress"><div class="topic-progress-fill" style="width:${all.total ? Math.round((all.done / all.total) * 100) : 0}%"></div></div>
      <span class="topic-progress-label">${all.done}/${all.total} lessons complete across ${SiteNav.topics.length} topics</span>
      <button type="button" class="link-btn" id="home-search">Search everything <kbd>/</kbd></button>
    </div>`;

  // ----- tracks -----
  const tracks = SiteNav.tracks
    .map((tr, i) => {
      const tTopics = SiteNav.topics.filter((t) => t.track === tr.id);
      const st = SiteNav.stats(SiteNav.pageList.filter((p) => p.topic.track === tr.id));
      const head = `
        <div class="track-head">
          <div><span class="track-num">Track ${i + 1}</span><h2>${esc(tr.title)}</h2><p class="track-blurb">${esc(tr.blurb)}</p></div>
          <span class="tier-progress">${st.total ? `${st.done}/${st.total} complete` : "coming soon"}</span>
        </div>`;
      if (!tTopics.length) {
        return `<section class="track track-empty">${head}<p class="track-note">${tr.upcoming.length} topics planned. See the roadmap below.</p></section>`;
      }
      const cards = tTopics
        .map((t) => {
          const ts = SiteNav.stats(SiteNav.pagesOf(t));
          const pct = ts.total ? Math.round((ts.done / ts.total) * 100) : 0;
          const first = SiteNav.pagesOf(t).find((p) => !SiteNav.isDone(p));
          const cta = ts.done === 0 ? "Start" : ts.done === ts.total ? "Review" : "Continue";
          const prereq = t.prereqs.map((id) => SiteNav.topicById[id]).filter(Boolean).map((p) => p.title.split(" ")[0]);
          return `
            <a class="card topic-card" href="${SiteNav.topicUrl(t)}">
              <h3>${esc(t.title)}</h3>
              <p>${esc(t.tagline)}</p>
              <div class="topic-progress"><div class="topic-progress-fill" style="width:${pct}%"></div></div>
              <div class="card-foot"><span>${ts.done}/${ts.total} lessons${prereq.length ? ` &middot; needs ${esc(prereq.join(", "))}` : ""}</span><span class="cta">${cta} &rarr;</span></div>
            </a>`;
        })
        .join("");
      const soon = tr.upcoming.length ? `<p class="track-note">+ ${tr.upcoming.length} more planned in the roadmap.</p>` : "";
      return `<section class="track">${head}<div class="card-grid">${cards}</div>${soon}</section>`;
    })
    .join("");

  // ----- collapsed roadmap -----
  const planned = SiteNav.tracks.filter((t) => t.upcoming.length);
  const total = planned.reduce((n, t) => n + t.upcoming.length, 0);
  const roadmap = `
    <details class="roadmap" id="roadmap">
      <summary>Roadmap: ${total} topics coming soon</summary>
      ${planned
        .map(
          (t) => `<div class="roadmap-track"><h3>${esc(t.title)}</h3><ul class="roadmap-list">${t.upcoming.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></div>`
        )
        .join("")}
    </details>`;

  root.innerHTML = banner + tracks + roadmap;
  const s = document.getElementById("home-search");
  if (s) s.addEventListener("click", SiteNav.openSearch);
});
