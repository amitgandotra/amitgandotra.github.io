// Auto-graded multiple choice quiz engine.
// Usage: initQuiz({ containerId, questions, topicId, patternId })
function initQuiz({ containerId, questions, topicId, patternId }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let index = 0;
  let score = 0;
  let answered = false;
  const picks = new Array(questions.length).fill(null);

  render();

  function render() {
    if (index >= questions.length) {
      renderResult();
      return;
    }
    const q = questions[index];
    answered = picks[index] !== null;
    const pct = Math.round((index / questions.length) * 100);

    container.innerHTML = `
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-progress">Question ${index + 1} of ${questions.length}</div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, i) => `<button class="quiz-option" data-i="${i}">${opt}</button>`
          )
          .join("")}
      </div>
      <div class="quiz-feedback" id="qf"></div>
      <div class="quiz-actions">
        <button class="btn" id="qn" disabled>${
          index === questions.length - 1 ? "See Results" : "Next Question"
        }</button>
      </div>
    `;

    const optionEls = container.querySelectorAll(".quiz-option");
    const nextBtn = container.querySelector("#qn");
    const feedback = container.querySelector("#qf");

    optionEls.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (picks[index] !== null) return; // already answered
        const chosen = parseInt(btn.dataset.i, 10);
        picks[index] = chosen;
        const correct = chosen === q.correct;
        if (correct) score++;

        optionEls.forEach((b) => (b.disabled = true));
        btn.classList.add(correct ? "correct" : "incorrect");
        if (!correct) {
          optionEls[q.correct].classList.add("reveal");
        }

        feedback.classList.add("show", correct ? "is-correct" : "is-incorrect");
        feedback.textContent = (correct ? "Correct — " : "Not quite — ") + q.explanation;

        nextBtn.disabled = false;
      });
    });

    nextBtn.addEventListener("click", () => {
      index++;
      render();
    });
  }

  function renderResult() {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;

    if (topicId && patternId) {
      Progress.record(topicId, patternId, score, questions.length);
    }

    container.innerHTML = `
      <div class="quiz-result">
        <div class="score">${score}/${questions.length}</div>
        <div class="score-label">${pct}% correct</div>
        <div class="verdict" style="color:${passed ? "var(--beginner)" : "var(--advanced)"}">
          ${passed ? "Passed — pattern marked complete." : "Below 60% — give it another pass."}
        </div>
        <div class="quiz-actions" style="justify-content:center; margin-top:20px;">
          <button class="btn btn-secondary" id="qr">Retake Quiz</button>
        </div>
      </div>
    `;

    container.querySelector("#qr").addEventListener("click", () => {
      index = 0;
      score = 0;
      picks.fill(null);
      render();
    });

    document.dispatchEvent(
      new CustomEvent("quiz-complete", { detail: { topicId, patternId, passed, score, total: questions.length } })
    );
  }
}
