#!/usr/bin/env node
// Crypto Crush P1 — root build authority entry point.
// Single public demo target: apps/web-public.
// Output folder rule: dist/web-public at the repo root.

import { mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const target = resolve(repoRoot, "apps/web-public");
const outDir = resolve(repoRoot, "dist/web-public");

if (!existsSync(target)) {
  console.error(`[build] public demo target missing: ${target}`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const srcDir = resolve(target, "src");
if (existsSync(srcDir)) {
  cpSync(srcDir, outDir, { recursive: true });
}

console.log(`[build] target : apps/web-public`);
console.log(`[build] output : dist/web-public`);
console.log(`[build] done`);
