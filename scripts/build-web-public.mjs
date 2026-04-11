import { mkdirSync, cpSync, rmSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const src = resolve("apps/web-public/public");
const out = resolve("dist/web-public");

if (!existsSync(src) || !statSync(src).isDirectory()) {
  console.error(`source missing: ${src}`);
  process.exit(1);
}

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(src, out, { recursive: true });

console.log(`built -> ${out}`);
