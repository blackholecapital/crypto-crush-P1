# Crypto Crush | WA | P1.2 — Build Verification

Scope: verify that `npm run build` from the repo root produces the approved demo output and that no build output lands outside the approved path.

Source of truth:
- `package.json` root build authority (P1.1)
- `scripts/build.mjs` (single writer)
- `scripts/verify-build.mjs` (this verification)

---

## 1. Checks performed

1. `npm run build` from repo root produces `dist/web-public/index.html`.
2. All required static assets land under `dist/web-public`.
3. No build output writes outside the approved path.

Required static assets (P1.2 set):

- `index.html`
- `styles.css`
- `main.js`

---

## 2. How check 3 is enforced

- `scripts/build.mjs` is the only writer of build output in the repo. It refuses any write whose destination is not under `dist/web-public` (`assertUnderOutDir`).
- `scripts/verify-build.mjs` additionally:
  - snapshots mtimes of every file under the repo root (excluding `.git`, `node_modules`, `dist`) before the build and compares after — any changed/new file outside `dist/` fails the run;
  - asserts `dist/` contains only `web-public/`;
  - asserts every file under `dist/` lives under `dist/web-public`.

---

## 3. Verification run

Command: `npm run verify:build`

```
[verify] running: npm run build
[build] target : apps/web-public
[build] output : dist/web-public
[build] done
[verify] OK  index.html present at dist/web-public/index.html
[verify] OK  asset present: index.html
[verify] OK  asset present: styles.css
[verify] OK  asset present: main.js
[verify] OK  dist/ contains only web-public/
[verify] OK  no writes outside dist/ during build
[verify] OK  all dist/ files live under dist/web-public (10 files)

[verify] PASS — all P1.2 checks green
```

---

## 4. Output tree snapshot

```
dist/web-public/
├── app/
│   ├── app/layout/shell.layout.proof-run.ts
│   ├── app/layout/shell.layout.proof.ts
│   ├── app/layout/shell.layout.ts
│   └── mounts/
│       ├── disable.mount.ts
│       ├── index.ts
│       ├── proof.ts
│       └── remove.mount.ts
├── index.html
├── main.js
└── styles.css
```

---

## 5. Result

| Check | Status |
|---|---|
| `dist/web-public/index.html` produced by `npm run build` | **PASS** |
| Required static assets under `dist/web-public` | **PASS** |
| No build output outside approved path | **PASS** |

**P1.2 verification: PASS.**
