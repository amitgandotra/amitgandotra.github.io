// Interview questions for the DSA topic. Key = "topicId/pageId"; a = HTML.
window.INTERVIEW = window.INTERVIEW || {};
Object.assign(window.INTERVIEW, {
  "dsa/complexity": [
    {
      q: "What is the difference between Big-O, Big-Omega and Big-Theta? What do people usually mean in interviews?",
      a: "<p>Big-O is an upper bound, Big-Omega a lower bound, and Big-Theta a tight bound (both). In interviews \"O(n)\" is normally used loosely for the tight worst-case bound. State the case you mean (worst, average, best) and be ready to separate time from space.</p>",
    },
    {
      q: "What is amortised complexity? Give an example.",
      a: "<p>The average cost per operation over a worst-case sequence of operations. Appending to a dynamic array is O(1) amortised: most appends are cheap, and the occasional O(n) resize is spread across many appends. A single append can still cost O(n).</p>",
    },
    {
      q: `What is the time complexity of <pre><code>for i in range(n):
    j = 1
    while j < n:
        j *= 2</code></pre>`,
      a: "<p>O(n log n). The outer loop runs n times and the inner loop doubles <code>j</code> each step, so it runs about log&#8322;(n) times.</p>",
    },
    {
      q: "What space does a recursive DFS use?",
      a: "<p>O(h) for the call stack, where h is the recursion depth: O(log n) for a balanced tree, O(n) for a skewed tree or a path-like graph. In Python the default recursion limit (about 1000) can also be hit, so deep recursion may need an explicit stack.</p>",
    },
  ],
  "dsa/playbook": [
    {
      q: "You get a problem you have not seen before. Walk me through how you choose an approach.",
      a: "<p>Restate the problem and clarify edge cases (empty input, duplicates, negatives, size). Read the constraints to learn the target complexity. Look for structural keywords (sorted, contiguous, prefix, graph-like, two sequences, \"number of ways\") and name a candidate pattern out loud. State the brute force and its cost, explain which pattern removes which cost, then code the simplest correct version and test it on a small case and an edge case.</p>",
    },
    {
      q: "The input size is n up to 10<sup>5</sup>. What does that tell you?",
      a: "<p>Roughly 10<sup>8</sup> simple operations are feasible, so O(n&sup2;) (10<sup>10</sup>) is too slow and you should aim for O(n log n) or O(n): sorting, heaps, binary search, hashing, sliding window, or two pointers. By contrast, n around 20 suggests O(2<sup>n</sup>) subsets or bitmask, n around 10 allows factorial backtracking, and n up to 10<sup>9</sup> suggests O(log n) or math. Python is slower than compiled languages, so leave extra margin.</p>",
    },
    {
      q: "A problem asks for the \"minimum number of steps/minutes\" on a grid, starting from several cells at once. What do you use?",
      a: "<p>Multi-source BFS: put all starting cells in the queue at distance 0 and expand level by level, so each level is one step or minute. BFS gives shortest paths only when every move costs the same; with different costs use Dijkstra, and with 0/1 costs use a deque-based 0-1 BFS.</p>",
    },
    {
      q: "\"Longest subarray\" versus \"longest subsequence\": how does the wording change your approach?",
      a: "<p>A subarray or substring is contiguous, which points to a sliding window (or prefix sums). A subsequence need not be contiguous, which usually means dynamic programming (for example LIS or LCS). Also note that with negative numbers a sliding window on \"sum at least k\" breaks, so use prefix sums with a hash map or monotonic deque.</p>",
    },
    {
      q: "Name three Python gotchas that commonly cost people a correct answer in interviews.",
      a: "<ul><li>Floor division and modulo with negatives: <code>-7 // 2 == -4</code> and <code>-7 % 3 == 2</code>, unlike Java.</li><li>Appending a reference instead of a copy in backtracking: use <code>path[:]</code>.</li><li>List operations that look cheap but are O(n): <code>pop(0)</code>, <code>in list</code>, slicing. Use <code>deque</code>, a set, and indexes.</li></ul>",
    },
  ],
  "dsa/arrays-hashing": [
    {
      q: "Two Sum: how do you solve it in O(n), and what are the trade-offs against sorting?",
      a: "<p>One pass with a hash map from value to index: for each <code>x</code>, check whether <code>target - x</code> is already stored, then store <code>x</code>. That is O(n) time and O(n) space. Sorting plus two pointers is O(n log n) time and O(1) extra space, but loses the original indices unless you keep them.</p>",
    },
    {
      q: "How do you detect duplicates in an array, and what are the options?",
      a: "<ul><li>Set of seen values: O(n) time, O(n) space.</li><li>Sort then compare neighbours: O(n log n) time, O(1) extra space (if sorting in place).</li><li>Brute force pairs: O(n&sup2;) time, O(1) space.</li></ul><p>State the time/space trade-off and ask whether the input may be modified.</p>",
    },
    {
      q: "Group Anagrams: what makes a good hash key, and what is the complexity?",
      a: "<p>Either the sorted string (O(k log k) per word) or a 26-length count tuple (O(k) per word). With n words of length k that is O(n k log k) or O(n k) respectively, with O(n k) space for the groups.</p>",
    },
    {
      q: "Top K Frequent Elements: describe two approaches beyond sorting everything.",
      a: "<p>(1) Count with a hash map, then keep a min-heap of size k: O(n log k). (2) Bucket sort by frequency (frequencies are at most n): O(n) time and space. Quickselect on the counts averages O(n).</p>",
    },
  ],
  "dsa/prefix-sum": [
    {
      q: "How does a prefix sum turn range-sum queries into O(1) operations?",
      a: "<p>Precompute <code>prefix[i]</code> = sum of the first i elements in O(n). The sum of any range <code>[l, r]</code> is then <code>prefix[r + 1] - prefix[l]</code>, one subtraction. It pays off when there are many queries on a fixed array; for a single query a plain loop is fine.</p>",
    },
    {
      q: "Count the subarrays whose sum equals k, when the array may contain negatives. What is the approach and complexity?",
      a: "<p>One pass keeping a running sum and a hash map from prefix sum to the number of times it has occurred (seeded with <code>{0: 1}</code>). For each element, add <code>map[running - k]</code> to the answer, then record the running sum. O(n) time, O(n) space.</p>",
    },
    {
      q: "Why does a sliding window fail for \"subarray sum equals k\" when the array has negative numbers?",
      a: "<p>A sliding window assumes that extending the window increases the sum and shrinking it decreases the sum, so it knows which end to move. Negative numbers break that monotonic behaviour: adding an element can lower the sum. Prefix sums compare two totals directly and make no such assumption.</p>",
    },
    {
      q: "How would you handle \"longest subarray with equal 0s and 1s\" or \"subarrays divisible by k\"?",
      a: "<p>Transform the property into a prefix-sum equality. Equal 0s and 1s: map 0 to -1, so a balanced subarray sums to 0, and two equal prefix sums mark its ends (store the earliest index of each). Divisible by k: two prefixes with the same remainder modulo k bound a divisible subarray, so count pairs of equal remainders.</p>",
    },
  ],
  "dsa/two-pointers": [
    {
      q: "How do you check for a palindrome ignoring non-alphanumeric characters in O(1) space?",
      a: "<p>Two pointers from both ends: skip characters that are not alphanumeric, compare lowercased characters, and move inward until the pointers meet. O(n) time, O(1) space. Cleaning the string first and comparing to its reverse is simpler but uses O(n) extra space.</p>",
    },
    {
      q: "3Sum: why sort first, and how do you avoid duplicate triplets?",
      a: "<p>Sorting enables the two-pointer sweep (move left up if the sum is too small, right down if too large) and groups duplicates together. Fix element <code>i</code>, skip it if it equals the previous one, run two pointers on the rest, and skip repeated values after finding a match. O(n&sup2;) time, O(1) extra space besides output.</p>",
    },
    {
      q: "Container With Most Water: why is it correct to move the shorter line inward?",
      a: "<p>The area is limited by the shorter line times the width. Moving the taller line inward can only shrink the width without raising the limiting height, so it cannot help; moving the shorter one might. This argument shows no better pair is skipped. O(n).</p>",
    },
    {
      q: "When does two pointers not apply?",
      a: "<p>When the data is unsorted and order cannot be changed, or when the condition is not monotonic in the pointers. Then use a hash map or set (for pairs) or a different technique. Also, if you need original indices after sorting, remember to carry them along.</p>",
    },
  ],
  "dsa/sliding-window": [
    {
      q: "Longest substring without repeating characters: describe the approach.",
      a: "<p>Expand the right pointer, adding characters to a set (or a last-seen index map). When a duplicate appears, shrink from the left until it is removed, tracking the maximum window length. O(n) time, O(min(n, alphabet)) space. With a last-index map you can jump the left pointer directly.</p>",
    },
    {
      q: "How do you tell a fixed-size window from a variable-size one, and when do you shrink?",
      a: "<p>\"Subarray of size k\" means fixed: slide by adding one element and removing one. \"Longest/shortest subarray satisfying X\" means variable: expand the right end always, and shrink the left end while the window is invalid (for longest) or while it is valid (for shortest).</p>",
    },
    {
      q: "Minimum Window Substring: what state do you track and what is the complexity?",
      a: "<p>A need-count map for the target and a counter of how many required characters are still missing. Expand until nothing is missing, then shrink from the left to find the smallest valid window, recording the best. O(n + m) time, O(alphabet) space.</p>",
    },
    {
      q: "Sliding Window Maximum: how do you get O(n)?",
      a: "<p>Keep a deque of indices whose values are in decreasing order. Before pushing index <code>i</code>, pop smaller values from the back; pop the front if it has left the window. The front is always the current maximum. Each index enters and leaves the deque once.</p>",
    },
  ],
  "dsa/intervals": [
    {
      q: "Merge Intervals: outline the algorithm.",
      a: "<p>Sort by start. Keep a result list; for each interval, if it starts at or before the last merged end, extend that end to the max of the two ends, else append it. O(n log n) for the sort, O(n) for the sweep.</p>",
    },
    {
      q: "Meeting Rooms II: how do you compute the minimum number of rooms?",
      a: "<p>Either sort by start and use a min-heap of end times (reuse a room if the earliest end is at or before the next start), or sort starts and ends separately and sweep with two pointers counting concurrent meetings. Both are O(n log n).</p>",
    },
    {
      q: "Insert Interval into a sorted, non-overlapping list.",
      a: "<p>One linear pass in three phases: copy intervals that end before the new one starts; merge all intervals that overlap it by taking min start and max end; copy the rest. O(n), no extra sort needed.</p>",
    },
    {
      q: "Non-overlapping Intervals: minimum removals so none overlap?",
      a: "<p>Greedy: sort by end time and keep an interval if it starts at or after the last kept end; otherwise it is removed. Choosing the earliest end leaves the most room for the rest. O(n log n).</p>",
    },
  ],
  "dsa/binary-search": [
    {
      q: "What are the preconditions for binary search, and how do you avoid off-by-one bugs?",
      a: "<p>The search space must be monotonic: sorted, or a predicate that flips from false to true once. Pick one invariant (for example \"answer lies in <code>[lo, hi]</code>\") and keep the loop condition and the bound updates consistent with it. In Java you also write <code>mid = lo + (hi - lo) / 2</code> to avoid integer overflow; Python ints do not overflow.</p>",
    },
    {
      q: "How do you search a rotated sorted array in O(log n)?",
      a: "<p>At each step one half around <code>mid</code> is sorted. Determine which half by comparing <code>nums[lo]</code> with <code>nums[mid]</code>, check whether the target lies inside that sorted half, and discard the other half. Duplicates can break the ordering test and degrade the worst case to O(n).</p>",
    },
    {
      q: "What is \"binary search on the answer\"? Give an example.",
      a: "<p>Instead of searching an array, search the range of possible answers using a monotonic feasibility check. Koko Eating Bananas: if speed <code>k</code> works, any larger speed works, so search the smallest feasible <code>k</code>. Cost is O(check &times; log range). Same idea applies to shipping capacity and split-array problems.</p>",
    },
    {
      q: "How do you find the first or last occurrence of a value?",
      a: "<p>Do not stop when you find a match; keep searching the left half (for first) or right half (for last) while recording the candidate. Python's <code>bisect_left</code> and <code>bisect_right</code> implement exactly these lower and upper bounds.</p>",
    },
  ],
  "dsa/bit-manipulation": [
    {
      q: "Single Number: find the element that appears once when the rest appear twice.",
      a: "<p>XOR everything: <code>a ^ a = 0</code> and <code>a ^ 0 = a</code>, and XOR is commutative, so pairs cancel and the unique value remains. O(n) time, O(1) space.</p>",
    },
    {
      q: "How do you check for a power of two and count set bits?",
      a: "<p>Power of two: <code>n &gt; 0 and n &amp; (n - 1) == 0</code>. Count set bits with Brian Kernighan's loop: <code>while n: n &amp;= n - 1; count += 1</code>, which runs once per set bit. Python also has <code>int.bit_count()</code> (3.10+).</p>",
    },
    {
      q: "What is different about bit manipulation in Python versus Java?",
      a: "<p>Python ints are arbitrary precision with infinite sign extension, so there is no 32-bit wraparound. To emulate fixed-width behaviour, mask with <code>&amp; 0xFFFFFFFF</code> and convert back for negatives. Right shift is arithmetic, and there is no <code>&gt;&gt;&gt;</code> operator.</p>",
    },
    {
      q: "How do you enumerate all subsets with a bitmask?",
      a: "<p>For <code>mask in range(1 &lt;&lt; n)</code>, include element <code>i</code> when <code>mask &amp; (1 &lt;&lt; i)</code> is non-zero. It produces 2<sup>n</sup> subsets in O(n 2<sup>n</sup>) and is also the basis of bitmask DP for small n (roughly n &le; 20).</p>",
    },
  ],
  "dsa/fast-slow-pointers": [
    {
      q: "Detect a cycle and find where it starts.",
      a: "<p>Floyd's tortoise and hare: a slow pointer (1 step) and fast pointer (2 steps) meet if there is a cycle. Then reset one pointer to the head and advance both one step at a time; they meet at the cycle start. O(n) time, O(1) space.</p>",
    },
    {
      q: "How do you remove the n-th node from the end in one pass?",
      a: "<p>Use two pointers separated by n nodes: advance the lead pointer n steps, then move both until the lead reaches the end; the trailing pointer is just before the node to delete. A dummy head handles removing the first node.</p>",
    },
    {
      q: "Find the duplicate number in an array of n + 1 integers from 1 to n, in O(1) extra space and without modifying the array.",
      a: "<p>Treat <code>i -&gt; nums[i]</code> as a linked list. Because a value repeats, two indexes point to the same place, which forms a cycle, and the cycle's entrance is the duplicate. Use Floyd's algorithm: find the meeting point, reset one pointer to 0, and advance both one step at a time until they meet. O(n) time, O(1) space.</p>",
    },
    {
      q: "When is a hash set of visited nodes acceptable instead of Floyd's algorithm?",
      a: "<p>When O(n) extra space is allowed and simplicity matters, a set is easier to write and to explain, and it also gives you the first repeated node directly. Floyd's algorithm is preferred when the problem demands O(1) space or when nodes are not hashable.</p>",
    },
  ],
  "dsa/linked-list-reversal": [
    {
      q: "Reverse a linked list iteratively and recursively. What are the complexities?",
      a: "<p>Iterative: keep <code>prev</code>, <code>curr</code>, and <code>next</code>; point <code>curr.next</code> at <code>prev</code> and advance: O(n) time, O(1) space. Recursive: reverse the rest, then point the next node back at the current one: O(n) time, O(n) stack space.</p>",
    },
    {
      q: "Why use a dummy head node?",
      a: "<p>It removes special cases for operations at the head (insert, delete, merge), since the real head is always <code>dummy.next</code>. It keeps the code uniform and avoids null checks.</p>",
    },
    {
      q: "Check whether a linked list is a palindrome in O(n) time and O(1) space.",
      a: "<p>Use fast and slow pointers to find the middle, reverse the second half in place, then compare the first half with the reversed half node by node. Optionally reverse the second half back to restore the list.</p>",
    },
    {
      q: "Reverse nodes in k-groups: describe the approach.",
      a: "<p>Use a dummy head. For each block, first check that k nodes remain; if so, reverse exactly k nodes with the standard three-pointer loop and reconnect the block's start to the previous group's tail and its new tail to the next group's head. Leave a final block with fewer than k nodes unchanged. O(n) time, O(1) space.</p>",
    },
  ],
  "dsa/stack": [
    {
      q: "Valid Parentheses: outline the solution and its complexity.",
      a: "<p>Push opening brackets. On a closing bracket, the stack must be non-empty and its top must be the matching opener; pop it. At the end the stack must be empty. O(n) time, O(n) space.</p>",
    },
    {
      q: "Design a stack that supports push, pop, top and getMin in O(1).",
      a: "<p>Keep a second stack of running minimums (or store <code>(value, current_min)</code> pairs). On push, record <code>min(value, current_min)</code>; on pop, pop both. getMin reads the top of the min stack. O(1) time per operation, O(n) extra space.</p>",
    },
    {
      q: "When do you replace recursion with an explicit stack?",
      a: "<p>When depth may exceed the recursion limit (deep trees or graphs), or when you need to control traversal state. An explicit stack turns recursive DFS into iterative DFS with the same O(V+E) complexity but heap-allocated depth.</p>",
    },
    {
      q: "How do you evaluate a postfix (Reverse Polish) expression, and what should you watch for with division?",
      a: "<p>Scan the tokens: push numbers; for an operator, pop the right operand first and then the left, apply the operator, and push the result. The final stack top is the answer. Watch division and modulo on negatives: Java truncates toward zero, but Python's <code>//</code> floors, so use <code>int(a / b)</code> when the problem expects truncation.</p>",
    },
  ],
  "dsa/monotonic-stack": [
    {
      q: "What is a monotonic stack and what problems does it solve?",
      a: "<p>A stack kept in increasing or decreasing order by popping elements that break the order. It finds the next greater/smaller element, daily temperatures, and largest rectangle in a histogram. Each element is pushed and popped at most once, so the total work is O(n) even with a nested while loop.</p>",
    },
    {
      q: "Largest Rectangle in Histogram: outline the monotonic-stack solution.",
      a: "<p>Keep bar indexes on a stack with increasing heights. When a shorter bar arrives, pop taller bars: for each popped bar, its height applies over the width between the new stack top (nearest smaller on the left) and the current index (nearest smaller on the right). Append a sentinel height 0 to flush the stack. O(n) time and space.</p>",
    },
    {
      q: "How do you adapt next-greater-element to a circular array?",
      a: "<p>Iterate over indexes <code>0 .. 2n - 1</code> using <code>i % n</code>, pushing indexes only during the first pass. Elements near the end can then see the elements at the start. Still O(n).</p>",
    },
    {
      q: "Monotonic stack versus monotonic deque: when do you use each?",
      a: "<p>A stack works when you only need the nearest greater/smaller element on one side and elements never expire. A deque adds removal from the front, which you need for sliding windows (for example Sliding Window Maximum), where old indexes fall out of the window.</p>",
    },
  ],
  "dsa/heap": [
    {
      q: "Kth largest element: compare heap and quickselect.",
      a: "<p>Min-heap of size k: O(n log k) time, O(k) space, and works on streams. Quickselect: O(n) average, O(n&sup2;) worst case, O(1) extra space, but needs the whole array in memory. Sorting is O(n log n).</p>",
    },
    {
      q: "Merge k sorted lists: approach and complexity.",
      a: "<p>Keep a min-heap with the current head of each list. Pop the smallest, append it to the output, and push its successor. With N total elements and k lists it is O(N log k) time and O(k) space. Divide and conquer merging gives the same bound.</p>",
    },
    {
      q: "Find the median of a data stream.",
      a: "<p>Two heaps: a max-heap for the lower half and a min-heap for the upper half, kept balanced within one element. The median is the top of the larger heap or the average of both tops. Insert is O(log n), median lookup O(1).</p>",
    },
    {
      q: "What is the complexity of building a heap, and how does a heap compare with a BST?",
      a: "<p><code>heapify</code> builds a heap from n items in O(n). A heap gives O(1) peek and O(log n) push/pop of the min or max but no ordered traversal or fast arbitrary search. A balanced BST gives O(log n) search, delete and ordered iteration, at higher constants.</p>",
    },
  ],
  "dsa/trees": [
    {
      q: "Explain preorder, inorder and postorder traversals, and what an inorder traversal of a BST gives.",
      a: "<p>Preorder: node, left, right. Inorder: left, node, right. Postorder: left, right, node. Inorder on a BST yields values in sorted order, which is the basis for validating a BST and finding the k-th smallest.</p>",
    },
    {
      q: "Validate a BST: what is the common mistake?",
      a: "<p>Comparing each node only with its direct children. A node deep in the left subtree can still be greater than an ancestor. Pass down allowed bounds <code>(low, high)</code> (or check that inorder output is strictly increasing). O(n) time.</p>",
    },
    {
      q: "Compare BFS and DFS on trees in time and space.",
      a: "<p>Both visit every node in O(n). DFS uses O(h) stack space (O(log n) balanced, O(n) skewed). BFS uses O(w) space for the widest level, up to about n/2 for a complete tree. Use BFS for level-based questions and shortest path; DFS for path/subtree questions.</p>",
    },
    {
      q: "Lowest Common Ancestor: how does it differ for a BST and a general binary tree?",
      a: "<p>BST: walk down from the root; if both values are smaller go left, if both larger go right, otherwise the current node is the LCA: O(h). General tree: recurse both sides; if left and right each return a node, the current node is the LCA: O(n).</p>",
    },
  ],
  "dsa/tries": [
    {
      q: "What is a trie and when is it better than a hash set of strings?",
      a: "<p>A tree where each edge is a character and each path from the root spells a prefix. It supports prefix queries (startsWith, autocomplete) and enumeration by prefix in O(L), which a hash set cannot do efficiently. For exact membership only, a hash set is simpler and often faster.</p>",
    },
    {
      q: "What are the time and space complexities?",
      a: "<p>Insert, search and prefix-search are O(L) for a word of length L, independent of how many words are stored. Space is O(total characters) in the worst case, times the per-node overhead of the children structure.</p>",
    },
    {
      q: "Word Search II: why does a trie help?",
      a: "<p>Building a trie of all target words lets DFS on the grid follow only paths that are a prefix of some word and prune immediately otherwise, instead of running a separate search per word. It also finds all words in a single traversal.</p>",
    },
    {
      q: "How would you reduce a trie's memory use?",
      a: "<p>Use dicts (sparse) instead of fixed 26-slot arrays for large alphabets, compress single-child chains into one edge (radix/compressed trie), or store the words in a sorted array and binary search if the set is static.</p>",
    },
  ],
  "dsa/dfs": [
    {
      q: "Adjacency list vs adjacency matrix?",
      a: "<p>List: O(V + E) space, fast iteration over neighbours, best for sparse graphs. Matrix: O(V&sup2;) space, O(1) edge lookup, better for dense graphs or small V. Most interview graphs are sparse, so use an adjacency list.</p>",
    },
    {
      q: "How does cycle detection differ in directed and undirected graphs?",
      a: "<p>Undirected: DFS with a visited set; reaching a visited node that is not the current node's parent means a cycle (or use Union-Find). Directed: track three states (unvisited, on the current path, done); reaching a node that is still on the current path is a back edge and means a cycle. Kahn's algorithm is an alternative.</p>",
    },
    {
      q: "Recursive versus iterative DFS: what are the trade-offs?",
      a: "<p>Recursion is shorter and mirrors the problem, but its depth is limited (about 1000 frames by default in Python) and it costs stack space. An explicit stack avoids the limit and gives control over visit order, at the price of more code. Prefer iterative for graphs that can be long paths.</p>",
    },
    {
      q: "How do you clone a graph that may contain cycles?",
      a: "<p>Keep a dictionary from original node to its copy. When you visit a node, create its copy and register it <em>before</em> cloning its neighbours, then recursively clone (or reuse) each neighbour. The map prevents infinite recursion and preserves shared structure. O(V + E).</p>",
    },
  ],
  "dsa/bfs": [
    {
      q: "BFS vs DFS: when do you use each?",
      a: "<p>BFS for shortest path in an unweighted graph and level-order problems (it explores by distance). DFS for reachability, connected components, cycle detection, topological sort and exhaustive search. Both are O(V + E).</p>",
    },
    {
      q: "Why does BFS find the shortest path in an unweighted graph, and when does it stop being correct?",
      a: "<p>BFS processes all nodes at distance d before any at distance d + 1, so the first time it reaches a node uses the fewest edges. It stops being correct when edges have different costs: it counts edges, not total weight. Use Dijkstra for non-negative weights, or 0-1 BFS with a deque when weights are only 0 or 1.</p>",
    },
    {
      q: "Why should you mark nodes visited when they are enqueued, not when dequeued?",
      a: "<p>If you mark on dequeue, the same node can be added to the queue several times by different neighbours before it is processed, wasting time and memory (and making the state space blow up in puzzles like Word Ladder). Marking on enqueue guarantees each node enters the queue once.</p>",
    },
    {
      q: "What is multi-source BFS? Give an example.",
      a: "<p>Start the queue with several sources at distance 0 so they expand simultaneously. Rotting Oranges seeds every rotten orange, so each BFS level is one minute for all of them; \"01 Matrix\" and \"Walls and Gates\" find the distance to the nearest source the same way. It is cheaper than running one BFS per source.</p>",
    },
    {
      q: "How could you speed up Word Ladder?",
      a: "<p>Bidirectional BFS: search from both the start and the end word and always expand the smaller frontier, stopping when they meet. Pre-computing wildcard buckets (for example <code>h*t</code> mapping to all matching words) also avoids trying all 26 letters at each position.</p>",
    },
  ],
  "dsa/matrix-traversal": [
    {
      q: "Number of Islands: how do you model and solve it?",
      a: "<p>The grid is an implicit graph with 4-neighbour edges. Scan cells; on an unvisited land cell, flood fill with DFS or BFS, marking cells visited, and increment the count. O(rows &times; cols) time and space. Marking visited by mutating the grid saves the extra set.</p>",
    },
    {
      q: "How do you return the elements of a matrix in spiral order?",
      a: "<p>Maintain four boundaries (top, bottom, left, right). Walk the top row, right column, bottom row and left column in turn, shrinking the corresponding boundary after each side, and stop when the boundaries cross. Guard the bottom and left passes so a single remaining row or column is not visited twice. O(m n) time.</p>",
    },
    {
      q: "How do you rotate an n x n matrix 90 degrees clockwise in place?",
      a: "<p>Transpose the matrix (swap <code>m[i][j]</code> with <code>m[j][i]</code>), then reverse each row. Both steps are in place, giving O(n&sup2;) time and O(1) extra space. Alternatively rotate four cells at a time layer by layer.</p>",
    },
    {
      q: "In Pacific Atlantic Water Flow, why do you search from the borders instead of from every cell?",
      a: "<p>Searching from every cell repeats work. Reversing the direction, start a DFS/BFS from all Pacific-border cells moving to neighbours with greater or equal height, and do the same from the Atlantic border. The cells reached by both searches are the answer, and each search is O(m n).</p>",
    },
  ],
  "dsa/topological-sort": [
    {
      q: "Compare Kahn's algorithm with the DFS-based topological sort.",
      a: "<p>Kahn's (BFS) repeatedly removes nodes with in-degree 0 and detects cycles when fewer than n nodes are removed. The DFS version emits nodes in post-order and reverses the list, detecting cycles with the on-current-path state. Both are O(V + E); Kahn's is iterative and easy to extend to \"process in layers\".</p>",
    },
    {
      q: "How do you detect that no valid ordering exists?",
      a: "<p>In Kahn's algorithm the produced order has fewer nodes than the graph: the remaining nodes lie on or depend on a cycle. In DFS you meet a node that is still on the current recursion path.</p>",
    },
    {
      q: "Can a graph have more than one valid topological order? How does that affect testing?",
      a: "<p>Yes, whenever two available nodes are independent. Tests should validate the ordering (every edge goes forward) instead of comparing to one specific list, unless the problem guarantees uniqueness.</p>",
    },
    {
      q: "Derive the letter order of an alien language from a sorted word list.",
      a: "<p>For each pair of adjacent words, find the first differing letters <code>x != y</code> and add the edge <code>x -&gt; y</code>. If a longer word precedes its own prefix, the input is invalid. Then topologically sort the letters; a cycle means the ordering is contradictory. Time is linear in the total characters.</p>",
    },
  ],
  "dsa/union-find": [
    {
      q: "What is Union-Find and why are path compression and union by rank used?",
      a: "<p>A disjoint-set structure with <code>find</code> (representative of a set) and <code>union</code> (merge sets). Path compression flattens trees during <code>find</code>; union by rank/size keeps them shallow. Together they give near-constant amortised time, O(&alpha;(n)) per operation.</p>",
    },
    {
      q: "Kruskal vs Prim for a minimum spanning tree?",
      a: "<p>Kruskal sorts edges by weight and adds each edge that does not create a cycle (checked with Union-Find): O(E log E). Prim grows one tree from a start node by repeatedly adding the cheapest crossing edge using a heap: O((V + E) log V). Kruskal suits sparse graphs given as edge lists.</p>",
    },
    {
      q: "Accounts Merge: describe the approach.",
      a: "<p>Give each email an id and union all emails that appear in the same account (for example union each email with the account's first email). Then group emails by their root, sort each group, and attach the account name. Near-linear time using path compression and union by size.</p>",
    },
    {
      q: "Detect a cycle in an undirected graph: Union-Find versus DFS?",
      a: "<p>Both are near-linear. With Union-Find, process edges one at a time; an edge whose endpoints already share a root closes a cycle, which also works when edges arrive online. DFS needs the whole graph and must ignore the edge back to the parent.</p>",
    },
  ],
  "dsa/shortest-path": [
    {
      q: "How does Dijkstra's algorithm work, and what are its limits?",
      a: "<p>Repeatedly pop the unvisited node with the smallest known distance from a min-heap, finalise it, and relax its outgoing edges. With a binary heap it is O((V + E) log V). It requires non-negative edge weights; with negative weights use Bellman-Ford (O(VE)).</p>",
    },
    {
      q: "Pick the shortest-path algorithm: BFS, Dijkstra or Bellman-Ford?",
      a: "<ul><li>Unweighted (or all weights equal): BFS, O(V + E).</li><li>Non-negative weights: Dijkstra.</li><li>Negative weights or need negative-cycle detection: Bellman-Ford.</li></ul>",
    },
    {
      q: "Cheapest Flights Within K Stops: how do you solve it?",
      a: "<p>Bellman-Ford limited to k + 1 rounds: keep a distance array and, in each round, relax every edge using a copy of the previous round's distances so a round adds at most one flight. O(k E). Alternatively run Dijkstra over states (city, stops used), pruning states that exceed the stop limit.</p>",
    },
    {
      q: "Why does Dijkstra fail with negative edge weights? Give an example.",
      a: "<p>Dijkstra finalises a node the first time it is popped, assuming no later path can be shorter. A negative edge can make a longer-looking path cheaper: with edges A-B 2, A-C 3 and C-B -2, B is finalised at 2 but the true shortest distance is 1. Use Bellman-Ford instead.</p>",
    },
  ],
  "dsa/backtracking": [
    {
      q: "Describe the backtracking template.",
      a: "<p>Choose, explore, unchoose: append a choice to the current path, recurse, then remove it. Record a solution at the base case. Add pruning checks before recursing so invalid branches are abandoned early.</p>",
    },
    {
      q: "Compare the sizes of subsets, permutations and combinations output.",
      a: "<p>Subsets of n items: 2<sup>n</sup>. Permutations: n!. Combinations of k from n: C(n, k). Because the output itself is that large, the running time is exponential or factorial no matter how clever the code is; pruning only improves constants.</p>",
    },
    {
      q: "How do you avoid duplicate results when the input has duplicates?",
      a: "<p>Sort the input, then at each recursion level skip a value equal to the previous one that was already tried at that level (<code>if i &gt; start and nums[i] == nums[i-1]: continue</code>). For permutations, use a used-array and the same skip rule.</p>",
    },
    {
      q: "Backtracking vs dynamic programming: how do you choose?",
      a: "<p>If you must enumerate all solutions, use backtracking. If you only need a count or an optimum and subproblems overlap (the same state is reached by different paths), memoise or use DP. Backtracking with memoisation on the state is effectively top-down DP.</p>",
    },
  ],
  "dsa/greedy": [
    {
      q: "How do you know a greedy strategy is correct?",
      a: "<p>Prove the greedy-choice property, typically with an exchange argument (any optimal solution can be transformed to use the greedy choice without getting worse) plus optimal substructure. Try small counterexamples: greedy fails for coin change with coins <code>[1, 3, 4]</code> and amount 6 (greedy gives 4+1+1, optimal is 3+3).</p>",
    },
    {
      q: "Which greedy rule solves interval scheduling (max non-overlapping intervals)?",
      a: "<p>Sort by earliest finish time and repeatedly take the interval that ends first and does not overlap the last chosen one. Sorting by start time or by shortest duration is not correct.</p>",
    },
    {
      q: "Jump Game: greedy solution?",
      a: "<p>Track the farthest reachable index while scanning; if the current index exceeds it, return false. O(n) time, O(1) space. For the minimum number of jumps, track the end of the current jump range and increment a counter when you reach it.</p>",
    },
    {
      q: "Gas Station: why can you skip ahead after a failure?",
      a: "<p>If starting at <code>s</code> the tank first goes negative at <code>i</code>, no start between <code>s</code> and <code>i</code> can work either (they would arrive at each point with no more fuel than starting at <code>s</code>). So restart at <code>i + 1</code>. A solution exists only if total gas &ge; total cost. O(n).</p>",
    },
  ],
  "dsa/dp-1d": [
    {
      q: "How do you recognise a dynamic programming problem, and what is the difference between top-down and bottom-up?",
      a: "<p>Look for overlapping subproblems and optimal substructure, with keywords like \"number of ways\", \"minimum/maximum cost\", \"can you reach\". Top-down is recursion plus memoisation (easy to write, computes only needed states). Bottom-up fills a table in dependency order (no recursion, easier space optimisation).</p>",
    },
    {
      q: "House Robber: give the recurrence and the space optimisation.",
      a: "<p><code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>. Only the last two values are needed, so keep two variables: O(n) time, O(1) space.</p>",
    },
    {
      q: "Coin Change: how does \"minimum coins\" differ from \"number of ways\"?",
      a: "<p>Minimum coins: <code>dp[a] = min(dp[a - c] + 1)</code> over coins, initialised to infinity. Number of ways (combinations): iterate coins in the outer loop and amounts inner loop so each combination is counted once, <code>dp[a] += dp[a - c]</code>. Swapping loop order counts permutations. Both are O(amount &times; coins).</p>",
    },
    {
      q: "Longest Increasing Subsequence: what are the two standard solutions?",
      a: "<p>DP in O(n&sup2;): <code>dp[i] = 1 + max(dp[j])</code> for <code>j &lt; i</code> with <code>nums[j] &lt; nums[i]</code>. Patience-sorting with binary search in O(n log n): maintain the smallest tail of an increasing subsequence for each length and use <code>bisect_left</code> to place each element.</p>",
    },
  ],
  "dsa/dp-2d": [
    {
      q: "Longest Common Subsequence: state the recurrence.",
      a: "<p><code>dp[i][j]</code> is the LCS of the first i and j characters. If <code>a[i-1] == b[j-1]</code> then <code>dp[i-1][j-1] + 1</code>, else <code>max(dp[i-1][j], dp[i][j-1])</code>. O(mn) time; O(min(m, n)) space by keeping one row.</p>",
    },
    {
      q: "Edit Distance: what are the transitions and base cases?",
      a: "<p>If characters match, take <code>dp[i-1][j-1]</code>; otherwise <code>1 + min(insert, delete, replace)</code> = <code>1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])</code>. Base cases: <code>dp[i][0] = i</code> and <code>dp[0][j] = j</code>. O(mn).</p>",
    },
    {
      q: "0/1 Knapsack: how do you reduce space to one dimension?",
      a: "<p>Use a 1-D array over capacity and iterate capacity <em>downwards</em> for each item so each item is used at most once: <code>dp[w] = max(dp[w], dp[w - wt] + val)</code>. Iterating upwards would allow reuse (unbounded knapsack). O(nW) time, O(W) space.</p>",
    },
    {
      q: "Unique Paths with obstacles: how does it change?",
      a: "<p>Set <code>dp</code> to 0 at obstacle cells; otherwise <code>dp[r][c] = dp[r-1][c] + dp[r][c-1]</code>, with the first row and column limited by the first obstacle. It can be rolled into one row for O(cols) space.</p>",
    },
  ],
  "dsa/combining-patterns": [
    {
      q: "What are the signs of a \"binary search on the answer\" problem?",
      a: "<p>The question asks for the minimum or maximum value of something (capacity, speed, days, largest sum) subject to a constraint, the answer lies in a numeric range, and you can write a function <code>feasible(x)</code> that is monotonic: if x works, then every larger (or smaller) x works. Then search the range and use the check as the comparator.</p>",
    },
    {
      q: "How do you convince an interviewer that your feasibility function is monotonic?",
      a: "<p>State the argument directly: for example, if a ship of capacity c can deliver everything in D days, a larger capacity can too, because any packing valid for c is still valid. Then state the search bounds (lower bound the heaviest single item, upper bound the total) and the cost, O(log range times the check).</p>",
    },
    {
      q: "Split Array Largest Sum: outline the solution.",
      a: "<p>Binary search the largest allowed part sum between max(nums) and sum(nums). The greedy check walks the array, starting a new part whenever adding the next element would exceed the limit, and returns whether the number of parts is at most m. The smallest feasible limit is the answer. O(n log sum).</p>",
    },
    {
      q: "When combining patterns, how do you reason about total complexity?",
      a: "<p>Multiply the cost of the outer pattern by the cost of its inner engine: binary search iterations times a linear check, DFS states times work per state (with memoisation, distinct states times work each), trie-pruned backtracking bounded by word lengths. State the pieces separately, then combine them.</p>",
    },
  ],
});
