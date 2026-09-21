// Syntax-compiles every Python example in the lessons, and runs the self-contained ones.  Run: node tools/checks/checkcode.js
// Extract every python code block from lesson HTML; syntax-compile all, execute those that are self-contained.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const SITE = new Function(fs.readFileSync(ROOT + "/js/data/site.js", "utf8") + "; return SITE;")();
let compiled = 0, syntaxBad = 0, ran = 0, runBad = [];
const prelude = "from typing import *\nclass ListNode:\n    def __init__(self,val=0,next=None): self.val=val; self.next=next\nclass TreeNode:\n    def __init__(self,val=0,left=None,right=None): self.val=val; self.left=left; self.right=right\n";
for (const t of SITE.topics) for (const s of t.sections) for (const p of s.pages) {
  if (t.id === "dsa" && p.id === "complexity") continue;
  const html = fs.readFileSync(path.join(ROOT, "topics", t.dir, p.href), "utf8");
  const m = html.match(/const PAGE_DATA = ([\s\S]*?);\s*<\/script>/);
  if (!m) continue;
  const d = new Function("return (" + m[1] + ")")();
  const blocks = [];
  if (d.template && (d.template.label || "python").startsWith("python") && !/needs/.test(d.template.label||"")) blocks.push([`${t.id}/${p.id} template`, d.template.code]);
  for (const ex of d.examples) if ((ex.label || "python") === "python") blocks.push([`${t.id}/${p.id} ${ex.title}`, ex.code]);
  for (const [name, code] of blocks) {
    compiled++;
    const c = cp.spawnSync("python3", ["-c", "import sys,ast; ast.parse(sys.stdin.read())"], { input: code, encoding: "utf8" });
    if (c.status !== 0) { syntaxBad++; console.log("SYNTAX", name, (c.stderr||"").split("\n").slice(-3).join(" ")); continue; }
    if (t.id === "patterns" || t.id === "integration") continue; // already executed earlier
    ran++;
    const r = cp.spawnSync("python3", ["-c", prelude + code], { encoding: "utf8", timeout: 20000 });
    if (r.status !== 0) runBad.push([name, (r.stderr || "").trim().split("\n").slice(-1)[0]]);
  }
}
console.log(`compiled ${compiled} blocks (${syntaxBad} syntax errors); executed ${ran} in dsa/python; run failures: ${runBad.length}`);
runBad.forEach(([n, e]) => console.log("  RUN", n, "->", e));
