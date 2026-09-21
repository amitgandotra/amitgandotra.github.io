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

// One-time migration: the DSA lessons "linked-list", "graphs" and "advanced-graphs" were split into
// more focused ones. Carry a completed result over to each successor so no progress is lost.
(function migrateProgress() {
  try {
    const KEY = "fde_progress";
    const all = JSON.parse(localStorage.getItem(KEY)) || {};
    const SPLIT = {
      "dsa:linked-list": ["dsa:fast-slow-pointers", "dsa:linked-list-reversal"],
      "dsa:graphs": ["dsa:dfs", "dsa:bfs", "dsa:matrix-traversal"],
      "dsa:advanced-graphs": ["dsa:shortest-path", "dsa:union-find"],
    };
    let changed = false;
    for (const [oldKey, successors] of Object.entries(SPLIT)) {
      if (!all[oldKey]) continue;
      for (const k of successors) if (!all[k]) all[k] = all[oldKey];
      delete all[oldKey];
      changed = true;
    }
    if (changed) localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {}
})();
