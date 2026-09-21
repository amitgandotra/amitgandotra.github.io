// Usage: node tools/checks/mobile.js [widths=375,320]   (needs puppeteer-core; see package.json)
// Real-Chrome mobile audit: horizontal overflow, offending elements, small tap targets, tiny text, viewport, screenshots.
const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const SITE = new Function(fs.readFileSync(ROOT + "/js/data/site.js", "utf8") + ";return SITE")();
const BASE = process.env.SITE_URL || "http://localhost:8981/"; // serve the repo root first: python3 -m http.server 8981
const pages = ["index.html"];
for (const t of SITE.topics) { pages.push(`topics/${t.dir}/index.html`); for (const s of t.sections) for (const p of s.pages) pages.push(`topics/${t.dir}/${p.href}`); }
const widths = (process.argv[2] || "375,320").split(",").map(Number);
const shots = process.argv[3] ? process.argv[3].split(",") : [];
(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
  const problems = [];
  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    for (const rel of pages) {
      await page.goto(BASE + rel, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 250));
      const r = await page.evaluate((vw) => {
        const doc = document.documentElement;
        const out = { scrollW: doc.scrollWidth, vw, offenders: [], small: [], tinyText: 0 };
        const rectOK = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        // elements that stick out past the viewport and are not inside a scrollable container
        const inScroller = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth) return true; } return false; };
        for (const el of document.body.querySelectorAll("*")) {
          if (!rectOK(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.right > vw + 1 && !inScroller(el) && getComputedStyle(el).position !== "fixed") {
            out.offenders.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""} right=${Math.round(r.right)}`);
            if (out.offenders.length >= 4) break;
          }
        }
        // small tap targets (visible buttons/links/summary)
        for (const el of document.querySelectorAll("a, button, summary, input, textarea")) {
          if (!rectOK(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.top > document.body.scrollHeight) continue;
          const inline = getComputedStyle(el).display === "inline" && el.tagName === "A" && el.closest("p, li, td, .code-block, .callout");
          if (inline) continue; // inline links inside prose are exempt
          if (r.height < 32 || r.width < 32) out.small.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${(el.className || "").toString().split(" ")[0]} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        out.small = [...new Set(out.small)].slice(0, 5);
        for (const el of document.querySelectorAll("p, li, td, th, span, a")) { if (!el.childNodes.length) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 11 && el.textContent.trim() && rectOK(el)) out.tinyText++; }
        out.viewportMeta = !!document.querySelector('meta[name="viewport"]');
        return out;
      }, w);
      if (r.scrollW > w + 1) problems.push({ w, rel, kind: "HORIZONTAL SCROLL", detail: `scrollWidth ${r.scrollW} > ${w}; ${r.offenders.join(" | ")}` });
      else if (r.offenders.length) problems.push({ w, rel, kind: "sticks out", detail: r.offenders.join(" | ") });
      if (r.small.length) problems.push({ w, rel, kind: "small tap targets", detail: r.small.join(", ") });
      if (!r.viewportMeta) problems.push({ w, rel, kind: "NO VIEWPORT META", detail: "" });
      if (shots.includes(rel) && w === widths[0]) { await page.screenshot({ path: `${__dirname}/shot-${rel.replace(/[\/.]/g, "_")}-${w}.png`, fullPage: false }); }
    }
    await page.close();
  }
  await browser.close();
  const byKind = {};
  problems.forEach((p) => ((byKind[p.kind] ||= []).push(p)));
  console.log(`audited ${pages.length} pages at widths ${widths.join(", ")}px`);
  for (const [k, list] of Object.entries(byKind)) { console.log(`\n${k}: ${list.length}`); list.slice(0, 14).forEach((p) => console.log(`  [${p.w}] ${p.rel}  ${p.detail}`)); }
  if (!problems.length) console.log("no problems found");
})();
