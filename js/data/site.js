// Single source of truth for site structure.
// tracks -> topics -> sections -> pages. Everything (homepage, top-bar menu,
// sidebars, search, prev/next, prerequisites) reads this file.
//
// To add a page:    add it to a topic's section here, then create topics/<dir>/<href>.
// To add a topic:   add an entry to "topics" (with sections) and list it in a track.
// To plan a topic:  add its title to a track's "upcoming" list (shown in the Roadmap).
// "needs" = prerequisites, "related" = cross-links; both use "topicId/pageId" keys.
const SITE = {
  tracks: [
    {
      id: "foundations",
      title: "Foundations",
      blurb: "The language and the interview fundamentals everything else builds on.",
      upcoming: [],
    },
    {
      id: "engineering",
      title: "Engineering",
      blurb: "Core engineering craft: patterns, data, cloud, and systems.",
      upcoming: [
        "SQL: Window Functions, CTEs & Optimization",
        "Practical Coding & Debugging Integrations",
        "Full-Stack Prototyping",
        "Git, CLI & Testing",
        "APIs: REST, GraphQL, Streaming & Auth Flows",
        "Data Pipelines & ETL/ELT",
        "Modern Data Stack",
        "Cloud: AWS, GCP & Azure",
        "Containers & CI/CD",
        "System Design for Enterprise Workloads",
        "Rate Limiting & Distributed Coordination",
        "Observability & Monitoring",
        "Incident Response",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise delivery",
      blurb: "Connecting to and shipping inside a customer's environment.",
      upcoming: [
        "Security & Compliance",
        "White-Glove Implementation",
        "AI Deployment Patterns",
        "Vertical Knowledge",
      ],
    },
    {
      id: "ai",
      title: "AI / LLM",
      blurb: "Building and operating production LLM systems.",
      upcoming: [
        "Production LLMs & Prompt Engineering",
        "Agents, Orchestration & Tool Use",
        "MCP Servers, Sub-agents & Agent Skills",
        "RAG: Chunking, Embeddings & Reranking",
        "Fine-tuning vs RAG vs Prompting",
        "Evals & Evaluation Frameworks",
        "Guardrails, Safety & Drift Monitoring",
        "LLM Cost, Latency & Reliability",
      ],
    },
    {
      id: "customer",
      title: "Customer-facing & ownership",
      blurb: "Discovery, communication, and owning outcomes end to end.",
      upcoming: [
        "Discovery & Requirements Elicitation",
        "Problem Decomposition Under Ambiguity",
        "Stakeholder & Executive Communication",
        "Product Sense & Cross-Customer Patterns",
        "Customer Empathy & Diagnostic Questioning",
        "Delivering Bad News",
        "Handling Disagreement & De-escalation",
        "High Agency & End-to-End Ownership",
        "Cross-Functional Collaboration",
        "Documenting Repeatable Deployments",
        "Rapid Prototyping & MVP Scoping",
        "Expansion Opportunities",
        "On-Site Work & Travel",
        "AI Safety Mission Alignment",
      ],
    },
    {
      id: "interview",
      title: "Interview prep",
      blurb: "The formats you will actually face.",
      upcoming: [
        "Ambiguous Case Study",
        "Practical Coding Rounds",
        "System Design for Integrations",
        "Behavioral & Ownership Stories",
        "Company-Specific Prep",
      ],
    },
  ],

  topics: [
    {
      id: "python",
      dir: "python",
      track: "foundations",
      short: "Python",
      title: "Python for Java Developers",
      tagline: "Syntax translation, idioms, and the setup basics. Start here.",
      prereqs: [],
      sections: [
        {
          name: "Setup",
          pages: [
            { id: "environment", title: "Environment & Running Python", tier: "Foundations", href: "environment.html", blurb: "venv, pip, requirements.txt, and every way to run Python" },
          ],
        },
        {
          name: "Language basics",
          pages: [
            { id: "syntax-variables", title: "Syntax & Variables", tier: "Beginner", href: "syntax-variables.html", blurb: "Indentation, dynamic typing, names vs objects" },
            { id: "numbers-strings", title: "Numbers & Strings", tier: "Beginner", href: "numbers-strings.html", blurb: "Big ints, f-strings, slicing, join" },
            { id: "lists-tuples", title: "Lists & Tuples", tier: "Beginner", href: "lists-tuples.html", blurb: "ArrayList and its Pythonic cousin, plus tuples" },
            { id: "dicts-sets", title: "Dicts & Sets", tier: "Beginner", href: "dicts-sets.html", blurb: "HashMap/HashSet with literals and set algebra" },
            { id: "control-functions", title: "Control Flow & Functions", tier: "Beginner", href: "control-functions.html", blurb: "for-in, match, defaults, *args/**kwargs" },
          ],
        },
        {
          name: "Idiomatic Python",
          pages: [
            { id: "comprehensions", title: "Comprehensions", tier: "Intermediate", href: "comprehensions.html", blurb: "Replace loop-plus-append with one expression" },
            { id: "oop", title: "OOP in Python", tier: "Intermediate", href: "oop.html", blurb: "Classes, dunder methods, duck typing", related: ["patterns/patterns-overview"] },
            { id: "exceptions", title: "Exceptions & EAFP", tier: "Intermediate", href: "exceptions.html", blurb: "try/except/else/finally and EAFP", related: ["integration/resilience"] },
            { id: "functional", title: "Functional Python", tier: "Advanced", href: "functional.html", blurb: "Lambdas, closures, decorators", related: ["patterns/strategy", "patterns/decorator-pattern"] },
            { id: "iterators-generators", title: "Iterators, Generators & Context Managers", tier: "Advanced", href: "iterators-generators.html", blurb: "yield, lazy sequences, with-statements", related: ["integration/rest-clients"] },
          ],
        },
        {
          name: "Tooling & runtime",
          pages: [
            { id: "modules-packages", title: "Modules, Packages & pip", tier: "Intermediate", href: "modules-packages.html", blurb: "Imports, packages, __main__, pip", related: ["patterns/singleton"] },
            { id: "stdlib-dsa", title: "Stdlib Essentials for DSA", tier: "Intermediate", href: "stdlib-dsa.html", blurb: "Counter, deque, heapq, itertools, lru_cache", related: ["dsa/heap", "dsa/arrays-hashing", "dsa/dp-1d", "dsa/stack"] },
            { id: "concurrency-memory", title: "Concurrency, Memory & Java-Dev Gotchas", tier: "Advanced", href: "concurrency-memory.html", blurb: "The GIL, reference counting, == vs is", related: ["patterns/singleton"] },
          ],
        },
      ],
    },
    {
      id: "dsa",
      dir: "dsa",
      track: "foundations",
      short: "DSA",
      title: "Data Structures & Algorithms",
      tagline: "24 technique patterns with signals, templates and numbered LeetCode lists, plus a recognition playbook.",
      prereqs: ["python"],
      sections: [
        {
          name: "Foundations",
          pages: [
            { id: "complexity", title: "Big O: Time & Space Complexity", tier: "Foundations", href: "complexity.html", blurb: "Read and derive time and space complexity", needs: ["python/syntax-variables"], related: ["python/numbers-strings"] },
            { id: "playbook", title: "Pattern Recognition Playbook", tier: "Foundations", href: "playbook.html", blurb: "If you see X, think Y: rules, decision guides, constraints, Python toolbox", needs: ["dsa/complexity", "python/stdlib-dsa"], related: ["python/numbers-strings", "dsa/combining-patterns"] },
          ],
        },
        {
          name: "Arrays & strings",
          pages: [
            { id: "arrays-hashing", title: "Hashing & Frequency Counting", tier: "Beginner", href: "arrays-hashing.html", blurb: "Seen-sets, counters, complements, anagram keys", needs: ["python/lists-tuples", "python/dicts-sets"], related: ["dsa/prefix-sum"] },
            { id: "prefix-sum", title: "Prefix Sum", tier: "Beginner", href: "prefix-sum.html", blurb: "Running totals for range sums and subarray-sum counting", needs: ["dsa/arrays-hashing"], related: ["dsa/sliding-window", "python/stdlib-dsa"] },
            { id: "two-pointers", title: "Two Pointers", tier: "Beginner", href: "two-pointers.html", blurb: "Converging or same-direction pointers on sorted data" },
            { id: "sliding-window", title: "Sliding Window", tier: "Intermediate", href: "sliding-window.html", blurb: "Fixed and variable windows over contiguous ranges", needs: ["dsa/two-pointers"] },
            { id: "intervals", title: "Overlapping Intervals", tier: "Intermediate", href: "intervals.html", blurb: "Sort, then sweep: merge, insert, schedule", related: ["dsa/greedy"] },
          ],
        },
        {
          name: "Search & numbers",
          pages: [
            { id: "binary-search", title: "Binary Search & Modified Binary Search", tier: "Beginner", href: "binary-search.html", blurb: "Halve the space: sorted, rotated, and search on the answer", related: ["dsa/combining-patterns", "python/stdlib-dsa"] },
            { id: "bit-manipulation", title: "Bit Manipulation", tier: "Intermediate", href: "bit-manipulation.html", blurb: "XOR tricks, masks, powers of two, counting bits" },
          ],
        },
        {
          name: "Linked lists",
          pages: [
            { id: "fast-slow-pointers", title: "Fast & Slow Pointers", tier: "Beginner", href: "fast-slow-pointers.html", blurb: "Cycle detection, the middle, n-th from the end", related: ["dsa/linked-list-reversal"] },
            { id: "linked-list-reversal", title: "Linked List In-place Reversal", tier: "Intermediate", href: "linked-list-reversal.html", blurb: "Reverse all, part, pairs; palindrome and reorder", needs: ["dsa/fast-slow-pointers"] },
          ],
        },
        {
          name: "Stacks & heaps",
          pages: [
            { id: "stack", title: "Stack (Matching & Undo)", tier: "Beginner", href: "stack.html", blurb: "Brackets, nested structure, undo, postfix, Min Stack", needs: ["python/lists-tuples"], related: ["dsa/monotonic-stack", "python/stdlib-dsa"] },
            { id: "monotonic-stack", title: "Monotonic Stack", tier: "Intermediate", href: "monotonic-stack.html", blurb: "Next greater/smaller, spans, histograms in O(n)", needs: ["dsa/stack"] },
            { id: "heap", title: "Top K Elements (Heap)", tier: "Intermediate", href: "heap.html", blurb: "k-th, top k, k closest, merge k, running median", needs: ["python/stdlib-dsa"], related: ["dsa/shortest-path", "python/stdlib-dsa"] },
          ],
        },
        {
          name: "Trees",
          pages: [
            { id: "trees", title: "Binary Tree Traversal", tier: "Intermediate", href: "trees.html", blurb: "DFS orders, level order, and subtree answers", related: ["dsa/dfs", "dsa/bfs"] },
            { id: "tries", title: "Prefix Search (Trie)", tier: "Intermediate", href: "tries.html", blurb: "Autocomplete, prefix and wildcard search", related: ["dsa/backtracking"] },
          ],
        },
        {
          name: "Graphs & grids",
          pages: [
            { id: "dfs", title: "Depth-First Search (DFS)", tier: "Intermediate", href: "dfs.html", blurb: "Components, cycles, cloning and path enumeration", related: ["dsa/bfs"] },
            { id: "bfs", title: "Breadth-First Search (BFS)", tier: "Intermediate", href: "bfs.html", blurb: "Fewest steps, levels, multi-source spreading" },
            { id: "matrix-traversal", title: "Matrix Traversal", tier: "Intermediate", href: "matrix-traversal.html", blurb: "Grids as graphs: islands, regions, spiral, rotate", needs: ["dsa/dfs", "dsa/bfs"] },
            { id: "topological-sort", title: "Topological Sort", tier: "Advanced", href: "topological-sort.html", blurb: "Dependency order with Kahn's algorithm", needs: ["dsa/dfs"] },
            { id: "union-find", title: "Union-Find", tier: "Advanced", href: "union-find.html", blurb: "Merge groups and test connectivity in near-constant time", needs: ["dsa/dfs"] },
            { id: "shortest-path", title: "Shortest Path (Dijkstra)", tier: "Advanced", href: "shortest-path.html", blurb: "Weighted routes, Bellman-Ford and k-stop limits", needs: ["dsa/bfs", "dsa/heap"] },
          ],
        },
        {
          name: "Recursion & optimization",
          pages: [
            { id: "backtracking", title: "Backtracking", tier: "Advanced", href: "backtracking.html", blurb: "Choose, explore, unchoose: subsets, permutations, partitions" },
            { id: "greedy", title: "Greedy", tier: "Advanced", href: "greedy.html", blurb: "Locally best choices that provably compose" },
            { id: "dp-1d", title: "Dynamic Programming: 1-D", tier: "Advanced", href: "dp-1d.html", blurb: "Overlapping subproblems along a sequence", needs: ["python/stdlib-dsa"], related: ["dsa/dp-2d", "dsa/backtracking"] },
            { id: "dp-2d", title: "Dynamic Programming: 2-D", tier: "Advanced", href: "dp-2d.html", blurb: "Two-index tables: LCS, edit distance, knapsack", needs: ["dsa/dp-1d"] },
          ],
        },
        {
          name: "Putting it together",
          pages: [
            { id: "combining-patterns", title: "Combining Patterns", tier: "Advanced", href: "combining-patterns.html", blurb: "Binary search + greedy, DFS + memo, trie + backtracking, and more", needs: ["dsa/binary-search", "dsa/dfs", "dsa/sliding-window"] },
          ],
        },
      ],
    },
    {
      id: "patterns",
      dir: "patterns",
      track: "engineering",
      short: "Patterns",
      title: "Design Patterns in Python",
      tagline: "Singleton, Factory, Strategy, Observer and more: the textbook form and the Pythonic form.",
      prereqs: ["python"],
      sections: [
        {
          name: "Overview",
          pages: [
            { id: "patterns-overview", title: "Patterns, the Pythonic Way", tier: "Foundations", href: "patterns-overview.html", blurb: "Which patterns Python makes trivial, and which it still needs", needs: ["python/oop"] },
          ],
        },
        {
          name: "Creational",
          pages: [
            { id: "singleton", title: "Singleton", tier: "Beginner", href: "singleton.html", blurb: "Creational — one shared instance", needs: ["python/modules-packages"] },
            { id: "factory", title: "Factory", tier: "Beginner", href: "factory.html", blurb: "Creational — decouple creation from use", related: ["patterns/builder"] },
            { id: "builder", title: "Builder", tier: "Intermediate", href: "builder.html", blurb: "Creational — construct complex objects step by step", needs: ["python/oop"] },
          ],
        },
        {
          name: "Structural",
          pages: [
            { id: "adapter", title: "Adapter", tier: "Intermediate", href: "adapter.html", blurb: "Structural — make incompatible interfaces fit", related: ["integration/data-mapping", "integration/legacy-systems"] },
            { id: "decorator-pattern", title: "Decorator", tier: "Intermediate", href: "decorator-pattern.html", blurb: "Structural — add behavior by wrapping", needs: ["python/functional"] },
            { id: "facade", title: "Facade", tier: "Intermediate", href: "facade.html", blurb: "Structural — one simple entry point to a messy subsystem", related: ["integration/integration-styles"] },
            { id: "proxy", title: "Proxy", tier: "Advanced", href: "proxy.html", blurb: "Structural — control access, cache, or lazy-load", related: ["patterns/decorator-pattern"] },
          ],
        },
        {
          name: "Behavioral",
          pages: [
            { id: "strategy", title: "Strategy", tier: "Beginner", href: "strategy.html", blurb: "Behavioral — swap algorithms at runtime", needs: ["python/functional"], related: ["integration/resilience"] },
            { id: "observer", title: "Observer", tier: "Beginner", href: "observer.html", blurb: "Behavioral — publish/subscribe inside a process", related: ["integration/messaging", "integration/webhooks"] },
            { id: "command", title: "Command", tier: "Intermediate", href: "command.html", blurb: "Behavioral — turn actions into objects", related: ["integration/messaging", "integration/resilience"] },
            { id: "state", title: "State", tier: "Advanced", href: "state.html", blurb: "Behavioral — behavior that changes with internal state" },
          ],
        },
        {
          name: "Architecture",
          pages: [
            { id: "dependency-injection", title: "Dependency Injection", tier: "Advanced", href: "dependency-injection.html", blurb: "Architecture — pass collaborators in, don't build them", related: ["patterns/singleton"] },
          ],
        },
      ],
    },
    {
      id: "integration",
      dir: "integration",
      track: "enterprise",
      short: "Integration",
      title: "Enterprise Integration",
      tagline: "REST clients, auth, webhooks, queues, batch files, legacy systems, resilience.",
      prereqs: ["python", "patterns"],
      sections: [
        {
          name: "Fundamentals",
          pages: [
            { id: "integration-styles", title: "Integration Styles & Landscape", tier: "Foundations", href: "integration-styles.html", blurb: "API, events, files, database — and how to choose", related: ["integration/messaging", "integration/batch-files"] },
          ],
        },
        {
          name: "Transport",
          pages: [
            { id: "rest-clients", title: "Calling REST APIs Reliably", tier: "Beginner", href: "rest-clients.html", blurb: "Timeouts, retries, pagination, rate limits", needs: ["python/exceptions"], related: ["integration/resilience"] },
            { id: "authentication", title: "API Authentication", tier: "Beginner", href: "authentication.html", blurb: "API keys, bearer tokens, OAuth2 client credentials", needs: ["integration/rest-clients"] },
            { id: "webhooks", title: "Webhooks", tier: "Beginner", href: "webhooks.html", blurb: "Receiving events safely: signatures and replays", needs: ["integration/authentication"], related: ["integration/resilience"] },
          ],
        },
        {
          name: "Messaging & batch",
          pages: [
            { id: "messaging", title: "Queues & Event-Driven Integration", tier: "Intermediate", href: "messaging.html", blurb: "Decoupling systems with messages", needs: ["integration/webhooks"] },
            { id: "batch-files", title: "Batch & File-Based Integration", tier: "Intermediate", href: "batch-files.html", blurb: "CSV/SFTP drops, validation, dead-letter files", needs: ["python/stdlib-dsa"], related: ["integration/data-mapping"] },
          ],
        },
        {
          name: "Legacy & data",
          pages: [
            { id: "legacy-systems", title: "Legacy Systems: SOAP, XML & Databases", tier: "Intermediate", href: "legacy-systems.html", blurb: "Integrating with what the customer already has", needs: ["python/modules-packages"] },
            { id: "data-mapping", title: "Data Mapping & Anti-Corruption Layers", tier: "Advanced", href: "data-mapping.html", blurb: "Canonical models and schema drift", needs: ["patterns/adapter"] },
          ],
        },
        {
          name: "Reliability & security",
          pages: [
            { id: "resilience", title: "Resilience: Idempotency, Backoff & Circuit Breakers", tier: "Advanced", href: "resilience.html", blurb: "Surviving flaky, slow, or duplicate-delivering systems", needs: ["integration/rest-clients", "integration/messaging"] },
            { id: "security-observability", title: "Security, Secrets & Observability", tier: "Advanced", href: "security-observability.html", blurb: "What customer security reviews will ask for", needs: ["integration/authentication"], related: ["integration/authentication"] },
          ],
        },
      ],
    },
  ],
};
