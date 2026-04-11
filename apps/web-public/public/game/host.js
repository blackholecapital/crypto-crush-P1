// Crypto Crush — real game module (host).
// Owns: board, score, moves, goals, selected, busy, paused.
// Receives: an approved entry payload + a single onExit callback.
// Emits: exactly one approved exit payload per session, for one of:
//        "win" | "fail" | "back_out". Never simulates.
//
// The shell does not read or write any of this module's state. The
// shell's only contact points are mountGame() and the onExit callback.
import { newBoard, attemptSwap } from "./engine.js";
import { getLevel } from "./levels.js";
import { buildExit, unlockLevel } from "./contract.js";
import { renderGame } from "./ui.js";

export function mountGame(rootEl, entry, onExit) {
  // Start rules (game-contract): reject missing or out-of-range levelId.
  if (
    entry == null ||
    entry.levelId == null ||
    entry.levelId < 1 ||
    entry.levelId > 5
  ) {
    return { unmount() {} };
  }

  const lv = getLevel(entry.levelId);
  let exited = false;

  // ---- All game-owned state lives here, not in the shell. ----
  const game = {
    levelId: entry.levelId,
    username: entry.username,
    board: newBoard(),
    movesTotal: lv.moves,
    movesRemaining: lv.moves,
    score: 0,
    goals: { ...lv.goals },
    selected: null,
    busy: false,
    paused: false,
  };

  function emit(outcome, nextRoute) {
    if (exited) return;
    exited = true;
    const payload = buildExit({
      levelId: game.levelId,
      username: game.username,
      outcome,
      score: game.score,
      movesUsed: lv.moves - Math.max(0, game.movesRemaining),
      movesRemaining: Math.max(0, game.movesRemaining),
      nextRoute,
    });
    if (outcome === "win" && game.levelId < 5) {
      unlockLevel(game.levelId + 1);
    }
    onExit(payload);
  }

  function dispatch(action) {
    if (exited) return;
    switch (action.type) {
      case "PAUSE":
        if (game.busy) return;
        game.paused = true;
        return draw();
      case "RESUME":
        game.paused = false;
        return draw();
      case "RETRY":
        // Pause-menu retry: emit a back_out with nextRoute=retry. The
        // shell decides how to relaunch — the game module never
        // re-creates its own session.
        if (game.busy) return;
        return emit("back_out", "retry");
      case "QUIT":
        if (game.busy) return;
        return emit("back_out", "level_select");
      case "CELL_TAP":
        if (game.busy || game.paused) return;
        handleCellTap(action.r, action.c);
        return draw();
    }
  }

  function handleCellTap(r, c) {
    if (!game.selected) {
      game.selected = [r, c];
      return;
    }
    const [r1, c1] = game.selected;
    if (r1 === r && c1 === c) {
      game.selected = null;
      return;
    }
    const dist = Math.abs(r1 - r) + Math.abs(c1 - c);
    if (dist !== 1) {
      game.selected = [r, c];
      return;
    }
    game.busy = true;
    game.selected = null;
    const res = attemptSwap(game.board, r1, c1, r, c, game.goals);
    if (res.committed) {
      game.movesRemaining -= 1;
      game.score += res.scoreGained;
      const won = Object.values(game.goals).every((v) => v <= 0);
      if (won) {
        // Win bonus: 500 per leftover move.
        game.score += 500 * Math.max(0, game.movesRemaining);
        emit("win", game.levelId < 5 ? "next_level" : "level_select");
        return;
      }
      if (game.movesRemaining <= 0) {
        emit("fail", "retry");
        return;
      }
    }
    game.busy = false;
  }

  function draw() {
    if (exited) return;
    renderGame(rootEl, game, dispatch);
  }

  draw();

  return {
    unmount() {
      exited = true;
      if (rootEl) rootEl.innerHTML = "";
    },
  };
}
