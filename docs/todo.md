# Todo

Status of the Becoming FDE site: what is built, what is missing, and known gaps.
Project briefing for AI assistants: [website-info.md](website-info.md). Site structure and how to add things: [site-structure.md](site-structure.md).

**Built (4 topics, 64 lessons, 259 interview questions):** Python for Java Developers (14), Data Structures & Algorithms (27),
Design Patterns in Python (13), Enterprise Integration (10). Every lesson has a quiz and 4-5 interview questions. The DSA topic is organised around 24 technique patterns (plus Big-O, the Pattern Recognition Playbook and Combining Patterns). Each pattern has a "Tips & tricks" section (trigger words, disguised problems, one extra Python example, Python tips) and a numbered LeetCode list with links.

Planned topics live in `js/data/site.js` (each track's `upcoming` list) and show in the homepage Roadmap.
To ship one: build the pages, add the topic with sections to `site.js`, remove it from `upcoming`, add its interview
questions (`js/data/interview/<topic>.js`), then run `node tools/build-search-index.js`.

---

## 1. Missing topics (not built yet)

### Engineering track
- [ ] SQL: Window Functions, CTEs & Optimization
- [ ] Practical Coding & Debugging Integrations
- [ ] Full-Stack Prototyping
- [ ] Git, CLI & Testing
- [ ] APIs: REST, GraphQL, Streaming & Auth Flows
- [ ] Data Pipelines & ETL/ELT
- [ ] Modern Data Stack
- [ ] Cloud: AWS, GCP & Azure
- [ ] Containers & CI/CD
- [ ] System Design for Enterprise Workloads
- [ ] Rate Limiting & Distributed Coordination
- [ ] Observability & Monitoring
- [ ] Incident Response

### Enterprise delivery track (the core Enterprise Integration topic is built)
- [ ] Security & Compliance
- [ ] White-Glove Implementation
- [ ] AI Deployment Patterns
- [ ] Vertical Knowledge

### AI / LLM track
- [ ] Production LLMs & Prompt Engineering
- [ ] Agents, Orchestration & Tool Use
- [ ] MCP Servers, Sub-agents & Agent Skills
- [ ] RAG: Chunking, Embeddings & Reranking
- [ ] Fine-tuning vs RAG vs Prompting
- [ ] Evals & Evaluation Frameworks
- [ ] Guardrails, Safety & Drift Monitoring
- [ ] LLM Cost, Latency & Reliability

### Customer-facing & ownership track
- [ ] Discovery & Requirements Elicitation
- [ ] Problem Decomposition Under Ambiguity
- [ ] Stakeholder & Executive Communication
- [ ] Product Sense & Cross-Customer Patterns
- [ ] Customer Empathy & Diagnostic Questioning
- [ ] Delivering Bad News
- [ ] Handling Disagreement & De-escalation
- [ ] High Agency & End-to-End Ownership
- [ ] Cross-Functional Collaboration
- [ ] Documenting Repeatable Deployments
- [ ] Rapid Prototyping & MVP Scoping
- [ ] Expansion Opportunities
- [ ] On-Site Work & Travel
- [ ] AI Safety Mission Alignment

### Interview prep track
- [ ] Ambiguous Case Study
- [ ] Practical Coding Rounds
- [ ] System Design for Integrations
- [ ] Behavioral & Ownership Stories
- [ ] Company-Specific Prep

### Suggested build order
1. AI / LLM: biggest gap, and a core requirement in Anthropic's FDE postings.
2. Customer-facing: the signature interview round (ambiguous case study).
3. Engineering: SQL and APIs first.
4. Remaining enterprise delivery, ownership, and interview formats.

---

## 2. Gaps inside the topics already built

These were planned or are commonly needed but did not make it in.

### Python for Java Developers
- [ ] **Type hints & `typing`**: I planned to fold this into "Control Flow & Functions" but it was never written. It needs its own page (hints, `Optional`, `Protocol`, mypy).
- [ ] **Java ↔ Python cheat sheet**: planned as a beginner reference page, dropped.
- [ ] `dataclasses`, `enum`, and `pathlib`
- [ ] File I/O, JSON, and CSV handling
- [ ] Testing with `pytest` (fixtures, parametrize, mocking)
- [ ] `logging` module (only touched on in the integration security page)
- [ ] `asyncio` hands-on (only compared with threads and processes today)
- [ ] Regular expressions
- [ ] Modern packaging and tooling: `pyproject.toml`, `uv`/Poetry, `ruff`, `black`

### Data Structures & Algorithms
The 24 patterns follow the union of AlgoMaster's 20 patterns and the CodeAndDebug cheat sheet. Still missing:
- [ ] Patterns from the "~30" list that were left out: Cyclic Sort, Two Heaps (median is only an example inside Top K), K-way Merge (only an example inside Top K), Kadane's algorithm (mentioned in the rules, no lesson), Dutch national flag, sweep line
- [ ] Math & geometry problems, and segment tree / Fenwick tree (optional advanced)
- [ ] Topological sort covers Kahn's algorithm in depth but the DFS-based version only in interview questions
- [ ] Each lesson has 2 worked examples plus 1 tips example. Add more practice with solutions, and "the interviewer changes the constraints" follow-ups
- [ ] The Playbook and Tips cannot recognise patterns that have no lesson (see the first item)
- [ ] Only 48 disguised problems (2 per pattern). The Playbook drill picks 10 random patterns with look-alike wrong answers; more problems would improve it
- [ ] The Big-O lesson has no tips section (the Playbook's constraints table covers that ground)
- [ ] Two sources that were requested (LeetCode discuss "15 essential DSA patterns", Medium roadmap by Shivanjali Verma) and one more (Towards AI "15 DSA patterns") blocked automated reading (HTTP 403). Only their search summaries were used. If they contain patterns or rules not covered here, paste them and they can be added

### Design Patterns
- [ ] Abstract Factory, Template Method, Chain of Responsibility, Composite, Iterator, Mediator, Memento, Prototype, Flyweight, Bridge, Visitor, Null Object
- [ ] Repository / Unit of Work (common in enterprise Python)
- [ ] SOLID principles page, and a "pick the right pattern" decision guide

### Enterprise Integration
- [ ] GraphQL and gRPC clients
- [ ] OAuth2 authorization-code flow, OIDC, and SSO/SAML in practice
- [ ] Change data capture and streaming (Kafka) in more depth
- [ ] SFTP / managed file transfer hands-on
- [ ] Testing integrations: sandboxes, contract tests, recorded HTTP responses, fakes
- [ ] API versioning and deprecation, gateways, iPaaS tools
- [ ] Data validation with JSON Schema / pydantic
- [ ] Reconciliation as a deep dive (checksums, tolerances, exception queues)

---

## 3. Process and quality gaps found while building

- [ ] **LeetCode problem numbers, slugs and difficulty levels were written from memory** (cross-checked against AlgoMaster's lists), and the links are not machine-verified. Spot-check them, or add a link checker that follows each `https://leetcode.com/problems/<slug>/` (LeetCode may block automated requests).
- [ ] **Lesson generators are not in the repo.** The `patterns`, `integration` and restructured `dsa` lesson pages were produced by scripts kept outside the repository, so the HTML is now the only source. Either keep it that way (edit HTML directly) or check a small generator into `tools/`.
- [ ] **`tools/checks/lesson_examples.json` is a hand-synced copy** of the DSA example code plus asserts. Editing a lesson example without updating it makes the check test stale code. Derive it from the lesson HTML (extract `PAGE_DATA.examples`, keep the asserts in a separate file).
- [ ] **Never checked visually in a real browser.** The Chrome extension was not connected, so layout, mobile behaviour, the menu drawer and the search overlay have only been tested in jsdom. Do a manual pass at desktop width and at about 390px.
- [ ] **Quiz answers were 91% option A** in the authored data (253 of 278). The quiz engine now shuffles options on every attempt (10 questions with "both of the above" style wording keep their written order). Longer term, rewrite the authored data so the correct answer is not always first, and reword those 10 positional questions.
- [ ] **Interview answers were written by me from web-research themes, not copied.** Have a human review the 259 answers for accuracy before relying on them, especially version-specific claims (for example the CPython free-threaded build status).
- [ ] The pattern finder on the Playbook is a keyword-weight heuristic. It ranks the right pattern first for 49 of 51 test prompts and top 3 for the rest, but real problems that lack the trigger words will be missed. Treat it as a training aid; keep its wording as "hints, not verdicts".
- [ ] Interview questions exist per lesson only. Consider a per-topic "Interview practice" page that aggregates them, with level tags (junior/mid/senior).
- [ ] Every new topic needs its own `js/data/interview/<topic>.js` file (see site-structure.md).
- [ ] Progress is per-browser `localStorage` only: no reset button, export/import, or cross-device sync.
- [ ] No light theme and no print stylesheet.
- [ ] No page metadata for sharing/SEO (meta descriptions, Open Graph tags, sitemap).
- [ ] The search index is one 247 KB file loaded on first search. Split it per topic if it grows.
- [ ] Nothing is committed yet. Review `git status` and commit the new topics, shell, and docs. The DSA restructure deletes nothing from git history: the old lesson pages `linked-list`, `graphs` and `advanced-graphs` remain as redirect stubs.
- [ ] Add a CI job (GitHub Actions) that runs `tools/checks/*` on every push.

## 4. Verification that exists today

Run from `tools/checks` (`npm install` once, for jsdom):
- `node e2e.js`: loads all 68 topic pages plus the homepage in jsdom; checks rendering, menu, search, prerequisites, prev/next, tips & tricks and numbered LeetCode lists on every DSA pattern, the Playbook (rules and filter, both decision guides, catalog, pattern finder, look-alike drill), the retired-lesson redirects, the progress migration, interview reveal links, progress, the resume banner, and quiz shuffling.
- `node checkcode.js`: syntax-compiles every Python example in the lessons and runs the self-contained ones (5 Python-lesson fragments that need surrounding context are expected to fail to run).
- `node lesson_examples_check.js`: runs all 53 DSA lesson examples against known-answer asserts (`lesson_examples.json` is generated with the lessons). Mutation-tested: a deliberately wrong answer or bug makes it fail.
- `node tips_asserts.js`: for the DSA Tips data, checks every pattern has cues, finder keys, 2+ disguised problems, an example and 3+ Python tips; runs all 112 Python snippets (each pattern's extra example has a known-answer `check`); and verifies the finder ranks the right pattern in the top 3 for every disguised problem.

## 5. Sources used for topic research
- [Anthropic: Forward Deployed Engineer](https://job-boards.greenhouse.io/anthropic/jobs/5302966008)
- [Anthropic: Forward Deployed Engineer, Applied AI](https://job-boards.greenhouse.io/anthropic/jobs/4985877008)
- [Aced: FDE Interview Guide](https://www.tryexponent.com/blog/forward-deployed-engineer-interview-the-definitive-2026-guide-fde)
- [Aced: What Is a Forward Deployed Engineer?](https://www.tryexponent.com/blog/what-is-a-forward-deployed-engineer)
- [Salesforce: 5 Skills for This New Role](https://www.salesforce.com/blog/forward-deployed-engineer/)
- [GeeksforGeeks: FDE Role, Skills, Salary & Roadmap](https://www.geeksforgeeks.org/blogs/forward-deployed-engineer-role-skills-salary-roadmap/)
- [OpenAI FDE Interview Guide](https://www.tryexponent.com/guides/openai-forward-deployed-engineer-interview)

## 6. Sources used for interview-question themes
- [Interview Cake: Python interview questions](https://www.interviewcake.com/python-interview-questions)
- [InterviewBit: Python interview questions](https://www.interviewbit.com/python-interview-questions/)
- [TechInterview: Python interview questions (generators, decorators, GIL, memory)](https://www.techinterview.org/post/3233474450/python-interview-questions-2025-generators-decorators-async-await-type-hints-dataclasses-concurrency-gil-memory-management/)
- [Thita: Top 50 coding interview questions with patterns](https://thita.ai/blog/interview/top-50-most-asked-coding-interview-questions-in-2026-with-patterns)
- [DataCamp: Top programming interview questions](https://www.datacamp.com/blog/top-programming-interview-questions)
- [GeeksforGeeks: Design patterns interview questions](https://www.geeksforgeeks.org/system-design/top-design-patterns-interview-questions/)
- [InterviewBit: Design patterns interview questions](https://www.interviewbit.com/design-patterns-interview-questions/)
- [Hello Interview: Low-level design patterns](https://www.hellointerview.com/learn/low-level-design/in-a-hurry/patterns)
- [startup.jobs: Integration engineer interview questions](https://startup.jobs/interview-questions/integration-engineer)
- [System Design School: Webhook system design](https://systemdesignschool.io/problems/webhook/solution)
- [System Design Handbook: Design a webhook system](https://www.systemdesignhandbook.com/guides/design-a-webhook-system/)

## 7. Sources used for the DSA tips, playbook and Python tips
- [Educative: 10+ top LeetCode patterns](https://www.educative.io/blog/coding-interview-leetcode-patterns)
- [DEV Community: Coding interview patterns, the 15 essential patterns](https://dev.to/matt_frank_usa/coding-interview-patterns-the-15-essential-patterns-n44)
- [DesignGurus: 10 top LeetCode patterns](https://www.designgurus.io/blog/top-lc-patterns)
- [Grokking the Coding Interview: the NeetCode roadmap and the pattern behind each topic](https://www.grokkingthecodinginterview.com/blog/neetcode-roadmap)
- [Educative: Using Python for algorithms in coding interviews](https://www.educative.io/blog/using-python-for-algorithms-in-coding-interview)
- [intervu.dev: Python coding interview cheat sheet](https://intervu.dev/blog/python-coding-interview-cheatsheet/)
- [SpaceComplexity: Python built-in data structures for coding interviews](https://spacecomplexity.ai/blog/python-built-in-data-structures-interview)
- [Boot.dev: Python / vs // (floor division)](https://www.boot.dev/blog/python/python-floor-division)
- [AlgoMonster: Runtime to algorithm cheat sheet](https://algo.monster/problems/runtime_summary)
- [Tech Interview Handbook: Algorithms study cheatsheet](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/)
- [GeeksforGeeks: Knowing the complexity in competitive programming](https://www.geeksforgeeks.org/dsa/knowing-the-complexity-in-competitive-programming/)
- [AlgoMaster: 20 DSA patterns](https://blog.algomaster.io/p/20-dsa-patterns) (read in full; pattern list, structure, LeetCode problem lists)
- [CodeAndDebug: DSA interview cheat sheet](https://codeanddebug.in/blog/dsa-interview-cheat-sheet/) (read in full; 13 patterns and "if you see X, think Y" rules)
- [LeetCode discuss: 15 essential DSA patterns](https://leetcode.com/discuss/post/7347258/15-essential-dsa-patterns-for-tech-inter-nxem/) (blocked, search summary only)
- [Medium: DSA pattern-wise roadmap (Shivanjali Verma)](https://medium.com/@id.shivanjali/dsa-pattern-wise-roadmap-f92f38a9e83d) (blocked, search summary only)
- [Towards AI: The 15 DSA patterns that unlock every coding problem](https://pub.towardsai.net/the-15-dsa-patterns-that-unlock-every-coding-problem-13a55a5960da) (blocked, search summary only)
