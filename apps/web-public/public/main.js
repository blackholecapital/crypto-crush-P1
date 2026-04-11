// Crypto Crush — public game surface entry (P2.2).
// Mounts the real game shell on `/` and drives the screen state machine:
//   splash → level_select → game → result
import { renderSplash, renderLevelSelect, renderGame, renderResult } from "./game/ui.js";
import { buildEntry, buildExit, unlockLevel } from "./game/contract.js";
import { getLevel } from "./game/levels.js";
import { newBoard, attemptSwap } from "./game/engine.js";

const root = document.getElementById("app");

// Visible states: splash | level_select | game | result
let screen = "splash";
let game = null; // active game state or null
let exitPayload = null; // last emitted exit payload

function dispatch(action) {
  switch (action.type) {
    case "GO_SPLASH":
      screen = "splash";
      game = null;
      exitPayload = null;
      return render();
    case "GO_LEVEL_SELECT":
      screen = "level_select";
      game = null;
      exitPayload = null;
      return render();
    case "LAUNCH_LEVEL": {
      const entry = buildEntry(action.levelId, { entrySource: "level_select" });
      startGame(entry);
      return render();
    }
    case "PAUSE":
      if (!game || game.busy) return;
      game.paused = true;
      return render();
    case "RESUME":
      if (!game) return;
      game.paused = false;
      return render();
    case "RETRY": {
      if (screen === "result" && exitPayload) {
        const entry = buildEntry(exitPayload.levelId, { entrySource: "retry" });
        startGame(entry);
        return render();
      }
      if (game) {
        const lvId = game.levelId;
        const entry = buildEntry(lvId, { entrySource: "retry" });
        startGame(entry);
        return render();
      }
      return;
    }
    case "QUIT":
      if (!game || game.busy) return;
      finishGame("back_out", "level_select");
      return render();
    case "NEXT_LEVEL": {
      if (exitPayload && exitPayload.levelId < 5) {
        const entry = buildEntry(exitPayload.levelId + 1, { entrySource: "next_level" });
        startGame(entry);
        return render();
      }
      return;
    }
    case "CELL_TAP":
      if (!game || game.busy || game.paused) return;
      handleCellTap(action.r, action.c);
      return render();
  }
}

// Start rules (game-contract): reject if levelId missing or out of 1..5, fresh start.
function startGame(entry) {
  if (entry.levelId == null || entry.levelId < 1 || entry.levelId > 5) {
    screen = "level_select";
    game = null;
    return;
  }
  const lv = getLevel(entry.levelId);
  game = {
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
  screen = "game";
  exitPayload = null;
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
    // Not adjacent — treat as a new selection.
    game.selected = [r, c];
    return;
  }

  // Active resolve: no exit/pause during cascade. attemptSwap is synchronous,
  // so `busy` is a structural guard more than a temporal race window.
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
      finishGame("win", game.levelId < 5 ? "next_level" : "level_select");
      return;
    }
    if (game.movesRemaining <= 0) {
      finishGame("fail", "retry");
      return;
    }
  }
  if (game) game.busy = false;
}

function finishGame(outcome, nextRoute) {
  const lv = getLevel(game.levelId);
  exitPayload = buildExit({
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
  game = null;
  screen = "result";
}

function render() {
  if (!root) return;
  switch (screen) {
    case "splash":
      return renderSplash(root, dispatch);
    case "level_select":
      return renderLevelSelect(root, dispatch);
    case "game":
      return renderGame(root, game, dispatch);
    case "result":
      return renderResult(root, exitPayload, dispatch);
  }
}

render();
