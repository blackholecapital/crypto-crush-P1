// Approved WA entry payload consumer.
// Payload shape is NOT redefined here - this only constructs the agreed fields
// from shell-owned state before handing off to the game.

export function buildEntryPayload(state, entrySource = "level_select") {
  const s = state.get();
  return {
    levelId: s.selectedLevel,
    username: s.username,
    sessionId: s.sessionId,
    entrySource,
    audioEnabled: s.audioEnabled,
    hapticsEnabled: s.hapticsEnabled,
  };
}

// Validates that an exit payload carries the approved fields.
// Shell does not compute or mutate score/moves - it only reads.
export function isValidExitPayload(p) {
  if (!p || typeof p !== "object") return false;
  const required = [
    "levelId",
    "username",
    "outcome",
    "score",
    "movesUsed",
    "movesRemaining",
    "nextRoute",
  ];
  return required.every((k) => k in p);
}
