// End-to-end check of the whole site in jsdom (real DOM, real scripts).
// Setup once:  cd tools/checks && npm install     Run:  node tools/checks/e2e.js
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const http = require("http");
const PORT = 8961;
const BASE = `http://localhost:${PORT}/`;
const TIPS = (() => { const w = {}; new Function("window", fs.readFileSync(ROOT + "/js/data/dsa-tips.js", "utf8"))(w); return w.DSA_TIPS; })();
const SITE = new Function(fs.readFileSync(ROOT + "/js/data/site.js", "utf8") + "; return SITE;")();
const TITLE = Object.fromEntries(SITE.topics.flatMap((t) => t.sections.flatMap((sec) => sec.pages.map((pg) => [`${t.id}/${pg.id}`, pg.title]))));
let fails = 0;
const TOTAL = SITE.topics.reduce((n, t) => n + t.sections.reduce((m, sec) => m + sec.pages.length, 0), 0);
const fail = (m) => { fails++; console.log("FAIL", m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(rel, storage) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message));
  vc.on("error", (e) => errors.push(String(e)));
  const dom = await JSDOM.fromURL(BASE + rel, { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { if (storage) for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v); } });
  await new Promise((res) => { if (dom.window.document.readyState === "complete") res(); else dom.window.addEventListener("load", res); });
  await wait(30);
  return { dom, w: dom.window, d: dom.window.document, errors };
}

// tiny static file server so the pages load over http (localStorage needs a real origin)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

server.listen(PORT, async () => { try { await main(); } catch (e) { console.error("HARNESS ERROR", e); server.close(); process.exit(2); } });

async function main() {
  const pages = [];
  for (const t of SITE.topics) {
    pages.push({ rel: `topics/${t.dir}/index.html`, kind: "index", t });
    for (const s of t.sections) for (const p of s.pages) pages.push({ rel: `topics/${t.dir}/${p.href}`, kind: "page", t, p });
  }
  // ---- every page renders cleanly ----
  for (const pg of pages) {
    const { dom, d, errors } = await open(pg.rel);
    const tag = pg.rel;
    if (errors.length) fail(`${tag}: script errors: ${errors.slice(0, 2).join(" | ")}`);
    if (!d.getElementById("hdr-search") || !d.getElementById("hdr-progress")) fail(`${tag}: header not rebuilt`);
    if (!d.querySelector(".drawer .drawer-track")) fail(`${tag}: drawer empty`);
    if (pg.kind === "index") {
      const html = d.getElementById("tier-sections").innerHTML;
      if (!html.includes("card") || /undefined|NaN/.test(html)) fail(`${tag}: index render bad`);
      const cards = d.querySelectorAll("#tier-sections .card").length;
      const expect = pg.t.sections.reduce((n, s) => n + s.pages.length, 0);
      if (cards !== expect) fail(`${tag}: ${cards} cards, expected ${expect}`);
    } else {
      const content = d.getElementById("content") ? d.getElementById("content").innerHTML : d.querySelector(".content").innerHTML;
      if (!content || /undefined|NaN|\[object/.test(content)) fail(`${tag}: content bad`);
      if (!d.getElementById("quiz-container").textContent.includes("Question 1 of")) fail(`${tag}: quiz not rendered`);
      const links = d.querySelectorAll("#sidebar .pattern-link").length;
      const expect = pg.t.sections.reduce((n, s) => n + s.pages.length, 0);
      if (links !== expect) fail(`${tag}: sidebar has ${links} links, expected ${expect}`);
      if (!d.querySelector("#sidebar .pattern-link.active")) fail(`${tag}: no active sidebar link`);
      if (!d.querySelectorAll("#pagination a").length) fail(`${tag}: pagination empty`);
      if (!d.querySelector(".sidebar-toggle")) fail(`${tag}: no mobile toggle`);
      // interview questions load lazily; wait for them
      for (let i = 0; i < 40 && !d.getElementById("interview"); i++) await wait(25);
      const iv = d.getElementById("interview");
      if (!iv) fail(`${tag}: interview section missing`);
      else {
        const items = iv.querySelectorAll(".iq");
        if (items.length < 3) fail(`${tag}: only ${items.length} interview questions`);
        if (iv.querySelectorAll("details.iq-details summary").length !== items.length) fail(`${tag}: show-answer links`);
        if ([...iv.querySelectorAll(".iq-a")].some((a) => !a.textContent.trim())) fail(`${tag}: empty answer`);
        if (/undefined|\[object/.test(iv.innerHTML)) fail(`${tag}: interview render bad`);
        // order on the page: lesson, extras (tips, interview), connections, quiz
        const kids = [...d.querySelector(".content").children].map((c) => c.id || c.className);
        const ex = kids.indexOf("lesson-extras"), qz = kids.findIndex((k) => String(k).includes("quiz-section"));
        if (ex < 0 || ex > qz) fail(`${tag}: extras must sit above the quiz`);
        const inner = [...d.getElementById("lesson-extras").children].map((c) => c.id);
        if (pg.t.id === "dsa" && !["complexity", "playbook", "combining-patterns"].includes(pg.p.id)) {
          if (inner.join(",") !== "tips,interview") fail(`${tag}: extras order ${inner.join(",")} (want tips,interview)`);
        }
      }
      // DSA lessons: numbered LeetCode practice list
      if (pg.t.id === "dsa" && !["complexity", "playbook"].includes(pg.p.id)) {
        const items = [...d.querySelectorAll(".lc-list li.lc")];
        if (items.length < 4) fail(`${tag}: only ${items.length} numbered problems`);
        const rank = { easy: 0, medium: 1, hard: 2 };
        let prev = -1;
        for (const li of items) {
          const a = li.querySelector("a");
          if (!/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/.test(a.href)) fail(`${tag}: bad problem link ${a.href}`);
          if (a.target !== "_blank" || !/noopener/.test(a.rel)) fail(`${tag}: external link should open safely`);
          if (!/^#\d+ /.test(a.textContent.trim())) fail(`${tag}: problem number missing: ${a.textContent}`);
          const lvl = li.querySelector(".lc-level");
          if (!lvl || !(lvl.textContent.toLowerCase() in rank)) { fail(`${tag}: level missing`); continue; }
          const r = rank[lvl.textContent.toLowerCase()];
          if (r < prev) fail(`${tag}: problems not ordered easy to hard`);
          prev = r;
        }
        if (!d.querySelector(".lc-note")) fail(`${tag}: LeetCode note missing`);
      }
      // DSA pattern lessons: tips & tricks
      if (pg.t.id === "dsa" && !["complexity", "playbook", "combining-patterns"].includes(pg.p.id)) {
        for (let i = 0; i < 40 && !d.getElementById("tips"); i++) await wait(25);
        const tp = d.getElementById("tips");
        const want = TIPS.patterns[pg.p.id];
        if (!tp) fail(`${tag}: tips section missing`);
        else {
          if (tp.querySelectorAll(".tips-cues .chip").length !== want.cues.length) fail(`${tag}: cue chips`);
          if (tp.querySelectorAll(".spot").length !== want.spot.length) fail(`${tag}: spot count`);
          if (!tp.querySelector(".spot blockquote mark")) fail(`${tag}: cue words not highlighted`);
          if (!tp.querySelector(".code-block pre")) fail(`${tag}: tips example code`);
          if (tp.querySelectorAll(".tips-python li").length !== want.python.length) fail(`${tag}: python tips`);
          if (!tp.querySelector('a[href$="playbook.html"]')) fail(`${tag}: link to playbook`);
          if (/undefined|\[object/.test(tp.innerHTML)) fail(`${tag}: tips render bad`);
          // unconverted **cue** markup in prose (code blocks may legitimately contain "**", e.g. 10**18)
          if ([...tp.querySelectorAll(".spot, .tips-ask, .tips-notwhen")].some((n) => n.textContent.includes("**"))) fail(`${tag}: raw ** markup in tips prose`);
        }
      }
      const needs = (pg.p.needs || []).length;
      if (needs && !d.getElementById("connections").textContent.includes("Before you start")) fail(`${tag}: prerequisites missing`);
      if (!d.querySelector(".badge.tier-tag") && !d.querySelector(".badge")) fail(`${tag}: no tier badge`);
    }
    dom.window.close();
  }
  console.log(`checked ${pages.length} topic pages`);

  // ---- homepage ----
  let { dom, w, d, errors } = await open("index.html");
  if (errors.length) fail("home errors: " + errors.join("|"));
  if (d.querySelectorAll(".track").length !== SITE.tracks.length) fail("home: track count");
  if (!d.querySelector(".resume-label").textContent.includes("Start here")) fail("home: fresh visitor should see Start here");
  if (!d.querySelector(".resume a.btn").href.endsWith("topics/python/environment.html")) fail("home: start link");
  if (d.querySelectorAll(".topic-card").length !== SITE.topics.length) fail("home: topic cards");
  if (!d.getElementById("roadmap") || d.getElementById("roadmap").open) fail("home: roadmap should exist and be collapsed");
  if (!d.getElementById("roadmap").textContent.includes("Ambiguous Case Study")) fail("home: roadmap items");
  const cnt = SITE.tracks.reduce((n, t) => n + t.upcoming.length, 0);
  if (!d.querySelector(".roadmap summary").textContent.includes(String(cnt))) fail("home: roadmap count");
  w.close();

  // ---- search ----
  ({ dom, w, d } = await open("topics/dsa/index.html"));
  const key = (k, o = {}) => d.dispatchEvent(new w.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...o }));
  key("/");
  if (d.querySelector(".search-overlay").hidden) fail("search: '/' should open");
  const input = d.querySelector(".search-input");
  const type = async (q) => { input.value = q; input.dispatchEvent(new w.Event("input", { bubbles: true })); await wait(300); };
  const titles = () => [...d.querySelectorAll(".search-item .si-title")].map((e) => e.textContent.trim());
  await type("heap");
  if (!titles().some((t) => t.startsWith("Top K Elements"))) fail("search: 'heap' -> " + titles().join(","));
  await type("hmac");
  if (!titles().some((t) => t.startsWith("Webhooks"))) fail("search: full-text 'hmac' -> " + titles().join(","));
  await type("singleton");
  if (!titles()[0].startsWith("Singleton")) fail("search: 'singleton' first -> " + titles().join(","));
  await type("subarray sum equals k");
  if (!titles()[0].startsWith("Prefix Sum")) fail("search: problem name -> " + titles().join(","));
  await type("560");
  if (!titles().some((t) => t.startsWith("Prefix Sum"))) fail("search: LeetCode number 560 -> " + titles().join(","));
  await type("fast slow");
  if (!titles()[0].startsWith("Fast & Slow")) fail("search: 'fast slow' -> " + titles().join(","));
  await type("if you see");
  if (!titles().some((t) => t.startsWith("Pattern Recognition"))) fail("search: playbook rules -> " + titles().join(","));
  await type("ambiguous");
  if (!d.querySelector(".search-item.soon")) fail("search: coming-soon result expected");
  await type("zzzzqqq");
  if (!d.querySelector(".search-empty")) fail("search: empty state");
  await type("dijkstra");
  key("ArrowDown"); key("ArrowUp");
  if (!d.querySelector(".search-item.selected")) fail("search: selection");
  key("Escape");
  if (!d.querySelector(".search-overlay").hidden) fail("search: Esc should close");
  key("k", { ctrlKey: true });
  if (d.querySelector(".search-overlay").hidden) fail("search: Ctrl+K should open");
  w.close();

  // ---- drawer ----
  ({ dom, w, d } = await open("topics/patterns/adapter.html"));
  d.getElementById("hdr-menu").click();
  const dr = d.querySelector(".drawer");
  if (dr.hidden) fail("drawer: should open");
  if (!dr.querySelector("details.drawer-topic[open] .drawer-link.active")) fail("drawer: current topic should be expanded with active link");
  if (!dr.textContent.includes("Coming soon")) fail("drawer: coming soon lists");
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  if (!dr.hidden) fail("drawer: Esc should close");
  // related + needs on Adapter
  const conn = d.getElementById("connections").textContent;
  if (!conn.includes("Data Mapping") || !conn.includes("Legacy Systems")) fail("connections: adapter related -> " + conn);
  w.close();

  // mutual related: data-mapping shows Adapter (declared only on the adapter side)
  ({ dom, w, d } = await open("topics/integration/data-mapping.html"));
  if (!d.getElementById("connections").textContent.includes("Adapter")) fail("connections: mutual related");
  w.close();

  // ---- cross-topic pagination ----
  ({ dom, w, d } = await open("topics/dsa/complexity.html"));
  const prev = d.querySelector("#pagination .prev");
  if (!prev || !prev.textContent.includes("Previous topic") || !prev.href.endsWith("python/concurrency-memory.html")) fail("pagination: complexity prev -> " + (prev && prev.textContent));
  w.close();
  ({ dom, w, d } = await open("topics/integration/security-observability.html"));
  if (!d.querySelector("#pagination .next").textContent.includes("Back to the learning path")) fail("pagination: last page");
  w.close();

  // ---- progress: resume + ticks ----
  const progress = { "python:environment": { done: true, score: 5, total: 5, ts: 1 } };
  ({ dom, w, d } = await open("topics/python/syntax-variables.html", { fde_progress: JSON.stringify(progress) }));
  const lastRaw = JSON.parse(w.localStorage.getItem("fde_last"));
  if (lastRaw.key !== "python/syntax-variables") fail("last visited not stored");
  if (d.getElementById("hdr-progress").textContent !== `1/${TOTAL}`) fail("progress pill: " + d.getElementById("hdr-progress").textContent);
  if (!d.querySelector("#sidebar .check")) fail("sidebar tick for completed page");
  // pass the quiz here via UI to test live refresh
  const store = w.localStorage;
  w.close();

  ({ dom, w, d } = await open("index.html", { fde_progress: JSON.stringify(progress), fde_last: JSON.stringify({ key: "python/syntax-variables", ts: 1 }) }));
  if (!d.querySelector(".resume-label").textContent.includes("Continue")) fail("home: should offer Continue");
  if (!d.querySelector(".resume-title").textContent.includes("Syntax")) fail("home: resume title");
  w.close();
  // last page passed -> "Up next"
  const p2 = { ...progress, "python:syntax-variables": { done: true, score: 5, total: 5, ts: 2 } };
  ({ dom, w, d } = await open("index.html", { fde_progress: JSON.stringify(p2), fde_last: JSON.stringify({ key: "python:syntax-variables".replace(":", "/"), ts: 1 }) }));
  if (!d.querySelector(".resume-label").textContent.includes("Up next") || !d.querySelector(".resume-title").textContent.includes("Numbers")) fail("home: up next -> " + d.querySelector(".resume-title").textContent);
  w.close();

  // live quiz completion refreshes sidebar + pill
  ({ dom, w, d } = await open("topics/python/environment.html"));
  const before = d.getElementById("hdr-progress").textContent;
  for (let i = 0; i < 5; i++) {
    const opts = [...d.querySelectorAll("#quiz-container .quiz-option")];
    const q = w.eval("PAGE_DATA").quiz[i];
    // options are shuffled per attempt, so find the right one by its text
    opts.find((o) => o.textContent === q.options[q.correct]).click();
    d.getElementById("qn").click();
  }
  await wait(50);
  const after = d.getElementById("hdr-progress").textContent;
  if (before !== `0/${TOTAL}` || after !== `1/${TOTAL}`) fail(`quiz->progress pill ${before} -> ${after}`);
  if (!d.querySelector("#sidebar .check")) fail("quiz->sidebar tick");
  w.close();

  // ---- playbook page ----
  ({ dom, w, d, errors } = await open("topics/dsa/playbook.html"));
  if (errors.length) fail("playbook errors: " + errors.join("|"));
  const dsaPatternCount = Object.keys(TIPS.patterns).length;
  if (d.querySelectorAll("#pattern-table tr").length !== dsaPatternCount) fail("playbook: pattern table rows");
  if (d.querySelectorAll("#pattern-table a").length !== dsaPatternCount) fail("playbook: pattern links");
  if (d.querySelectorAll("#rules-table tr").length !== TIPS.general.rules.length) fail("playbook: rules rows");
  if (TIPS.general.rules.length < 40) fail("playbook: expected 40+ rules");
  if (d.querySelectorAll("#shape-table tr").length !== TIPS.general.byShape.length) fail("playbook: shape guide rows");
  if (d.querySelectorAll("#question-table tr").length !== TIPS.general.byQuestion.length) fail("playbook: question guide rows");
  if (d.querySelectorAll("#constraint-table tr").length !== TIPS.general.constraints.length) fail("playbook: constraint rows");
  if (d.querySelectorAll("#steps li").length !== TIPS.general.steps.length) fail("playbook: steps");
  if (d.querySelectorAll("#toolbox .tool").length !== TIPS.general.toolbox.length) fail("playbook: toolbox");
  if (d.querySelectorAll("#pitfalls .pitfall").length !== TIPS.general.pitfalls.length) fail("playbook: pitfalls");
  // every pattern lesson is reachable from at least one rule and from the catalog
  const ruleTargets = new Set([...d.querySelectorAll("#rules-table a")].map((a) => a.getAttribute("href").split("/").pop().replace(".html", "")));
  for (const id of Object.keys(TIPS.patterns)) if (!ruleTargets.has(id)) fail(`playbook: no "if you see" rule points to ${id}`);
  // rule filter
  const rf = d.getElementById("rule-filter");
  rf.value = "grid"; rf.dispatchEvent(new w.Event("input", { bubbles: true }));
  const filtered = d.querySelectorAll("#rules-table tr");
  if (!filtered.length || filtered.length >= TIPS.general.rules.length) fail("playbook: rule filter should narrow the list");
  if (![...d.querySelectorAll("#rules-table a")].some((a) => a.href.endsWith("matrix-traversal.html"))) fail("playbook: 'grid' rule should point to Matrix Traversal");
  rf.value = "zzzznomatch"; rf.dispatchEvent(new w.Event("input", { bubbles: true }));
  if (!d.querySelector("#rules-table .finder-empty")) fail("playbook: empty filter message");
  rf.value = ""; rf.dispatchEvent(new w.Event("input", { bubbles: true }));
  if (d.querySelectorAll("#rules-table tr").length !== TIPS.general.rules.length) fail("playbook: clearing the filter restores all rules");

  const fin = d.getElementById("finder-input");
  const ask = (q) => { fin.value = q; fin.dispatchEvent(new w.Event("input", { bubbles: true })); return d.querySelector(".finder-hit .fh-title") ? d.querySelector(".finder-hit .fh-title").textContent : ""; };
  const cases = [
    ["Find the length of the longest substring without repeating characters.", "sliding-window"],
    ["Given n courses and prerequisites, return a valid order to take them all.", "topological-sort"],
    ["Return the number of distinct ways to climb n stairs taking 1 or 2 steps.", "dp-1d"],
    ["Given a sorted array, find two numbers that add up to a target using constant extra space.", "two-pointers"],
    ["Given an unsorted array, find the longest run of consecutive integers.", "arrays-hashing"],
    ["Design a search box that returns suggestions for each prefix typed.", "tries"],
    ["Find the k-th largest element in a stream.", "heap"],
    ["Count the subarrays whose sum equals k. The array may contain negatives.", "prefix-sum"],
    ["For each day, how many days until a warmer temperature?", "monotonic-stack"],
    ["Detect whether a linked list has a cycle.", "fast-slow-pointers"],
    ["Return the minimum number of minutes until every orange is rotten.", "bfs"],
    ["Count the islands in a grid of land and water.", "matrix-traversal"],
    ["Find the cheapest price from city A to city B with weighted flights.", "shortest-path"],
  ];
  for (const [q, want] of cases) { const got = ask(q); if (got !== TITLE[`dsa/${want}`]) fail(`finder "${q.slice(0, 40)}..." -> ${got}, wanted ${TITLE[`dsa/${want}`]}`); }
  ask("Given an unsorted array, find the longest run of consecutive integers.");
  if (d.querySelector(".finder-hit .fh-title").textContent === "Two Pointers") fail("finder: 'sorted' must not match inside 'unsorted'");
  if (!d.querySelector(".finder-preview mark")) fail("finder: cue words should be highlighted");
  ask("");
  if (d.querySelectorAll(".finder-hit").length) fail("finder: empty input should clear results");
  d.querySelector('#finder-samples button[data-i="0"]').click();
  if (!fin.value.includes("longest substring")) fail("finder: sample chip");
  // drill quiz: 10 questions, look-alike wrong answers, explanation names the cues
  const titleToId = Object.fromEntries(Object.entries(TITLE).filter(([k]) => k.startsWith("dsa/")).map(([k, v]) => [v, k.slice(4)]));
  if (!d.getElementById("quiz-container").textContent.includes("Question 1 of 10")) fail("playbook: drill should have 10 questions");
  let cueNamed = 0, lookalikeOk = 0;
  for (let i = 0; i < 10; i++) {
    const opts = [...d.querySelectorAll("#quiz-container .quiz-option")];
    const optIds = opts.map((o) => titleToId[o.textContent]);
    if (opts.length !== 4 || new Set(optIds).size !== 4 || optIds.includes(undefined)) fail("playbook: drill options " + opts.map((o) => o.textContent).join("|"));
    opts[0].click();
    const fb = d.querySelector("#quiz-container .quiz-feedback").textContent;
    if (fb.includes("Cue words:")) cueNamed++;
    const correctTitle = fb.replace(/^(Correct|Not quite) \u2014 /, "").split(". Cue words:")[0];
    const cid = titleToId[correctTitle];
    if (cid && optIds.some((x) => x !== cid && (TIPS.general.confusable[cid] || []).includes(x))) lookalikeOk++;
    d.getElementById("qn").click();
  }
  if (cueNamed !== 10) fail(`playbook: explanations should name cue words (${cueNamed}/10)`);
  if (lookalikeOk < 10) fail(`playbook: every drill question should include a look-alike wrong answer (${lookalikeOk}/10)`);
  if (!d.getElementById("quiz-container").textContent.includes("/10")) fail("playbook: drill result screen");
  w.close();

  // ---- retired lessons redirect to their successors ----
  for (const [oldFile, to] of [["linked-list", "fast-slow-pointers"], ["graphs", "dfs"], ["advanced-graphs", "shortest-path"]]) {
    const html = fs.readFileSync(path.join(ROOT, "topics/dsa", oldFile + ".html"), "utf8");
    if (!html.includes(`url=${to}.html`)) fail(`redirect stub for ${oldFile}`);
  }
  // ---- progress migration: split lessons keep their completed state ----
  ({ dom, w, d } = await open("topics/dsa/index.html", { fde_progress: JSON.stringify({ "dsa:graphs": { done: true, score: 5, total: 5, ts: 1 }, "dsa:linked-list": { done: false, score: 1, total: 5, ts: 1 } }) }));
  const mig = JSON.parse(w.localStorage.getItem("fde_progress"));
  for (const k of ["dsa:dfs", "dsa:bfs", "dsa:matrix-traversal"]) if (!mig[k] || !mig[k].done) fail("migration: " + k + " should inherit dsa:graphs");
  if (mig["dsa:graphs"] || mig["dsa:linked-list"]) fail("migration: old keys should be removed");
  if (!mig["dsa:fast-slow-pointers"] || mig["dsa:fast-slow-pointers"].done) fail("migration: unfinished state should carry over as not done");
  w.close();

  // ---- interview: reveal links + show-all ----
  ({ dom, w, d } = await open("topics/python/oop.html"));
  for (let i = 0; i < 40 && !d.getElementById("interview"); i++) await wait(25);
  const det = d.querySelector("#interview details.iq-details");
  if (!det || det.open) fail("interview: answers should start hidden");
  det.querySelector("summary").click();
  if (!det.open) fail("interview: Show answer link should open the answer");
  d.getElementById("iq-toggle").click();
  if (![...d.querySelectorAll("#interview details")].every((x) => x.open)) fail("interview: Show all answers");
  if (d.getElementById("iq-toggle").textContent !== "Hide all answers") fail("interview: toggle label");
  d.getElementById("iq-toggle").click();
  if ([...d.querySelectorAll("#interview details")].some((x) => x.open)) fail("interview: Hide all answers");
  w.close();

  // interview text is searchable
  ({ dom, w, d } = await open("index.html"));
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true }));
  const inp = d.querySelector(".search-input");
  inp.value = "thundering herd";
  inp.dispatchEvent(new w.Event("input", { bubbles: true }));
  await wait(400);
  const hits = [...d.querySelectorAll(".search-item .si-title")].map((e) => e.textContent.trim());
  if (!hits.some((t) => t.startsWith("Resilience"))) fail("search: interview text 'thundering herd' -> " + hits.join(","));
  w.close();

  // ---- quiz shuffle: answers vary across attempts and stay correct ----
  const seenFirst = new Set();
  let shuffledQs = 0, totalQs = 0;
  for (let run = 0; run < 12; run++) {
    ({ dom, w, d } = await open("topics/dsa/heap.html"));
    const q0 = w.eval("PAGE_DATA").quiz[0];
    const opts = [...d.querySelectorAll("#quiz-container .quiz-option")].map((o) => o.textContent);
    seenFirst.add(opts.indexOf(q0.options[q0.correct]));
    w.close();
  }
  if (seenFirst.size < 2) fail("quiz shuffle: correct answer always in the same position " + [...seenFirst]);
  // fraction of all questions that are exempt from shuffling
  for (const t of SITE.topics) for (const s2 of t.sections) for (const p2 of s2.pages) {
    const h = fs.readFileSync(path.join(ROOT, "topics", t.dir, p2.href), "utf8");
    const m = h.match(/const PAGE_DATA = ([\s\S]*?);\s*<\/script>/);
    if (!m) continue;
    for (const q of new Function("return (" + m[1] + ")")().quiz) { totalQs++; if (q.options.some((o) => /\b(above|both|all of|none of|neither)\b/i.test(o))) shuffledQs++; }
  }
  console.log(`quiz: ${shuffledQs}/${totalQs} questions keep written order (positional wording); the rest are shuffled`);

  console.log(fails ? `${fails} FAILURES` : "ALL E2E CHECKS PASSED");
  server.close();
  process.exit(fails ? 1 : 0);
}
