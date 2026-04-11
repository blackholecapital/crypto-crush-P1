# Shell Wiring

## Launch route

- source is `screen.level_select`
- shell sends WA entry payload
- selected level comes from tapped level card

## Field mapping

- selected level card → `levelId`
- signed-in username or guest name → `username`
- current session id or null → `sessionId`
- route source → `entrySource`
- `settings.audio` → `audioEnabled`
- `settings.haptics` → `hapticsEnabled`

## Accepted exit handling

- `win`
- `fail`
- `back_out`

## Route results

- `win` + `nextRoute` `next_level` → level select with next level unlocked marker
- `fail` + `nextRoute` `retry` → relaunch same level
- `back_out` + `nextRoute` `level_select` → return to level select

## Ownership

- shell owns session, selected level memory, route changes
- shell does not edit score, moves, board, goals

## 3 examples

- `level_select` → `game`
- `game` win → `level_select`
- `game` fail retry → `game`
