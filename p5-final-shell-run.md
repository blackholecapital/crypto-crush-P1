# Crypto Crush | P5 | Final Shell Run Bundle

## 1. Final shell bundle check

- splash, create account, login, home, level select, chat, leaderboard, settings included: confirmed
- upsell appears only in approved region/overlay locations: confirmed
- approved WA entry contract consumed: confirmed
- approved WA exit contract consumed: confirmed
- session continuity unchanged from V1.4: confirmed
- settings persistence unchanged from V1.4: confirmed
- no shell mutation of board, score, moves, or goals: confirmed
- no route drift from V1.4: confirmed

## 2. Final run report

### final-screen-status-table

| screen | load | primary actions | exit routes | session display | notes |
| --- | --- | --- | --- | --- | --- |
| splash | pass | pass | pass | pass | cold launch and logout return verified |
| create account | pass | pass | pass | pass | reachable from splash and login |
| login | pass | pass | pass | pass | success routes to home |
| home | pass | pass | pass | pass | chat and leaderboard gated for guest |
| level select | pass | pass | pass | pass | tap level card emits WA entry payload |
| chat | pass | pass | pass | pass | blocked for guest; back to home verified |
| leaderboard | pass | pass | pass | pass | blocked for guest; upsell region present |
| settings | pass | pass | pass | pass | toggles persist; logout hidden for guest |

## 3. Game handoff final check

### final-route-status-table

| route | result |
| --- | --- |
| `level_select -> game` | pass |
| `game win -> shell` | pass |
| `game fail -> shell` | pass |
| `game back_out -> shell` | pass |
| `retry routing` | pass |
| `next level routing` | pass |
| `level unlock marker after win` | pass |

## 4. Locked scope confirmation

- routing frozen for test run
- session handling unchanged
- guest rules unchanged
- settings carry unchanged
- upsell placement unchanged
- no auth redesign
- no payload redesign

## 5. Known issues

no blocking defects found

## 6. Patch notes draft

none required from final run

## 7. Review bundle items

- `p5-final-shell-run.md` (this file)
- `final-screen-status-table` (section 2)
- `final-route-status-table` (section 3)
- `known-issues` (section 5)
- `patch-notes` (section 6)
- `excluded-items` (below)

### excluded-items

- board logic
- score logic
- blocker/booster mechanics
- payment implementation
- chat protocol redesign
- leaderboard logic redesign
- auth datastore redesign
- art polish
- contract redesign

## Return at merge gate

`Crypto Crush | BLUEPRINT | V1.5`
