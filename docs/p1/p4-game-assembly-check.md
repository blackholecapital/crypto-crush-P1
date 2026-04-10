# Crypto Crush | WA | P4 — Playable Demo Assembly Check

Scope: assembly verification only for levels 1–5 inside the approved game contract. No feature work. No redesign.

Source of truth:
- `core-game-spec.md` (P1)
- `game-contract.md` (P2.1)
- `level-definitions.md` (P3)

---

## 1. Assembly checklist

| # | Check | Status |
|---|---|---|
| 1 | Level 1 to 5 launch from approved entry payload | PASS |
| 2 | Each level starts fresh (no resume) | PASS |
| 3 | 8x8 board initializes valid | PASS |
| 4 | No pre-matches on start | PASS |
| 5 | At least one legal move on start | PASS |
| 6 | Approved 5-token spawn only (`T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC`) | PASS |
| 7 | Committed swap only on valid match | PASS |
| 8 | Invalid swap reverts and costs no move | PASS |
| 9 | Moves decrement only on committed swap | PASS |
| 10 | Match / clear / gravity / refill / cascade loop works | PASS |
| 11 | Win exits through approved exit payload | PASS |
| 12 | Fail exits through approved exit payload | PASS |
| 13 | Back-out exits through approved exit payload | PASS |
| 14 | No resume path present | PASS |

---

## 2. Per-level play check

### Level 1 — 20 BTC / 25 moves
- launch = **pass**
- goal reachable = **pass**
- fail state reachable = **pass**
- exit payload emitted = **pass**
- notes: tutorial-shaped, comfortable move budget.

### Level 2 — 25 ETH / 22 moves
- launch = **pass**
- goal reachable = **pass**
- fail state reachable = **pass**
- exit payload emitted = **pass**
- notes: tightest single-target ratio, still solvable.

### Level 3 — 20 BTC + 20 ETH / 24 moves
- launch = **pass**
- goal reachable = **pass**
- fail state reachable = **pass**
- exit payload emitted = **pass**
- notes: dual-target counters update independently, no cross-credit.

### Level 4 — 30 SUI / 20 moves
- launch = **pass**
- goal reachable = **pass**
- fail state reachable = **pass**
- exit payload emitted = **pass**
- notes: highest single-target count, cascade-dependent.

### Level 5 — 20 BTC + 20 ETH + 20 SUI / 22 moves
- launch = **pass**
- goal reachable = **pass**
- fail state reachable = **pass**
- exit payload emitted = **pass**
- notes: P1 difficulty ceiling, balance watch item.

---

## 3. Contract compliance

- Entry contract used: `levelId`, `username`, `sessionId`, `entrySource`, `audioEnabled`, `hapticsEnabled`. ✓
- Exit contract used: `levelId`, `username`, `outcome`, `score`, `movesUsed`, `movesRemaining`, `nextRoute`. ✓
- No shell-state mutation from the game surface. ✓
- No chat / leaderboard / settings access from the game surface. ✓
- No blocker behavior active. ✓
- No booster behavior active beyond placeholders. ✓

---

## 4. Defect list

no blocking defects found

---

## 5. Open risks

- **Shuffle edge case** — auto-shuffle after refill when no legal moves exist; correctness under rapid consecutive shuffles not yet stress-tested.
- **Duplicate result emission risk** — win trigger during a deep cascade could fire more than once if the resolve loop is not strictly gated on "stable" before emission.
- **Pause / back timing during resolve** — pause opens from the top bar; must be ignored or queued during active cascade per core rules. Timing boundary needs verification.
- **Level balance risk** — L4 (30 SUI / 20 moves) and L5 (triple target / 22 moves) are RNG-sensitive under uniform spawn; may need retune after playtest.

---

## 6. Deliverables

### level-check-table

| levelId | launch | goal reachable | fail reachable | exit payload | notes |
|---|---|---|---|---|---|
| 1 | pass | pass | pass | pass | tutorial-shaped, comfortable budget |
| 2 | pass | pass | pass | pass | tightest single-target ratio |
| 3 | pass | pass | pass | pass | dual-target counters independent |
| 4 | pass | pass | pass | pass | highest single-target, cascade-dependent |
| 5 | pass | pass | pass | pass | P1 ceiling, balance watch |

### defect-list

no blocking defects found

### open-risks

- shuffle edge case
- duplicate result emission risk
- pause / back timing during resolve
- level balance risk

### excluded-items

- shell routing changes
- account / chat / leaderboard / settings
- art polish
- monetization
- blocker mechanics
- booster mechanics redesign
- score redesign

---

## Merge gate

`Crypto Crush | BLUEPRINT | V1.4`
