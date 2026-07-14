import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Resolve properties.json without import.meta (blocked by tsconfig NodeNext) or
// __dirname (not defined in ESM). Strategy: look relative to cwd AND this file.
// Works in dev (cwd=packages/api, src/data/properties.json), in the Next.js web
// app (cwd=apps/web, data/properties.json copied next to .next), and in prod
// (Docker copies src/data -> dist/data, cwd=/app).
//
// IMPORTANT: never throw at import time. A missing data file must not break
// `next build` (collectPageData) or crash the whole API — degrade gracefully to
// an empty dataset and log a warning so the issue is visible in logs.
export function loadProperties(): unknown[] {
  const here = __dirname;
  const candidates = [
    join(process.cwd(), 'data', 'properties.json'),
    join(process.cwd(), 'src', 'data', 'properties.json'),
    join(process.cwd(), 'dist', 'data', 'properties.json'),
    join(here, '..', 'data', 'properties.json'),
    join(here, 'data', 'properties.json'),
  ];
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (parsed?.properties ?? []);
    } catch {
      // try next candidate
    }
  }
  console.warn('[loadProperties] Could not locate properties.json — API serving empty dataset.');
  return [];
}
