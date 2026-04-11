#!/usr/bin/env node
// Crypto Crush P1.2 — build verification.
// Asserts:
//   1. dist/web-public/index.html exists
//   2. all required static assets land under dist/web-public
//   3. no build output writes outside the approved path (dist/web-public)

import { statSync, readdirSync, existsSync, utimesSync } from "node:fs";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const distRoot = resolve(repoRoot, "dist");
const approvedOut = resolve(distRoot, "web-public");

const REQUIRED_ASSETS = [
  "index.html",
  "styles.css",
  "main.js",
];

const failures = [];
const lines = [];
function log(s) { lines.push(s); console.log(s); }

// Take a sentinel timestamp before build to detect stray writes under repo
// root outside dist/. We walk once before and once after and compare mtimes.
function walkMtimes(root, skipDirs) {
  const out = new Map();
  (function rec(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = resolve(dir, e.name);
      if (e.isDirectory()) {
        if (skipDirs.has(full)) continue;
        rec(full);
      } else {
        try {
          const st = statSync(full);
          out.set(full, st.mtimeMs);
        } catch {}
      }
    }
  })(root);
  return out;
}

const skip = new Set([
  resolve(repoRoot, ".git"),
  resolve(repoRoot, "node_modules"),
  resolve(repoRoot, "dist"),
]);

const beforeMtimes = walkMtimes(repoRoot, skip);

// Run the build.
log("[verify] running: npm run build");
const r = spawnSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });
if (r.status !== 0) {
  failures.push("build script exited non-zero");
}

// Check 1: dist/web-public/index.html exists.
const indexHtml = resolve(approvedOut, "index.html");
if (existsSync(indexHtml)) {
  log(`[verify] OK  index.html present at ${relative(repoRoot, indexHtml)}`);
} else {
  failures.push(`missing: ${relative(repoRoot, indexHtml)}`);
}

// Check 2: required static assets land under dist/web-public.
for (const a of REQUIRED_ASSETS) {
  const p = resolve(approvedOut, a);
  if (existsSync(p)) {
    log(`[verify] OK  asset present: ${a}`);
  } else {
    failures.push(`missing asset: ${a}`);
  }
}

// Check 3: no build output outside approved path.
// (a) dist/ must contain only web-public/.
if (existsSync(distRoot)) {
  const distChildren = readdirSync(distRoot);
  const stray = distChildren.filter((c) => c !== "web-public");
  if (stray.length === 0) {
    log(`[verify] OK  dist/ contains only web-public/`);
  } else {
    failures.push(`stray entries under dist/: ${stray.join(", ")}`);
  }
}

// (b) No file outside dist/ was written or modified during the build.
const afterMtimes = walkMtimes(repoRoot, skip);
const changedOutside = [];
for (const [path, mt] of afterMtimes) {
  const prior = beforeMtimes.get(path);
  if (prior === undefined || prior !== mt) {
    changedOutside.push(relative(repoRoot, path));
  }
}
if (changedOutside.length === 0) {
  log(`[verify] OK  no writes outside dist/ during build`);
} else {
  failures.push(`unexpected writes outside dist/: ${changedOutside.join(", ")}`);
}

// (c) Every file under dist/ must be under dist/web-public.
function listAll(root) {
  const out = [];
  (function rec(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, e.name);
      if (e.isDirectory()) rec(full);
      else out.push(full);
    }
  })(root);
  return out;
}
if (existsSync(distRoot)) {
  const all = listAll(distRoot);
  const outside = all.filter((p) => !p.startsWith(approvedOut + sep) && p !== approvedOut);
  if (outside.length === 0) {
    log(`[verify] OK  all dist/ files live under dist/web-public (${all.length} files)`);
  } else {
    failures.push(`files outside approved path: ${outside.map((p) => relative(repoRoot, p)).join(", ")}`);
  }
}

log("");
if (failures.length === 0) {
  log("[verify] PASS — all P1.2 checks green");
  process.exit(0);
} else {
  log("[verify] FAIL");
  for (const f of failures) log(`  - ${f}`);
  process.exit(1);
}
