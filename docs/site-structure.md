# Site structure and how to extend it

For the full picture (architecture, conventions, pitfalls, verification) read [website-info.md](website-info.md) first.

Everything about the site's shape lives in one file: **`js/data/site.js`**.

```
tracks   -> ordered learning tracks (Foundations, Engineering, Enterprise delivery, AI / LLM, ...)
              each has an `upcoming` list of planned topic titles (shown in the homepage Roadmap)
topics   -> built topics, each in a track, with `prereqs` (other topic ids)
sections -> subject groups inside a topic (e.g. Creational / Structural / Behavioral)
pages    -> lessons: id, title, tier (Beginner|Intermediate|Advanced|Foundations), href, blurb,
            optional `needs` (prerequisites) and `related` (cross-links), as "topicId/pageId"
```

The homepage, top-bar menu, per-topic sidebars, search, prev/next (which continues into the next topic),
prerequisite chips, and progress counts are all generated from it. Difficulty tier is shown as a badge on each page.

## Shared scripts (loaded on every page)
| File | Role |
| --- | --- |
| `js/data/site.js` | The manifest above |
| `js/progress.js` | Quiz results in `localStorage` (`fde_progress`); keys are `topicId:pageId` |
| `js/site-shell.js` | Top bar (search / menu / progress), menu drawer, search, sidebar, prev/next, prerequisites and related links, "last visited" |
| `js/topic-page.js` | Renders a lesson from its inline `PAGE_DATA` and starts its quiz |
| `js/topic-index.js` | Renders a topic overview (cards grouped by section) |
| `js/home.js` | Homepage: resume banner, tracks, collapsed roadmap |
| `js/data/interview/<topic>.js` | Interview questions, loaded on demand per topic: `INTERVIEW["topicId/pageId"] = [{ q, a }]` (`a` is HTML) |
| `js/data/dsa-tips.js` | DSA "Tips & tricks" data: per pattern (trigger words, finder keys, disguised problems, one extra Python example with a known-answer `check`, Python tips) plus the Playbook's process, constraints table, Python toolbox and gotchas |
| `js/data/search-index.js` | Generated full-text index, includes interview text (`node tools/build-search-index.js`) |

## Add a lesson to an existing topic
1. Create `topics/<dir>/<page>.html`. Copy any sibling page and change the inline `PAGE_DATA` (see below).
2. Add `{ id, title, tier, href, blurb }` to a section of that topic in `js/data/site.js`. Optionally add `needs` / `related`.
3. Add 3-4 interview questions for it in `js/data/interview/<topicId>.js` (key `"topicId/pageId"`). They render as an "Interview questions" section above the quiz, each answer behind a "Show answer" link.
4. `node tools/build-search-index.js`

`PAGE_DATA` fields: `summary`, `keyPoints` (+ `keyHeading`), `template {heading,label,note,code}`,
`examples [{title,prompt,code,explanation,output|complexity,complexityWhy}]`, `gotchas` (+ `gotchasHeading`),
`practiceExercises`, `quiz [{question,options,correct,explanation}]`.
The older field names `recognize` (DSA) and `keyDifferences` (Python) are still understood.

## Add a new topic
1. Create `topics/<dir>/index.html` (copy an existing topic's index: hero text plus `<main id="tier-sections">`).
2. Add a topic to `topics` in `js/data/site.js` (choose its `track`, `prereqs`, sections and pages).
3. Remove the matching title from that track's `upcoming` list.
4. Create the lesson pages and a `js/data/interview/<topicId>.js` file, then `node tools/build-search-index.js`.

## Progress and resume
Progress is per browser. A lesson counts as complete when its quiz is passed (60%+).
The homepage "Continue" banner resumes the last visited lesson until it is passed, then offers the next one.

## Quizzes
Answer positions are shuffled on every attempt by `js/quiz.js`, so the order in `PAGE_DATA.quiz` does not matter.
Questions whose options refer to each other ("both of the above", "neither") keep their written order.

## Checks
`tools/checks/` has the automated checks (see [todo.md](todo.md#4-verification-that-exists-today)):
`node tools/checks/e2e.js`, `node tools/checks/lesson_examples_check.js`, `node tools/checks/tips_asserts.js`, `node tools/checks/checkcode.js` (run `npm install` in that folder once for jsdom).

## DSA: technique patterns, tips, and the Playbook
- The DSA topic is organised around **24 technique patterns** (Prefix Sum, Two Pointers, Sliding Window, Fast & Slow Pointers, Monotonic Stack, BFS, DFS, Union-Find, Dijkstra, ...), plus Big-O, the Playbook and Combining Patterns. Sections in `site.js` group them (Arrays & strings, Linked lists, Graphs & grids, ...).
- Each lesson's `practiceProblems` is a list of numbered LeetCode problems `{ n, title, slug, level, premium? }` (rendered with links, ordered easy to hard). Plain strings still work for other topics.
- Every DSA pattern lesson gets a **Tips & tricks** section (rendered by `js/site-shell.js` from `DSA_TIPS.patterns[pageId]`), placed above the interview questions. To add tips for a new pattern lesson, add an entry to `js/data/dsa-tips.js` with the same id.
- `**bold**` in a disguised problem marks the cue words; they are shown highlighted in the lesson and hidden in the Playbook drill.
- `keys` are `[substring, weight]` pairs used by the Playbook's pattern finder. Matching is case-insensitive and must start at a word boundary. Run `node tools/checks/tips_asserts.js` after editing: it re-runs every Python example and confirms the finder still ranks each disguised problem's pattern in the top 3.
- `topics/dsa/playbook.html` is a hand-written page (like the Big-O lesson). Its rules (`general.rules`), decision guides (`byShape`, `byQuestion`), catalog, finder, toolbox, gotchas and drill quiz are all generated from `dsa-tips.js`, so it stays in sync. `general.confusable` lists look-alike patterns used as the wrong answers in the drill.
- Retired lesson URLs (`linked-list`, `graphs`, `advanced-graphs`) are redirect stubs, and `js/progress.js` migrates any saved progress to their successors.
