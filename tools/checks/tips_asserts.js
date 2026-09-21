// Checks js/data/dsa-tips.js:
//   1. structure: every DSA pattern lesson has cues, keys, 2+ disguised problems, an example, 3 Python tips
//   2. every Python example passes its known-answer `check`, and every runnable snippet executes
//   3. the pattern finder's keyword scoring puts the right pattern in the top 3 for each disguised problem
// Run: node tools/checks/tips_asserts.js
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os");
const ROOT = path.resolve(__dirname, "..", "..");
const SITE = new Function(fs.readFileSync(path.join(ROOT, "js/data/site.js"), "utf8") + "; return SITE;")();
const w = {};
new Function("window", fs.readFileSync(path.join(ROOT, "js/data/dsa-tips.js"), "utf8"))(w);
const T = w.DSA_TIPS;

let fails = 0;
const fail = (m) => { fails++; console.log("FAIL", m); };

// ---- 1. structure ----
const dsa = SITE.topics.find((t) => t.id === "dsa");
const patternIds = dsa.sections.flatMap((s) => s.pages.map((p) => p.id)).filter((id) => !["complexity", "playbook", "combining-patterns"].includes(id));
for (const id of patternIds) {
  const p = T.patterns[id];
  if (!p) { fail(`no tips for pattern ${id}`); continue; }
  if (!p.ask) fail(`${id}: ask`);
  if (!p.cues || p.cues.length < 5) fail(`${id}: needs 5+ cues`);
  if (!p.keys || p.keys.length < 6) fail(`${id}: needs 6+ finder keys`);
  if (!p.notWhen) fail(`${id}: notWhen`);
  if (!p.spot || p.spot.length < 2) fail(`${id}: needs 2+ disguised problems`);
  (p.spot || []).forEach((s, i) => {
    if (!/\*\*.+\*\*/.test(s.text)) fail(`${id}: spot ${i} has no **cue** marks`);
    if (!s.why || s.why.length < 30) fail(`${id}: spot ${i} why`);
  });
  const ex = p.example || {};
  if (!ex.title || !ex.code || !ex.check || !ex.explanation || !ex.complexity) fail(`${id}: example incomplete`);
  if (!p.python || p.python.length < 3) fail(`${id}: needs 3+ python tips`);
  (p.keys || []).forEach(([k, wt]) => { if (k !== k.toLowerCase() || typeof wt !== "number") fail(`${id}: bad key ${k}`); });
}
for (const id of Object.keys(T.patterns)) if (!patternIds.includes(id)) fail(`tips for unknown pattern ${id}`);

// ---- 2. run the Python ----
const prelude = `import itertools
from collections import *
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
const run = (name, code) => {
  const file = path.join(os.tmpdir(), "fde_tip.py");
  fs.writeFileSync(file, code);
  const r = cp.spawnSync("python3", [file], { encoding: "utf8", timeout: 20000 });
  if (r.status !== 0) fail(`${name}: ${(r.stderr || "").trim().split("\n").slice(-2).join(" | ")}`);
  return r.status === 0;
};
let ran = 0;
for (const id of patternIds) {
  const p = T.patterns[id];
  if (!p) continue;
  ran++; run(`${id} example`, prelude + p.example.code + "\n" + p.example.check + "\n");
  p.python.forEach((t, i) => { if (t.code && t.run !== false) { ran++; run(`${id} python tip ${i}`, prelude + t.code + "\n"); } });
}
T.general.toolbox.forEach((t) => { ran++; run(`toolbox ${t.name}`, t.code + "\n"); });
T.general.pitfalls.forEach((t) => { ran++; run(`pitfall ${t.title}`, t.code + "\n"); });

// ---- 3. finder sanity: right pattern in the top 3 for each disguised problem ----
// same rule as the finder on the playbook page: a key must start at a word boundary ("sorted" must not match "unsorted")
const reEscape = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (low, k) => new RegExp("(?<![a-z0-9])" + reEscape(k)).test(low);
const scoreAll = (text) => {
  const low = text.toLowerCase();
  return Object.entries(T.patterns).map(([id, p]) => ({ id, s: p.keys.reduce((n, [k, wt]) => n + (has(low, k) ? wt : 0), 0) })).sort((a, b) => b.s - a.s);
};
let finderChecked = 0, top1 = 0;
for (const id of patternIds) {
  const p = T.patterns[id];
  if (!p) continue;
  for (const s of [...p.spot.map((x) => x.text), p.example.prompt]) {
    finderChecked++;
    const plain = s.replace(/\*\*/g, "").replace(/`/g, "").replace(/<[^>]+>/g, "");
    const ranked = scoreAll(plain);
    const pos = ranked.findIndex((r) => r.id === id);
    if (ranked[pos].s === 0 || pos > 2) fail(`finder: "${plain.slice(0, 70)}..." expected ${id}, top = ${ranked.slice(0, 3).map((r) => r.id + ":" + r.s).join(", ")}`);
    else if (pos === 0) top1++;
  }
}

console.log(`${patternIds.length} patterns; ran ${ran} Python snippets; finder: ${finderChecked} prompts checked, ${top1} ranked first, rest in top 3`);
console.log(fails ? `${fails} FAILURES` : "ALL TIPS CHECKS PASSED");
process.exit(fails ? 1 : 0);
