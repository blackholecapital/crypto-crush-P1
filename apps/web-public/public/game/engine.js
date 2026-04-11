// Crypto Crush — board engine (P1 core rules).
// 8x8, 5 tokens, uniform spawn, match-3+, gravity, refill, cascade.
import { TOKENS } from "./contract.js";

export const W = 8;
export const H = 8;

function randToken() {
  return TOKENS[Math.floor(Math.random() * TOKENS.length)];
}

// Generate a board with zero pre-matches. Avoids picks that would
// continue a run of 2 on the left or above, guaranteeing no match-3.
function generateClean() {
  const b = Array.from({ length: H }, () => Array.from({ length: W }, () => null));
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const bad = new Set();
      if (c >= 2 && b[r][c - 1] === b[r][c - 2]) bad.add(b[r][c - 1]);
      if (r >= 2 && b[r - 1][c] === b[r - 2][c]) bad.add(b[r - 1][c]);
      const avail = TOKENS.filter((t) => !bad.has(t));
      b[r][c] = avail[Math.floor(Math.random() * avail.length)];
    }
  }
  return b;
}

export function newBoard() {
  for (let tries = 0; tries < 200; tries++) {
    const b = generateClean();
    if (hasLegalMove(b)) return b;
  }
  return generateClean();
}

export function findAllMatches(b) {
  const runs = [];
  // horizontal
  for (let r = 0; r < H; r++) {
    let start = 0;
    for (let c = 1; c <= W; c++) {
      if (c === W || b[r][c] !== b[r][start] || b[r][start] == null) {
        const len = c - start;
        if (len >= 3 && b[r][start] != null) {
          const cells = [];
          for (let k = start; k < c; k++) cells.push([r, k]);
          runs.push({ cells, size: len });
        }
        start = c;
      }
    }
  }
  // vertical
  for (let c = 0; c < W; c++) {
    let start = 0;
    for (let r = 1; r <= H; r++) {
      if (r === H || b[r][c] !== b[start][c] || b[start][c] == null) {
        const len = r - start;
        if (len >= 3 && b[start][c] != null) {
          const cells = [];
          for (let k = start; k < r; k++) cells.push([k, c]);
          runs.push({ cells, size: len });
        }
        start = r;
      }
    }
  }
  return runs;
}

export function hasLegalMove(b) {
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const dirs = [
        [0, 1],
        [1, 0],
      ];
      for (const [dr, dc] of dirs) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (r2 >= H || c2 >= W) continue;
        const t = b[r][c];
        b[r][c] = b[r2][c2];
        b[r2][c2] = t;
        const hit = findAllMatches(b).length > 0;
        const t2 = b[r][c];
        b[r][c] = b[r2][c2];
        b[r2][c2] = t2;
        if (hit) return true;
      }
    }
  }
  return false;
}

// Gravity + refill: empty cells above fall down, top fills with randoms.
export function applyGravityAndRefill(b) {
  for (let c = 0; c < W; c++) {
    let write = H - 1;
    for (let r = H - 1; r >= 0; r--) {
      if (b[r][c] != null) {
        b[write][c] = b[r][c];
        if (write !== r) b[r][c] = null;
        write--;
      }
    }
    for (let r = write; r >= 0; r--) {
      b[r][c] = randToken();
    }
  }
}

// Resolve cascade until stable. Mutates b and goals.
export function resolveCascade(b, goals) {
  let totalScore = 0;
  let cascadeDepth = 0;
  const goalDelta = {};
  while (true) {
    const runs = findAllMatches(b);
    if (runs.length === 0) break;
    cascadeDepth++;
    const mult = Math.min(5, cascadeDepth);
    // L/T: a cell may belong to both a horizontal and vertical run — take the max size for scoring.
    const maxSize = new Map();
    for (const run of runs) {
      for (const [r, c] of run.cells) {
        const key = r + "," + c;
        if ((maxSize.get(key) || 0) < run.size) maxSize.set(key, run.size);
      }
    }
    for (const [key, size] of maxSize) {
      const [rs, cs] = key.split(",");
      const r = Number(rs);
      const c = Number(cs);
      const id = b[r][c];
      let pts;
      if (size === 3) pts = 20;
      else if (size === 4) pts = 30;
      else pts = 40;
      totalScore += pts * mult;
      if (goals && goals[id] != null && goals[id] > 0) {
        goals[id] = Math.max(0, goals[id] - 1);
        goalDelta[id] = (goalDelta[id] || 0) + 1;
      }
      b[r][c] = null;
    }
    applyGravityAndRefill(b);
  }
  // Ensure at least one legal move remains; reshuffle in place if not.
  if (!hasLegalMove(b)) {
    for (let tries = 0; tries < 200; tries++) {
      const flat = [];
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) flat.push(b[r][c]);
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = flat[i];
        flat[i] = flat[j];
        flat[j] = tmp;
      }
      let k = 0;
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) b[r][c] = flat[k++];
      if (findAllMatches(b).length === 0 && hasLegalMove(b)) break;
    }
  }
  return { scoreGained: totalScore, cascadeDepth, goalDelta };
}

// Attempt an orthogonal swap. Commits only if it creates a match.
export function attemptSwap(b, r1, c1, r2, c2, goals) {
  if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return { committed: false };
  const t = b[r1][c1];
  b[r1][c1] = b[r2][c2];
  b[r2][c2] = t;
  if (findAllMatches(b).length === 0) {
    const t2 = b[r1][c1];
    b[r1][c1] = b[r2][c2];
    b[r2][c2] = t2;
    return { committed: false };
  }
  const res = resolveCascade(b, goals);
  return { committed: true, ...res };
}
