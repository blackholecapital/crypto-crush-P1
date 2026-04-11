// Shell-owned state only.
// Owns: currentScreen, selectedLevel, unlocked level memory,
//       guest identity display, local settings constants.
// Does NOT own: board, score, moves logic, goal logic, cascade logic.

export const MAX_LEVEL = 5;

export function createShellState() {
  const listeners = new Set();

  const data = {
    currentScreen: "splash",
    selectedLevel: null,
    unlockedLevel: 1,
    username: "Guest",
    sessionId: null,
    audioEnabled: true,
    hapticsEnabled: true,
    lastResult: null,
  };

  function notify() {
    for (const fn of listeners) fn();
  }

  return {
    get() {
      return data;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    MAX_LEVEL,

    goSplash() {
      data.currentScreen = "splash";
      notify();
    },

    goLevelSelect() {
      data.currentScreen = "level_select";
      data.selectedLevel = null;
      data.lastResult = null;
      notify();
    },

    launchLevel(levelId) {
      if (typeof levelId !== "number") return;
      if (levelId < 1 || levelId > MAX_LEVEL) return;
      if (levelId > data.unlockedLevel) return;
      data.selectedLevel = levelId;
      data.lastResult = null;
      data.currentScreen = "game";
      notify();
    },

    // Called when the shell receives an approved WA exit payload.
    // Shell owns only: unlock memory + route decision.
    recordResult(exitPayload) {
      data.lastResult = exitPayload;
      if (
        exitPayload &&
        exitPayload.outcome === "win" &&
        typeof data.selectedLevel === "number"
      ) {
        const next = Math.min(data.selectedLevel + 1, MAX_LEVEL);
        if (next > data.unlockedLevel) data.unlockedLevel = next;
      }
      data.currentScreen = "result";
      notify();
    },

    // Route decision from result screen based on nextRoute.
    routeFromResult() {
      const r = data.lastResult;
      if (!r) {
        data.selectedLevel = null;
        data.currentScreen = "level_select";
        notify();
        return;
      }
      if (r.outcome === "win" && r.nextRoute === "next_level") {
        const next = Math.min((data.selectedLevel ?? 1) + 1, MAX_LEVEL);
        data.selectedLevel = next;
        data.lastResult = null;
        data.currentScreen = "game";
      } else if (r.outcome === "fail" && r.nextRoute === "retry") {
        data.lastResult = null;
        data.currentScreen = "game";
      } else {
        // back_out or any other -> level_select
        data.selectedLevel = null;
        data.lastResult = null;
        data.currentScreen = "level_select";
      }
      notify();
    },
  };
}
