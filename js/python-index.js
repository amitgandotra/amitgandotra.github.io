// Renders the Python roadmap page: topic cards grouped by tier, with
// progress counts and completion checkmarks pulled from localStorage.
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("tier-sections");
  if (!root || typeof PYTHON_TOPICS === "undefined") return;

  const tiers = ["Foundations", "Beginner", "Intermediate", "Advanced"];

  root.innerHTML = tiers
    .map((tier) => {
      const items = PYTHON_TOPICS.filter((p) => p.tier === tier);
      const doneCount = Progress.countDone("python", items.map((p) => p.id));
      const cards = items
        .map((p) => {
          const done = Progress.isDone("python", p.id);
          return `
          <a class="card" href="${p.href}">
            ${done ? '<span class="progress-check">&#10003;</span>' : ""}
            <div class="card-icon">${tier[0]}</div>
            <h3>${p.title}</h3>
            <p>${tier === "Foundations" ? "Setup" : `${tier} topic`}</p>
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
