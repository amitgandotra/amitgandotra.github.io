# Becoming FDE: project briefing for an LLM

This file is written for an AI assistant that has just been pointed at this repository and needs to understand it well
enough to keep improving it. Read this file first, then [site-structure.md](site-structure.md) (how to extend the site),
then [todo.md](todo.md) (what is missing, known gaps, verification, sources). Everything else can be discovered from
the code, but the facts below are the ones that are easy to get wrong.

Last verified against the repository state described in section 3. If something here disagrees with the code, trust the
code and fix this file.

---

## 1. What this project is

**Becoming FDE** is a static, self-paced learning site for someone becoming a **Forward Deployed Engineer (FDE)**: a
customer-embedded software engineer role (Palantir, OpenAI, Anthropic and others). The target learner is an
**experienced Java developer** who needs to become strong in Python, interview algorithms, design patterns and enterprise
integration, and later AI/LLM systems and customer-facing skills.

- Hosted as a **GitHub Pages user site** (`amitgandotra.github.io`); `index.html` at the repo root is the homepage.
- Every lesson ends in an auto-graded **quiz**, and has **interview questions** with click-to-reveal answers.
- All progress lives in the learner's browser (`localStorage`). There is no backend, no accounts, no analytics.
- The site is plain **HTML, CSS and vanilla JavaScript**. No framework, no bundler, no build step needed to serve it.
  Open it with any static server, for example `python3 -m http.server 8000`.

The curriculum was derived from web research on FDE job postings (Anthropic's FDE listings) and interview guides.
The list of everything an FDE was found to need is in `todo.md`; only part of it is built.

---

## 2. Reading order and what each doc is for

| File | Purpose |
| --- | --- |
| `docs/website-info.md` (this file) | Orientation: architecture, data model, conventions, workflows, pitfalls |
| `docs/site-structure.md` | Short how-to for adding lessons, topics, tips, interview questions |
| `docs/todo.md` | Missing topics, gaps in built topics, quality gaps, verification commands, research sources |
| `README.md` | One-paragraph summary and pointers |

When you finish work, **update `todo.md`** (tick or add items, fix counts) and `site-structure.md` if a workflow changed.

---

## 3. Current state (snapshot)

| Topic id | Title | Track | Lessons | Notes |
| --- | --- | --- | --- | --- |
| `python` | Python for Java Developers | foundations | 14 | Java-to-Python translation; setup, syntax, OOP, generators, GIL |
| `dsa` | Data Structures & Algorithms | foundations | 27 | 24 technique patterns + Big-O + Playbook + Combining Patterns |
| `patterns` | Design Patterns in Python | engineering | 13 | 12 patterns plus an overview; textbook vs Pythonic form |
| `integration` | Enterprise Integration | enterprise | 10 | REST, auth, webhooks, queues, batch files, legacy, resilience, mapping, security |

- **64 lessons**, **259 interview questions**, **44 planned topics** listed as "upcoming" (AI/LLM, customer-facing,
  interview prep, data/cloud engineering, enterprise delivery). None of those planned topics exist as pages yet.
- Six **tracks**: `foundations`, `engineering`, `enterprise`, `ai`, `customer`, `interview`. Only the first three contain
  built topics.
- Recent large changes (all **uncommitted** in git at the time of writing): the shared site shell, the two newer topics,
  interview questions, DSA tips, and the DSA restructure into technique patterns. The last commits in git are older
  (`added python`, `initial commit`). **Do not commit unless the user asks.**

---

## 4. Repository map

```
index.html                     Homepage (hero + <main id="home"> filled by js/home.js)
css/style.css                  The only stylesheet (dark theme, design tokens at the top)
js/
  data/site.js                 SINGLE SOURCE OF TRUTH for structure (tracks, topics, sections, pages)
  data/dsa-tips.js             DSA "Tips & tricks" + Playbook data (window.DSA_TIPS)
  data/interview/<topic>.js    Interview Q&A per topic (window.INTERVIEW["topicId/pageId"])
  data/search-index.js         GENERATED full-text search index (window.SEARCH_INDEX)
  progress.js                  localStorage progress API + one-time migration of retired DSA lessons
  site-shell.js                Top bar, menu drawer, search, sidebar, prev/next, prerequisites, tips/interview loaders
  topic-page.js                Renders a lesson's body from inline PAGE_DATA, starts its quiz
  topic-index.js               Renders a topic overview page (cards by section)
  home.js                      Homepage: resume banner, tracks, roadmap
  quiz.js                      Auto-graded multiple-choice quiz (shuffles options per attempt)
  highlight.js                 Tiny dependency-free Python syntax highlighter
topics/<dir>/index.html        Topic overview (hand-written hero + <main id="tier-sections">)
topics/<dir>/<page>.html       One lesson per file (inline PAGE_DATA)
tools/
  build-search-index.js        Regenerates js/data/search-index.js
  checks/                      Automated checks (jsdom end-to-end, Python example runners) + package.json
docs/                          This documentation
```

Topic directories are `python`, `dsa`, `patterns`, `integration`. Three DSA files (`linked-list.html`, `graphs.html`,
`advanced-graphs.html`) are **redirect stubs** to their successors; they are not in the manifest.

---

## 5. Architecture

### 5.1 The manifest: `js/data/site.js`

```js
const SITE = {
  tracks: [{ id, title, blurb, upcoming: ["planned topic title", ...] }],
  topics: [{
    id, dir, short, track, title, tagline,
    prereqs: ["topicId", ...],
    sections: [{ name, pages: [{ id, title, tier, href, blurb, needs?: [...], related?: [...] }] }],
  }],
};
```

- **Page key** everywhere is `"topicId/pageId"` (for example `"dsa/prefix-sum"`). It is used by `needs`, `related`, the
  interview data, the search index, and progress (`topicId:pageId`).
- **`tier`** is one of `Foundations | Beginner | Intermediate | Advanced`. It is only a **badge** on the page; grouping
  in the sidebar is by **section**. CSS badge classes exist for exactly those four names.
- **`needs`** = prerequisites shown as "Before you start". **`related`** = cross-links; the shell makes them **mutual**
  (declare on one side only).
- **Page order in the manifest is the global reading order.** Prev/next walks that order and **continues across topics**
  (last page of Python leads to the first of DSA). Topics are ordered python, dsa, patterns, integration.
- **`upcoming`** titles are plain strings shown in the homepage Roadmap, the menu, and search (greyed). Moving a planned
  topic to built means adding a topic entry and deleting its string from `upcoming`.
- `site.js` is hand-maintained. It was partly generated by scripts during development, but those scripts are **not in the
  repo** (see section 10). Edit it directly and keep its header comment.

### 5.2 Page loading and script order

Every page (lesson, topic index, home) loads the same shared scripts, in this order, with paths relative to the page:

```html
<script src="../../js/data/site.js"></script>
<script src="../../js/progress.js"></script>
<script src="../../js/site-shell.js"></script>
<script src="../../js/highlight.js"></script>   <!-- lessons only -->
<script src="../../js/quiz.js"></script>        <!-- lessons only -->
<script> const PAGE_DATA = { ... }; </script>   <!-- lessons only -->
<script src="../../js/topic-page.js"></script>  <!-- lessons; topic-index.js for topic indexes; home.js for the homepage -->
```

- `site-shell.js` computes the site root from its own script URL (`new URL("../", document.currentScript.src)`), so links
  work under any hosting path. It **replaces the contents of `.site-header .container`** at runtime, so the static header
  in each HTML file only needs the brand link.
- The **current page is detected from `location.pathname`** matching `/topics/<dir>/<href>` from the manifest. There is no
  `data-page` attribute. A file that is not in the manifest gets no sidebar, no prev/next, no progress.
- `const PAGE_DATA` in an inline script is **not** a `window` property. Code outside that script reads it as a bare
  global; tests use `window.eval("PAGE_DATA")`.

### 5.3 `js/site-shell.js` responsibilities

Exposes `window.SiteNav` (`current`, `pageList`, `byKey`, `topicById`, `stats`, `isDone`, `pagesOf`, `topicUrl`,
`resumeTarget`, `lastVisited`, `chip`, `esc`, `openSearch`, `ROOT`, `topics`, `tracks`) for the page scripts, and on load:

1. Rebuilds the header: brand, **Search** button, **Menu** button, overall **progress pill** (done/total).
2. **Menu drawer**: track > topic > section > lesson tree, current topic expanded, ticks for completed lessons, "Coming soon" lists.
3. **Search** modal: opens with `/` or Ctrl/Cmd+K, closes with Esc, arrow keys + Enter. Title/blurb/section matches
   score higher than body text from `search-index.js` (lazy-loaded on first open). Every token must match somewhere.
   Planned topics appear greyed and non-clickable.
4. **Sidebar** (`#sidebar`): collapsible section groups for the current topic, remembers open sections across refreshes;
   a mobile "In this topic" toggle button is injected.
5. **Prev/next** (`#pagination`) across topics.
6. **Lesson extras**, placed in a `#lesson-extras` container above the quiz in a fixed order: **tips** (order 1, DSA
   pattern lessons only, loads `dsa-tips.js`), then **interview questions** (order 2, loads
   `js/data/interview/<topicId>.js`). Then `#connections` (prerequisites and related chips), then the quiz.
7. Stores the last visited lesson (`fde_last`) and refreshes the sidebar, drawer and pill on the `quiz-complete` event.

### 5.4 Lesson body: `js/topic-page.js`

Reads inline `PAGE_DATA` and fills `#content`, then calls `initQuiz`. It accepts **three vocabularies** for historical
reasons and detects the kind from the fields present:

| Kind | Detected by | Key-points field | Default headings |
| --- | --- | --- | --- |
| DSA | `recognize` present | `recognize` | "Pattern recognition", "Core template", "Worked examples", "Practice problems" |
| Python | `keyDifferences` present | `keyDifferences` | "Key differences from Java", "Core syntax", "Common gotchas coming from Java", "Try it yourself" |
| Generic | otherwise | `keyPoints` (+ optional `keyHeading`) | "Key points", "Core shape", "Common pitfalls", "Try it yourself" |

Shared fields (all strings are **inserted as raw HTML**, so escape user-facing angle brackets as `&lt;`/`&gt;`):

```js
const PAGE_DATA = {
  id: "prefix-sum",                      // must match the manifest page id
  summary: "...",
  recognize | keyDifferences | keyPoints: ["...", ...],
  template: { heading?, label?, note?, code },        // code is a template literal; highlighted as Python
  examples: [{ title, prompt, code, label?, explanation, output?, complexity?, complexityWhy? }],
  gotchas: ["..."],   gotchasHeading?: "...",
  practiceProblems: [{ n, title, slug, level, premium? }]   // DSA: numbered LeetCode list, rendered with links
  // or practiceExercises: ["...", ...]                     // other topics: plain strings
  quiz: [{ question, options: [4 strings], correct: index, explanation }],
};
```

`label` overrides the code block caption (`"shell"`, `"requirements.txt"`); default is `python`. `complexity` and
`complexityWhy` render a complexity pill plus a paragraph. `output` renders "Output: ...". A practice item that is an
object is rendered as a link to `https://leetcode.com/problems/<slug>/` with a level tag and an optional Premium tag;
lists are **ordered easy to hard** (the page states this).

### 5.5 Quizzes: `js/quiz.js`

- `initQuiz({ containerId, questions, topicId, patternId })`. Immediate feedback, explanation, score screen, retake.
- **Passing is 60% or more**; that marks the lesson complete (`Progress.record`).
- **Option order is shuffled on every attempt**, because the authored data has the correct answer at index 0 for about
  91% of questions. Questions whose options refer to each other (regex `above|both|all of|none of|neither`) are **not**
  shuffled, so avoid such wording in new questions. Do not rely on `correct` positions in tests; match by option text.
- Dispatches a `quiz-complete` event on `document`.

### 5.6 Progress and resume: `js/progress.js`, `js/home.js`

- `localStorage.fde_progress = { "topicId:pageId": { done, score, total, ts } }`. API: `Progress.isDone`, `record`, `get`,
  `countDone`. `localStorage.fde_last = { key: "topicId/pageId", ts }`.
- Homepage banner: fresh visitor gets "Start here" (first lesson); otherwise "Continue" the last lesson until its quiz is
  passed, then "Up next" (the next lesson in global order).
- A one-time migration at the bottom of `progress.js` carries saved state from the retired DSA ids (`linked-list`,
  `graphs`, `advanced-graphs`) to their successors. Add similar entries if you retire or split more lesson ids.
- Progress is **per browser**. There is no reset, export, or sync (listed in `todo.md`).

### 5.7 Search index: `tools/build-search-index.js`

Generates `js/data/search-index.js` (`window.SEARCH_INDEX["topicId/pageId"] = text`). For each lesson it indexes the
prose fields of `PAGE_DATA`, the **numbered LeetCode problem titles and numbers** (in their own slot so length caps do not
cut them), DSA tips text, interview questions and answers, and the code identifiers. Hand-written pages (Big-O, Playbook)
fall back to their visible text plus the tips data. **Run `node tools/build-search-index.js` after any content change**;
the file is committed. Without it, search still works on titles and blurbs.

---

## 6. Content by topic

### 6.1 Python for Java Developers (`python`)

Sections: Setup (environment: venv, pip, `requirements.txt`, the ways to run Python), Language basics, Idiomatic Python
(comprehensions, OOP, exceptions, functional, generators/context managers), Tooling & runtime (packages, stdlib for DSA,
concurrency/memory/GIL). Framing: every page compares with Java in "Key differences from Java", plus "Common gotchas
coming from Java". Uses the `keyDifferences` vocabulary.

### 6.2 Data Structures & Algorithms (`dsa`)

Organised around **24 technique patterns**, following the union of AlgoMaster's 20 patterns and the CodeAndDebug cheat
sheet. Sections: Foundations, Arrays & strings, Search & numbers, Linked lists, Stacks & heaps, Trees, Graphs & grids,
Recursion & optimization, Putting it together.

Patterns (`id`): `arrays-hashing`, `prefix-sum`, `two-pointers`, `sliding-window`, `intervals`, `binary-search`,
`bit-manipulation`, `fast-slow-pointers`, `linked-list-reversal`, `stack`, `monotonic-stack`, `heap` (Top K), `trees`
(traversal), `tries`, `dfs`, `bfs`, `matrix-traversal`, `topological-sort`, `union-find`, `shortest-path`,
`backtracking`, `greedy`, `dp-1d`, `dp-2d`. Plus `complexity` (Big-O), `playbook`, `combining-patterns`.

Special pages:
- **`complexity.html`**: hand-written; its own inline script builds the code blocks and runs the quiz (`QUIZ` array).
- **`playbook.html`**: hand-written UI whose content is **generated at load from `js/data/dsa-tips.js`**: process steps,
  44 "if you see X, think Y" rules with a filter box, two decision guides (by input shape, by what the question asks), the
  24-row pattern catalog, constraints-to-complexity table, an interactive **pattern finder** (keyword-weight heuristic,
  word-boundary matching), a Python toolbox and gotchas, and a 10-question "which pattern?" drill quiz whose wrong answers
  are look-alike patterns (`general.confusable`).
- **`combining-patterns.html`**: five worked problems that need two patterns (binary search + greedy, DFS + memoisation,
  intervals + prefix sums, sliding window + counting, trie + backtracking).

`js/data/dsa-tips.js` schema (`window.DSA_TIPS`):

```js
general: { steps, constraints, constraintsNote, toolbox, pitfalls, rules: [{when, think, ids}],
           byShape: [{shape, consider: [[patternId, note]]}], byQuestion: [{ask, consider: [...]}],
           confusable: { patternId: [3 look-alike ids] } }
patterns: { [patternId]: { ask, cues: [...], keys: [[lowercase substring, weight]], notWhen,
            spot: [{ text (with **cue** marks), why }],              // 2 disguised problems
            example: { title, prompt, code, explanation, complexity, check },   // one extra Python example
            python: [{ tip, code?, run? }] } }                        // 3 Python tips; run:false = illustrative fragment
```

Each pattern lesson shows this data as **"Tips & tricks: spot it, then apply it"** (trigger words, disguised problems with
highlighted cues, "not this pattern when", the extra example, Python tips, link to the Playbook). `check` and `run` are
test-only; `check` holds Python `assert` lines executed by `tools/checks/tips_asserts.js`.

### 6.3 Design Patterns (`patterns`) and Enterprise Integration (`integration`)

Both use the **generic** vocabulary (`keyPoints`, `keyHeading`, `gotchasHeading`). Patterns: overview, then creational
(singleton, factory, builder), structural (adapter, decorator, facade, proxy), behavioural (strategy, observer, command,
state), architecture (dependency injection). Integration: styles, REST clients, authentication, webhooks, queues, batch
files, legacy systems, resilience, data mapping, security/observability. Examples are runnable, mostly standard library
only, with fakes injected so they run offline.

### 6.4 Interview questions

`js/data/interview/<topicId>.js`: `Object.assign(window.INTERVIEW, { "topicId/pageId": [{ q, a }, ...] })`. `q` and `a`
are HTML strings (template literals). Each lesson has 4 or 5. They are lazy-loaded per topic and shown above the quiz
with a "Show answer" link per question and a "Show all answers" toggle. Answers are original writing informed by web
research themes; they have **not been human-reviewed**.

---

## 7. Conventions to follow

**Audience and tone.** Experienced Java developer; explain Python by contrast with Java where useful. Direct, practical,
no filler. Keep claims accurate and version-specific claims hedged (for example the CPython free-threaded build).

**Code.** All examples are **Python 3** and must run. Prefer the standard library. Show Big-O with `complexity` plus a
`complexityWhy` sentence explaining *why*. Use `label: "shell"` for shell snippets. Avoid `${` inside template literals
(escape it). Keep code blocks narrow enough to scroll rather than wrap.

**Lesson checklist.** summary; key points; template; two examples with complexity; gotchas; practice list; **five** quiz
questions with explanations (avoid "both/all/none of the above" wording); **four to five** interview questions; for DSA
patterns also a tips entry with a tested example.

**HTML in data strings.** `PAGE_DATA`, interview answers and tips are rendered with `innerHTML`. Use `<code>`, `<strong>`,
`<em>`, `<pre><code>` blocks, and entities (`&lt;`, `&gt;`, `&rarr;`) for symbols. Do not put `<pre>` inside `<p>`.

**Accessibility and mobile.** Buttons and links are real elements; menu/search close on Esc; the sidebar collapses behind
a toggle at 820px or narrower; header labels shrink to icons at 640px or narrower. Preserve these when editing CSS.

**Design tokens.** `css/style.css` starts with CSS variables (`--bg`, `--bg-raised`, `--bg-inset`, `--border`, `--text`,
`--text-dim`, `--text-faint`, `--accent` teal, tier colours `--beginner` green, `--intermediate` amber, `--advanced` red,
`--foundations` blue). Dark theme only. New components should reuse these tokens and existing classes (`.card`, `.chip`,
`.callout`, `.badge`, `.complexity-line`, `.code-block`).

**Punctuation and style of docs.** Plain prose. Do not add emojis. Keep docs and the manifest in sync with what exists.

---

## 8. Common tasks (recipes)

**Add a lesson to an existing topic**
1. Copy a sibling `topics/<dir>/<page>.html`, change `<title>`, `PAGE_DATA` (including `id`).
2. Add the page to a section in `js/data/site.js` (`id`, `title`, `tier`, `href`, `blurb`, optional `needs`/`related`).
3. Add 4-5 interview questions in `js/data/interview/<topicId>.js`.
4. If it is a DSA pattern: add a tips entry in `js/data/dsa-tips.js` (and rules/`confusable` entries), and a numbered
   practice list.
5. `node tools/build-search-index.js`, then run the checks (section 9). Update `todo.md`.

**Add a topic**
1. Create `topics/<dir>/index.html` (copy an existing index: hero plus `<main id="tier-sections">`, scripts
   `site.js`, `progress.js`, `site-shell.js`, `topic-index.js`).
2. Add a topic to `SITE.topics` (pick a `track`, `prereqs`, `short` label, sections); remove the matching string from the
   track's `upcoming` list.
3. Create the lessons and `js/data/interview/<topicId>.js`. Rebuild the search index. Update `todo.md`.
   Progress and search need no other wiring; the menu, homepage cards and sidebars are generated from the manifest.

**Plan a topic without building it**: add its title to a track's `upcoming` array in `site.js` and to `todo.md`.

**Change a DSA pattern's recognition data**: edit `dsa-tips.js` (`keys` drive the finder; run
`node tools/checks/tips_asserts.js`, which fails if the finder no longer ranks a disguised problem's pattern in the top 3).

**Rename or retire a lesson id**: update the manifest, all `needs`/`related`/interview keys, leave a redirect stub at the
old URL (`<meta http-equiv="refresh">`), and add a migration entry in `progress.js`.

---

## 9. Verification

Requirements: Node 18+ (developed on Node 25), **Python 3.10+** (developed on 3.12; some examples use `bisect key=` and
`int.bit_count`). One-time setup: `cd tools/checks && npm install` (installs `jsdom`). Then, from the repo root:

| Command | What it checks |
| --- | --- |
| `node tools/checks/e2e.js` | Starts its own static server on port 8961 and loads **every topic page and the homepage** in jsdom with real scripts: rendering, no script errors, sidebar, prev/next, prerequisites, menu, search (titles, full text, LeetCode numbers, coming-soon), tips and numbered problem lists on every DSA pattern, the Playbook (rules, filter, guides, finder, drill with look-alike options), interview reveal links, progress, resume banner, quiz shuffle, redirect stubs, progress migration |
| `node tools/checks/lesson_examples_check.js` | Runs every DSA lesson example (from `lesson_examples.json`) against known-answer asserts |
| `node tools/checks/tips_asserts.js` | DSA tips structure, runs every tips example and Python tip, verifies the pattern finder |
| `node tools/checks/checkcode.js` | Syntax-compiles every Python example in lesson pages and runs the self-contained ones (5 fragments in the Python topic are expected to fail to run) |
| `node tools/build-search-index.js` | Regenerates the search index |

Expected result today: all four checks pass. **Important limits:** jsdom does not lay out or paint anything, so visual
layout, mobile appearance and animations have **never been checked in a real browser**. Treat visual changes as unverified.

---

## 10. Known caveats and traps

1. **Lesson generators are not in the repo.** During development the lesson HTML for `patterns`, `integration` and the
   restructured `dsa` topic was produced by throwaway scripts kept outside the repository. **The HTML files are now the
   source of truth; edit them directly.**
2. **`tools/checks/lesson_examples.json` can go stale.** It was generated alongside the DSA lessons and holds a copy of each
   example's code plus its asserts (fields: `lesson`, `title`, `template`, `code`, `check`). If you edit a DSA lesson
   example by hand, update its entry, or the check will silently test old code. Deriving it from the HTML is a good
   improvement (see `todo.md`).
3. **`site.js` and the search index are committed artefacts**; forgetting to rebuild the index leaves body-text search stale.
4. **LeetCode data is unverified.** Problem numbers, slugs and levels were written from memory and AlgoMaster's lists;
   links were never machine-checked. Some problems are Premium (marked).
5. **The authored quiz data is biased** (correct answer mostly first). The runtime shuffle hides it; do not "fix" the
   shuffle, and do not write questions that depend on option order.
6. **Do not overwrite `.gitignore`.** It contains a large Python template; only append.
7. **Do not commit** unless the user asks; the working tree has many uncommitted changes by design.
8. **Regex lookbehind** (`(?<!...)`) is used by the Playbook finder; it needs a modern browser (Safari 16.4+).
9. **Some web sources block automated fetching** (LeetCode discuss, Medium, Towards AI return HTTP 403). Only search
   summaries were available for those; see `todo.md` section 5.
10. **Interview answers are unreviewed**, and several planned topics are large. Prefer accuracy over volume.

---

## 11. Working agreements with the user (observed)

- The user gives **short, goal-level instructions** and expects you to plan and execute end to end.
- For large design choices they like to be asked a few well-framed questions first (options with a recommendation), then
  want the whole thing built in one pass.
- They expect **verification, not assertions**: run the checks, report real numbers, say plainly what was not verified
  (for example, no browser check) and what is unverified data (LeetCode links, interview answers).
- They want documentation kept current: update `docs/todo.md` whenever topics, counts, gaps or sources change.
- They asked for real web research for content decisions and want sources listed in `todo.md`.
- Keep final messages concise and honest; list caveats and anything left uncommitted.

---

## 12. What to do next

Open `docs/todo.md`. Its suggested build order is: **AI / LLM** track first (largest gap and central to Anthropic's FDE
requirements), then **customer-facing** skills (the ambiguous case-study interview), then **engineering** topics (SQL and
APIs first), then remaining enterprise-delivery, ownership and interview-format topics. It also lists gaps inside the four
built topics (for example Python type hints, more GoF patterns, GraphQL/gRPC/SSO in integration, missing DSA patterns such as
Cyclic Sort and Two Heaps as their own lessons) and process gaps (visual QA in a real browser, verifying LeetCode links,
reviewing interview answers, CI for `tools/checks`, progress export/reset, per-topic interview practice pages).
