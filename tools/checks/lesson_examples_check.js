// Runs every DSA lesson example (tools/checks/lesson_examples.json, generated with the lessons)
// against its known-answer asserts. Run: node tools/checks/lesson_examples_check.js
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os");
const entries = JSON.parse(fs.readFileSync(path.join(__dirname, "lesson_examples.json"), "utf8"));
const prelude = `import itertools, heapq, math
from collections import *
from functools import lru_cache
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right
def lst(xs):
    d = ListNode(); t = d
    for x in xs:
        t.next = ListNode(x); t = t.next
    return d.next
def tolist(n):
    o = []
    while n:
        o.append(n.val); n = n.next
    return o
def tree(vals):
    nodes = [None if v is None else TreeNode(v) for v in vals]
    kids = nodes[::-1]; root = kids.pop()
    for n in nodes:
        if n:
            if kids: n.left = kids.pop()
            if kids: n.right = kids.pop()
    return root
`;
let bad = 0;
for (const e of entries) {
  const code = prelude + (e.template ? e.template + "\n" : "") + e.code + "\n" + e.check + "\n";
  const file = path.join(os.tmpdir(), "fde_lesson_example.py");
  fs.writeFileSync(file, code);
  const r = cp.spawnSync("python3", [file], { encoding: "utf8", timeout: 30000 });
  if (r.status !== 0) { bad++; console.log("FAIL", e.lesson, "|", e.title, "\n   ", (r.stderr || "").trim().split("\n").slice(-3).join("\n    ")); }
}
console.log(`${entries.length} lesson examples checked across ${new Set(entries.map((e) => e.lesson)).size} lessons, ${bad} failed`);
process.exit(bad ? 1 : 0);
