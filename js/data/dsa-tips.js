// Tips & tricks for recognising and applying each DSA pattern. Single source for:
//   - the "Tips & tricks" section on every DSA pattern lesson (rendered by js/site-shell.js)
//   - the Pattern Recognition Playbook lesson (rules, guides, catalog table, pattern finder, drill quiz)
//
// general:  steps, constraints, toolbox, pitfalls, rules ([if you see, think, pattern ids]),
//           byShape and byQuestion decision guides
// Per pattern:
//   ask      one question to ask yourself when reading a problem
//   cues     trigger words/phrases, shown to the reader
//   keys     [substring, weight] pairs the pattern finder matches (lowercase, word-boundary start)
//   notWhen  when this pattern is the wrong tool
//   spot     disguised problem statements; **bold** marks the cue words
//   example  one more worked problem in Python (code + check; `check` is run by tools/checks/tips_asserts.js)
//   python   Python-specific tips (run:false marks illustrative fragments)
window.DSA_TIPS = {
  general: {
    steps: [
      "Restate the problem and ask about edge cases: empty input, duplicates, negatives, very large values. Confirm input and output types, and whether you may modify the input.",
      "Read the constraints. They tell you the complexity you are aiming for (table below).",
      "Look for keywords and structure, name the pattern out loud, and say why.",
      "Start with the brute force and state its complexity. Then say which pattern removes which cost.",
      "Write the simplest correct version, then trace it on a small example and on an edge case.",
      "State time and space complexity, and mention trade-offs and follow-ups.",
    ],
    constraints: [
      ["n up to about 10", "O(n!) or O(2ⁿ · n)", "Brute-force permutations, backtracking"],
      ["n up to about 20", "O(2ⁿ)", "Subsets, bitmask, backtracking"],
      ["n up to about 100", "O(n³)", "Triple loops, Floyd–Warshall, small DP tables"],
      ["n up to 1,000 to 5,000", "O(n²)", "Two-index DP, all pairs"],
      ["n up to 10⁵ to 10⁶", "O(n log n) or O(n)", "Sorting, heap, binary search, sliding window, hashing"],
      ["n up to 10⁹ or more", "O(log n) or O(1)", "Binary search on the answer, math"],
    ],
    constraintsNote: "A rule of thumb is about 10⁸ simple operations per second in a compiled language. CPython does noticeably fewer, so stay well below that when you write Python. Treat the table as a hint, not a proof.",
    toolbox: [
      {
        name: "collections.Counter",
        use: "Frequencies, anagram checks, top-k by count",
        code: `from collections import Counter
Counter("listen") == Counter("silent")   # True
Counter("mississippi").most_common(2)     # [('i', 4), ('s', 4)]`,
      },
      {
        name: "collections.defaultdict",
        use: "Grouping and adjacency lists without key checks",
        code: `from collections import defaultdict
graph = defaultdict(list)
graph["a"].append("b")   # no KeyError on first use`,
      },
      {
        name: "collections.deque",
        use: "BFS queues and monotonic queues, O(1) at both ends",
        code: `from collections import deque
q = deque([1, 2, 3])
q.popleft(); q.appendleft(0)`,
      },
      {
        name: "heapq",
        use: "Min-heap, top-k, merge k, Dijkstra",
        code: `import heapq
h = [5, 1, 3]
heapq.heapify(h)
heapq.heappop(h)          # 1
heapq.nlargest(2, [5, 1, 3])   # [5, 3]`,
      },
      {
        name: "bisect",
        use: "Binary search on a sorted list: lower/upper bound",
        code: `from bisect import bisect_left, bisect_right
a = [1, 2, 2, 2, 5]
bisect_left(a, 2), bisect_right(a, 2)   # (1, 4)`,
      },
      {
        name: "itertools",
        use: "permutations, combinations, product, accumulate (prefix sums)",
        code: `from itertools import accumulate, combinations
list(accumulate([1, 2, 3, 4]))     # [1, 3, 6, 10]
list(combinations("abc", 2))       # [('a','b'), ('a','c'), ('b','c')]`,
      },
      {
        name: "functools.lru_cache",
        use: "One-line memoisation for top-down DP",
        code: `from functools import lru_cache
@lru_cache(maxsize=None)
def ways(n):
    return 1 if n <= 1 else ways(n - 1) + ways(n - 2)`,
      },
      {
        name: "sorted(key=...)",
        use: "Sort by any field, multi-key with tuples; stable",
        code: `pairs = [("b", 2), ("a", 2), ("c", 1)]
sorted(pairs, key=lambda p: (p[1], p[0]))`,
      },
      {
        name: "enumerate / zip",
        use: "Index+value loops and parallel iteration",
        code: `for i, (a, b) in enumerate(zip("abc", [1, 2, 3])):
    pass`,
      },
      {
        name: "math.inf, divmod, any/all",
        use: "Sentinels, quotient+remainder, short-circuit checks",
        code: `import math
best = math.inf
q, r = divmod(17, 5)      # (3, 2)
all(x > 0 for x in [1, 2])   # True`,
      },
    ],
    pitfalls: [
      {
        title: "Floor division rounds toward negative infinity",
        code: "print(-7 // 2, int(-7 / 2))   # -4 -3",
        note: "Java's <code>/</code> on ints truncates toward zero; Python's <code>//</code> floors. Use <code>int(a / b)</code> (or <code>math.trunc</code>) when you need truncation.",
      },
      {
        title: "The sign of % follows the divisor",
        code: "print(-7 % 3)   # 2   (Java gives -1)",
        note: "Handy for circular indexes: <code>(i - 1) % n</code> is always in range.",
      },
      {
        title: "Store a copy, not a reference",
        code: `path = [1]
result = []
result.append(path)         # stores the same list
path.append(2)
print(result)               # [[1, 2]]  surprise!
result = [path[:]]          # copy`,
        note: "Backtracking bugs are usually this.",
      },
      {
        title: "Do not repeat mutable rows",
        code: `grid = [[0] * 3 for _ in range(3)]   # correct
bad = [[0] * 3] * 3                   # three names, one list`,
        note: "",
      },
      {
        title: "Recursion depth is about 1000",
        code: `import sys
print(sys.getrecursionlimit())   # 1000`,
        note: "Deep DFS on 10⁵ nodes will crash. Prefer an explicit stack, or raise the limit with <code>sys.setrecursionlimit</code> as a last resort.",
      },
      {
        title: "Some list operations are O(n)",
        code: `q = [1, 2, 3]
q.pop(0)      # O(n): use deque.popleft()
2 in q        # O(n): use a set
s = "abcdef"
s[1:4]        # O(k) copy`,
        note: "",
      },
      {
        title: "heapq is a min-heap only",
        code: `import heapq
h = []
for x in [3, 1, 2]:
    heapq.heappush(h, -x)   # negate for a max-heap
print(-heapq.heappop(h))    # 3`,
        note: "",
      },
      {
        title: "Counter subtraction drops non-positive counts",
        code: `from collections import Counter
print(Counter("aab") - Counter("abb"))   # Counter({'a': 1})  (b vanished)
c = Counter("aab"); c.subtract(Counter("abb"))
print(c)                                  # keeps negatives`,
        note: "Use <code>.subtract()</code> when negatives matter.",
      },
    ],
    rules: [
      {
        when: "Sorted array and you need a pair, triplet, or closest sum",
        think: "Two Pointers",
        ids: ["two-pointers"],
      },
      {
        when: "Sorted array (or rotated sorted) and O(log n) is required",
        think: "Binary Search",
        ids: ["binary-search"],
      },
      {
        when: "Contiguous subarray or substring; longest or shortest that satisfies a rule",
        think: "Sliding Window",
        ids: ["sliding-window"],
      },
      {
        when: "Contiguous subarray with an exact sum, negatives allowed",
        think: "Prefix Sum + hash map",
        ids: ["prefix-sum"],
      },
      {
        when: "Many range-sum queries on a fixed array",
        think: "Prefix Sum",
        ids: ["prefix-sum"],
      },
      {
        when: "Count subarrays divisible by k, or with equal 0s and 1s",
        think: "Prefix Sum (modulo, or 0 as -1)",
        ids: ["prefix-sum"],
      },
      {
        when: "'Have I seen it?', how many times, or what is the complement",
        think: "Hashing / Frequency Counting",
        ids: ["arrays-hashing"],
      },
      {
        when: "Anagrams, grouping by signature, first non-repeating element",
        think: "Hashing / Frequency Counting",
        ids: ["arrays-hashing"],
      },
      {
        when: "Linked list: cycle, middle, or n-th node from the end",
        think: "Fast & Slow Pointers",
        ids: ["fast-slow-pointers"],
      },
      {
        when: "Linked list: reverse all or part, pairs, palindrome, reorder in place",
        think: "In-place Reversal",
        ids: ["linked-list-reversal"],
      },
      {
        when: "Matching brackets, nested structures, undo, postfix expressions",
        think: "Stack",
        ids: ["stack"],
      },
      {
        when: "Next greater or smaller element, stock span, histogram",
        think: "Monotonic Stack",
        ids: ["monotonic-stack"],
      },
      {
        when: "k-th largest or smallest, top k, k closest, merge k sorted, median of a stream",
        think: "Top K Elements (Heap)",
        ids: ["heap"],
      },
      {
        when: "Intervals: merge, overlap, insert, meeting rooms",
        think: "Overlapping Intervals",
        ids: ["intervals"],
      },
      {
        when: "Binary tree or BST: depth, path sum, level order, validate, ancestor",
        think: "Binary Tree Traversal",
        ids: ["trees"],
      },
      {
        when: "Prefix matching, autocomplete, dictionary of words, wildcard search",
        think: "Trie",
        ids: ["tries"],
      },
      {
        when: "Grid or matrix: islands, flood fill, regions, spiral, rotate",
        think: "Matrix Traversal",
        ids: ["matrix-traversal"],
      },
      {
        when: "Minimum steps, moves or minutes when every move costs the same",
        think: "BFS",
        ids: ["bfs"],
      },
      {
        when: "Spreads from several sources at once (rotting oranges, nearest gate)",
        think: "Multi-source BFS",
        ids: ["bfs"],
      },
      {
        when: "Explore all paths, connected components, detect a cycle, clone a graph",
        think: "DFS",
        ids: ["dfs"],
      },
      {
        when: "Prerequisites, dependencies, build order, alien dictionary",
        think: "Topological Sort",
        ids: ["topological-sort"],
      },
      {
        when: "Merge groups, 'are these connected?', redundant edge, minimum spanning tree",
        think: "Union-Find",
        ids: ["union-find"],
      },
      {
        when: "Weighted edges and the cheapest, fastest or most probable route",
        think: "Shortest Path (Dijkstra)",
        ids: ["shortest-path"],
      },
      {
        when: "Generate all subsets, permutations, combinations or partitions",
        think: "Backtracking",
        ids: ["backtracking"],
      },
      {
        when: "Number of ways, minimum cost, or 'can you reach' along a sequence",
        think: "Dynamic Programming (1-D)",
        ids: ["dp-1d"],
      },
      {
        when: "Two strings or sequences, grid paths, knapsack or subset sum",
        think: "Dynamic Programming (2-D)",
        ids: ["dp-2d"],
      },
      {
        when: "A locally best choice is provably safe (earliest end, largest first)",
        think: "Greedy",
        ids: ["greedy"],
      },
      {
        when: "Appears once or twice, power of two, count set bits, O(1) space",
        think: "Bit Manipulation",
        ids: ["bit-manipulation"],
      },
      {
        when: "Minimum or maximum value such that a yes/no check is monotonic (capacity, speed, days)",
        think: "Binary Search on the answer",
        ids: ["binary-search", "combining-patterns"],
      },
      {
        when: "Split an array into m parts and minimise the largest sum",
        think: "Binary Search + Greedy check",
        ids: ["combining-patterns", "binary-search"],
      },
      {
        when: "'At most k distinct' or 'at most k replacements' in a window",
        think: "Sliding Window + counting",
        ids: ["sliding-window"],
      },
      {
        when: "Sorted array and remove duplicates or partition in place",
        think: "Two Pointers (read/write index)",
        ids: ["two-pointers"],
      },
      {
        when: "Palindrome with pointers moving inward, or a linked-list palindrome",
        think: "Two Pointers, or Fast & Slow + Reversal",
        ids: ["two-pointers", "linked-list-reversal"],
      },
      {
        when: "Subsequence (not contiguous) such as LIS or LCS",
        think: "Dynamic Programming",
        ids: ["dp-1d", "dp-2d"],
      },
      {
        when: "Kth smallest in a BST",
        think: "In-order traversal",
        ids: ["trees"],
      },
      {
        when: "Find the duplicate or missing number in O(1) space",
        think: "XOR, Fast & Slow, or sum formula",
        ids: ["bit-manipulation", "fast-slow-pointers"],
      },
      {
        when: "Longest path in a DAG or a grid with increasing values",
        think: "DFS + memoisation",
        ids: ["combining-patterns", "dfs"],
      },
      {
        when: "Maximum number of non-overlapping intervals; minimum arrows or removals",
        think: "Greedy (sort by end)",
        ids: ["greedy", "intervals"],
      },
      {
        when: "Maximum subarray sum (Kadane) or best time to buy and sell once",
        think: "Greedy / DP with a running value",
        ids: ["greedy", "dp-1d"],
      },
      {
        when: "Range updates ('add x to every position in [l, r]') then read the result",
        think: "Difference array (prefix sum)",
        ids: ["prefix-sum", "combining-patterns"],
      },
      {
        when: "Word or state changes one step at a time (word ladder, lock)",
        think: "BFS over an implicit graph",
        ids: ["bfs"],
      },
      {
        when: "Find all words on a board",
        think: "Trie + Backtracking",
        ids: ["combining-patterns", "tries"],
      },
      {
        when: "n is at most about 20 and you must try all choices",
        think: "Backtracking or bitmask",
        ids: ["backtracking", "bit-manipulation"],
      },
      {
        when: "n is up to 10^5 and brute force is O(n^2)",
        think: "Sort, heap, hashing, window or binary search",
        ids: [],
      },
    ],
    byShape: [
      {
        shape: "Array or string",
        consider: [
          ["arrays-hashing", "seen / count / complement"],
          ["two-pointers", "sorted, or in place"],
          ["sliding-window", "contiguous range"],
          ["prefix-sum", "range or subarray sums"],
          ["binary-search", "sorted, or a monotonic answer"],
          ["monotonic-stack", "nearest greater / smaller"],
          ["dp-1d", "ways / min / max along the sequence"],
          ["greedy", "provably safe local choice"],
        ],
      },
      {
        shape: "Sorted data",
        consider: [["two-pointers", "pairs from both ends"], ["binary-search", "find or bound a value"], ["intervals", "sort first, then sweep"]],
      },
      {
        shape: "Linked list",
        consider: [["fast-slow-pointers", "cycle, middle, n-th from end"], ["linked-list-reversal", "reverse, reorder, palindrome"]],
      },
      {
        shape: "Tree",
        consider: [["trees", "traversals and subtree answers"], ["bfs", "level by level"], ["dfs", "paths and components"], ["tries", "a tree of prefixes"]],
      },
      {
        shape: "Graph or grid",
        consider: [["bfs", "fewest steps"], ["dfs", "reachability, components, cycles"], ["matrix-traversal", "grid neighbours"], ["topological-sort", "dependencies"], ["union-find", "merging groups"], ["shortest-path", "weighted edges"]],
      },
      {
        shape: "Intervals or ranges",
        consider: [["intervals", "merge, insert, overlap"], ["greedy", "schedule by earliest end"], ["heap", "rooms / active intervals"], ["prefix-sum", "difference array"]],
      },
      {
        shape: "Numbers or bits",
        consider: [["bit-manipulation", "XOR, masks, powers of two"], ["binary-search", "search on the answer"], ["prefix-sum", "running totals"]],
      },
      {
        shape: "Two strings or sequences",
        consider: [["dp-2d", "LCS, edit distance"], ["two-pointers", "merge or compare in order"], ["arrays-hashing", "character counts"]],
      },
      {
        shape: "'Generate all' or a tiny n",
        consider: [["backtracking", "choose, explore, unchoose"], ["dp-1d", "if states repeat"], ["bit-manipulation", "bitmask over subsets"]],
      },
      {
        shape: "A stream or repeated min/max",
        consider: [["heap", "top k, running median"], ["monotonic-stack", "window or nearest extremes"]],
      },
    ],
    byQuestion: [
      {
        ask: "Does it exist / is it possible?",
        consider: [["arrays-hashing", "membership"], ["dfs", "reachability"], ["bfs", "reachability"], ["dp-1d", "feasibility"], ["greedy", "if a rule is provable"]],
      },
      {
        ask: "Minimum, maximum, longest or shortest",
        consider: [["sliding-window", "contiguous range"], ["dp-1d", "along a sequence"], ["dp-2d", "two indexes"], ["greedy", "provable rule"], ["binary-search", "of a feasible answer"], ["bfs", "fewest steps"], ["shortest-path", "weighted"]],
      },
      {
        ask: "How many ways / count",
        consider: [["dp-1d", "ways along a sequence"], ["dp-2d", "grid or two-sequence counts"], ["prefix-sum", "count subarrays"], ["backtracking", "if n is tiny"]],
      },
      {
        ask: "All solutions / generate every ...",
        consider: [["backtracking", "constraints prune the search"], ["dfs", "all paths"]],
      },
      {
        ask: "K-th element / top k",
        consider: [["heap", "top k, k-th, stream"], ["binary-search", "search on the value"]],
      },
      {
        ask: "An order / a schedule",
        consider: [["topological-sort", "dependencies"], ["intervals", "time ranges"], ["greedy", "earliest deadline or end"]],
      },
      {
        ask: "Group / connected / merge",
        consider: [["union-find", "dynamic merging"], ["dfs", "static components"], ["arrays-hashing", "group by key"]],
      },
      {
        ask: "Nearest / next greater / previous smaller",
        consider: [["monotonic-stack", "in an array"], ["bfs", "distance in a graph or grid"]],
      },
      {
        ask: "Sum of a range, or repeated subarray sums",
        consider: [["prefix-sum", "running totals"]],
      },
      {
        ask: "Cheapest route / weighted distance",
        consider: [["shortest-path", "Dijkstra / Bellman-Ford"]],
      },
    ],
    confusable: {
      "arrays-hashing": ["prefix-sum", "two-pointers", "sliding-window"],
      "prefix-sum": ["sliding-window", "arrays-hashing", "dp-1d"],
      "two-pointers": ["sliding-window", "binary-search", "fast-slow-pointers"],
      "sliding-window": ["two-pointers", "prefix-sum", "dp-1d"],
      intervals: ["greedy", "heap", "sliding-window"],
      "binary-search": ["two-pointers", "greedy", "heap"],
      "bit-manipulation": ["arrays-hashing", "fast-slow-pointers", "prefix-sum"],
      "fast-slow-pointers": ["two-pointers", "linked-list-reversal", "arrays-hashing"],
      "linked-list-reversal": ["fast-slow-pointers", "stack", "two-pointers"],
      stack: ["monotonic-stack", "dfs", "backtracking"],
      "monotonic-stack": ["stack", "sliding-window", "heap"],
      heap: ["binary-search", "monotonic-stack", "arrays-hashing"],
      trees: ["dfs", "bfs", "tries"],
      tries: ["arrays-hashing", "trees", "backtracking"],
      dfs: ["bfs", "backtracking", "union-find"],
      bfs: ["dfs", "shortest-path", "matrix-traversal"],
      "matrix-traversal": ["dfs", "bfs", "dp-2d"],
      "topological-sort": ["dfs", "union-find", "shortest-path"],
      "union-find": ["dfs", "topological-sort", "shortest-path"],
      "shortest-path": ["bfs", "greedy", "dp-2d"],
      backtracking: ["dfs", "dp-1d", "greedy"],
      greedy: ["dp-1d", "intervals", "heap"],
      "dp-1d": ["greedy", "backtracking", "dp-2d"],
      "dp-2d": ["dp-1d", "backtracking", "greedy"],
    },
  },
  patterns: {
    "arrays-hashing": {
      ask: "Do I keep needing to know 'have I seen this?', 'how many times?', or 'what is the complement?'",
      cues: ["have I seen this before / duplicate", "count / frequency / most common", "pair that sums to a target", "group by / anagram", "first non-repeating / unique", "longest consecutive run"],
      keys: [
        ["duplicate", 3],
        ["frequency", 3],
        ["how many times", 2],
        ["anagram", 3],
        ["sum to", 2],
        ["target", 1],
        ["unique", 2],
        ["non-repeating", 3],
        ["group", 2],
        ["occurrence", 2],
        ["consecutive", 1],
        ["intersection", 2],
        ["consecutive integers", 3],
        ["unsorted", 1],
        ["longest run", 2],
      ],
      notWhen: "Order or sortedness is the point (use two pointers or binary search), or you need the k-th smallest (heap or quickselect).",
      spot: [
        {
          text: "Given a string, return the index of the **first non-repeating character**.",
          why: "'First non-repeating' means you need each character's **frequency**, then one more scan in original order. Count with a dict, then scan.",
        },
        {
          text: "Given two arrays, return their **intersection**, where each result element must be **unique**.",
          why: "Set membership answers 'is it in the other array?' in O(1), so turn one array into a set and de-duplicate the result.",
        },
      ],
      example: {
        title: "Longest Consecutive Sequence",
        prompt: "Given an unsorted array, return the length of the **longest run of consecutive integers** (like 1, 2, 3, 4) in **O(n)** time.",
        code: `def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for n in values:
        if n - 1 not in values:            # n starts a run
            length = 1
            while n + length in values:
                length += 1
            best = max(best, length)
    return best`,
        explanation: "Sorting would cost O(n log n). A set gives O(1) membership, and only numbers that <em>start</em> a run (no <code>n - 1</code> present) walk forward, so every element is visited a constant number of times overall.",
        complexity: "Time: O(n) · Space: O(n)",
        check: `assert longest_consecutive([100, 4, 200, 1, 3, 2]) == 4
assert longest_consecutive([]) == 0
assert longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9`,
      },
      python: [
        {
          tip: "<code>Counter</code> turns frequency and anagram questions into one-liners.",
          code: `from collections import Counter
print(Counter("listen") == Counter("silent"))   # True`,
        },
        {
          tip: "<code>dict.fromkeys(items)</code> de-duplicates and keeps first-seen order; <code>defaultdict(list)</code> groups without key checks.",
          code: "print(list(dict.fromkeys([3, 1, 3, 2, 1])))   # [3, 1, 2]",
        },
        {
          tip: "Any hashable value can be a key. Use a <em>tuple</em> for coordinates or a sorted-letters key, because lists are not hashable.",
          code: `seen = {(0, 0), (1, 2)}
key = tuple(sorted("eat"))   # ('a', 'e', 't')
print((1, 2) in seen, key)`,
        },
      ],
    },
    "prefix-sum": {
      ask: "Will I be asked for the sum of many ranges, or for how many ranges add up to a given total?",
      cues: ["range sum queries", "subarray sum equals k / divisible by k", "running total / cumulative", "product of array except self", "equal number of 0s and 1s", "balance / pivot index"],
      keys: [
        ["prefix sum", 3],
        ["range sum", 3],
        ["subarray sum", 3],
        ["sum equals k", 3],
        ["cumulative", 2],
        ["running sum", 3],
        ["except self", 3],
        ["pivot", 3],
        ["equal number of", 3],
        ["divisible by k", 3],
        ["sum queries", 3],
        ["number of subarrays", 2],
        ["many queries", 3],
        ["sum of elements", 2],
        ["between two indexes", 3],
      ],
      notWhen: "You need range minimum/maximum (use a sparse table, segment tree or monotonic deque), or the array changes between queries (use a Fenwick or segment tree).",
      spot: [
        {
          text: "Given an array of **0s and 1s**, find the longest subarray with an **equal number of 0s and 1s**.",
          why: "Treat each 0 as -1. **Equal counts** means the subarray sums to 0, so two equal **prefix sums** mark its ends. Store the first index of each prefix.",
        },
        {
          text: "Design a class that answers **many queries** for the **sum of elements** between two indexes of a fixed array.",
          why: "'Many **range sum queries**' on a static array: precompute the **prefix sums** once, answer each query with one subtraction.",
        },
      ],
      example: {
        title: "Contiguous Array",
        prompt: "Return the length of the <strong>longest subarray</strong> of a 0/1 array with an <strong>equal number of 0s and 1s</strong>.",
        code: `def find_max_length(nums):
    first_seen = {0: -1}                  # prefix sum -> earliest index where it occurred
    running = best = 0
    for i, x in enumerate(nums):
        running += 1 if x == 1 else -1    # 0 counts as -1
        if running in first_seen:
            best = max(best, i - first_seen[running])
        else:
            first_seen[running] = i
    return best`,
        explanation: "With 0 mapped to -1, a balanced subarray has sum 0, so it starts right after an earlier index that had the same running total. Keeping only the <em>earliest</em> index of each total gives the longest span.",
        complexity: "Time: O(n) · Space: O(n)",
        check: `assert find_max_length([0, 1]) == 2
assert find_max_length([0, 1, 0]) == 2
assert find_max_length([0, 0, 1, 0, 0, 0, 1, 1]) == 6`,
      },
      python: [
        {
          tip: "<code>itertools.accumulate</code> builds prefix sums in one call; <code>initial=0</code> (3.8+) adds the leading zero.",
          code: `from itertools import accumulate
print(list(accumulate([3, 1, 4], initial=0)))   # [0, 3, 4, 8]`,
        },
        {
          tip: "Counting prefixes: seed a dict with <code>{0: 1}</code> (count) or <code>{0: -1}</code> (earliest index) so subarrays starting at index 0 are included.",
          code: `from collections import defaultdict
count = defaultdict(int)
count[0] = 1
print(dict(count))`,
        },
        {
          tip: "For 'divisible by k', use the prefix sum <em>modulo k</em>. Python's <code>%</code> is already non-negative for positive k, unlike Java.",
          code: "print((-7) % 5)   # 3",
        },
      ],
    },
    "two-pointers": {
      ask: "Is the data sorted (or can I sort it), and can I decide which end to move by comparing two values?",
      cues: ["sorted array", "pair or triplet with a given sum", "palindrome", "from both ends", "in place with O(1) extra space", "remove duplicates / partition", "closest to a target"],
      keys: [
        ["sorted", 3],
        ["palindrome", 3],
        ["in-place", 2],
        ["in place", 2],
        ["both ends", 3],
        ["triplet", 3],
        ["two numbers", 2],
        ["pair", 1],
        ["reverse", 1],
        ["o(1) space", 1],
        ["constant extra space", 2],
        ["container", 2],
        ["remove duplicates", 3],
        ["water", 3],
        ["two lines", 2],
        ["heights", 1],
      ],
      notWhen: "The data is unsorted and you must keep the original order or indices (use a hash map), or the condition is not monotonic in the pointers.",
      spot: [
        {
          text: "Given a **sorted** array, return the indices of **two numbers that add up** to a target, using only **constant extra space**.",
          why: "Sorted plus 'pair that sums' plus O(1) space is the textbook converging-pointers signal. Sum too small: move left up. Too large: move right down.",
        },
        {
          text: "Given a string, decide if it can become a **palindrome** by deleting **at most one** character.",
          why: "Compare **from both ends** inward. On the first mismatch, try skipping the left character or the right one and check the remainder is a palindrome.",
        },
      ],
      example: {
        title: "Container With Most Water",
        prompt: "Given heights of vertical lines, pick **two lines** that, with the x-axis, hold the **most water**.",
        code: `def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        best = max(best, min(height[left], height[right]) * (right - left))
        if height[left] < height[right]:
            left += 1                      # the shorter line limits the area
        else:
            right -= 1
    return best`,
        explanation: "Start with the widest container. The shorter line caps the height, so moving the <em>taller</em> line inward can only reduce width without raising the cap. Always move the shorter one.",
        complexity: "Time: O(n) · Space: O(1)",
        check: `assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49
assert max_area([1, 1]) == 1`,
      },
      python: [
        {
          tip: "Swap without a temporary variable using tuple assignment.",
          code: `a = [1, 2, 3]
a[0], a[2] = a[2], a[0]
print(a)   # [3, 2, 1]`,
        },
        {
          tip: "If you must sort but keep original indices, sort the indices instead of the values.",
          code: `nums = [30, 10, 20]
order = sorted(range(len(nums)), key=nums.__getitem__)
print(order)   # [1, 2, 0]`,
        },
        {
          tip: "<code>s == s[::-1]</code> is a quick palindrome check, but it copies the string (O(n) space). Use pointers when space is constrained.",
          code: `s = "racecar"
print(s == s[::-1])   # True`,
        },
      ],
    },
    "sliding-window": {
      ask: "Is the answer defined over a contiguous range that I can extend on the right and shrink on the left as I scan?",
      cues: ["contiguous subarray or substring", "longest / shortest ... such that", "at most k distinct or k replacements", "subarray of size k", "maximum sum of k consecutive elements", "permutation or anagram inside a string"],
      keys: [["contiguous", 3], ["substring", 3], ["subarray", 3], ["window", 3], ["at most k", 3], ["k distinct", 3], ["longest", 1], ["shortest", 1], ["consecutive", 1], ["size k", 3], ["anagram", 1], ["permutation in", 3]],
      notWhen: "Elements do not have to be adjacent (a subsequence: use DP), or the array has negatives and the rule is 'sum at least target' (the shrink logic breaks; use prefix sums with a hash map or deque).",
      spot: [
        {
          text: "Find the length of the **longest substring** that contains **at most k distinct characters**.",
          why: "'Longest **substring**' + 'at most k' is a **variable window**: grow right, and shrink from the left while there are more than k distinct characters.",
        },
        {
          text: "Given a binary array, find the **longest run of ones** if you may **flip at most k zeros**.",
          why: "**Contiguous** run + a budget of at most k bad elements: keep a window with at most k zeros inside and shrink when you exceed it.",
        },
      ],
      example: {
        title: "Sliding Window Maximum",
        prompt: "For every window of <strong>size k</strong> in an array, return the <strong>maximum</strong> in that window.",
        code: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()                     # indices, values in decreasing order
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()                 # smaller values can never be a maximum again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()             # front left the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
        explanation: "A monotonic deque keeps candidates in decreasing order, so the window maximum is always at the front. Each index is pushed and popped at most once, so the whole scan is linear even though there is a nested <code>while</code>.",
        complexity: "Time: O(n) · Space: O(k)",
        check: `assert max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]
assert max_sliding_window([1], 1) == [1]`,
      },
      python: [
        {
          tip: "Use <code>deque</code> for windows and monotonic queues. <code>list.pop(0)</code> shifts every element (O(n)).",
          code: `from collections import deque
dq = deque(maxlen=3)
for x in range(5):
    dq.append(x)
print(list(dq))   # [2, 3, 4]`,
        },
        {
          tip: "For 'k distinct' windows, keep a <code>Counter</code> and delete keys that hit zero so <code>len(counter)</code> is the distinct count.",
          code: `from collections import Counter
window = Counter("aab")
window["a"] -= 2
if window["a"] == 0:
    del window["a"]
print(len(window))   # 1`,
        },
        {
          tip: "Avoid slicing inside the loop: <code>s[l:r]</code> copies O(k) characters each time. Track indexes and slice once at the end.",
          code: `s = "abcabcbb"
l, r = 0, 3
best = s[l:r]   # slice once, when you have the answer
print(best)`,
        },
      ],
    },
    intervals: {
      ask: "Are there ranges [start, end] where overlap matters? If so, sort them first.",
      cues: ["intervals / ranges / [start, end] pairs", "merge overlapping", "meeting rooms / schedule conflicts", "insert into sorted intervals", "minimum removals so none overlap", "how many at the same time"],
      keys: [["interval", 3], ["overlap", 3], ["meeting", 3], ["schedule", 2], ["calendar", 2], ["booking", 2], ["conflict", 2], ["merge", 1], ["free time", 3], ["balloons", 3], ["arrows", 3], ["[start", 2]],
      notWhen: "Ranges carry weights or profits (weighted job scheduling needs DP plus binary search), or the ranges live on a graph.",
      spot: [
        {
          text: "Given an array of **meeting time intervals**, determine if a person can **attend all meetings**.",
          why: "**Sort by start**, then any meeting that starts before the previous one ends is a conflict. One pass over adjacent pairs.",
        },
        {
          text: "Balloons are **ranges** on the x-axis. Find the **minimum number of arrows** to burst them all.",
          why: "Overlapping ranges can share one arrow. **Sort by end** and shoot at the earliest end; skip everything it already covers.",
        },
      ],
      example: {
        title: "Non-overlapping Intervals",
        prompt: "Return the <strong>minimum number of intervals to remove</strong> so that the rest do not overlap.",
        code: `def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])         # earliest end first
    kept_end = float("-inf")
    removed = 0
    for start, end in intervals:
        if start >= kept_end:
            kept_end = end                     # keep this one
        else:
            removed += 1                       # overlaps the kept one: drop it
    return removed`,
        explanation: "Greedy: keeping the interval that ends earliest leaves the most room for the rest. Touching endpoints such as <code>[1,2]</code> and <code>[2,3]</code> do not overlap, which is why the test is <code>start &gt;= kept_end</code>.",
        complexity: "Time: O(n log n) · Space: O(1) beyond the sort",
        check: `assert erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]) == 1
assert erase_overlap_intervals([[1, 2], [1, 2], [1, 2]]) == 2
assert erase_overlap_intervals([[1, 2], [2, 3]]) == 0`,
      },
      python: [
        {
          tip: "<code>sorted(intervals)</code> sorts by start, then end. Use <code>key=lambda x: x[1]</code> to sort by end.",
          code: `iv = [[3, 4], [1, 5], [1, 2]]
print(sorted(iv))
print(sorted(iv, key=lambda x: x[1]))`,
        },
        {
          tip: "Merging mutates the last result in place: <code>merged[-1][1] = max(merged[-1][1], end)</code>. Copy the input first if the caller's list must stay unchanged.",
          code: `merged = [[1, 3]]
start, end = 2, 6
if start <= merged[-1][1]:
    merged[-1][1] = max(merged[-1][1], end)
print(merged)   # [[1, 6]]`,
        },
        {
          tip: "For 'how many at once' you can sort start and end times separately and sweep, or push end times into a min-heap.",
          code: `starts = sorted([0, 5, 15])
ends = sorted([30, 10, 20])
rooms = best = j = 0
for s in starts:
    while ends[j] <= s:
        j += 1
        rooms -= 1
    rooms += 1
    best = max(best, rooms)
print(best)   # 2`,
        },
      ],
    },
    "binary-search": {
      ask: "Is there a monotonic yes/no question ('is x big enough?') so I can discard half the possibilities each step?",
      cues: ["sorted or rotated sorted array", "O(log n) required", "minimum/maximum value such that it is feasible", "least capacity / smallest speed / fewest days", "first or last occurrence, insert position", "n up to 10⁹ or 10¹⁸"],
      keys: [
        ["o(log n)", 3],
        ["rotated", 3],
        ["sorted", 2],
        ["least capacity", 3],
        ["capacity", 2],
        ["minimum speed", 3],
        ["speed", 1],
        ["insert position", 3],
        ["first occurrence", 3],
        ["last occurrence", 3],
        ["peak", 2],
        ["square root", 3],
        ["within d days", 3],
        ["smallest", 1],
        ["modified binary search", 3],
        ["monotonic", 1],
        ["feasible", 2],
        ["split array", 2],
      ],
      notWhen: "The data is unsorted and there is no monotonic property to exploit.",
      spot: [
        {
          text: "A conveyor belt carries packages with given weights. Find the **least ship capacity** that delivers everything **within D days**.",
          why: "'Least ... such that it works' with a feasibility check that only gets easier as the number grows is **binary search on the answer**. Search capacity between max(weight) and sum(weight).",
        },
        {
          text: "Given a **sorted** array and a target, return the index where it is, or **where it would be inserted**.",
          why: "Sorted plus 'position' is a lower-bound search. That is exactly <code>bisect_left</code>.",
        },
      ],
      example: {
        title: "Find First and Last Position of an Element",
        prompt: "In a sorted array, return the <strong>first and last index</strong> of a target, or <code>[-1, -1]</code>, in <strong>O(log n)</strong>.",
        code: `from bisect import bisect_left, bisect_right

def search_range(nums, target):
    lo = bisect_left(nums, target)             # first index with value >= target
    if lo == len(nums) or nums[lo] != target:
        return [-1, -1]
    return [lo, bisect_right(nums, target) - 1]   # first index > target, minus one`,
        explanation: "Two boundary searches: the lower bound (first index not less than the target) and the upper bound (first index greater than the target). Python's <code>bisect</code> module implements both in C.",
        complexity: "Time: O(log n) · Space: O(1)",
        check: `assert search_range([5, 7, 7, 8, 8, 10], 8) == [3, 4]
assert search_range([5, 7, 7, 8, 8, 10], 6) == [-1, -1]
assert search_range([], 0) == [-1, -1]`,
      },
      python: [
        {
          tip: "<code>bisect_left</code> is the first index where <code>x</code> could go keeping order (lower bound); <code>bisect_right</code> is one past the last equal element. <code>insort</code> inserts but is still O(n).",
          code: `from bisect import bisect_left, bisect_right
a = [1, 2, 2, 2, 5]
print(bisect_left(a, 2), bisect_right(a, 2))   # 1 4`,
        },
        {
          tip: "Since Python 3.10, <code>bisect</code> accepts <code>key=</code>, so you can search a list of records without building a separate list.",
          code: `from bisect import bisect_left
records = [("a", 10), ("b", 20), ("c", 30)]
print(bisect_left(records, 20, key=lambda r: r[1]))   # 1`,
        },
        {
          tip: "No overflow to worry about: <code>(lo + hi) // 2</code> is safe in Python (in Java write <code>lo + (hi - lo) / 2</code>). Pick one loop invariant and stick to it.",
          code: `lo, hi = 0, 10**18
print((lo + hi) // 2)`,
        },
      ],
    },
    "bit-manipulation": {
      ask: "Is this about parity, uniqueness, powers of two, or subsets, and does it demand O(1) extra space?",
      cues: ["every element appears twice except one", "without extra space", "power of two", "count set bits / Hamming weight", "enumerate subsets with a mask", "add or swap without using + or a temp variable"],
      keys: [
        ["xor", 3],
        ["single number", 3],
        ["power of two", 3],
        ["bit", 2],
        ["binary", 2],
        ["set bits", 3],
        ["hamming", 3],
        ["without using", 1],
        ["missing number", 3],
        ["bitwise", 3],
        ["mask", 2],
        ["appears twice", 3],
        ["one missing", 3],
        ["o(1) extra space", 2],
      ],
      notWhen: "Readability matters more than a micro-optimisation. A set or counter is fine.",
      spot: [
        {
          text: "An array holds the numbers `0..n` with **one missing**. Find it using **O(1) extra space**.",
          why: "**XOR** all indices and all values. Everything cancels except the missing number (or use the sum formula).",
        },
        {
          text: "Return the **number of 1 bits** in the binary representation of an integer (its **Hamming weight**).",
          why: "Repeatedly clear the lowest set bit with `n &= n - 1`, counting iterations. Or use `n.bit_count()`.",
        },
      ],
      example: {
        title: "Sum of Two Integers (no + or -)",
        prompt: "Add two integers <strong>without using</strong> <code>+</code> or <code>-</code>. Python's ints are unbounded, so you must emulate 32-bit behaviour.",
        code: `def get_sum(a, b):
    mask = 0xFFFFFFFF                          # keep 32 bits
    while b != 0:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask   # sum without carry, and carry
    return a if a <= 0x7FFFFFFF else ~(a ^ mask)      # convert back if negative`,
        explanation: "XOR adds without carrying; AND shifted left is the carry. Repeat until no carry remains. Because Python integers never overflow, negative numbers would loop forever, so mask to 32 bits and translate back at the end.",
        complexity: "Time: O(1) (at most 32 iterations) · Space: O(1)",
        check: `assert get_sum(1, 2) == 3
assert get_sum(-1, 1) == 0
assert get_sum(-2, -3) == -5
assert get_sum(5, -3) == 2`,
      },
      python: [
        {
          tip: "Python ints have unlimited width. To emulate fixed-width behaviour, mask with <code>&amp; 0xFFFFFFFF</code>, then convert back if the sign bit is set.",
          code: `x = -1
print(x & 0xFFFFFFFF)   # 4294967295`,
        },
        {
          tip: "Handy built-ins: <code>bin(n)</code>, <code>n.bit_count()</code> (3.10+), <code>n &amp; (n - 1)</code> clears the lowest set bit, <code>n &amp; -n</code> isolates it.",
          code: `n = 12
print(bin(n), n.bit_count(), n & (n - 1), n & -n)`,
        },
        {
          tip: "There is no unsigned shift <code>&gt;&gt;&gt;</code>. Right shift <code>&gt;&gt;</code> is arithmetic (sign-extending) for negatives.",
          code: "print(-8 >> 1)   # -4",
        },
      ],
    },
    "fast-slow-pointers": {
      ask: "Is there a cycle or repeated state, or do I need the middle or the end position of a sequence without knowing its length?",
      cues: ["cycle in a linked list / array / sequence", "middle of the list", "start of the cycle", "n-th node from the end", "find the duplicate without extra space", "loops forever or reaches 1"],
      keys: [
        ["cycle", 3],
        ["middle", 2],
        ["tortoise", 3],
        ["hare", 3],
        ["duplicate number", 3],
        ["happy number", 3],
        ["from the end", 2],
        ["linked list", 1],
        ["loops forever", 3],
        ["without extra space", 1],
        ["repeats", 1],
        ["repeated number", 3],
        ["without modifying the array", 3],
        ["one repeated", 3],
      ],
      notWhen: "You need every repeated element or the number of repeats (use a hash map or set).",
      spot: [
        {
          text: "Repeatedly replace a number with the **sum of the squares of its digits**. Return true if it **reaches 1**, false if it **loops forever**.",
          why: "A repeating sequence of states is a **cycle**. Floyd's two speeds detect it in O(1) space instead of a set of seen numbers.",
        },
        {
          text: "An array of n+1 integers in `[1, n]` holds **one repeated number**. Find it **without modifying the array** and in **O(1) extra space**.",
          why: "Treat `i → nums[i]` as a pointer. A duplicate means two indexes point to the same place, which creates a **cycle**.",
        },
      ],
      example: {
        title: "Happy Number",
        prompt: "Return true if repeatedly replacing a number by the <strong>sum of the squares of its digits</strong> eventually reaches 1, false if it <strong>cycles</strong>.",
        code: `def is_happy(n):
    def step(x):
        total = 0
        while x:
            x, digit = divmod(x, 10)
            total += digit * digit
        return total

    slow, fast = n, step(n)
    while fast != 1 and slow != fast:
        slow = step(slow)                 # one step
        fast = step(step(fast))           # two steps
    return fast == 1`,
        explanation: "The sequence either reaches 1 (and stays there) or enters a cycle. If fast reaches 1, the number is happy; if fast meets slow first, a cycle exists. No set of seen numbers is required.",
        complexity: "Time: O(log n) per step, with a bounded number of steps · Space: O(1)",
        check: `assert is_happy(19) is True
assert is_happy(2) is False
assert is_happy(1) is True`,
      },
      python: [
        {
          tip: "Compare nodes with <code>is</code>, not <code>==</code>, when detecting a cycle. Equal values do not mean the same node.",
          code: `a = [1]
b = [1]
print(a == b, a is b)   # True False`,
        },
        {
          tip: "<code>divmod(x, 10)</code> gives quotient and remainder in one call, handy for digit loops.",
          code: `x, digit = divmod(123, 10)
print(x, digit)   # 12 3`,
        },
        {
          tip: "The same idea works on an array: treat <code>i -&gt; nums[i]</code> as a next pointer (Find the Duplicate Number).",
          code: `nums = [1, 3, 4, 2, 2]
slow = fast = 0
while True:
    slow = nums[slow]
    fast = nums[nums[fast]]
    if slow == fast:
        break
slow = 0
while slow != fast:
    slow = nums[slow]
    fast = nums[fast]
print(slow)   # 2`,
        },
      ],
    },
    "linked-list-reversal": {
      ask: "Do I have to rearrange the links in place (reverse all, part, or pairs), possibly after finding the middle?",
      cues: ["reverse a linked list or a portion of it", "reverse in groups of k", "palindrome linked list", "reorder list (L0, Ln, L1, Ln-1, ...)", "swap nodes in pairs", "rotate the list"],
      keys: [["reverse", 2], ["linked list", 2], ["in-place", 1], ["in place", 1], ["palindrome linked", 3], ["reorder", 3], ["swap nodes", 3], ["k-group", 3], ["in groups of", 3], ["rotate", 1], ["listnode", 2]],
      notWhen: "O(n) extra space is allowed and you only need to read the values: copy them into an array, which is simpler.",
      spot: [
        {
          text: "Given a linked list, determine whether it is a **palindrome** using **O(1) extra space**.",
          why: "Find the middle (fast/slow), **reverse** the second half **in place**, then compare the two halves.",
        },
        {
          text: "Given the head of a linked list, **reverse the nodes k at a time** and return the modified list.",
          why: "**Reverse in groups of k**: apply the standard reversal to each block of k nodes and reconnect the blocks.",
        },
      ],
      example: {
        title: "Palindrome Linked List",
        prompt: "Check whether a singly linked list reads the same forwards and backwards, in <strong>O(n) time and O(1) space</strong>.",
        code: `def is_palindrome_list(head):
    slow = fast = head
    while fast and fast.next:                # 1. find the middle
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:                              # 2. reverse the second half
        nxt = slow.next
        slow.next = prev
        prev, slow = slow, nxt
    left, right = head, prev
    while right:                             # 3. compare the halves
        if left.val != right.val:
            return False
        left, right = left.next, right.next
    return True`,
        explanation: "This combines two patterns: fast/slow pointers to reach the middle, then in-place reversal of the back half. The first half still ends at the middle node, so comparing until the reversed half runs out is enough.",
        complexity: "Time: O(n) · Space: O(1)",
        check: `assert is_palindrome_list(lst([1, 2, 2, 1])) is True
assert is_palindrome_list(lst([1, 2])) is False
assert is_palindrome_list(lst([1])) is True
assert is_palindrome_list(lst([1, 2, 3, 2, 1])) is True`,
      },
      python: [
        {
          tip: "Reversing pointers with one chained tuple assignment is a trap: the targets are assigned <em>left to right</em>, so <code>curr.next</code> can be overwritten before it is read. Save <code>next</code> first.",
          code: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next          # save first
        curr.next = prev
        prev, curr = curr, nxt
    return prev

node = reverse(Node(1, Node(2, Node(3))))
print(node.val, node.next.val, node.next.next.val)   # 3 2 1`,
        },
        {
          tip: "A dummy head (<code>ListNode(0, head)</code>) removes special cases when the head itself changes.",
          code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next
dummy = ListNode(0, ListNode(1))
print(dummy.next.val)`,
        },
        {
          tip: "Recursive reversal is elegant but uses O(n) stack and hits the recursion limit on long lists. Prefer the iterative loop in interviews unless asked.",
          code: `import sys
print(sys.getrecursionlimit())`,
        },
      ],
    },
    stack: {
      ask: "Do I need the most recent unmatched thing, or the next greater/smaller element?",
      cues: ["valid or balanced brackets", "undo / most recent", "nested structure or expression", "postfix (reverse Polish) evaluation", "minimum or maximum so far in O(1)", "remove adjacent duplicates / simplify a path"],
      keys: [["parenthes", 3], ["bracket", 3], ["nested", 2], ["undo", 2], ["expression", 2], ["postfix", 3], ["reverse polish", 3], ["stack", 3], ["decode", 2], ["simplify", 1], ["adjacent duplicate", 3], ["min stack", 3], ["matching", 1]],
      notWhen: "You need oldest-first processing (use a queue or deque) or random access to elements.",
      spot: [
        {
          text: "Given a string, repeatedly remove **adjacent duplicate** letters (for example `abbaca` becomes `ca`).",
          why: "Each new letter is compared with the **most recent** kept letter. A match cancels it, which is a **pop**; otherwise push.",
        },
        {
          text: "**Simplify** a Unix absolute path: handle `.`, `..`, and repeated slashes.",
          why: "'..' means **undo the most recent** directory, which is a pop. Split on '/', push names, pop on '..'.",
        },
      ],
      example: {
        title: "Decode String",
        prompt: "Decode strings like <code>3[a2[c]]</code>, where <code>k[text]</code> means <code>text</code> repeated <code>k</code> times, into <code>accaccacc</code>.",
        code: `def decode_string(s):
    stack = []                        # saved (text so far, repeat count) for each open '['
    current, number = "", 0
    for ch in s:
        if ch.isdigit():
            number = number * 10 + int(ch)
        elif ch == "[":
            stack.append((current, number))     # remember the outer context
            current, number = "", 0
        elif ch == "]":
            previous, count = stack.pop()
            current = previous + current * count
        else:
            current += ch
    return current`,
        explanation: "A '[' starts a nested context, so save the text built so far and the repeat count on the stack. A ']' finishes the inner text: pop the saved context and combine. Nesting depth is exactly the stack depth.",
        complexity: "Time: O(output length) · Space: O(nesting depth + output)",
        check: `assert decode_string("3[a2[c]]") == "accaccacc"
assert decode_string("2[abc]3[cd]ef") == "abcabccdcdcdef"
assert decode_string("abc") == "abc"`,
      },
      python: [
        {
          tip: "A plain <code>list</code> is your stack: <code>append</code> and <code>pop</code> are O(1), <code>stack[-1]</code> peeks, and <code>if not stack</code> tests empty.",
          code: `stack = []
stack.append("(")
print(stack[-1], bool(stack))   # ( True`,
        },
        {
          tip: "Match brackets with a dict of closer to opener.",
          code: `pairs = {")": "(", "]": "[", "}": "{"}
stack = []
for ch in "([]{})":
    if ch in pairs:
        assert stack and stack.pop() == pairs[ch]
    else:
        stack.append(ch)
print(not stack)   # True`,
        },
        {
          tip: "Do not use a list as a queue: <code>pop(0)</code> is O(n). Use <code>collections.deque</code> when you need FIFO.",
          code: `from collections import deque
q = deque([1, 2, 3])
print(q.popleft())   # 1`,
        },
      ],
    },
    "monotonic-stack": {
      ask: "For each element, do I need the nearest element to its left or right that is bigger (or smaller)?",
      cues: ["next greater / next smaller element", "days until a warmer temperature", "stock span / previous smaller", "largest rectangle in a histogram", "visible buildings / taller to the right", "remove k digits to make the smallest number"],
      keys: [
        ["next greater", 3],
        ["next smaller", 3],
        ["warmer", 3],
        ["stock span", 3],
        ["span", 2],
        ["histogram", 3],
        ["remove k digits", 3],
        ["visible", 2],
        ["previous smaller", 3],
        ["circular array", 3],
        ["days until", 2],
        ["taller", 2],
        ["monotonic", 3],
      ],
      notWhen: "You need the k-th greater element or every greater element (not just the nearest), or you only need a value lookup (use a hash map).",
      spot: [
        {
          text: "Given a **circular array**, return the **next greater element** for every element, wrapping around the end.",
          why: "'**Next greater**' is the monotonic-stack signal. For a **circular** array, walk the array twice.",
        },
        {
          text: "Given a number as a string, **remove k digits** so the remaining number is the **smallest** possible.",
          why: "Keep the digits **increasing** on a stack. When a smaller digit arrives, pop larger ones while you still have removals left.",
        },
      ],
      example: {
        title: "Next Greater Element II (circular)",
        prompt: "Given a <strong>circular</strong> array, return each element's <strong>next greater element</strong> (searching around the end), or <code>-1</code>.",
        code: `def next_greater_elements(nums):
    n = len(nums)
    result = [-1] * n
    stack = []                                  # indices whose answer is still unknown
    for i in range(2 * n):                      # two passes simulate wrapping around
        x = nums[i % n]
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x
        if i < n:
            stack.append(i)                     # only push during the first pass
    return result`,
        explanation: "Walking indexes <code>0..2n-1</code> with <code>i % n</code> lets every element see the elements that follow it, including those wrapped around from the front. Only the first pass pushes, so no index is answered twice.",
        complexity: "Time: O(n) · Space: O(n)",
        check: `assert next_greater_elements([1, 2, 1]) == [2, -1, 2]
assert next_greater_elements([1, 2, 3, 4, 3]) == [2, 3, 4, -1, 4]`,
      },
      python: [
        {
          tip: "Store <em>indices</em> on the stack, not values, so you can compute distances and widths. <code>nums[stack[-1]]</code> reads the value.",
          code: `nums = [2, 1, 3]
stack = [0, 1]
print(nums[stack[-1]])   # 1`,
        },
        {
          tip: "A sentinel simplifies flushing the stack: <code>heights + [0]</code> guarantees everything is popped by the end.",
          code: `heights = [2, 1, 5]
print(heights + [0])`,
        },
        {
          tip: "The invariant flips with the question: pop while <code>top &lt; x</code> for next greater, pop while <code>top &gt; x</code> for next smaller.",
          code: "print(\"greater: pop smaller; smaller: pop greater\")",
        },
      ],
    },
    heap: {
      ask: "Do I repeatedly need the current smallest or largest (or the top k) while the data changes?",
      cues: ["k-th largest / smallest", "top k / k most frequent / k closest", "merge k sorted lists", "median of a stream", "always process the highest priority next", "repeatedly take the two largest"],
      keys: [["kth", 3], ["k-th", 3], ["top k", 3], ["k closest", 3], ["k most frequent", 3], ["median", 3], ["merge k", 3], ["stream", 2], ["priority", 2], ["largest", 1], ["smallest", 1], ["stones", 2], ["scheduler", 2]],
      notWhen: "You need everything sorted once (just sort), or arbitrary rank queries (an order-statistics tree).",
      spot: [
        {
          text: "Given points on a plane, return the **k closest** to the origin.",
          why: "Keep a **max-heap of size k** (negate distances). Each new point either replaces the farthest of the k or is ignored: O(n log k).",
        },
        {
          text: "Repeatedly **smash the two heaviest stones**; if unequal, the difference stays. Return the **last stone's** weight.",
          why: "'Repeatedly take the **largest**' while the collection changes is a priority queue. Negate values for a max-heap.",
        },
      ],
      example: {
        title: "Find Median from Data Stream",
        prompt: "Numbers arrive one at a time. Support <code>add_num</code> and <code>find_median</code> efficiently.",
        code: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []        # max-heap of the smaller half (stored as negatives)
        self.high = []       # min-heap of the larger half

    def add_num(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))   # move the max of low across
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
        explanation: "Two heaps split the data around the median. <code>low</code> is at most one element larger than <code>high</code>, so the median is the top of <code>low</code> or the average of both tops. Insert is O(log n); the median is O(1).",
        complexity: "add: O(log n) · median: O(1) · Space: O(n)",
        check: `m = MedianFinder()
m.add_num(1); m.add_num(2)
assert m.find_median() == 1.5
m.add_num(3)
assert m.find_median() == 2`,
      },
      python: [
        {
          tip: "<code>heapq</code> is a min-heap only. Negate values on the way in and out to get a max-heap.",
          code: `import heapq
h = []
for x in [3, 1, 2]:
    heapq.heappush(h, -x)
print(-heapq.heappop(h))   # 3`,
        },
        {
          tip: "Push tuples <code>(priority, counter, item)</code>. If priorities tie, Python compares the next field, and un-orderable items would raise an error. A running counter breaks ties safely.",
          code: `import heapq, itertools
count = itertools.count()
h = []
for pri, item in [(1, {"a": 1}), (1, {"b": 2})]:
    heapq.heappush(h, (pri, next(count), item))
print(heapq.heappop(h)[2])`,
        },
        {
          tip: "<code>heapq.heapify(list)</code> is O(n), better than n pushes. <code>nlargest(k, it, key=...)</code> and <code>nsmallest</code> are concise for one-off top-k.",
          code: `import heapq
print(heapq.nlargest(2, [5, 1, 9, 3]))   # [9, 5]`,
        },
      ],
    },
    trees: {
      ask: "Can I define the answer for a node from the answers of its children (or from a bound passed down to them)?",
      cues: ["binary tree or BST", "depth, height or diameter", "path sum / root-to-leaf", "level by level / right side view", "lowest common ancestor", "validate BST or balanced", "serialize / construct from traversals"],
      keys: [["binary tree", 3], ["binary search tree", 3], ["bst", 3], ["treenode", 3], ["depth", 2], ["height", 2], ["diameter", 3], ["level order", 3], ["ancestor", 3], ["subtree", 3], ["leaf", 2], ["inorder", 3], ["preorder", 3], ["root", 1]],
      notWhen: "It is really a graph with cycles or shared children (use graph traversal with a visited set).",
      spot: [
        {
          text: "Return the **diameter** of a **binary tree**: the number of edges on the **longest path** between any two nodes.",
          why: "Post-order: each node returns its **height**, and while doing so updates a global best with `left_height + right_height`.",
        },
        {
          text: "Return the **right side view** of a **binary tree**: the values you would see from the right, top to bottom.",
          why: "**Level by level** means BFS. Keep the last node of each level.",
        },
      ],
      example: {
        title: "Validate Binary Search Tree",
        prompt: "Check that a binary tree is a <strong>valid BST</strong>: every node is greater than everything in its left subtree and less than everything in its right subtree.",
        code: `def is_valid_bst(root, low=float("-inf"), high=float("inf")):
    if not root:
        return True
    if not (low < root.val < high):
        return False
    return (is_valid_bst(root.left, low, root.val) and
            is_valid_bst(root.right, root.val, high))`,
        explanation: "Comparing a node only with its parent is wrong: a deep node can violate an ancestor. Pass allowed bounds down. Going left tightens the upper bound; going right tightens the lower bound.",
        complexity: "Time: O(n) · Space: O(h) recursion",
        check: `assert is_valid_bst(tree([2, 1, 3])) is True
assert is_valid_bst(tree([5, 1, 4, None, None, 3, 6])) is False
assert is_valid_bst(None) is True`,
      },
      python: [
        {
          tip: "<code>float('-inf')</code> and <code>float('inf')</code> make clean bounds. Immutable default arguments are fine (mutable ones are not).",
          code: `low, high = float("-inf"), float("inf")
print(low < 5 < high)   # True`,
        },
        {
          tip: "The recursion limit is about 1000, so a skewed tree with 10⁵ nodes can crash recursive DFS. Use an explicit stack for a safe iterative traversal.",
          code: `def inorder(root):
    out, stack, node = [], [], root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out`,
          run: false,
        },
        {
          tip: "Return a tuple from recursion when one pass needs two facts (for example <code>(is_balanced, height)</code>) instead of calling the function twice.",
          code: `def check(node):
    if not node:
        return True, 0
    lok, lh = check(node.left)
    rok, rh = check(node.right)
    return lok and rok and abs(lh - rh) <= 1, 1 + max(lh, rh)`,
          run: false,
        },
      ],
    },
    tries: {
      ask: "Am I repeatedly asking 'does any word start with this prefix?' across many words?",
      cues: ["prefix / starts with", "autocomplete or suggestions", "dictionary of words", "word search on a grid with many words", "longest common prefix", "wildcard '.' matching"],
      keys: [["prefix", 3], ["starts with", 3], ["autocomplete", 3], ["suggest", 2], ["dictionary", 2], ["word search", 3], ["wildcard", 3], ["trie", 3], ["words", 1], ["replace words", 3]],
      notWhen: "You only need exact membership. A set is simpler and faster.",
      spot: [
        {
          text: "Design a search box: after each typed character, return the **top 3 product names** that share that **prefix**.",
          why: "**Prefix** queries over many strings is the reason tries exist. Walk down one node per typed character.",
        },
        {
          text: "Given a dictionary of roots and a sentence, **replace every word** with the **shortest root that is its prefix**.",
          why: "Walk each word down the trie; the first end-of-word marker you hit is the **shortest prefix** root.",
        },
      ],
      example: {
        title: "Replace Words",
        prompt: "Given a dictionary of <strong>roots</strong> and a sentence, replace each word with the <strong>shortest root that is a prefix</strong> of it.",
        code: `def replace_words(dictionary, sentence):
    trie = {}
    for root in dictionary:
        node = trie
        for ch in root:
            node = node.setdefault(ch, {})
        node["#"] = True                       # end-of-word marker

    def shortest_root(word):
        node = trie
        for i, ch in enumerate(word):
            if ch not in node:
                break
            node = node[ch]
            if "#" in node:
                return word[:i + 1]
        return word

    return " ".join(shortest_root(w) for w in sentence.split())`,
        explanation: "A nested-dict trie needs no class. Each word is checked in O(length of the word) regardless of how many roots exist, and it stops at the first root found, which is by construction the shortest.",
        complexity: "Time: O(total characters) · Space: O(total characters in roots)",
        check: "assert replace_words([\"cat\", \"bat\", \"rat\"], \"the cattle was rattled by the battery\") == \"the cat was rat by the bat\"",
      },
      python: [
        {
          tip: "A trie can be nested dicts: <code>node = node.setdefault(ch, {})</code>, with a key like <code>'#'</code> as the end marker.",
          code: `root = {}
node = root
for ch in "cat":
    node = node.setdefault(ch, {})
node["#"] = True
print(root)   # {'c': {'a': {'t': {'#': True}}}}`,
        },
        {
          tip: "One-line recursive trie with <code>defaultdict</code>, a well-known trick.",
          code: `from collections import defaultdict
Trie = lambda: defaultdict(Trie)
t = Trie()
t["a"]["b"]["#"] = True
print("a" in t and "b" in t["a"])   # True`,
        },
        {
          tip: "Use a <code>TrieNode</code> class with <code>__slots__</code> when memory matters. Slots remove the per-instance dict.",
          code: `class TrieNode:
    __slots__ = ("children", "end")
    def __init__(self):
        self.children = {}
        self.end = False
print(TrieNode().end)`,
        },
      ],
    },
    dfs: {
      ask: "Do I need to visit everything reachable, find groups, detect a cycle, or list paths?",
      cues: ["connected components / groups / provinces", "explore all paths from A to B", "detect a cycle", "clone or copy a graph", "root-to-leaf path sum", "is it possible to reach"],
      keys: [
        ["connected", 3],
        ["provinces", 3],
        ["all paths", 3],
        ["cycle", 2],
        ["clone", 3],
        ["reachable", 3],
        ["path sum", 3],
        ["components", 3],
        ["depth-first", 3],
        ["dfs", 3],
        ["valid tree", 3],
        ["friend circle", 3],
        ["deep copy", 3],
        ["all possible paths", 6],
        ["paths from", 2],
      ],
      notWhen: "You need the SHORTEST path in an unweighted graph (use BFS) or the cheapest weighted path (Dijkstra).",
      spot: [
        {
          text: "Given a connected undirected graph, return a **deep copy (clone)** of it.",
          why: "Visit every node once, and keep a dict from **original to copy** so each node is cloned exactly once even with cycles.",
        },
        {
          text: "Given a directed acyclic graph, return **all possible paths** from node 0 to node n − 1.",
          why: "'**All paths**' means exhaustive exploration: DFS, carrying the current path and recording it when the target is reached.",
        },
      ],
      example: {
        title: "Clone Graph",
        prompt: "Return a <strong>deep copy</strong> of a connected undirected graph given one node. Each node has a value and a list of neighbours.",
        code: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def clone_graph(node):
    if not node:
        return None
    copies = {}                                # original node -> its copy

    def clone(n):
        if n in copies:
            return copies[n]                   # already cloned: reuse (this also breaks cycles)
        copies[n] = Node(n.val)
        for nb in n.neighbors:
            copies[n].neighbors.append(clone(nb))
        return copies[n]

    return clone(node)`,
        explanation: "The dict serves as both the visited set and the memory of which copy belongs to which original. Registering the copy <em>before</em> cloning the neighbours is what prevents infinite recursion on cycles.",
        complexity: "Time: O(V + E) · Space: O(V)",
        check: `a, b, c, d = Node(1), Node(2), Node(3), Node(4)
a.neighbors = [b, d]; b.neighbors = [a, c]; c.neighbors = [b, d]; d.neighbors = [a, c]
copy = clone_graph(a)
assert copy is not a and copy.val == 1
assert sorted(n.val for n in copy.neighbors) == [2, 4]
assert copy.neighbors[0] is not b
assert clone_graph(None) is None`,
      },
      python: [
        {
          tip: "Enumerating all paths: pass the path down as a new list (<code>path + [nxt]</code>) instead of appending and popping, which avoids copy mistakes.",
          code: `def all_paths(graph):
    target = len(graph) - 1
    out = []
    def go(node, path):
        if node == target:
            out.append(path)
            return
        for nxt in graph[node]:
            go(nxt, path + [nxt])
    go(0, [0])
    return out
print(all_paths([[1, 2], [3], [3], []]))   # [[0, 1, 3], [0, 2, 3]]`,
        },
        {
          tip: "Python's default recursion limit (about 1000) makes deep DFS risky. Convert to an explicit stack for graphs that can be path-like.",
          code: `stack, seen = [0], {0}
graph = {0: [1], 1: [2], 2: []}
while stack:
    node = stack.pop()
    for nxt in graph[node]:
        if nxt not in seen:
            seen.add(nxt)
            stack.append(nxt)
print(sorted(seen))`,
        },
        {
          tip: "Objects are hashable by identity by default, so a node can be a dict key with no extra code (unless you define <code>__eq__</code>).",
          code: `class N: pass
a = N()
d = {a: "copy"}
print(d[a])`,
        },
      ],
    },
    bfs: {
      ask: "Is the question 'fewest steps / moves / minutes / edges', or 'level by level', from one or many starting points?",
      cues: [
        "minimum number of steps / moves / minutes",
        "shortest path in an unweighted graph or grid",
        "level order / by distance",
        "spreads from several sources at once",
        "transform one word/state into another one step at a time",
        "nearest zero / nearest gate",
      ],
      keys: [
        ["minimum number of steps", 3],
        ["minimum number of moves", 3],
        ["minimum number of turns", 3],
        ["minimum minutes", 3],
        ["minimum number of minutes", 3],
        ["number of minutes", 3],
        ["minutes", 2],
        ["orange", 3],
        ["fewest", 2],
        ["shortest path", 2],
        ["level order", 3],
        ["level by level", 3],
        ["nearest", 2],
        ["word ladder", 3],
        ["one step at a time", 3],
        ["spread", 2],
        ["each minute", 3],
        ["bfs", 3],
        ["shortest clear path", 3],
        ["length of the shortest", 3],
        ["8 directions", 2],
        ["eight directions", 2],
      ],
      notWhen: "Edges have different costs (use Dijkstra) or you need every path rather than the shortest (DFS or backtracking).",
      spot: [
        {
          text: "A combination lock has 4 wheels (0-9) and some **dead-end** states. Return the **minimum number of turns** to open it.",
          why: "Each state is a node; one turn is an edge. '**Minimum number of turns**' with equal-cost moves is BFS over an implicit graph.",
        },
        {
          text: "Given a binary matrix, return the length of the **shortest clear path** from top-left to bottom-right, moving in **8 directions**.",
          why: "**Shortest path** on a grid where every step costs the same is BFS. The only twist is the 8 directions.",
        },
      ],
      example: {
        title: "Shortest Path in Binary Matrix",
        prompt: "In an <code>n x n</code> binary grid, return the length of the <strong>shortest path</strong> of 0-cells from top-left to bottom-right, moving in <strong>8 directions</strong>, or <code>-1</code>.",
        code: `from collections import deque

def shortest_path_binary_matrix(grid):
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    queue = deque([(0, 0, 1)])                 # (row, col, path length so far)
    grid[0][0] = 1                             # mark visited when enqueued
    while queue:
        r, c, dist = queue.popleft()
        if (r, c) == (n - 1, n - 1):
            return dist
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                    grid[nr][nc] = 1
                    queue.append((nr, nc, dist + 1))
    return -1`,
        explanation: "Standard BFS with a distance carried in each queue entry. Marking cells on enqueue prevents duplicates. The two nested loops over <code>-1, 0, 1</code> generate the eight neighbours; the (0, 0) offset hits a cell that is already marked, so it is skipped.",
        complexity: "Time: O(n²) · Space: O(n²)",
        check: `assert shortest_path_binary_matrix([[0, 1], [1, 0]]) == 2
assert shortest_path_binary_matrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]]) == 4
assert shortest_path_binary_matrix([[1, 0, 0], [1, 1, 0], [1, 1, 0]]) == -1`,
      },
      python: [
        {
          tip: "Use <code>collections.deque</code> for the queue. <code>list.pop(0)</code> is O(n) and turns BFS quadratic.",
          code: `from collections import deque
q = deque([1])
q.append(2)
print(q.popleft())   # 1`,
        },
        {
          tip: "To process one level at a time, loop <code>for _ in range(len(queue))</code> and count levels outside the loop.",
          code: `from collections import deque
q = deque([0])
levels = 0
while q:
    for _ in range(len(q)):
        node = q.popleft()
        if node < 3:
            q.append(node + 1)
    levels += 1
print(levels)   # 4`,
        },
        {
          tip: "Generate neighbours lazily for implicit graphs (word ladder, lock states) instead of building the whole graph.",
          code: `word = "hit"
print([word[:i] + "*" + word[i + 1:] for i in range(len(word))])`,
        },
      ],
    },
    "matrix-traversal": {
      ask: "Is the input a grid where each cell relates to its neighbours, or must I walk the grid in a special order?",
      cues: ["grid / matrix / board", "islands, regions, flood fill", "surrounded by / border cells", "adjacent cells (up, down, left, right)", "spiral / rotate / transpose", "word on a board"],
      keys: [["grid", 2], ["matrix", 2], ["board", 2], ["island", 3], ["flood fill", 3], ["surrounded", 3], ["border", 2], ["adjacent", 1], ["spiral", 3], ["rotate", 2], ["transpose", 3], ["cells", 2], ["4-directionally", 3], ["pacific", 3]],
      notWhen: "Cells carry weights and you need the cheapest route (Dijkstra), or the grid is only used for repeated rectangle sums (2-D prefix sums).",
      spot: [
        {
          text: "Given an m x n matrix, return all elements in **spiral order**.",
          why: "This is a **traversal order** problem, not a search: keep four shrinking boundaries (top, bottom, left, right) and walk the outer ring each round.",
        },
        {
          text: "Rain flows to **neighbouring cells with lower or equal height**. Find the cells from which water can reach **both** the Pacific and Atlantic borders.",
          why: "Reverse the flow: start from the **border** cells and search inward to higher cells. The cells reached from both oceans are the answer.",
        },
      ],
      example: {
        title: "Spiral Matrix",
        prompt: "Return the elements of an <code>m x n</code> matrix in <strong>spiral order</strong>.",
        code: `def spiral_order(matrix):
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):              # top row, left to right
            result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):              # right column, top to bottom
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):      # bottom row, right to left
                result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):      # left column, bottom to top
                result.append(matrix[r][left])
            left += 1
    return result`,
        explanation: "Peel the matrix one ring at a time, shrinking a boundary after each side. The two <code>if</code> guards stop the last row or column from being visited twice when the ring is a single row or column.",
        complexity: "Time: O(m × n) · Space: O(1) besides the output",
        check: `assert spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == [1, 2, 3, 6, 9, 8, 7, 4, 5]
assert spiral_order([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]) == [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
assert spiral_order([[1]]) == [1]`,
      },
      python: [
        {
          tip: "Keep the four directions in a tuple and use chained comparison for the bounds check.",
          code: `DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))
rows = cols = 3
r, c = 0, 0
print([(r + dr, c + dc) for dr, dc in DIRS if 0 <= r + dr < rows and 0 <= c + dc < cols])`,
        },
        {
          tip: "<code>zip(*matrix)</code> transposes a matrix, and rotating 90 degrees clockwise is a one-liner.",
          code: `m = [[1, 2], [3, 4]]
print([list(row) for row in zip(*m)])          # transpose
print([list(row) for row in zip(*m[::-1])])   # rotate clockwise`,
        },
        {
          tip: "Mark visited cells by overwriting them (for example with <code>'#'</code>) and restore afterwards if the caller needs the grid intact (Word Search).",
          code: `grid = [["a", "b"]]
ch = grid[0][0]
grid[0][0] = "#"
# ... explore ...
grid[0][0] = ch
print(grid)`,
        },
      ],
    },
    "topological-sort": {
      ask: "Are there 'A must happen before B' rules, and do I need a valid order or to know whether one exists?",
      cues: ["prerequisites / dependencies", "build order / task ordering", "order of letters (alien dictionary)", "is it possible to finish all", "in-degree / directed acyclic graph", "trimming leaves layer by layer"],
      keys: [
        ["prerequisite", 3],
        ["dependenc", 3],
        ["build order", 3],
        ["alien", 3],
        ["topological", 3],
        ["in-degree", 3],
        ["directed acyclic", 3],
        ["order to take", 3],
        ["finish all", 3],
        ["must come before", 3],
        ["valid order", 2],
        ["ordering", 1],
        ["minimum tree height", 3],
        ["tree height", 2],
        ["minimum height", 3],
        ["every root", 2],
      ],
      notWhen: "The graph is undirected, or you only need connectivity or components (DFS, BFS or Union-Find).",
      spot: [
        {
          text: "You must build projects where some projects **depend on** others. Return a **valid build order**, or report that it is **impossible**.",
          why: "**Dependencies** are directed edges. A valid **order** is a topological sort, and 'impossible' means there is a cycle.",
        },
        {
          text: "Given a **sorted list of words in an alien language**, derive the **order of its letters**.",
          why: "Each pair of neighbouring words yields one **'x before y'** rule. Then sort the letters topologically.",
        },
      ],
      example: {
        title: "Minimum Height Trees",
        prompt: "For an undirected tree with n nodes, return every root that gives the <strong>minimum tree height</strong>.",
        code: `from collections import defaultdict, deque

def find_min_height_trees(n, edges):
    if n == 1:
        return [0]
    graph = defaultdict(set)
    for a, b in edges:
        graph[a].add(b)
        graph[b].add(a)
    leaves = deque(i for i in range(n) if len(graph[i]) == 1)
    remaining = n
    while remaining > 2:
        for _ in range(len(leaves)):               # peel off one layer of leaves
            leaf = leaves.popleft()
            remaining -= 1
            neighbor = graph[leaf].pop()
            graph[neighbor].remove(leaf)
            if len(graph[neighbor]) == 1:
                leaves.append(neighbor)
    return list(leaves)`,
        explanation: "This is Kahn's algorithm applied to an undirected tree: repeatedly remove the current leaves (degree 1). The last one or two nodes left are the centres, which are the best roots.",
        complexity: "Time: O(n) · Space: O(n)",
        check: `assert sorted(find_min_height_trees(4, [[1, 0], [1, 2], [1, 3]])) == [1]
assert sorted(find_min_height_trees(6, [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]])) == [3, 4]
assert find_min_height_trees(1, []) == [0]`,
      },
      python: [
        {
          tip: "<code>defaultdict(list)</code> for the adjacency list plus an <code>indegree</code> list is the whole setup for Kahn's algorithm.",
          code: `from collections import defaultdict
graph = defaultdict(list)
indegree = [0] * 3
for a, b in [(0, 1), (1, 2)]:
    graph[a].append(b)
    indegree[b] += 1
print(dict(graph), indegree)`,
        },
        {
          tip: "Detect a cycle by comparing the size of the produced order with the node count: shorter means a cycle.",
          code: `order = [0, 1]
n = 3
print("cycle" if len(order) != n else "ok")`,
        },
        {
          tip: "Direction matters: for 'to take <em>a</em> you need <em>b</em>', the edge is <code>b -&gt; a</code>. Write the direction in a comment.",
          code: `prerequisites = [[1, 0]]   # [course, pre]
edges = [(pre, course) for course, pre in prerequisites]
print(edges)`,
        },
      ],
    },
    "union-find": {
      ask: "Are things being merged into groups, and do I keep asking whether two things are already in the same group?",
      cues: ["are X and Y connected", "merge accounts / friends / sets", "number of components as edges are added", "redundant connection / cycle in an undirected graph", "minimum spanning tree", "equality constraints (a == b)"],
      keys: [
        ["merge", 2],
        ["accounts", 3],
        ["redundant", 3],
        ["spanning", 3],
        ["union", 3],
        ["disjoint", 3],
        ["equivalent", 2],
        ["same group", 3],
        ["components", 2],
        ["cycle in an undirected", 3],
        ["equality", 2],
        ["connect all", 3],
        ["as edges are added", 3],
        ["edges one at a time", 3],
        ["creates a cycle", 3],
        ["closes a cycle", 3],
      ],
      notWhen: "The graph is fixed and you only need its components once (a single DFS or BFS is simpler), or you need shortest paths.",
      spot: [
        {
          text: "Given a list of **accounts** (a name and emails), **merge the accounts** that share any email.",
          why: "'**Merge** things that share something' is grouping. Union every email of an account together, then collect emails by group root.",
        },
        {
          text: "You add **edges one at a time** to a graph that started as a tree. Return the edge that **creates a cycle**.",
          why: "If both endpoints of a new edge are **already in the same group**, that edge closes a cycle. Union-Find answers it in near-constant time.",
        },
      ],
      example: {
        title: "Min Cost to Connect All Points (Kruskal + Union-Find)",
        prompt: "Return the <strong>minimum total cost</strong> to connect all points, where the cost between two points is their Manhattan distance.",
        code: `def min_cost_connect_points(points):
    n = len(points)
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            cost = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
            edges.append((cost, i, j))
    edges.sort()                                  # cheapest edges first

    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]         # path compression
            x = parent[x]
        return x

    total = used = 0
    for cost, a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:                              # joins two different groups
            parent[ra] = rb
            total += cost
            used += 1
            if used == n - 1:
                break
    return total`,
        explanation: "Kruskal: take edges from cheapest to most expensive, and keep one only if it connects two different components (Union-Find tells you in near-constant time). After n - 1 edges everything is connected.",
        complexity: "Time: O(n² log n) · Space: O(n²)",
        check: `assert min_cost_connect_points([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]) == 20
assert min_cost_connect_points([[0, 0]]) == 0`,
      },
      python: [
        {
          tip: "Iterative <code>find</code> with path halving avoids recursion limits: <code>parent[x] = parent[parent[x]]</code>.",
          code: `parent = [0, 0, 1, 2]
x = 3
while parent[x] != x:
    parent[x] = parent[parent[x]]
    x = parent[x]
print(x)   # 0`,
        },
        {
          tip: "To gather group members, bucket by root: <code>groups[find(x)].append(x)</code> with a <code>defaultdict(list)</code>.",
          code: `from collections import defaultdict
groups = defaultdict(list)
for x, root in [(0, 0), (1, 0), (2, 2)]:
    groups[root].append(x)
print(dict(groups))`,
        },
        {
          tip: "Sorting tuples <code>(cost, u, v)</code> orders edges by cost first, which is what Kruskal needs.",
          code: `edges = [(5, 0, 1), (2, 1, 2), (2, 0, 2)]
edges.sort()
print(edges)`,
        },
      ],
    },
    "shortest-path": {
      ask: "Do edges have different costs (time, price, distance, effort) and do I need the cheapest total, or the smallest worst step?",
      cues: ["cheapest / minimum cost / minimum time", "weighted edges", "network delay / signal", "at most k stops", "minimum effort or maximum probability variants", "a grid where cells have costs"],
      keys: [["cheapest", 3], ["minimum cost", 2], ["weighted", 3], ["network delay", 3], ["signal", 2], ["at most k stops", 3], ["minimum effort", 3], ["probability", 3], ["dijkstra", 3], ["price", 1], ["travel time", 3], ["swim", 2]],
      notWhen: "All edges cost the same (plain BFS is enough), or weights can be negative (Bellman-Ford).",
      spot: [
        {
          text: "**Flights** have **prices**. Find the **cheapest price** from `src` to `dst` with **at most k stops**.",
          why: "Weighted shortest path with a **hop limit**: Bellman-Ford for k + 1 rounds, or Dijkstra over the state (city, stops used).",
        },
        {
          text: "Each edge has a **success probability**. Find the path from start to end with the **maximum probability** of success.",
          why: "Path value is a **product** that only shrinks as you extend it, so Dijkstra with a max-heap (negated probabilities) applies.",
        },
      ],
      example: {
        title: "Cheapest Flights Within K Stops (Bellman-Ford)",
        prompt: "Return the <strong>cheapest price</strong> from <code>src</code> to <code>dst</code> using <strong>at most k stops</strong>, or <code>-1</code>.",
        code: `def find_cheapest_price(n, flights, src, dst, k):
    dist = [float("inf")] * n
    dist[src] = 0
    for _ in range(k + 1):                      # at most k + 1 flights (edges)
        nxt = dist[:]                           # relax from a snapshot, so each round adds one edge
        for u, v, w in flights:
            if dist[u] + w < nxt[v]:
                nxt[v] = dist[u] + w
        dist = nxt
    return -1 if dist[dst] == float("inf") else dist[dst]`,
        explanation: "After round <em>i</em>, <code>dist</code> holds the cheapest cost using at most <em>i</em> flights. Relaxing from a copy of the previous round prevents a single round from chaining several flights, which is how the stop limit is enforced.",
        complexity: "Time: O(k · E) · Space: O(n)",
        check: `assert find_cheapest_price(4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1) == 700
assert find_cheapest_price(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1) == 200
assert find_cheapest_price(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0) == 500`,
      },
      python: [
        {
          tip: "Push <code>(distance, node)</code> tuples into <code>heapq</code>. When you pop, skip entries that are already worse than the best known distance.",
          code: `import heapq
dist = {"a": 0}
heap = [(0, "a")]
while heap:
    d, node = heapq.heappop(heap)
    if d > dist.get(node, float("inf")):
        continue
print("ok")`,
        },
        {
          tip: "Use <code>float('inf')</code> (or <code>math.inf</code>) for 'unreachable'. Remember <code>inf + 1</code> is still <code>inf</code>.",
          code: `import math
print(math.inf + 1, math.inf > 10**18)`,
        },
        {
          tip: "For 'maximum probability', push negated values into the min-heap and multiply along the path.",
          code: `import heapq
heap = []
heapq.heappush(heap, (-0.5, "a"))
heapq.heappush(heap, (-0.9, "b"))
print(heapq.heappop(heap))   # (-0.9, 'b')`,
        },
      ],
    },
    backtracking: {
      ask: "Must I generate (or count) every arrangement or choice sequence that satisfies some rules?",
      cues: ["all possible / all valid / generate every", "subsets, permutations, combinations", "partition a string or array into parts", "place N queens / solve sudoku", "find all paths", "n is tiny (about 15 to 20)"],
      keys: [
        ["all possible", 3],
        ["all valid", 3],
        ["generate", 2],
        ["subsets", 3],
        ["permutations", 3],
        ["combinations", 3],
        ["partition", 2],
        ["n-queens", 3],
        ["sudoku", 3],
        ["every", 1],
        ["word search", 2],
        ["combination sum", 3],
        ["parentheses", 1],
        ["return all", 3],
        ["all partitions", 3],
        ["all combinations", 3],
        ["all permutations", 3],
        ["all subsets", 3],
        ["all ways", 2],
      ],
      notWhen: "You only need a count or an optimum and the same state is reached repeatedly (memoise or use DP).",
      spot: [
        {
          text: "**Generate all** combinations of **well-formed parentheses** for n pairs.",
          why: "'Generate **all**' with a validity rule is backtracking. Add '(' while open &lt; n and ')' while close &lt; open; the rule prunes invalid branches early.",
        },
        {
          text: "**Partition** a string so every substring is a **palindrome**; return **all** partitions.",
          why: "At each position choose the next cut, keep it only if the piece is a palindrome, and recurse on the rest (choose, explore, unchoose).",
        },
      ],
      example: {
        title: "Permutations",
        prompt: "Return <strong>all permutations</strong> of a list of distinct integers.",
        code: `def permute(nums):
    result, path, used = [], [], [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])            # copy! path keeps changing
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(x)                    # choose
            backtrack()                       # explore
            path.pop()                        # unchoose
            used[i] = False

    backtrack()
    return result`,
        explanation: "Same choose/explore/unchoose skeleton as subsets, but any unused element can come next, so a <code>used</code> array tracks which are taken. There are n! results, so the runtime is factorial by nature.",
        complexity: "Time: O(n · n!) · Space: O(n) recursion, excluding output",
        check: `import itertools
assert sorted(permute([1, 2, 3])) == sorted(list(map(list, itertools.permutations([1, 2, 3]))))
assert len(permute([1, 2, 3, 4])) == 24
assert permute([]) == [[]]`,
      },
      python: [
        {
          tip: "Append a <em>copy</em> of the path: <code>result.append(path[:])</code>. Appending <code>path</code> itself stores a reference that ends up empty.",
          code: `path = [1]
bad, good = [path], [path[:]]
path.pop()
print(bad, good)   # [[]] [[1]]`,
        },
        {
          tip: "<code>itertools.permutations/combinations/product</code> give you a quick brute force to compare against your backtracking output.",
          code: `from itertools import combinations
print(list(combinations([1, 2, 3], 2)))`,
        },
        {
          tip: "Nested helper functions can read the outer lists, but to rebind a counter you need <code>nonlocal</code> (or keep it in a list).",
          code: `def count_paths():
    total = 0
    def go(n):
        nonlocal total
        if n == 0:
            total += 1
            return
        go(n - 1)
    go(3)
    return total
print(count_paths())`,
        },
      ],
    },
    greedy: {
      ask: "Is there a rule I can justify (earliest end, largest first, closest deadline) that never needs to be undone?",
      cues: [
        "minimum number of ... to cover / remove / schedule",
        "maximum number of non-overlapping",
        "can you reach the end / minimum jumps",
        "earliest deadline / best ratio first",
        "always take the best local option",
        "split so each letter appears in one part",
      ],
      keys: [
        ["minimum number of", 2],
        ["maximum number of", 2],
        ["non-overlapping", 3],
        ["jump", 3],
        ["gas station", 3],
        ["deadline", 2],
        ["cover", 2],
        ["scheduler", 2],
        ["arrows", 2],
        ["assign", 1],
        ["partition labels", 3],
        ["candy", 3],
        ["cookies", 3],
        ["greed", 3],
        ["cookie", 3],
        ["content children", 3],
        ["maximise the number", 2],
        ["maximize the number", 2],
        ["as many parts as possible", 3],
        ["each letter appears", 3],
        ["at most one part", 3],
        ["as many as possible", 2],
      ],
      notWhen: "A locally best choice can be wrong later (coin change with awkward denominations). Use DP.",
      spot: [
        {
          text: "Each child has a **greed factor** and each cookie a size. **Maximise** the number of **content children**.",
          why: "Sort both. Give the **smallest** cookie that satisfies the **least greedy** child. The local choice never hurts later matches.",
        },
        {
          text: "**Split** a string into as many parts as possible so that **each letter appears in at most one part**. Return the part sizes.",
          why: "For each letter, know its **last** occurrence and extend the current part to it. When the scan reaches that boundary, cut.",
        },
      ],
      example: {
        title: "Partition Labels",
        prompt: "Partition a string so each letter appears in <strong>at most one part</strong>; return the sizes of the parts.",
        code: `def partition_labels(s):
    last = {ch: i for i, ch in enumerate(s)}      # last index of every letter
    sizes, start, end = [], 0, 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])                  # this part must reach the letter's last spot
        if i == end:                              # nothing reaches beyond here: cut
            sizes.append(end - start + 1)
            start = i + 1
    return sizes`,
        explanation: "The dict comprehension keeps the <em>last</em> index for each letter because later entries overwrite earlier ones. The running <code>end</code> is the farthest position the current part is forced to reach; when the scan reaches it, the part is closed.",
        complexity: "Time: O(n) · Space: O(alphabet)",
        check: `assert partition_labels("ababcbacadefegdehijhklij") == [9, 7, 8]
assert partition_labels("eccbbbbdec") == [10]`,
      },
      python: [
        {
          tip: "A dict comprehension over <code>enumerate</code> keeps the last index of each key automatically.",
          code: `last = {ch: i for i, ch in enumerate("abca")}
print(last)   # {'a': 3, 'b': 1, 'c': 2}`,
        },
        {
          tip: "Sort by several keys with a tuple. Negate a number to sort that part descending. <code>sorted</code> is stable.",
          code: `jobs = [("a", 2), ("b", 3), ("c", 2)]
print(sorted(jobs, key=lambda j: (-j[1], j[0])))`,
        },
        {
          tip: "Track a running best with <code>max(end, x)</code>. Off-by-one errors are the usual bug, so write <code>end - start + 1</code> for inclusive sizes.",
          code: `start, end = 0, 8
print(end - start + 1)   # 9`,
        },
      ],
    },
    "dp-1d": {
      ask: "Is the answer at position i built from answers at earlier positions (count the ways, minimise, maximise, or 'is it possible')?",
      cues: ["number of ways / how many ways", "minimum or maximum cost to reach", "can you reach / is it possible to form", "longest increasing subsequence", "no two adjacent (rob, pick)", "break a string into words / decode ways"],
      keys: [
        ["number of ways", 3],
        ["how many ways", 3],
        ["minimum cost", 2],
        ["climb", 3],
        ["stairs", 3],
        ["rob", 3],
        ["adjacent", 2],
        ["subsequence", 2],
        ["increasing", 2],
        ["word break", 3],
        ["decode", 3],
        ["fewest", 2],
        ["can you reach", 2],
        ["maximum profit", 1],
        ["segment", 3],
        ["can be segmented", 3],
        ["whether the string can", 2],
      ],
      notWhen: "A locally optimal choice is provably safe (greedy), or you must list every solution (backtracking).",
      spot: [
        {
          text: "You can climb **1 or 2 steps** at a time. In how many **distinct ways** can you reach step `n`?",
          why: "'**Number of ways**' where each answer depends on the previous two is 1-D DP: `ways[i] = ways[i-1] + ways[i-2]`.",
        },
        {
          text: "A digit string maps `1 → A … 26 → Z`. Return **the number of ways to decode** it.",
          why: "'**Number of ways**' along a string, where each position depends on the last one or two digits, is 1-D DP over the index.",
        },
      ],
      example: {
        title: "Word Break",
        prompt: "Given a string and a dictionary, decide whether the string can be <strong>segmented into dictionary words</strong>.",
        code: `def word_break(s, word_dict):
    words = set(word_dict)
    dp = [False] * (len(s) + 1)
    dp[0] = True                              # empty prefix is always breakable
    for end in range(1, len(s) + 1):
        for start in range(end):
            if dp[start] and s[start:end] in words:
                dp[end] = True
                break
    return dp[len(s)]`,
        explanation: "<code>dp[i]</code> means 'the first i characters can be broken'. It is true if some earlier breakable prefix <code>dp[start]</code> is followed by a dictionary word <code>s[start:end]</code>. Put the words in a set so each lookup is O(1).",
        complexity: "Time: O(n³) worst case (O(n²) substrings, each sliced and hashed in O(n)) · Space: O(n)",
        check: `assert word_break("leetcode", ["leet", "code"]) is True
assert word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]) is False
assert word_break("applepenapple", ["apple", "pen"]) is True`,
      },
      python: [
        {
          tip: "<code>@lru_cache(maxsize=None)</code> turns a plain recursive solution into memoised top-down DP. Arguments must be hashable.",
          code: `from functools import lru_cache
@lru_cache(maxsize=None)
def ways(n):
    return 1 if n <= 1 else ways(n - 1) + ways(n - 2)
print(ways(50))`,
        },
        {
          tip: "Initialise tables with the right sentinel: <code>[0] * (n + 1)</code> for counts, <code>[float('inf')] * (n + 1)</code> for minimums, <code>[False] * (n + 1)</code> for feasibility.",
          code: `n = 5
counts = [0] * (n + 1)
mins = [float("inf")] * (n + 1)
mins[0] = 0
print(counts, mins[:2])`,
        },
        {
          tip: "When only the last one or two states matter, roll them in variables: <code>a, b = b, a + b</code>.",
          code: `a, b = 0, 1
for _ in range(10):
    a, b = b, a + b
print(a)   # 55`,
        },
      ],
    },
    "dp-2d": {
      ask: "Do I have two sequences or two indices, a grid, or a choice of item combined with a remaining capacity?",
      cues: ["two strings or sequences", "edit distance / longest common subsequence", "grid paths, with or without obstacles", "knapsack / subset sum / partition", "capacity or budget", "interleaving / matching patterns"],
      keys: [
        ["two strings", 3],
        ["common subsequence", 3],
        ["edit distance", 3],
        ["unique paths", 3],
        ["grid", 1],
        ["knapsack", 3],
        ["subset sum", 3],
        ["partition", 1],
        ["capacity", 2],
        ["budget", 2],
        ["palindromic", 2],
        ["interleav", 3],
        ["target sum", 2],
        ["equal sum", 3],
        ["same sum", 3],
        ["two subsets", 3],
        ["split into two", 2],
      ],
      notWhen: "The state needs only one index (1-D DP) or the objective is locally decidable (greedy).",
      spot: [
        {
          text: "Given an `m x n` grid with **obstacles**, count the **unique paths** from top-left to bottom-right moving only **right or down**.",
          why: "A **grid** with moves that depend on the cell above and the cell to the left is 2-D DP: `paths[r][c] = paths[r-1][c] + paths[r][c-1]`, and 0 on obstacles.",
        },
        {
          text: "Can you **partition** an array into **two subsets with equal sum**?",
          why: "It reduces to '**subset sum** equals total/2', a 0/1 knapsack: item index × reachable sum.",
        },
      ],
      example: {
        title: "Partition Equal Subset Sum (bitset trick)",
        prompt: "Decide whether the array can be split into two subsets with the <strong>same sum</strong>.",
        code: `def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    bits = 1                              # bit i set  <=>  sum i is reachable
    for x in nums:
        bits |= bits << x                 # every reachable sum s also makes s + x reachable
    return (bits >> target) & 1 == 1`,
        explanation: "The usual solution is a boolean table over sums. Python's arbitrary-size integers let a single int act as a <strong>bitset</strong>: shifting left by <code>x</code> adds <code>x</code> to every reachable sum at once, and OR keeps the old ones. It is the 0/1 knapsack in a few lines.",
        complexity: "Time: about O(n · target / word size) · Space: O(target) bits",
        check: `assert can_partition([1, 5, 11, 5]) is True
assert can_partition([1, 2, 3, 5]) is False
assert can_partition([1, 1]) is True`,
      },
      python: [
        {
          tip: "Build 2-D tables with a comprehension. <code>[[0] * n] * m</code> repeats one row m times.",
          code: `m, n = 3, 4
dp = [[0] * (n + 1) for _ in range(m + 1)]
dp[0][0] = 1
print(dp[1][0], len(dp), len(dp[0]))`,
        },
        {
          tip: "For 0/1 knapsack in one dimension, loop the capacity <em>downwards</em> so each item is used at most once.",
          code: `weights, values, cap = [1, 3, 4], [15, 20, 30], 4
dp = [0] * (cap + 1)
for w, v in zip(weights, values):
    for c in range(cap, w - 1, -1):
        dp[c] = max(dp[c], dp[c - w] + v)
print(dp[cap])   # 35`,
        },
        {
          tip: "Big integers are bitsets: <code>bits |= bits &lt;&lt; x</code> and <code>bits &gt;&gt; t &amp; 1</code>. It is a Python-specific speed-up that would overflow in Java.",
          code: `bits = 1
for x in [2, 3]:
    bits |= bits << x
print(bin(bits))   # 0b101101  -> sums 0,2,3,5`,
        },
      ],
    },
  },
};
