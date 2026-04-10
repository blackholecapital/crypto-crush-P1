# Game Contract

## Entry payload

- `levelId`: `1 | 2 | 3 | 4 | 5`
- `username`: `string`
- `sessionId`: `string | null`
- `entrySource`: `"level_select" | "retry" | "next_level"`
- `audioEnabled`: `boolean`
- `hapticsEnabled`: `boolean`

## Start rules

- Reject if `levelId` missing.
- Reject if `levelId` not 1 to 5.
- Allow guest if `sessionId = null`.
- Always fresh start.
- No resume in P2.

## Exit payload

- `levelId`
- `username`
- `outcome`: `"win" | "fail" | "back_out"`
- `score`
- `movesUsed`
- `movesRemaining`
- `nextRoute`: `"level_select" | "retry" | "next_level"`

## Pause/back rules

- Pause opens from top bar.
- Pause options = resume / retry / quit.
- Quit returns `back_out`.
- No exit during active cascade.

## Ownership

- Game owns board, score, moves, goals.
- Shell owns routing, session, settings.
- Shell cannot edit board state.

## 3 examples

Valid entry:

```json
{
  "levelId": 2,
  "username": "player_one",
  "sessionId": "sess_abc123",
  "entrySource": "level_select",
  "audioEnabled": true,
  "hapticsEnabled": false
}
```

Win exit:

```json
{
  "levelId": 2,
  "username": "player_one",
  "outcome": "win",
  "score": 4850,
  "movesUsed": 18,
  "movesRemaining": 7,
  "nextRoute": "next_level"
}
```

Fail exit:

```json
{
  "levelId": 2,
  "username": "player_one",
  "outcome": "fail",
  "score": 1200,
  "movesUsed": 25,
  "movesRemaining": 0,
  "nextRoute": "retry"
}
```
