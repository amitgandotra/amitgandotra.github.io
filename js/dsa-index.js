// Renders the DSA roadmap page: pattern cards grouped by tier, with
// progress counts and completion checkmarks pulled from localStorage.
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("tier-sections");
  if (!root || typeof DSA_PATTERNS === "undefined") return;

  const tiers = ["Foundations", "Beginner", "Intermediate", "Advanced"];

  root.innerHTML = tiers
    .map((tier) => {
      const items = DSA_PATTERNS.filter((p) => p.tier === tier);
      const doneCount = Progress.countDone("dsa", items.map((p) => p.id));
      const cards = items
        .map((p) => {
          const done = Progress.isDone("dsa", p.id);
          return `
          <a class="card" href="${p.href}">
            ${done ? '<span class="progress-check">&#10003;</span>' : ""}
            <div class="card-icon">${tier[0]}</div>
            <h3>${p.title}</h3>
            <p>${tier === "Foundations" ? "Core concept" : `${tier} pattern`}</p>
          </a>
        `;
        })
        .join("");
      return `
        <div class="tier-section">
          <div class="tier-heading">
            <h2>${tier}</h2>
            <span class="tier-progress">${doneCount}/${items.length} complete</span>
          </div>
          <div class="card-grid">${cards}</div>
        </div>
      `;
    })
    .join("");
});
