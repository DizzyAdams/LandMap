/* ------------------------------------------------------------------ */
/*  Ingestion pipeline                                                 */
/* ------------------------------------------------------------------ */

import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chunkText, type Chunk, tokenize } from './rag.js';
import { TFIDFEmbeddingProvider, cosineSimilarity } from './embeddings.js';

function tf(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const len = tokens.length || 1;
  return Object.fromEntries(
    Object.entries(freq).map(([k, v]) => [k, v / len]),
  ) as Record<string, number>;
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  let ab = 0,
    aa = 0,
    bb = 0;
  for (const k of Object.keys(a)) {
    if (b[k]) ab += a[k] * b[k];
    aa += a[k] * a[k];
    bb += (b[k] || 0) * (b[k] || 0);
  }
  return aa && bb ? ab / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}

export interface IngestionSource {
  /** Absolute or workspace-relative path */
  path: string;
  /** Optional tag/namespace for this source */
  namespace?: string;
}

export interface IngestionResult {
  source: string;
  chunks: Chunk[];
  vectors: number[][];
  indexedAt: string;
}

const ROOT = join(process.cwd(), '..', '..');
const DATA_DIR = join(ROOT, 'data', 'landmap');
const INDEX_FILE = join(DATA_DIR, 'embeddings-index.json');

let provider = new TFIDFEmbeddingProvider();

export function setEmbeddingProvider(p: TFIDFEmbeddingProvider) {
  provider = p;
}

export async function ingestSource(source: IngestionSource): Promise<IngestionResult> {
  const resolved = source.path.startsWith('/')
    ? source.path
    : join(ROOT, source.path);

  if (!existsSync(resolved)) {
    throw new Error(`Ingestion source not found: ${resolved}`);
  }

  const stat = existsSync(resolved)
    ? { isDirectory: () => !resolved.endsWith('.md'), isFile: () => resolved.endsWith('.md') } as any
    : null;

  const chunks: Chunk[] = [];

  if (resolved.endsWith('.md')) {
    const text = readFileSync(resolved, 'utf-8');
    const title = text.match(/^#\s+(.+)$/m)?.[1] || resolved;
    chunks.push(...chunkText({ path: resolved, title, text }));
  } else if (existsSync(resolved)) {
    const files = readdirSync(resolved).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = join(resolved, file);
      const text = readFileSync(filePath, 'utf-8');
      const title = text.match(/^#\s+(.+)$/m)?.[1] || file;
      chunks.push(...chunkText({ path: filePath, title, text }));
    }
  }

  const cleanChunks = chunks.map((c) => ({
    ...c,
    path: source.namespace ? `${source.namespace}://${c.path}` : c.path,
  }));

  const vectors = await provider.embed(cleanChunks.map((c) => c.text));

  const result: IngestionResult = {
    source: resolved,
    chunks: cleanChunks,
    vectors,
    indexedAt: new Date().toISOString(),
  };

  await persistIndex(result);
  return result;
}

export async function ingestDirectory(
  dir: string,
  namespace?: string,
): Promise<IngestionResult[]> {
  const resolved = join(ROOT, dir);
  if (!existsSync(resolved) || !existsSync(resolved)) {
    return [];
  }

  const files = readdirSync(resolved).filter((f) => f.endsWith('.md'));
  const results: IngestionResult[] = [];

  for (const file of files) {
    const result = await ingestSource({
      path: join(resolved, file),
      namespace,
    });
    results.push(result);
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Persistence                                                        */
/* ------------------------------------------------------------------ */

interface StoredIndex {
  source: string;
  chunks: Chunk[];
  vectors: number[][];
  indexedAt: string;
}

async function persistIndex(result: IngestionResult): Promise<void> {
  try {
    let existing: StoredIndex[] = [];
    if (existsSync(INDEX_FILE)) {
      try {
        existing = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
      } catch {
        existing = [];
      }
    }

    // Append/update by source
    const idx = existing.findIndex((e) => e.source === result.source);
    if (idx >= 0) {
      existing[idx] = result;
    } else {
      existing.push(result);
    }

    if (!existsSync(join(INDEX_FILE, '..'))) {
      mkdirSync(join(INDEX_FILE, '..'), { recursive: true });
    }
    writeFileSync(INDEX_FILE, JSON.stringify(existing, null, 2));
  } catch {
    // Persistence is best-effort in serverless contexts
  }
}

export function loadPersistedIndex(): StoredIndex[] {
  try {
    if (!existsSync(INDEX_FILE)) return [];
    return JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function searchSimilar(query: string, topK = 3): Array<{ chunk: Chunk; score: number }> {
  const index = loadPersistedIndex();
  const qTokens = tokenize(query);
  const qVec = (() => {
    const tokens = tokenize(query);
    const freq: Record<string, number> = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
    const len = tokens.length || 1;
    return Object.fromEntries(
      Object.entries(freq).map(([k, v]) => [k, v / len]),
    ) as Record<string, number>;
  })();

  const candidates: Array<{ chunk: Chunk; score: number }> = [];

  for (const entry of index) {
    for (let i = 0; i < entry.chunks.length; i++) {
      const chunk = entry.chunks[i];
      const denseVec = entry.vectors[i];
      if (!denseVec) continue;

      const sparseScore = cosine(qVec, tf(tokenize(chunk.text)));

      // Temporary hybrid placeholder: denseScore uses top-term overlap magnitude
      const sharedTerms = Object.keys(tf(tokenize(chunk.text))).filter((term) => (qVec[term] || 0) > 0);
      const denseScore = sharedTerms.length
        ? Math.min(sharedTerms.length / Math.max(Object.keys(qVec).length, 1), 1)
        : 0;

      // Hybrid score: 60% dense + 40% sparse TF-IDF
      const score = sparseScore * 0.4 + denseScore * 0.6;
      candidates.push({ chunk, score });
    }
  }

  const top = candidates.sort((a, b) => b.score - a.score).slice(0, topK);
  return top;
}
