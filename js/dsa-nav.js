// Shared sidebar + pagination + mobile toggle for every DSA topic page
// (pattern pages and the complexity primer). Centralized here so adding a
// tier or changing nav behavior doesn't require touching per-page HTML.
const TOPIC_ID = "dsa";
const TIERS = ["Foundations", "Beginner", "Intermediate", "Advanced"];

function tierBadgeClass(tier) {
  return `badge-${tier.toLowerCase()}`;
}

function renderSidebar(currentId) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar || typeof DSA_PATTERNS === "undefined") return;

  sidebar.innerHTML = TIERS.map((tier) => {
    const items = DSA_PATTERNS.filter((p) => p.tier === tier);
    if (!items.length) return "";
    const links = items
      .map((p) => {
        const active = p.id === currentId ? "active" : "";
        const done = Progress.isDone(TOPIC_ID, p.id);
        return `<a class="pattern-link ${active}" href="${p.href}">
          <span>${p.title}</span>
          ${done ? '<span class="check">&#10003;</span>' : ""}
        </a>`;
      })
      .join("");
    return `<div class="sidebar-title">${tier}</div>${links}`;
  }).join("");
}

function renderPagination(currentId) {
  const el = document.getElementById("pagination");
  if (!el || typeof DSA_PATTERNS === "undefined") return;

  const idx = DSA_PATTERNS.findIndex((p) => p.id === currentId);
  const prev = idx > 0 ? DSA_PATTERNS[idx - 1] : null;
  const next = idx < DSA_PATTERNS.length - 1 ? DSA_PATTERNS[idx + 1] : null;

  el.innerHTML = `
    ${
      prev
        ? `<a class="prev" href="${prev.href}"><span class="direction">&larr; Previous</span>${prev.title}</a>`
        : `<span></span>`
    }
    ${
      next
        ? `<a class="next" href="${next.href}"><span class="direction">Next &rarr;</span>${next.title}</a>`
        : `<a class="next" href="index.html"><span class="direction">Done &rarr;</span>Back to DSA roadmap</a>`
    }
  `;
}

// Injects a "Patterns" toggle button ahead of the sidebar so mobile users
// aren't forced to scroll past the full pattern list before reaching content.
// Pure JS insertion means every existing/future pattern page gets this for
// free without per-page HTML edits.
function initMobileSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar || sidebar.dataset.toggleReady) return;
  sidebar.dataset.toggleReady = "true";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sidebar-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = `Patterns <span class="sidebar-toggle-icon">&#9662;</span>`;
  sidebar.parentNode.insertBefore(toggle, sidebar);

  toggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sidebar-toggle-icon").innerHTML = open ? "&#9652;" : "&#9662;";
  });
}
