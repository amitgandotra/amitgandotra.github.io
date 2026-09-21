// Shared site shell, loaded on every page after js/data/site.js and js/progress.js.
// Provides: top bar (search, menu, progress), menu drawer with the full topic tree,
// search modal, per-topic sidebar with subject sections, prev/next across topics,
// prerequisites / related links, and "last visited" tracking.
// Exposes window.SiteNav for the page renderers (home.js, topic-index.js, topic-page.js).
(function () {
  const ROOT = new URL("../", document.currentScript.src).href;
  const LAST_KEY = "fde_last";

  // ---------- data model ----------
  const topics = SITE.topics;
  const pageList = [];
  topics.forEach((t) =>
    t.sections.forEach((s) =>
      s.pages.forEach((p) =>
        pageList.push({ topic: t, section: s, page: p, key: `${t.id}/${p.id}`, url: ROOT + `topics/${t.dir}/${p.href}` })
      )
    )
  );
  const byKey = Object.fromEntries(pageList.map((e) => [e.key, e]));
  const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
  const trackById = Object.fromEntries(SITE.tracks.map((t) => [t.id, t]));

  // related links are mutual: declare once, show on both pages
  const relMap = {};
  const addRel = (a, b) => ((relMap[a] ||= new Set()).add(b), (relMap[b] ||= new Set()).add(a));
  pageList.forEach((e) => (e.page.related || []).forEach((k) => byKey[k] && addRel(e.key, k)));

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const isDone = (e) => Progress.isDone(e.topic.id, e.page.id);
  const topicUrl = (t) => ROOT + `topics/${t.dir}/index.html`;
  const pagesOf = (t) => pageList.filter((e) => e.topic === t);

  function stats(list) {
    const done = list.filter(isDone).length;
    return { done, total: list.length };
  }

  function current() {
    const path = location.pathname;
    for (const e of pageList) {
      if (path.endsWith(`/topics/${e.topic.dir}/${e.page.href}`)) return { topic: e.topic, entry: e };
    }
    for (const t of topics) {
      if (path.endsWith(`/topics/${t.dir}/`) || path.endsWith(`/topics/${t.dir}/index.html`)) return { topic: t, entry: null };
    }
    return { topic: null, entry: null };
  }

  function lastVisited() {
    try {
      const raw = JSON.parse(localStorage.getItem(LAST_KEY));
      return raw && byKey[raw.key] ? byKey[raw.key] : null;
    } catch (e) {
      return null;
    }
  }

  // Where should a returning learner go? Resume the last page until its quiz is passed,
  // then move on to the next page in the global order.
  function resumeTarget() {
    const last = lastVisited();
    if (!last) return { entry: pageList[0], fresh: true };
    if (!isDone(last)) return { entry: last, fresh: false, resume: true };
    const next = pageList[pageList.indexOf(last) + 1];
    return { entry: next || last, fresh: false, resume: false };
  }

  // ---------- header ----------
  const ICON_SEARCH =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>';
  const ICON_MENU =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"/></svg>';

  function renderHeader() {
    const bar = document.querySelector(".site-header .container");
    if (!bar) return;
    const all = stats(pageList);
    bar.innerHTML = `
      <a class="brand" href="${ROOT}index.html"><span class="bracket">&gt;_</span> Becoming FDE</a>
      <div class="header-actions">
        <button type="button" class="hdr-btn" id="hdr-search" aria-label="Search">${ICON_SEARCH}<span class="hdr-label">Search</span><kbd>/</kbd></button>
        <button type="button" class="hdr-btn" id="hdr-menu" aria-label="Open menu" aria-expanded="false">${ICON_MENU}<span class="hdr-label">Menu</span></button>
        <button type="button" class="progress-pill" id="hdr-progress" title="Pages completed (quiz passed)" aria-label="Progress ${all.done} of ${all.total}">${all.done}/${all.total}</button>
      </div>`;
    bar.querySelector("#hdr-search").addEventListener("click", openSearch);
    bar.querySelector("#hdr-menu").addEventListener("click", openDrawer);
    bar.querySelector("#hdr-progress").addEventListener("click", openDrawer);
  }

  // ---------- menu drawer ----------
  let drawer, overlay;

  function drawerHtml() {
    const cur = current();
    const tracks = SITE.tracks
      .map((tr) => {
        const tTopics = topics.filter((t) => t.track === tr.id);
        const st = stats(pageList.filter((e) => e.topic.track === tr.id));
        const built = tTopics
          .map((t) => {
            const ts = stats(pagesOf(t));
            const open = cur.topic === t ? " open" : "";
            const secs = t.sections
              .map((s) => {
                const links = s.pages
                  .map((p) => {
                    const e = byKey[`${t.id}/${p.id}`];
                    const active = cur.entry === e ? " active" : "";
                    return `<a class="drawer-link${active}" href="${e.url}"><span>${esc(p.title)}</span>${isDone(e) ? '<span class="check">&#10003;</span>' : ""}</a>`;
                  })
                  .join("");
                return `<div class="drawer-section">${esc(s.name)}</div>${links}`;
              })
              .join("");
            return `<details class="drawer-topic"${open}><summary><span>${esc(t.title)}</span><span class="count">${ts.done}/${ts.total}</span></summary><a class="drawer-link overview" href="${topicUrl(t)}">Topic overview</a>${secs}</details>`;
          })
          .join("");
        const soon = tr.upcoming.length
          ? `<details class="drawer-soon"><summary>Coming soon (${tr.upcoming.length})</summary><ul>${tr.upcoming.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></details>`
          : "";
        const count = st.total ? `<span class="count">${st.done}/${st.total}</span>` : `<span class="count">soon</span>`;
        return `<div class="drawer-track"><div class="drawer-track-title"><span>${esc(tr.title)}</span>${count}</div>${built}${soon}</div>`;
      })
      .join("");
    return `
      <div class="drawer-head"><strong>Menu</strong><button type="button" class="drawer-close" aria-label="Close menu">&times;</button></div>
      <div class="drawer-body">
        <a class="drawer-home" href="${ROOT}index.html">Home &amp; learning path</a>
        ${tracks}
      </div>`;
  }

  function buildDrawer() {
    overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.hidden = true;
    drawer = document.createElement("aside");
    drawer.className = "drawer";
    drawer.setAttribute("aria-label", "Site menu");
    drawer.hidden = true;
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    overlay.addEventListener("click", closeDrawer);
    refreshDrawer();
  }

  function refreshDrawer() {
    if (!drawer) return;
    // keep the user's expanded/collapsed choices across refreshes
    const openTopics = new Set([...drawer.querySelectorAll("details.drawer-topic[open] summary span:first-child")].map((s) => s.textContent));
    const scroll = drawer.querySelector(".drawer-body") ? drawer.querySelector(".drawer-body").scrollTop : 0;
    drawer.innerHTML = drawerHtml();
    if (openTopics.size) {
      drawer.querySelectorAll("details.drawer-topic").forEach((d) => {
        d.open = openTopics.has(d.querySelector("summary span:first-child").textContent);
      });
    }
    drawer.querySelector(".drawer-close").addEventListener("click", closeDrawer);
    const body = drawer.querySelector(".drawer-body");
    if (body) body.scrollTop = scroll;
  }

  function openDrawer() {
    refreshDrawer();
    overlay.hidden = false;
    drawer.hidden = false;
    document.body.classList.add("no-scroll");
    const btn = document.getElementById("hdr-menu");
    if (btn) btn.setAttribute("aria-expanded", "true");
    const closeBtn = drawer.querySelector(".drawer-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    overlay.hidden = true;
    drawer.hidden = true;
    document.body.classList.remove("no-scroll");
    const btn = document.getElementById("hdr-menu");
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  }

  // ---------- search ----------
  let searchEl, searchInput, searchList, searchResults = [], searchSel = 0, indexLoaded = false;

  function loadSearchIndex(cb) {
    if (window.SEARCH_INDEX || indexLoaded) return cb();
    indexLoaded = true;
    const s = document.createElement("script");
    s.src = ROOT + "js/data/search-index.js";
    s.onload = s.onerror = cb;
    document.head.appendChild(s);
  }

  function buildSearch() {
    searchEl = document.createElement("div");
    searchEl.className = "search-overlay";
    searchEl.hidden = true;
    searchEl.innerHTML = `
      <div class="search-box" role="dialog" aria-modal="true" aria-label="Search">
        <input type="search" class="search-input" placeholder="Search topics, patterns, concepts..." autocomplete="off" spellcheck="false" aria-label="Search" />
        <ul class="search-results" role="listbox"></ul>
        <div class="search-hint"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
      </div>`;
    document.body.appendChild(searchEl);
    searchInput = searchEl.querySelector(".search-input");
    searchList = searchEl.querySelector(".search-results");
    searchEl.addEventListener("mousedown", (ev) => {
      if (ev.target === searchEl) closeSearch();
    });
    searchInput.addEventListener("input", () => runSearch(searchInput.value));
    searchInput.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowDown") (ev.preventDefault(), moveSel(1));
      else if (ev.key === "ArrowUp") (ev.preventDefault(), moveSel(-1));
      else if (ev.key === "Enter") {
        ev.preventDefault();
        const r = searchResults[searchSel];
        if (r && r.url) location.href = r.url;
      }
    });
  }

  function openSearch() {
    closeDrawer();
    searchEl.hidden = false;
    document.body.classList.add("no-scroll");
    searchInput.value = "";
    loadSearchIndex(() => runSearch(searchInput.value));
    searchInput.focus();
  }

  function closeSearch() {
    if (!searchEl || searchEl.hidden) return;
    searchEl.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  function moveSel(d) {
    if (!searchResults.length) return;
    searchSel = (searchSel + d + searchResults.length) % searchResults.length;
    paintResults();
  }

  function tokens(q) {
    return q.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);
  }

  function runSearch(q) {
    const toks = tokens(q);
    const idx = window.SEARCH_INDEX || {};
    let results = [];
    if (!toks.length) {
      // empty query: suggest where to go next
      const r = resumeTarget();
      results = [r.entry, ...pageList.slice(0, 5)]
        .filter((e, i, a) => e && a.indexOf(e) === i)
        .slice(0, 6)
        .map((e, i) => ({ title: e.page.title, crumb: `${e.topic.title} › ${e.section.name}`, note: i === 0 ? (r.fresh ? "Start here" : r.resume ? "Continue" : "Up next") : e.page.blurb, url: e.url }));
    } else {
      const score = (title, meta, text) => {
        let s = 0;
        for (const t of toks) {
          const inTitle = title.toLowerCase().includes(t);
          const inMeta = meta.toLowerCase().includes(t);
          const inText = text ? text.toLowerCase().split(t).length - 1 : 0;
          if (!inTitle && !inMeta && !inText) return 0; // every token must match somewhere
          s += (inTitle ? 10 : 0) + (inMeta ? 4 : 0) + Math.min(inText, 4);
        }
        return s;
      };
      pageList.forEach((e) => {
        const s = score(e.page.title, `${e.page.blurb} ${e.section.name} ${e.topic.title}`, idx[e.key]);
        if (s) results.push({ s, title: e.page.title, crumb: `${e.topic.title} › ${e.section.name}`, note: e.page.blurb, url: e.url, tier: e.page.tier });
      });
      SITE.tracks.forEach((tr) =>
        tr.upcoming.forEach((u) => {
          const s = score(u, tr.title, "");
          if (s) results.push({ s: s - 1, title: u, crumb: `${tr.title}`, note: "Coming soon", url: null });
        })
      );
      results.sort((a, b) => b.s - a.s);
      results = results.slice(0, 8);
    }
    searchResults = results;
    searchSel = 0;
    paintResults(toks.length === 0, q);
  }

  function paintResults(empty, q) {
    if (!searchResults.length) {
      searchList.innerHTML = `<li class="search-empty">No matches${q ? ` for &ldquo;${esc(q)}&rdquo;` : ""}. Try a broader word.</li>`;
      return;
    }
    const head = empty ? `<li class="search-group">Suggested</li>` : "";
    searchList.innerHTML =
      head +
      searchResults
        .map((r, i) => {
          const cls = `search-item${i === searchSel ? " selected" : ""}${r.url ? "" : " soon"}`;
          const tag = r.tier ? `<span class="badge badge-${r.tier.toLowerCase()}">${esc(r.tier)}</span>` : "";
          const inner = `<span class="si-title">${esc(r.title)} ${tag}</span><span class="si-crumb">${esc(r.crumb)}</span><span class="si-note">${esc(r.note || "")}</span>`;
          return r.url
            ? `<li role="option" aria-selected="${i === searchSel}"><a class="${cls}" href="${r.url}">${inner}</a></li>`
            : `<li role="option" aria-disabled="true"><div class="${cls}">${inner}</div></li>`;
        })
        .join("");
    const sel = searchList.querySelector(".selected");
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }

  // ---------- per-topic sidebar / pagination / connections ----------
  function renderSidebar() {
    const el = document.getElementById("sidebar");
    const cur = current();
    if (!el || !cur.topic) return;
    const openNames = new Set([...el.querySelectorAll("details[open]")].map((d) => d.dataset.section));
    const hadRender = el.dataset.rendered === "1";
    el.innerHTML =
      `<a class="sidebar-topic" href="${topicUrl(cur.topic)}">${esc(cur.topic.title)}</a>` +
      cur.topic.sections
        .map((s) => {
          const list = s.pages.map((p) => byKey[`${cur.topic.id}/${p.id}`]);
          const st = stats(list);
          const holdsCurrent = cur.entry && list.includes(cur.entry);
          const open = hadRender ? openNames.has(s.name) || holdsCurrent : holdsCurrent || !cur.entry;
          const links = list
            .map((e) => `<a class="pattern-link${cur.entry === e ? " active" : ""}" href="${e.url}"><span>${esc(e.page.title)}</span>${isDone(e) ? '<span class="check">&#10003;</span>' : ""}</a>`)
            .join("");
          return `<details class="sidebar-section" data-section="${esc(s.name)}"${open ? " open" : ""}><summary><span>${esc(s.name)}</span><span class="sec-count">${st.done}/${st.total}</span></summary>${links}</details>`;
        })
        .join("");
    el.dataset.rendered = "1";
  }

  function ensureSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar || sidebar.dataset.toggleReady) return;
    sidebar.dataset.toggleReady = "true";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "sidebar-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `In this topic <span class="sidebar-toggle-icon">&#9662;</span>`;
    sidebar.parentNode.insertBefore(toggle, sidebar);
    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".sidebar-toggle-icon").innerHTML = open ? "&#9652;" : "&#9662;";
    });
  }

  function renderPagination() {
    const el = document.getElementById("pagination");
    const cur = current();
    if (!el || !cur.entry) return;
    const i = pageList.indexOf(cur.entry);
    const label = (e, dir) => {
      const cross = e.topic !== cur.topic;
      const head = dir === "prev" ? (cross ? "&larr; Previous topic" : "&larr; Previous") : cross ? "Next topic &rarr;" : "Next &rarr;";
      return `<span class="direction">${head}</span>${esc(cross ? `${e.topic.title}: ${e.page.title}` : e.page.title)}`;
    };
    const prev = pageList[i - 1];
    const next = pageList[i + 1];
    el.innerHTML =
      (prev ? `<a class="prev" href="${prev.url}">${label(prev, "prev")}</a>` : `<span></span>`) +
      (next
        ? `<a class="next" href="${next.url}">${label(next, "next")}</a>`
        : `<a class="next" href="${ROOT}index.html"><span class="direction">Finished everything built so far</span>Back to the learning path</a>`);
  }

  function chip(e) {
    return `<a class="chip${isDone(e) ? " done" : ""}" href="${e.url}"><span class="chip-topic">${esc(e.topic.short || e.topic.title.split(" ")[0])}</span>${esc(e.page.title)}${isDone(e) ? ' <span class="check">&#10003;</span>' : ""}</a>`;
  }

  function renderConnections() {
    const cur = current();
    if (!cur.entry) return;
    const quiz = document.querySelector(".quiz-section");
    if (!quiz) return;
    let box = document.getElementById("connections");
    if (!box) {
      box = document.createElement("section");
      box.id = "connections";
      box.className = "connections";
      quiz.parentNode.insertBefore(box, quiz);
    }
    const needs = (cur.entry.page.needs || []).map((k) => byKey[k]).filter(Boolean);
    const needKeys = new Set(needs.map((e) => e.key));
    const related = [...(relMap[cur.entry.key] || [])].map((k) => byKey[k]).filter((e) => e && !needKeys.has(e.key));
    if (!needs.length && !related.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    box.innerHTML =
      (needs.length ? `<div class="conn-row"><span class="conn-label">Before you start</span><div class="chips">${needs.map(chip).join("")}</div></div>` : "") +
      (related.length ? `<div class="conn-row"><span class="conn-label">Related</span><div class="chips">${related.map(chip).join("")}</div></div>` : "");
  }

  // ---------- lesson extras (tips, interview questions) ----------
  // Sections are loaded asynchronously, so they are placed by an explicit order
  // (1 = tips, 2 = interview) inside one container that sits above the quiz.
  function ensureExtras() {
    let box = document.getElementById("lesson-extras");
    if (box) return box;
    const quiz = document.querySelector(".quiz-section");
    if (!quiz) return null;
    box = document.createElement("div");
    box.id = "lesson-extras";
    quiz.parentNode.insertBefore(box, quiz);
    return box;
  }

  function placeExtra(sec, order) {
    const box = ensureExtras();
    if (!box) return;
    sec.dataset.order = String(order);
    const next = [...box.children].find((c) => Number(c.dataset.order) > order);
    box.insertBefore(sec, next || null);
  }

  function loadScriptOnce(src, cb) {
    if (loadScriptOnce.state[src] === "done") return cb();
    if (Array.isArray(loadScriptOnce.state[src])) return loadScriptOnce.state[src].push(cb);
    loadScriptOnce.state[src] = [cb];
    const el = document.createElement("script");
    el.src = src;
    el.onload = el.onerror = () => {
      const waiting = loadScriptOnce.state[src];
      loadScriptOnce.state[src] = "done";
      waiting.forEach((fn) => fn());
    };
    document.head.appendChild(el);
  }
  loadScriptOnce.state = {};

  // ---------- DSA tips & tricks ----------
  // Data: js/data/dsa-tips.js -> DSA_TIPS.patterns[pageId]
  const toMarks = (t) => String(t).replace(/\*\*(.+?)\*\*/g, "<mark>$1</mark>").replace(/`([^`]+)`/g, "<code>$1</code>");

  function renderTips() {
    const cur = current();
    if (!cur.entry || cur.topic.id !== "dsa") return;
    loadScriptOnce(ROOT + "js/data/dsa-tips.js", () => {
      const tip = window.DSA_TIPS && window.DSA_TIPS.patterns[cur.entry.page.id];
      if (!tip || document.getElementById("tips")) return;
      const playbook = byKey["dsa/playbook"];
      const sec = document.createElement("section");
      sec.id = "tips";
      sec.className = "tips";
      sec.innerHTML = `
        <h2>Tips &amp; tricks: spot it, then apply it</h2>
        <p class="tips-ask"><strong>Ask yourself:</strong> ${esc(tip.ask)}</p>

        <h3>Trigger words to look for</h3>
        <div class="chips tips-cues">${tip.cues.map((c) => `<span class="chip cue">${esc(c)}</span>`).join("")}</div>

        <h3>Spot it in the wild</h3>
        ${tip.spot
          .map(
            (x) => `
          <div class="spot">
            <blockquote>${toMarks(x.text)}</blockquote>
            <p class="spot-why"><span class="spot-label">Why this pattern</span>${toMarks(x.why)}</p>
          </div>`
          )
          .join("")}
        <p class="tips-notwhen"><span class="spot-label warn">Not this pattern when</span>${esc(tip.notWhen)}</p>

        <h3>One more example, in Python: ${esc(tip.example.title)}</h3>
        <p>${toMarks(tip.example.prompt)}</p>
        ${topicCodeBlockShell("python", tip.example.code)}
        <p>${tip.example.explanation}</p>
        <div class="complexity-line">${esc(tip.example.complexity)}</div>

        <h3>Python tips for this pattern</h3>
        <ul class="tips-python">
          ${tip.python
            .map((p) => `<li>${p.tip}${p.code ? `<pre><code>${window.highlightPython ? window.highlightPython(p.code) : esc(p.code)}</code></pre>` : ""}</li>`)
            .join("")}
        </ul>
        ${playbook ? `<p class="tips-foot">Every pattern side by side, with a pattern finder and a drill: <a href="${playbook.url}">Pattern Recognition Playbook</a>.</p>` : ""}`;
      placeExtra(sec, 1);
    });
  }

  function topicCodeBlockShell(label, code) {
    const body = window.highlightPython ? window.highlightPython(code) : esc(code);
    return `<div class="code-block"><div class="code-label">${label}</div><pre><code>${body}</code></pre></div>`;
  }

  // ---------- interview questions ----------
  // Data lives in js/data/interview/<topicId>.js and is loaded on demand:
  //   INTERVIEW["topicId/pageId"] = [{ q: "...", a: "<html answer>" }, ...]
  const interviewLoads = {};
  function loadInterview(topicId, cb) {
    const ready = () => window.INTERVIEW;
    if (interviewLoads[topicId] === "done") return cb();
    if (Array.isArray(interviewLoads[topicId])) return interviewLoads[topicId].push(cb);
    interviewLoads[topicId] = [cb];
    const s = document.createElement("script");
    s.src = ROOT + `js/data/interview/${topicId}.js`;
    const finish = () => {
      const waiting = interviewLoads[topicId];
      interviewLoads[topicId] = "done";
      waiting.forEach((fn) => fn());
    };
    s.onload = s.onerror = finish;
    document.head.appendChild(s);
  }

  function renderInterview() {
    const cur = current();
    const quiz = document.querySelector(".quiz-section");
    if (!cur.entry || !quiz || document.getElementById("interview")) return;
    loadInterview(cur.topic.id, () => {
      const qs = (window.INTERVIEW || {})[cur.entry.key];
      if (!qs || !qs.length || document.getElementById("interview")) return;
      const sec = document.createElement("section");
      sec.id = "interview";
      sec.className = "interview";
      sec.innerHTML = `
        <div class="interview-head">
          <h2>Interview questions</h2>
          <button type="button" class="link-btn" id="iq-toggle">Show all answers</button>
        </div>
        <p class="interview-sub">Answer out loud first, then reveal. ${qs.length} questions on this lesson.</p>
        <ol class="iq-list">
          ${qs
            .map(
              (item, i) => `
            <li class="iq">
              <div class="iq-q"><span class="iq-num">Q${i + 1}</span>${item.q}</div>
              <details class="iq-details"><summary><span class="lbl-show">Show answer</span><span class="lbl-hide">Hide answer</span></summary><div class="iq-a">${item.a}</div></details>
            </li>`
            )
            .join("")}
        </ol>`;
      placeExtra(sec, 2);

      const all = sec.querySelectorAll("details.iq-details");
      const btn = sec.querySelector("#iq-toggle");
      const sync = () => {
        btn.textContent = [...all].every((d) => d.open) ? "Hide all answers" : "Show all answers";
      };
      btn.addEventListener("click", () => {
        const open = ![...all].every((d) => d.open);
        all.forEach((d) => (d.open = open));
        sync();
      });
      all.forEach((d) => d.addEventListener("toggle", sync));
    });
  }

  function refreshProgress() {
    const pill = document.getElementById("hdr-progress");
    if (pill) {
      const s = stats(pageList);
      pill.textContent = `${s.done}/${s.total}`;
      pill.setAttribute("aria-label", `Progress ${s.done} of ${s.total}`);
    }
    refreshDrawer();
    renderSidebar();
    renderConnections();
  }

  // ---------- boot ----------
  function init() {
    renderHeader();
    buildDrawer();
    buildSearch();
    ensureSidebarToggle();
    renderSidebar();
    renderPagination();
    ensureExtras();
    renderConnections();
    renderTips();
    renderInterview();

    const cur = current();
    if (cur.entry) {
      try {
        localStorage.setItem(LAST_KEY, JSON.stringify({ key: cur.entry.key, ts: Date.now() }));
      } catch (e) {}
    }

    document.addEventListener("quiz-complete", refreshProgress);
    document.addEventListener("keydown", (ev) => {
      const tag = (ev.target && ev.target.tagName) || "";
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (ev.target && ev.target.isContentEditable);
      if (ev.key === "Escape") {
        closeSearch();
        closeDrawer();
      } else if ((ev.key === "/" && !typing && !ev.metaKey && !ev.ctrlKey) || ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k")) {
        ev.preventDefault();
        openSearch();
      }
    });
  }

  window.SiteNav = {
    ROOT, topics, tracks: SITE.tracks, pageList, byKey, topicById, trackById,
    current, stats, isDone, topicUrl, pagesOf, resumeTarget, lastVisited, chip, esc, openSearch,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
