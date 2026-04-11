#!/usr/bin/env node
// Crypto Crush P1 — root build authority entry point.
// Single public demo target: apps/web-public.
// Output folder rule: dist/web-public at the repo root.
// This script is the ONLY writer of build output in the repo.

import { mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const target = resolve(repoRoot, "apps/web-public");
const outDir = resolve(repoRoot, "dist/web-public");

function assertUnderOutDir(path) {
  const rel = path.startsWith(outDir);
  if (!rel) {
    console.error(`[build] refused write outside approved path: ${path}`);
    process.exit(1);
  }
}

if (!existsSync(target)) {
  console.error(`[build] public demo target missing: ${target}`);
  process.exit(1);
}

// Clean + recreate output folder (only under dist/web-public).
assertUnderOutDir(outDir);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 1) Copy public/ static assets to dist/web-public root (index.html lives here).
const publicDir = resolve(target, "public");
if (existsSync(publicDir)) {
  const dest = outDir;
  assertUnderOutDir(dest);
  cpSync(publicDir, dest, { recursive: true });
}

// 2) Copy src/ into dist/web-public/app (app code bundle placeholder).
const srcDir = resolve(target, "src");
if (existsSync(srcDir)) {
  const dest = resolve(outDir, "app");
  assertUnderOutDir(dest);
  cpSync(srcDir, dest, { recursive: true });
}

console.log(`[build] target : apps/web-public`);
console.log(`[build] output : dist/web-public`);
console.log(`[build] done`);
