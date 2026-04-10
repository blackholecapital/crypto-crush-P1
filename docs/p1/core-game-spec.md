# WA | P1 — Core Game Stream

Scope: match-3 core loop only.
Out of scope (this doc): account flow, chat, settings, leaderboard shell, upsell shell.

---

## 1. Core loop

One turn of the core loop, in order:

1. Board is idle. Player sees 8x8 grid, move counter, goal panel, score.
2. Player selects a token (tap or drag-start).
3. Player swaps it with an orthogonal neighbour (tap-tap or drag).
4. Swap is validated:
   - If swap produces >= 1 match of 3+, swap commits. Go to 5.
   - Else swap reverts. No move spent. Return to 1.
5. Move counter decrements by 1.
6. Resolve phase (loops until stable):
   a. Detect all matches.
   b. Clear matched tokens, award score, credit goal progress.
   c. Apply gravity (tokens above empty cells fall).
   d. Refill empty cells from the top with new random tokens.
   e. If new matches exist, go to 6a (cascade). Else stable.
7. Check terminal conditions:
   - All goals met → WIN.
   - Moves == 0 and goals not met → FAIL.
   - Else → return to 1.

Single source of truth: the board state machine runs the sequence above. No input is accepted while phases 4–6 are running.

---

## 2. Board spec — 8x8

| Field | Value |
|---|---|
| Width | 8 cells |
| Height | 8 cells |
| Total cells | 64 |
| Cell index | `(col, row)`, 0-indexed, `(0,0)` top-left |
| Cell contents | exactly one Token, or Empty (transient, during resolve only) |
| Spawn row | row 0 (top); refill falls into row 0 each tick |
| Gravity | +row direction (tokens fall down) |
| Neighbours | 4-connected (N, S, E, W). No diagonals. |

Initial board generation rule: shuffle until the starting board contains **zero pre-existing matches** and **at least one legal move**. If no legal move after N attempts, force-place a valid swap pair.

---

## 3. Token set

Five base tokens. Equal spawn weight at P1.

| ID | Symbol | Display | Color tag |
|---|---|---|---|
| `T_BTC`  | BTC  | Bitcoin  | orange |
| `T_ETH`  | ETH  | Ethereum | violet |
| `T_SUI`  | SUI  | Sui      | cyan |
| `T_XRP`  | XRP  | Ripple   | white |
| `T_USDC` | USDC | USDC     | blue |

Notes:
- 5 tokens is the P1 target density for an 8x8 board — keeps match probability healthy without trivial cascades.
- Each token is a plain matchable. No special/power tokens in P1 core (see §10 for placeholders).
- Spawn weight is uniform (1.0 each) at P1. Tunable later.

---

## 4. Swap rules

- Valid swap: two tokens in orthogonally adjacent cells.
- Swap input modes: tap-tap (select A then select B) or drag-from-A-to-B.
- A swap is **committed** only if it creates at least one match of 3+ on either of the two moved tokens.
- If the swap creates no match, the visual swap plays and **reverts**; no move is consumed.
- Diagonal swaps: not allowed.
- Long-range swaps: not allowed.
- Swapping during resolve phase (cascade/refill): blocked. Input disabled.
- Self-swap / swap with empty cell: ignored.

---

## 5. Match / cascade / refill rules

### 5.1 Match detection
- A **match** is 3 or more same-ID tokens in a straight horizontal or vertical line.
- L and T shapes resolve as the union of their H and V lines (all involved tokens clear together in one group).
- Matches are detected across the whole board in one pass per resolve tick.

### 5.2 Match sizes (P1)
| Size | Name | Result |
|---|---|---|
| 3 | Match-3 | clear 3 tokens |
| 4 | Match-4 | clear 4 tokens (booster placeholder hook — see §10) |
| 5 straight | Match-5 | clear 5 tokens (booster placeholder hook — see §10) |
| L / T | Shape match | clear all involved tokens (booster placeholder hook — see §10) |

In P1 the only **functional** outcome is "clear tokens + score". Booster creation is stubbed.

### 5.3 Cascade
- After a clear, tokens above fall straight down to fill gaps (column-local gravity, no diagonal fill).
- Empty cells at the top of each column are refilled with new random tokens from the spawn pool.
- Resolve loop re-runs detection. Any new matches form a **cascade**. Cascade depth is tracked per move.

### 5.4 Refill
- Refill source: random draw from the 5-token spawn pool with uniform weight.
- Refill must not **guarantee** an immediate match, but is allowed to create one (that drives cascades).
- After resolve stabilises, the board is checked for **at least one legal move**. If none exist, the board auto-shuffles in place (no move cost, short animation).

---

## 6. Level goals (5 levels)

Goals are collection-based in P1. Collect N of a target token by clearing it in matches.

| Level | Goal | Moves | Notes |
|---|---|---|---|
| 1 | Collect 20 BTC | 25 | Tutorial-shaped; generous moves. |
| 2 | Collect 25 ETH | 22 | Single target, tighter budget. |
| 3 | Collect 20 BTC + 20 ETH | 24 | First dual-target level. |
| 4 | Collect 30 SUI | 20 | Lower-frequency target feel (still uniform weight in P1). |
| 5 | Collect 20 BTC + 20 ETH + 20 SUI | 22 | Triple target; P1 difficulty ceiling. |

Goal progress rule: each cleared token of a target type decrements its remaining count by 1. Overflow does not roll over between targets.

---

## 7. Win / fail / score / moves logic

### 7.1 Moves
- Each level starts with `moves = level.moves`.
- `moves` decrements by 1 **only when a swap commits** (produces at least one match).
- Reverted swaps, auto-shuffles, and cascades do **not** cost moves.

### 7.2 Win
- Trigger: every goal target reaches 0 remaining.
- On trigger, the resolve loop finishes its current cascade, then the level ends in WIN.
- Remaining moves > 0 at win: carried into end-of-level score bonus (see 7.4).

### 7.3 Fail
- Trigger: `moves == 0` **and** any goal target > 0 **and** the resolve loop is stable.
- On trigger, level ends in FAIL.
- No retry flow in P1 core (handled by shell layer later).

### 7.4 Score
Base score is additive and paid out during resolve.

| Event | Points |
|---|---|
| Clear token (match-3) | 20 per token |
| Clear token (match-4) | 30 per token |
| Clear token (match-5 / L / T) | 40 per token |
| Cascade multiplier | x1 on first resolve tick, x2 on second, x3 on third, cap x5 |
| Remaining-move bonus (on WIN) | 500 per leftover move |

Score is a single integer per level session. No global score persistence in P1 core.

---

## 8. Main game screen layout

Portrait-first, mobile-optimised. One screen, three vertical zones.

```
+------------------------------------------------+
|  TOP BAR                                       |
|  [<- back]        LEVEL 3        [pause]       |
|                                                |
|  GOAL PANEL                                    |
|  [BTC icon] 12 / 20   [ETH icon] 07 / 20       |
|                                                |
|  SCORE        MOVES                            |
|  0123450        18                             |
+------------------------------------------------+
|                                                |
|  BOARD (8x8)                                   |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |    (square)         |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|  |  |  |  |  |  |  |  |  |                     |
|  +--+--+--+--+--+--+--+--+                     |
|                                                |
+------------------------------------------------+
|  BOOSTER TRAY                                  |
|  [ slot 1 ] [ slot 2 ] [ slot 3 ]   (stubs)    |
+------------------------------------------------+
```

Zone notes:
- **Top bar**: level label + pause. Back returns to level select (out of scope here; leaves a call-out only).
- **HUD block**: goal panel (targets with current/total), score, moves remaining.
- **Board**: square, edge-padded, snaps to device width. Row 0 at top.
- **Booster tray**: 3 fixed slots; all three are placeholder-only in P1 (render empty / locked).

Input model: single-finger. Tap-tap or drag swap. Input is locked during resolve.

---

## 9. Blocker placeholders (render nothing functional in P1)

List only — no behaviour implemented in P1 core. Reserve type IDs so the board engine can parse and skip them.

- `B_ICE` — frozen cell (would require N adjacent clears to break)
- `B_CRATE` — single-hit destructible
- `B_CRATE_2` — double-hit destructible
- `B_CHAIN` — locks the token beneath from being swapped
- `B_VAULT` — goal-carrying container that must be cleared
- `B_ROCK` — immovable, non-swappable filler
- `B_SPAWNER` — emits a specific token each resolve tick

---

## 10. Booster placeholders (render nothing functional in P1)

List only — creation hooks are stubbed at match-4 / match-5 / L-T events but produce no booster token in P1.

Board-created (would spawn from oversized matches):
- `K_LINE_H` — horizontal line clear
- `K_LINE_V` — vertical line clear
- `K_BOMB` — 3x3 area clear
- `K_RAINBOW` — clears all tokens of one ID

Tray boosters (would occupy the 3 booster tray slots):
- `K_HAMMER` — single-cell clear, pre-move
- `K_SWAP` — free swap, pre-move
- `K_PLUS5` — +5 moves, in-level

All of the above are reserved names only. No logic, no art, no economy in P1.

---

## 11. Scope boundary reminder

Not produced in this doc and not part of P1 core:
- Account / auth / profile flow
- Chat
- Settings screen
- Leaderboard shell
- Upsell / IAP shell

These are owned by sibling workstreams.
