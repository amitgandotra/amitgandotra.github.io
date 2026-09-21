// Homepage rendering: topic card grid from js/data/topics.js
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("topic-grid");
  if (!grid || typeof TOPICS === "undefined") return;

  grid.innerHTML = TOPICS.map((t) => {
    const available = t.status === "available";
    const tag = available
      ? ""
      : `<span class="status-badge">coming soon</span>`;
    const tagName = available ? "a" : "div";
    return `
      <${tagName} class="card ${available ? "" : "disabled"}" ${available ? `href="${t.href}"` : ""}>
        ${tag}
        <div class="card-icon">${t.icon}</div>
        <h3>${t.title}</h3>
        <p>${t.tagline}</p>
      </${tagName}>
    `;
  }).join("");
});
