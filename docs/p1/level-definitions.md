# Crypto Crush | WA | P3 — Level Definitions

Source of truth: approved core game spec (`core-game-spec.md`) and approved game contract (`game-contract.md`). No mechanics added beyond these.

---

## 1. Level sheets

### Level 1

- **levelId:** 1
- **goal:** Collect target tokens
- **target tokens:** 20 x `T_BTC`
- **move count:** 25
- **spawn set:** `T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC` (uniform weight)
- **starting blockers:** none
- **boosters available:** none
- **win condition:** `T_BTC` remaining == 0 before moves reach 0
- **fail condition:** `moves == 0` while `T_BTC` remaining > 0 and board is stable

### Level 2

- **levelId:** 2
- **goal:** Collect target tokens
- **target tokens:** 25 x `T_ETH`
- **move count:** 22
- **spawn set:** `T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC` (uniform weight)
- **starting blockers:** none
- **boosters available:** none
- **win condition:** `T_ETH` remaining == 0 before moves reach 0
- **fail condition:** `moves == 0` while `T_ETH` remaining > 0 and board is stable

### Level 3

- **levelId:** 3
- **goal:** Collect target tokens
- **target tokens:** 20 x `T_BTC` + 20 x `T_ETH`
- **move count:** 24
- **spawn set:** `T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC` (uniform weight)
- **starting blockers:** none
- **boosters available:** none
- **win condition:** `T_BTC` remaining == 0 AND `T_ETH` remaining == 0 before moves reach 0
- **fail condition:** `moves == 0` while either target > 0 and board is stable

### Level 4

- **levelId:** 4
- **goal:** Collect target tokens
- **target tokens:** 30 x `T_SUI`
- **move count:** 20
- **spawn set:** `T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC` (uniform weight)
- **starting blockers:** none
- **boosters available:** none
- **win condition:** `T_SUI` remaining == 0 before moves reach 0
- **fail condition:** `moves == 0` while `T_SUI` remaining > 0 and board is stable

### Level 5

- **levelId:** 5
- **goal:** Collect target tokens
- **target tokens:** 20 x `T_BTC` + 20 x `T_ETH` + 20 x `T_SUI`
- **move count:** 22
- **spawn set:** `T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC` (uniform weight)
- **starting blockers:** none
- **boosters available:** none
- **win condition:** `T_BTC` remaining == 0 AND `T_ETH` remaining == 0 AND `T_SUI` remaining == 0 before moves reach 0
- **fail condition:** `moves == 0` while any target > 0 and board is stable

---

## 2. Difficulty progression

- **L1 → L2:** target count rises from 20 to 25 and moves drop from 25 to 22. Tighter move budget on a single target.
- **L2 → L3:** goal becomes dual-target (20 + 20). Player must now split attention across two token IDs within 24 moves.
- **L3 → L4:** single target but the required count rises to 30 on a lower-player-focus color. Highest per-target count in the set, on 20 moves.
- **L4 → L5:** triple-target goal (20 + 20 + 20 = 60 total) within 22 moves. P1 difficulty ceiling.
- No new mechanics introduced beyond approved core loop.
- No blocker behavior in any level.
- No booster behavior in any level.

---

## 3. Board start rules

- Board is **8x8**.
- **No pre-matches** on the starting board.
- Starting board guarantees **at least one legal move**.
- **Uniform token spawn** (weight 1.0 per token).
- Spawn pool is the **same 5-token set only**: `T_BTC`, `T_ETH`, `T_SUI`, `T_XRP`, `T_USDC`.

---

## 4. Per-level result expectation

### Level 1
- **intended completion style:** first-time clear on first attempt
- **tag:** easy
- **expected player focus:** learn the swap, learn the goal panel

### Level 2
- **intended completion style:** clear within 1–2 attempts
- **tag:** easy
- **expected player focus:** target-hunting one color under a tighter budget

### Level 3
- **intended completion style:** clear within 2 attempts
- **tag:** medium
- **expected player focus:** balance progress across two targets, notice cascades

### Level 4
- **intended completion style:** clear within 2–3 attempts
- **tag:** medium
- **expected player focus:** efficient move-per-clear, chase cascades on the target color

### Level 5
- **intended completion style:** clear within 3+ attempts
- **tag:** hard
- **expected player focus:** plan multi-target turns, maximize cascade value

---

## 5. Contract compliance check

- Level IDs are `1..5`. ✓
- All levels launch from the approved entry payload (`levelId`, `username`, `sessionId`, `entrySource`, `audioEnabled`, `hapticsEnabled`). ✓
- All levels exit through the approved exit payload (`levelId`, `username`, `outcome`, `score`, `movesUsed`, `movesRemaining`, `nextRoute`). ✓
- No resume. ✓
- Fresh start only. ✓

---

## 6. Deliverables

### level-summary-table

| levelId | goal | target tokens | moves | blockers | boosters | tag |
|---|---|---|---|---|---|---|
| 1 | Collect target tokens | 20 BTC | 25 | none | none | easy |
| 2 | Collect target tokens | 25 ETH | 22 | none | none | easy |
| 3 | Collect target tokens | 20 BTC + 20 ETH | 24 | none | none | medium |
| 4 | Collect target tokens | 30 SUI | 20 | none | none | medium |
| 5 | Collect target tokens | 20 BTC + 20 ETH + 20 SUI | 22 | none | none | hard |

### open risks

- Uniform spawn weight may make Level 4 (30 SUI) feel swingy because target availability depends entirely on RNG.
- Level 5 triple-target on 22 moves may prove too tight without cascade luck; needs playtest validation.
- Dual/triple-target levels (L3, L5) depend on overflow rule — cleared tokens of a target type count only against that target, not others.
- No retry economy yet (shell-owned); player frustration on L5 could spike without a retry affordance verified end-to-end.
- Move-per-target ratio on L2 (22 moves / 25 ETH) is the tightest single-target budget; may need retune after playtest.

### excluded items

- Blocker behavior (all blockers are placeholders in core spec, none used here).
- Booster behavior (all boosters are placeholders in core spec, none used here).
- Score formula redesign (uses approved core scoring untouched).
- Shell routing (owned by shell workstream).
- Account / chat / leaderboard / settings.
- Art spec.
- Monetization logic.

---

## Merge gate

`Crypto Crush | BLUEPRINT | V1.3`
