// Shared localStorage-backed progress tracker.
// Key shape: fde_progress = { "dsa:arrays-hashing": { done: true, score: 4, total: 5, ts: 169... } }
const Progress = (() => {
  const KEY = "fde_progress";

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function key(topicId, patternId) {
    return `${topicId}:${patternId}`;
  }

  return {
    isDone(topicId, patternId) {
      const all = readAll();
      return !!all[key(topicId, patternId)]?.done;
    },
    record(topicId, patternId, score, total) {
      const all = readAll();
      all[key(topicId, patternId)] = {
        done: score / total >= 0.6,
        score,
        total,
        ts: Date.now(),
      };
      writeAll(all);
    },
    get(topicId, patternId) {
      const all = readAll();
      return all[key(topicId, patternId)] || null;
    },
    countDone(topicId, patternIds) {
      const all = readAll();
      return patternIds.filter((id) => all[key(topicId, id)]?.done).length;
    },
  };
})();
