// Shell game container only.
// Shell does NOT own board, score, moves, goals, or cascade logic.
// This host:
//   1. Builds an approved WA entry payload from shell state.
//   2. Surfaces the payload to whatever game component is mounted.
//   3. Accepts an approved WA exit payload back through state.recordResult().
//
// For the P2.2 demo wiring, no real game module is bundled, so the host
// provides three simulation buttons that produce exit payloads matching
// the approved contract. These stand in for real game outcomes and prove
// the handoff/route wiring without the shell owning game logic.

import { buildEntryPayload, isValidExitPayload } from "./contracts.js";

export function renderGameHost(root, state) {
  const entry = buildEntryPayload(state, "level_select");

  const h = document.createElement("h2");
  h.textContent = `Game - Level ${entry.levelId}`;
  root.appendChild(h);

  const payloadPre = document.createElement("pre");
  payloadPre.textContent =
    "WA entry payload (consumed):\n" + JSON.stringify(entry, null, 2);
  root.appendChild(payloadPre);

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent =
    "Shell hosts game container only. Game owns board, score, moves, goals.";
  root.appendChild(note);

  const actions = document.createElement("div");
  actions.className = "actions";

  function submitExit(exit) {
    if (!isValidExitPayload(exit)) return;
    state.recordResult(exit);
  }

  const winBtn = document.createElement("button");
  winBtn.textContent = "Simulate Win → next_level";
  winBtn.onclick = () =>
    submitExit({
      levelId: entry.levelId,
      username: entry.username,
      outcome: "win",
      score: 1000,
      movesUsed: 12,
      movesRemaining: 8,
      nextRoute: "next_level",
    });
  actions.appendChild(winBtn);

  const failBtn = document.createElement("button");
  failBtn.textContent = "Simulate Fail → retry";
  failBtn.onclick = () =>
    submitExit({
      levelId: entry.levelId,
      username: entry.username,
      outcome: "fail",
      score: 200,
      movesUsed: 20,
      movesRemaining: 0,
      nextRoute: "retry",
    });
  actions.appendChild(failBtn);

  const backBtn = document.createElement("button");
  backBtn.textContent = "Simulate Back Out → level_select";
  backBtn.onclick = () =>
    submitExit({
      levelId: entry.levelId,
      username: entry.username,
      outcome: "back_out",
      score: 0,
      movesUsed: 0,
      movesRemaining: 20,
      nextRoute: "level_select",
    });
  actions.appendChild(backBtn);

  root.appendChild(actions);
}
