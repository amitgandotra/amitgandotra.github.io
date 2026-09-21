// Shared sidebar + pagination + mobile toggle for the Python topic pages.
// Parallel to js/dsa-nav.js (kept separate rather than generalized, so the
// already-validated DSA pages don't need to be touched).
const PY_TOPIC_ID = "python";
const PY_TIERS = ["Foundations", "Beginner", "Intermediate", "Advanced"];

function pyTierBadgeClass(tier) {
  return `badge-${tier.toLowerCase()}`;
}

function renderPySidebar(currentId) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar || typeof PYTHON_TOPICS === "undefined") return;

  sidebar.innerHTML = PY_TIERS.map((tier) => {
    const items = PYTHON_TOPICS.filter((p) => p.tier === tier);
    if (!items.length) return "";
    const links = items
      .map((p) => {
        const active = p.id === currentId ? "active" : "";
        const done = Progress.isDone(PY_TOPIC_ID, p.id);
        return `<a class="pattern-link ${active}" href="${p.href}">
          <span>${p.title}</span>
          ${done ? '<span class="check">&#10003;</span>' : ""}
        </a>`;
      })
      .join("");
    return `<div class="sidebar-title">${tier}</div>${links}`;
  }).join("");
}

function renderPyPagination(currentId) {
  const el = document.getElementById("pagination");
  if (!el || typeof PYTHON_TOPICS === "undefined") return;

  const idx = PYTHON_TOPICS.findIndex((p) => p.id === currentId);
  const prev = idx > 0 ? PYTHON_TOPICS[idx - 1] : null;
  const next = idx < PYTHON_TOPICS.length - 1 ? PYTHON_TOPICS[idx + 1] : null;

  el.innerHTML = `
    ${
      prev
        ? `<a class="prev" href="${prev.href}"><span class="direction">&larr; Previous</span>${prev.title}</a>`
        : `<span></span>`
    }
    ${
      next
        ? `<a class="next" href="${next.href}"><span class="direction">Next &rarr;</span>${next.title}</a>`
        : `<a class="next" href="index.html"><span class="direction">Done &rarr;</span>Back to Python roadmap</a>`
    }
  `;
}

// Injects a "Topics" toggle button ahead of the sidebar on mobile so users
// aren't forced to scroll past the full topic list before reaching content.
function initPyMobileSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar || sidebar.dataset.toggleReady) return;
  sidebar.dataset.toggleReady = "true";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sidebar-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = `Topics <span class="sidebar-toggle-icon">&#9662;</span>`;
  sidebar.parentNode.insertBefore(toggle, sidebar);

  toggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sidebar-toggle-icon").innerHTML = open ? "&#9652;" : "&#9662;";
  });
}
