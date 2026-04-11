// Crypto Crush — public shell entry (P2.3, live route correction).
//
// THIN SHELL. The shell may only:
//   1. build approved entry payloads
//   2. pass payloads into the real game module (game/host.js)
//   3. receive approved exit payloads via the onExit callback
//   4. route the result screen
//
// The shell does NOT:
//   • own board / score / moves / goals
//   • simulate any outcome
//   • fake a result emission
//   • render the game itself
//
// On the live `/` path the game route mounts game/host.js directly.
// There is no simulation host. There are no debug buttons.
import { renderSplash, renderLevelSelect, renderResult } from "./game/ui.js";
import { buildEntry } from "./game/contract.js";
import { mountGame } from "./game/host.js";

const root = document.getElementById("app");

// Visible states: splash | level_select | game | result
let screen = "splash";
let exitPayload = null;
let mountedGame = null;

function dispatch(action) {
  switch (action.type) {
    case "GO_SPLASH":
      unmountGame();
      screen = "splash";
      exitPayload = null;
      return render();
    case "GO_LEVEL_SELECT":
      unmountGame();
      screen = "level_select";
      exitPayload = null;
      return render();
    case "LAUNCH_LEVEL":
      return launch(action.levelId, "level_select");
    case "RETRY":
      if (exitPayload) return launch(exitPayload.levelId, "retry");
      return;
    case "NEXT_LEVEL":
      if (exitPayload && exitPayload.levelId < 5) {
        return launch(exitPayload.levelId + 1, "next_level");
      }
      return;
  }
}

// Build an approved entry payload and hand it to the real game module.
// The shell never touches game internals after this call.
function launch(levelId, source) {
  unmountGame();
  exitPayload = null;
  screen = "game";
  const entry = buildEntry(levelId, { entrySource: source });
  mountedGame = mountGame(root, entry, onExit);
}

// Receive the real exit payload from the game module and route it.
function onExit(payload) {
  exitPayload = payload;
  unmountGame();
  // Route per approved current flow:
  //   win  → result
  //   fail → result
  //   back_out → result OR level_select OR retry-relaunch (per nextRoute)
  if (payload.outcome === "back_out") {
    if (payload.nextRoute === "retry") {
      return launch(payload.levelId, "retry");
    }
    screen = "level_select";
    return render();
  }
  screen = "result";
  return render();
}

function unmountGame() {
  if (mountedGame) {
    mountedGame.unmount();
    mountedGame = null;
  }
}

function render() {
  if (!root) return;
  switch (screen) {
    case "splash":
      return renderSplash(root, dispatch);
    case "level_select":
      return renderLevelSelect(root, dispatch);
    case "result":
      return renderResult(root, exitPayload, dispatch);
    case "game":
      // Game screen is rendered by the mounted game module, not the shell.
      return;
  }
}

render();
