# Crypto Crush | WA | P5 — Final Game Run Bundle

Scope: final playable game run bundle for levels 1–5 against the frozen game contract. No feature work. No redesign. Lock-in pass only.

Source of truth:
- `core-game-spec.md` (P1)
- `game-contract.md` (P2.1)
- `level-definitions.md` (P3)
- `p4-game-assembly-check.md` (P4, V1.4)

---

## 1. Final playable game bundle check

| # | Check | Status |
|---|---|---|
| 1 | Levels 1 to 5 included | CONFIRMED |
| 2 | Approved entry contract used | CONFIRMED |
| 3 | Approved exit contract used | CONFIRMED |
| 4 | Fresh start only | CONFIRMED |
| 5 | No resume path | CONFIRMED |
| 6 | No blocker behavior active | CONFIRMED |
| 7 | No booster behavior active beyond placeholders | CONFIRMED |
| 8 | No shell-owned state inside game | CONFIRMED |
| 9 | No contract drift from V1.4 | CONFIRMED |

---

## 2. Final run report

### Level 1 — 20 BTC / 25 moves
- launch = **pass**
- complete = **pass**
- fail path = **pass**
- back_out = **pass**
- exit payload = **pass**
- notes: clean first-clear run, tutorial-shaped.

### Level 2 — 25 ETH / 22 moves
- launch = **pass**
- complete = **pass**
- fail path = **pass**
- back_out = **pass**
- exit payload = **pass**
- notes: tightest single-target, solvable on focused play.

### Level 3 — 20 BTC + 20 ETH / 24 moves
- launch = **pass**
- complete = **pass**
- fail path = **pass**
- back_out = **pass**
- exit payload = **pass**
- notes: dual-target progress tracks independently.

### Level 4 — 30 SUI / 20 moves
- launch = **pass**
- complete = **pass**
- fail path = **pass**
- back_out = **pass**
- exit payload = **pass**
- notes: cascade-dependent clear, RNG-sensitive.

### Level 5 — 20 BTC + 20 ETH + 20 SUI / 22 moves
- launch = **pass**
- complete = **pass**
- fail path = **pass**
- back_out = **pass**
- exit payload = **pass**
- notes: P1 difficulty ceiling, clear achievable with planned turns.

---

## 3. Locked scope confirmation

- Board logic frozen for test run.
- Score logic unchanged.
- Token set unchanged (`T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC`).
- Move rules unchanged (decrement only on committed swap).
- Level goals unchanged from P3 definitions.
- Pause / back rules unchanged from approved contract.

---

## 4. Known issues

no blocking defects found

---

## 5. Patch notes draft

None required — no issues surfaced from the final run.

---

## 6. Review bundle items

### final-level-status-table

| levelId | launch | complete | fail path | back_out | exit payload | notes |
|---|---|---|---|---|---|---|
| 1 | pass | pass | pass | pass | pass | clean first-clear, tutorial-shaped |
| 2 | pass | pass | pass | pass | pass | tightest single-target, solvable |
| 3 | pass | pass | pass | pass | pass | dual-target counters independent |
| 4 | pass | pass | pass | pass | pass | cascade-dependent, RNG-sensitive |
| 5 | pass | pass | pass | pass | pass | P1 ceiling, achievable with planning |

### known-issues

no blocking defects found

### patch-notes

none required from final run

### excluded-items

- shell changes
- chat
- leaderboard
- settings
- monetization
- art polish
- blocker mechanics
- booster mechanics
- contract redesign

---

## Merge gate

`Crypto Crush | BLUEPRINT | V1.5`
