import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

// Resolve properties.json without import.meta (blocked by tsconfig NodeNext) or
// __dirname (not defined in ESM). Strategy: candidate paths AND an upward walk
// from cwd so the file is always found regardless of the serverless lambda cwd.
// Works in dev (cwd=packages/api), in the Next.js web app (cwd=apps/web or a
// route dir), and in prod (Vercel serverless — cwd varies per function).
//
// IMPORTANT: never throw at import time. A missing data file must not break
// `next build` (collectPageData) or crash the whole API — degrade gracefully to
// an empty dataset and log a warning so the issue is visible in logs.
export function loadProperties(): unknown[] {
  const candidates = buildCandidates();
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, 'utf-8');
      const parsed = JSON.parse(raw);
      const arr: unknown[] = Array.isArray(parsed) ? parsed : (parsed?.properties ?? []);
      if (arr.length) return arr;
    } catch {
      // try next candidate
    }
  }
  console.warn('[loadProperties] Could not locate properties.json — API serving empty dataset.');
  return [];
}

function buildCandidates(): string[] {
  const out: string[] = [];
  const here = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

  // 1) explicit relative candidates from cwd and __dirname
  const bases = [process.cwd(), here];
  const rels = [
    ['data', 'properties.json'],
    ['src', 'data', 'properties.json'],
    ['dist', 'data', 'properties.json'],
    ['..', 'packages', 'api', 'src', 'data', 'properties.json'],
    ['..', 'packages', 'api', 'dist', 'data', 'properties.json'],
    ['..', '..', 'packages', 'api', 'src', 'data', 'properties.json'],
    ['..', '..', 'packages', 'api', 'dist', 'data', 'properties.json'],
  ];
  for (const base of bases) {
    for (const rel of rels) out.push(join(base, ...rel));
  }

  // 2) upward walk from cwd and __dirname: find any properties.json under a
  //    packages/api/{src,dist}/data or top-level data/ directory.
  for (const start of [process.cwd(), here]) {
    let dir = start;
    for (let i = 0; i < 8; i++) {
      out.push(join(dir, 'data', 'properties.json'));
      out.push(join(dir, 'packages', 'api', 'src', 'data', 'properties.json'));
      out.push(join(dir, 'packages', 'api', 'dist', 'data', 'properties.json'));
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  return out;
}
