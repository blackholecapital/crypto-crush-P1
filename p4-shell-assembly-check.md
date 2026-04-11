# Crypto Crush | P4 | Shell Assembly Check

## 1. Assembly checklist

- splash loads first: pass
- create account route opens from splash or login: pass
- login route works: pass
- home route works: pass
- level select route works: pass
- chat route works: pass
- leaderboard route works: pass
- settings route works: pass
- upsell appears only as approved region/overlay: pass
- level select launches game using approved entry contract: pass
- game return is handled only through approved exit contract: pass
- logout returns to splash: pass
- signed-in continuity holds across shell screens: pass
- guest continuity works where allowed: pass
- settings persist for next launch: pass
- no shell mutation of board, score, moves, or goals: pass

## 2. Per-screen check

### screen-check-table

| screen | load | primary actions | exit routes | session display | notes |
| --- | --- | --- | --- | --- | --- |
| splash | pass | pass | pass | pass | first screen on cold launch and after logout |
| create account | pass | pass | pass | pass | reachable from splash and login |
| login | pass | pass | pass | pass | routes to home on success |
| home | pass | pass | pass | pass | gated tiles block chat and leaderboard for guest |
| level select | pass | pass | pass | pass | tap level card sends WA entry payload |
| chat | pass | pass | pass | pass | blocked for guest; back returns to home |
| leaderboard | pass | pass | pass | pass | blocked for guest; upsell region present |
| settings | pass | pass | pass | pass | logout hidden for guest; toggles persist |

## 3. Game handoff check

### route-check-table

| route | result |
| --- | --- |
| `level_select -> game` | pass |
| `game win -> shell` | pass |
| `game fail -> shell` | pass |
| `game back_out -> shell` | pass |
| `retry routing` | pass |
| `next level routing` | pass |
| `level unlock marker after win` | pass |

## 4. Contract compliance

- approved WA entry contract consumed
- approved WA exit contract consumed
- shell owns routing, session, settings, and selected-level memory only
- no payload redefinition
- no auth redesign
- no chat protocol redesign
- no leaderboard logic redesign

## 5. Defect list

no blocking defects found

## 6. Open risks

- stale session on return from game
- duplicate return handling
- guest route guard inconsistency
- settings persistence mismatch
- upsell placement drift

## 7. Deliverables

- `p4-shell-assembly-check.md` (this file)
- `screen-check-table` (section 2)
- `route-check-table` (section 3)
- `defect-list` (section 5)
- `open-risks` (section 6)
- `excluded-items` (below)

### excluded-items

- board logic
- score logic
- blocker/booster mechanics
- payment implementation
- art polish
- backend redesign
- auth datastore redesign

## Return at merge gate

`Crypto Crush | BLUEPRINT | V1.4`
