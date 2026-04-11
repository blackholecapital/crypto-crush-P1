export const TOKENS = ["T_BTC", "T_ETH", "T_SUI", "T_XRP", "T_USDC"];

export const TOKEN_DISPLAY = {
  T_BTC:  { label: "BTC",  color: "#f7931a" },
  T_ETH:  { label: "ETH",  color: "#8a2be2" },
  T_SUI:  { label: "SUI",  color: "#00d1ff" },
  T_XRP:  { label: "XRP",  color: "#d8d8d8" },
  T_USDC: { label: "USDC", color: "#2775ca" },
};

// Approved defaults for the public demo surface (P2.2).
// Allows guest path: username "Guest", sessionId null.
export const DEFAULT_ENTRY = {
  username: "Guest",
  sessionId: null,
  entrySource: "level_select",
  audioEnabled: true,
  hapticsEnabled: true,
};

export function buildEntry(levelId, overrides = {}) {
  return { levelId, ...DEFAULT_ENTRY, ...overrides };
}

export function buildExit({
  levelId,
  username,
  outcome,
  score,
  movesUsed,
  movesRemaining,
  nextRoute,
}) {
  return { levelId, username, outcome, score, movesUsed, movesRemaining, nextRoute };
}

// Local-only unlock state for the public demo (no backend, no auth).
const UNLOCK_KEY = "cc.unlock.maxUnlocked";

export function getMaxUnlocked() {
  try {
    const v = Number(localStorage.getItem(UNLOCK_KEY)) || 1;
    return Math.max(1, Math.min(5, v));
  } catch {
    return 1;
  }
}

export function unlockLevel(n) {
  try {
    const cur = getMaxUnlocked();
    if (n > cur) localStorage.setItem(UNLOCK_KEY, String(Math.min(5, n)));
  } catch {}
}
