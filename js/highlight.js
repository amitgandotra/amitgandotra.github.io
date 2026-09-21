// Minimal dependency-free Python syntax highlighter for <pre><code> blocks.
const PY_KEYWORDS = [
  "def", "class", "return", "if", "elif", "else", "for", "while", "in", "not",
  "and", "or", "is", "import", "from", "as", "break", "continue", "pass",
  "True", "False", "None", "try", "except", "finally", "raise", "with",
  "yield", "lambda", "global", "nonlocal", "assert", "del",
];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightPython(code) {
  const escaped = escapeHtml(code);
  const kwPattern = PY_KEYWORDS.join("|");
  const pattern = new RegExp(
    `(#.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(${kwPattern})\\b|\\b(self)\\b|\\b(\\d+\\.?\\d*)\\b|\\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\\()`,
    "gm"
  );

  return escaped.replace(pattern, (match, comment, string, kw, self, num, fn) => {
    if (comment) return `<span class="tok-com">${comment}</span>`;
    if (string) return `<span class="tok-str">${string}</span>`;
    if (kw) return `<span class="tok-kw">${kw}</span>`;
    if (self) return `<span class="tok-self">${self}</span>`;
    if (num) return `<span class="tok-num">${num}</span>`;
    if (fn) return `<span class="tok-fn">${fn}</span>`;
    return match;
  });
}
