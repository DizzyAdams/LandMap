/**
 * Server-side dataset loader (apps/web).
 *
 * Reusa a MESMA fonte do Hono `packages/api` (`properties.json`) para que
 * KPIs / oportunidades / alertas trabальnem com os dados reais do mercado.
 * Estratégia de resolução de caminho idêntica a `packages/api/src/loadJson.ts`
 * (cwd-relative + relativo ao __dirname), com fallback gracioso.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Property } from './api';

const CANDIDATES = [
  join(process.cwd(), 'data', 'properties.json'),
  join(process.cwd(), 'src', 'data', 'properties.json'),
  join(process.cwd(), '..', 'packages', 'api', 'src', 'data', 'properties.json'),
  join(process.cwd(), '..', '..', 'packages', 'api', 'src', 'data', 'properties.json'),
  join(__dirname, '..', '..', 'packages', 'api', 'src', 'data', 'properties.json'),
  join(__dirname, '..', 'packages', 'api', 'src', 'data', 'properties.json'),
  join(__dirname, 'data', 'properties.json'),
];

let cache: Property[] | null = null;

export function loadMarketProperties(): Property[] {
  if (cache) return cache;
  for (const p of CANDIDATES) {
    try {
      const raw = readFileSync(p, 'utf-8');
      const parsed = JSON.parse(raw);
      const arr: unknown[] = Array.isArray(parsed) ? parsed : parsed?.properties ?? [];
      if (arr.length) {
        cache = arr as Property[];
        return cache;
      }
    } catch {
      // try next
    }
  }
  console.warn('[loadMarketProperties] properties.json não encontrado — dataset vazio.');
  cache = [];
  return cache;
}
