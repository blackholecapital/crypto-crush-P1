# WB | P1 — Product Shell Stream (Screens, Navigation, Auth, Mock Chat)

**Stage:** `WB | P1 — Product shell stream`
**Branch:** `claude/product-shell-screens-EKO0i`
**Worker isolation:** all output lives under `worker-wb/product-shell-p1/` — no
shared artifact is mutated.

**Scope — produced by this pass:**

1. Screen map for the non-game user flow
2. Navigation map between screens
3. Username and password area flow
4. Mock global chat flow by username

**Scope — explicitly NOT produced by this pass (hard exclusion):**

- Board logic
- Swap logic
- Level mechanics internals

Every screen below that touches the game surface stops at the *handoff point*.
Nothing downstream of "enter game" is described, authored, or implied.

---

## 0. Conventions

- `screen_id` is the canonical identifier used by the product shell. Screen ids
  are stable and may later be bound to a `SURFACE_ID` in the chassis layer; at
  P1 they are shell-local names only.
- `[placeholder]` marks a region whose contents are intentionally undefined at
  P1 (copy, artwork, rates, pricing).
- `[out-of-scope: game]` marks a boundary that hands off to the game surface
  and is NOT described here.
- "Authed" = session has a bound `username` on the shell; "Guest" = no bound
  username.
- P1 is a *mock* shell: no network, no real auth backend, no real chat relay.
  All persistence is in-memory + local storage. All state is client-only.

---

## 1. Screen map (non-game user flow)

Nine screens are in scope. Each screen is listed with its id, purpose,
required state, primary regions, primary actions, and exit points.

### 1.1 `screen.splash`

| Field | Value |
|---|---|
| Purpose | First frame on cold start. Branding + readiness gate. |
| Required state | None. |
| Regions | logo, tagline `[placeholder]`, loading indicator |
| Primary actions | *none — auto-advance* |
| Auto-advance rule | When shell boot is complete: if session has a bound username → `screen.home`; otherwise → `screen.login`. |
| Exits | `screen.home` (authed), `screen.login` (guest) |

### 1.2 `screen.create_account`

| Field | Value |
|---|---|
| Purpose | New user creates a local account (username + password, mock). |
| Required state | Guest. |
| Regions | title, username field, password field, confirm-password field, submit button, "already have an account → login" link, error banner |
| Primary actions | `submit_create_account`, `goto_login`, `back` |
| Exits | `screen.home` on success, `screen.login` on link tap, `screen.splash` on back |

### 1.3 `screen.login`

| Field | Value |
|---|---|
| Purpose | Returning user signs in with an existing local account (mock). |
| Required state | Guest. |
| Regions | title, username field, password field, submit button, "no account → create" link, error banner |
| Primary actions | `submit_login`, `goto_create_account` |
| Exits | `screen.home` on success, `screen.create_account` on link tap |

### 1.4 `screen.home` (aka lobby)

| Field | Value |
|---|---|
| Purpose | Authed landing. Anchor for all outbound navigation. |
| Required state | Authed. |
| Regions | username badge (top-left), settings gear (top-right), "Play" CTA, "Leaderboard" tile, "Chat" tile, `upsell.placeholder` slot (bottom banner) |
| Primary actions | `goto_level_select`, `goto_leaderboard`, `goto_chat`, `goto_settings`, `tap_upsell` |
| Exits | `screen.level_select`, `screen.leaderboard`, `screen.chat`, `screen.settings`, `screen.upsell` |

### 1.5 `screen.level_select`

| Field | Value |
|---|---|
| Purpose | Pick a level. Handoff to the game surface. |
| Required state | Authed. |
| Regions | scroll list of level tiles, back arrow, current-level marker |
| Primary actions | `select_level(level_id)`, `back` |
| Handoff | On `select_level` the shell hands control to the game surface. **`[out-of-scope: game]`** — no board, swap, scoring, or level-internal behaviour is described here. |
| Exits | game surface (out of scope), `screen.home` on back |

### 1.6 `screen.chat`

| Field | Value |
|---|---|
| Purpose | Global chat room. One mock room. Attribution by bound username. |
| Required state | Authed. |
| Regions | room title, scrollable message list, composer (text input + send), back arrow |
| Primary actions | `send_message(text)`, `back` |
| Exits | `screen.home` on back |
| Notes | P1 is mock-only; see §4 for the mock relay flow. |

### 1.7 `screen.leaderboard`

| Field | Value |
|---|---|
| Purpose | Display ranked list of players. |
| Required state | Authed. |
| Regions | title, ranked rows (rank, username, score `[placeholder]`), "self" row highlight, back arrow |
| Primary actions | `back` |
| Exits | `screen.home` on back |
| Notes | P1 reads from an in-memory mock store; no scoring logic is defined here. Score values are `[placeholder]`. |

### 1.8 `screen.settings`

| Field | Value |
|---|---|
| Purpose | Account + shell preferences. |
| Required state | Authed. |
| Regions | username display, change-password row, sound toggle `[placeholder]`, notifications toggle `[placeholder]`, logout button, back arrow |
| Primary actions | `goto_change_password`, `logout`, `back` |
| Exits | `screen.login` on logout, `screen.home` on back |

### 1.9 `screen.upsell` (pay-me placeholder area)

| Field | Value |
|---|---|
| Purpose | Monetization surface. P1 is a placeholder only; no billing, no SKUs, no real purchase flow. |
| Required state | Authed. |
| Regions | title `[placeholder]`, offer card(s) `[placeholder]`, "maybe later" dismiss, close/back |
| Primary actions | `dismiss`, `back`, `tap_offer` (→ toast `[placeholder]`) |
| Exits | `screen.home` on back/dismiss |
| Notes | The upsell slot is referenced from `screen.home` as an embedded banner AND is reachable as a full screen. The full screen is a placeholder shell; no payment flow exists at P1. |

---

## 2. Navigation map between screens

### 2.1 Edge list

```
screen.splash ──(authed)────────────────▶ screen.home
screen.splash ──(guest)─────────────────▶ screen.login

screen.login ──(submit_login ok)────────▶ screen.home
screen.login ──(goto_create_account)────▶ screen.create_account

screen.create_account ──(submit ok)─────▶ screen.home
screen.create_account ──(goto_login)────▶ screen.login
screen.create_account ──(back)──────────▶ screen.splash

screen.home ──(Play)────────────────────▶ screen.level_select
screen.home ──(Leaderboard)─────────────▶ screen.leaderboard
screen.home ──(Chat)────────────────────▶ screen.chat
screen.home ──(Settings)────────────────▶ screen.settings
screen.home ──(tap_upsell)──────────────▶ screen.upsell

screen.level_select ──(select_level)────▶ [out-of-scope: game]
screen.level_select ──(back)────────────▶ screen.home

screen.leaderboard ──(back)─────────────▶ screen.home
screen.chat ──(back)────────────────────▶ screen.home
screen.upsell ──(back | dismiss)────────▶ screen.home

screen.settings ──(logout)──────────────▶ screen.login
screen.settings ──(back)────────────────▶ screen.home
```

### 2.2 ASCII topology

```
                       ┌────────────────┐
                       │ screen.splash  │
                       └──────┬─────────┘
                  guest  ┌────┴────┐  authed
                         ▼         ▼
            ┌────────────────┐   ┌───────────────────┐
            │  screen.login  │◀─▶│ screen.create_acc │
            └──────┬─────────┘   └──────┬────────────┘
                   │ ok                 │ ok
                   ▼                    ▼
                       ┌─────────────────────┐
                       │     screen.home     │◀────────┐
                       │       (lobby)       │         │
                       └─┬─────┬──────┬──────┘         │
            Play         │     │      │                │
            ┌────────────┘     │      └─────┐          │
            │                  │            │          │
            ▼                  ▼            ▼          │
  ┌─────────────────┐   ┌─────────────┐  ┌───────┐     │
  │ level_select    │   │ leaderboard │  │ chat  │─────┤
  └────────┬────────┘   └──────┬──────┘  └───┬───┘     │
           │ select_level      │ back        │ back    │
           ▼                   └─────────────┴─────────┤
     [out-of-scope:                                    │
        game]                                          │
                                                       │
       ┌───────────────┐        ┌─────────────────┐    │
       │   settings    │◀──────▶│     upsell      │    │
       │               │  back  │  (placeholder)  │◀───┘
       └──────┬────────┘        └─────────────────┘
              │ logout
              ▼
         screen.login
```

### 2.3 Navigation rules

- **Back button semantics:** every screen except `screen.splash` and the game
  surface has a deterministic back target as listed in §1. There is no freeform
  history stack at P1 — back is a static edge.
- **Guest quarantine:** only `screen.splash`, `screen.login`, and
  `screen.create_account` are reachable while guest. Any attempt to deep-link
  to an authed screen is redirected to `screen.login`.
- **Authed quarantine:** `screen.login` and `screen.create_account` are not
  reachable while authed except via `logout` from `screen.settings`, which
  first clears the bound username.
- **Game boundary:** `screen.level_select → select_level` is the one and only
  edge leaving the product shell into the game surface. The return edge (game
  → shell) is owned by the game surface and is explicitly not specified here.

---

## 3. Username and password area flow

P1 auth is a **mock local store**. No server, no hashing-of-record, no
recovery, no email. The flow's job at P1 is to bind a `username` to the shell
session so that downstream screens (home, chat, leaderboard, settings) can
attribute state.

### 3.1 State model

| Field | Type | Notes |
|---|---|---|
| `account_store` | `Map<username, { password_mock }>` | Client-only. In-memory + local storage mirror. |
| `session.bound_username` | `string \| null` | null = guest. |
| `session.bound_at` | `timestamp \| null` | Set on login/create success. |

No credential is ever sent off-device at P1. `password_mock` is stored as a
plain reversible token so the mock can be wiped without migration when a real
backend lands.

### 3.2 Field rules (P1 mock)

| Field | Rule | Error code (shell-local) |
|---|---|---|
| username | non-empty, 3–20 chars, `[a-zA-Z0-9_]`, case-insensitive uniqueness | `AUTH_ERR_USERNAME_SHAPE`, `AUTH_ERR_USERNAME_TAKEN` |
| password | non-empty, 6–64 chars | `AUTH_ERR_PASSWORD_SHAPE` |
| confirm password | must equal password | `AUTH_ERR_PASSWORD_MISMATCH` |

Error codes are shell-local vocabulary. They are **not** registered against
the chassis `FAILURE_CODES` set at P1 — that binding is deferred until the
product shell is wired into the validation chassis.

### 3.3 Create-account flow

```
user on screen.create_account
  │
  ▼
fill (username, password, confirm)
  │
  ▼
tap submit_create_account
  │
  ├─ validate username shape      ──fail──▶ show AUTH_ERR_USERNAME_SHAPE
  ├─ validate password shape      ──fail──▶ show AUTH_ERR_PASSWORD_SHAPE
  ├─ validate confirm matches     ──fail──▶ show AUTH_ERR_PASSWORD_MISMATCH
  ├─ check account_store.has(u)   ──fail──▶ show AUTH_ERR_USERNAME_TAKEN
  │
  ▼ all pass
account_store.set(u, { password_mock })
session.bound_username := u
session.bound_at := now
  │
  ▼
navigate → screen.home
```

### 3.4 Login flow

```
user on screen.login
  │
  ▼
fill (username, password)
  │
  ▼
tap submit_login
  │
  ├─ account_store.has(u)            ──fail──▶ show AUTH_ERR_UNKNOWN_USER
  ├─ account_store.get(u).pw matches ──fail──▶ show AUTH_ERR_BAD_PASSWORD
  │
  ▼ all pass
session.bound_username := u
session.bound_at := now
  │
  ▼
navigate → screen.home
```

### 3.5 Logout flow

```
user on screen.settings
  │
  ▼
tap logout
  │
  ▼
session.bound_username := null
session.bound_at := null
  │
  ▼
navigate → screen.login
```

### 3.6 Change password flow (inside screen.settings)

P1 exposes the hook-point only. Layout:

```
screen.settings
  │
  ▼
goto_change_password   [placeholder modal]
  │
  ├─ current password field
  ├─ new password field
  └─ confirm new password field
```

At P1, the modal wiring exists but submission is a no-op that closes the
modal. A follow-up stream owns the real update path.

### 3.7 Session persistence

- On cold start, `screen.splash` inspects `session.bound_username`. If present
  and the user still exists in `account_store`, the shell proceeds authed.
  Otherwise the shell falls through to `screen.login`.
- There is no expiry at P1. A persisted session remains valid until `logout`
  or a client-side store wipe.

### 3.8 Explicit non-goals at P1

- No password reset / recovery.
- No email, phone, social, or wallet login.
- No server-side auth, no token exchange, no refresh.
- No hashing-of-record (the mock store is plain; it is not a credential store).
- No rate limiting on submit.

---

## 4. Mock global chat flow by username

P1 ships **one** global chat room. The purpose of the mock is to prove that
username attribution flows end-to-end from the auth binding into the chat
surface. There is no relay, no moderation, no delivery guarantee, no history
retention across client wipes.

### 4.1 State model

| Field | Type | Notes |
|---|---|---|
| `chat.messages` | `Array<ChatMessage>` | Append-only, in-memory + local storage mirror. |
| `ChatMessage` | `{ id, username, text, sent_at }` | `username` is copied from `session.bound_username` at send-time. |
| `chat.seed` | `Array<ChatMessage>` | Static seed authored by other mock usernames so the room is not empty on first entry. |

### 4.2 Invariants

- Every `ChatMessage` MUST have a non-null `username`. The composer is
  disabled if `session.bound_username` is null — which under §2.3 can never
  happen on `screen.chat` because the screen is guest-quarantined.
- `username` on a stored message is a **snapshot**. Later rename / logout does
  not retroactively rewrite history.
- Message order is the order of append. No clock skew handling.

### 4.3 Send flow

```
user on screen.chat, authed
  │
  ▼
type text in composer
  │
  ▼
tap send
  │
  ├─ text empty?        ──yes──▶ no-op (button disabled)
  ├─ bound_username null? ─yes──▶ impossible (quarantine) — hard fail
  │
  ▼
msg := {
  id:        new_local_id(),
  username:  session.bound_username,   ◀── attribution
  text:      text,
  sent_at:   now
}
  │
  ▼
chat.messages.append(msg)
  │
  ▼
composer.clear()
scroll message list to tail
```

### 4.4 Render flow

```
on mount of screen.chat:
  feed := chat.seed ++ chat.messages         (seed first, live tail last)
  render each m in feed as:
      ┌──────────────────────────────┐
      │ @<m.username>                │
      │ <m.text>                     │
      │                <m.sent_at>   │
      └──────────────────────────────┘
  highlight row where m.username == session.bound_username  (self style)
```

### 4.5 Mock "other users" (seed + synth)

So the global room feels populated at P1:

- `chat.seed` is a static, human-authored list of `[placeholder]` lines from
  synthetic usernames (e.g. `@alpha`, `@beta`, `@gamma`) — content is
  `[placeholder]` and not authored here.
- No synthesised replies, no bot activity, no typing indicators. The mock
  room's only live author is the current user.

### 4.6 End-to-end attribution trace

```
screen.create_account OR screen.login
  │ writes
  ▼
session.bound_username = "acme"
  │ read on mount of
  ▼
screen.chat composer enabled
  │ read at send time
  ▼
ChatMessage { username: "acme", ... } appended to chat.messages
  │ read on render
  ▼
row shows "@acme" and is styled as self
```

This is the full path the P1 mock must honour. Anything beyond this — relay,
delivery, moderation, presence, rooms, DMs, blocking, emoji, media — is out
of scope for P1.

### 4.7 Explicit non-goals at P1

- No network transport.
- No multi-room / DM / thread model.
- No moderation, profanity filter, or report flow.
- No presence indicators.
- No message edit / delete.
- No read receipts or unread counts.

---

## 5. Exclusion reaffirmation

This document specifies **only** the product shell. It does not author, imply,
or constrain:

- Board logic
- Swap logic
- Level mechanics internals

The single handoff to the game surface is `screen.level_select → select_level`
and terminates at `[out-of-scope: game]`. The return path from the game
surface is owned by the game surface and not specified here.

---

## 6. Deliverable checklist

| Required deliverable | Section | Status |
|---|---|---|
| Screen map for non-game user flow | §1 | delivered |
| Navigation map between screens | §2 | delivered |
| Username and password area flow | §3 | delivered |
| Mock global chat flow by username | §4 | delivered |
| No board logic | — | excluded |
| No swap logic | — | excluded |
| No level mechanics internals | — | excluded |
