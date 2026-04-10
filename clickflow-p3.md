# Crypto Crush | Clickflow P3

## 1. Screen set

- splash
- create account
- login
- home
- level select
- chat
- leaderboard
- settings

Note: upsell is a region on leaderboard or a result return path overlay, not a 9th screen.

## 2. Clickflow

### splash
- entry source: app launch, logout return
- primary actions: continue as guest, go to login, go to create account
- exit routes: home, login, create account
- blocked routes if not signed in: none
- guest-allowed: yes

### create account
- entry source: splash
- primary actions: submit new account, switch to login
- exit routes: home, login, splash
- blocked routes if not signed in: none
- guest-allowed: yes (account creation path)

### login
- entry source: splash, create account
- primary actions: submit credentials, switch to create account
- exit routes: home, create account, splash
- blocked routes if not signed in: none
- guest-allowed: yes (login path)

### home
- entry source: splash, login, create account, level select, chat, leaderboard, settings
- primary actions: open level select, open chat, open leaderboard, open settings
- exit routes: level select, chat, leaderboard, settings
- blocked routes if not signed in: chat, leaderboard
- guest-allowed: yes (home only; gated features blocked)

### level select
- entry source: home, game result return
- primary actions: tap level card, back to home
- exit routes: game (via WA entry payload), home
- blocked routes if not signed in: none
- guest-allowed: yes

### chat
- entry source: home
- primary actions: view messages, send message, back to home
- exit routes: home
- blocked routes if not signed in: entire chat screen
- guest-allowed: no

### leaderboard
- entry source: home
- primary actions: view rankings, view upsell region, back to home
- exit routes: home
- blocked routes if not signed in: entire leaderboard screen
- guest-allowed: no

### settings
- entry source: home
- primary actions: toggle audio, toggle haptics, logout, back to home
- exit routes: home, splash (on logout)
- blocked routes if not signed in: logout action hidden
- guest-allowed: yes

## 3. Game handoff

Uses approved WA/WB contract. Payloads not redefined here.

- `level_select -> game`: shell sends WA entry payload with selected level
- `game -> level_select`: shell handles WB result return, routes to level select
- `game -> retry`: shell relaunches same level via WA entry payload
- `game -> next_level`: shell launches next level via WA entry payload with next level unlocked marker

## 4. Session carry

- username display source: signed-in username, or guest name if session is null
- signed-in continuity across shell screens: session id carried across all shell screens for the lifetime of the session
- guest continuity if session is null: guest name carried across shell screens; gated features remain blocked
- logout returns to splash
- settings (audio, haptics) persist for next launch

## 5. Result return placement

- shell handles return from game
- win may mark next level unlocked
- fail may allow retry
- back_out returns to level select
- upsell placeholder appears after win or on leaderboard only

## 6. Deliverables

- `clickflow-p3.md` (this file)
- `screen-route-table` (below)
- `open risks` (below)
- `excluded items` (below)

### screen-route-table

| from | to | trigger | guest-allowed | signed-in required |
| --- | --- | --- | --- | --- |
| splash | home | continue as guest | yes | no |
| splash | login | tap login | yes | no |
| splash | create account | tap create account | yes | no |
| create account | home | account created | yes | no |
| create account | login | switch to login | yes | no |
| create account | splash | back | yes | no |
| login | home | login success | yes | no |
| login | create account | switch | yes | no |
| login | splash | back | yes | no |
| home | level select | tap play | yes | no |
| home | chat | tap chat | no | yes |
| home | leaderboard | tap leaderboard | no | yes |
| home | settings | tap settings | yes | no |
| level select | game | tap level card (WA entry payload) | yes | no |
| level select | home | back | yes | no |
| chat | home | back | no | yes |
| leaderboard | home | back | no | yes |
| settings | home | back | yes | no |
| settings | splash | logout | no | yes |
| game | level select | WB result back_out | yes | no |
| game | game (retry) | WB result fail + retry | yes | no |
| game | game (next_level) | WB result win + next_level | yes | no |
| game | level select | WB result win + level_select | yes | no |

### open risks

- guest upgrade flow: how a guest becomes signed-in without losing selected level memory
- unlocked level marker source of truth if session is lost mid-play
- upsell region placement inside leaderboard vs. overlay after win
- settings persistence boundary: local vs. account-bound when signing in later
- blocked route UX: silent hide vs. prompt-to-sign-in on chat and leaderboard taps

### excluded items

- board logic
- score logic
- chat protocol internals
- leaderboard ranking logic
- auth datastore redesign
- payment implementation
- visual art spec

## Return at merge gate

`Crypto Crush | BLUEPRINT | V1.3`
