import { Hono } from 'hono';
import type { Env } from '../index.js';

export { Env };

/* ------------------------------------------------------------------ */
/*  Simple in-memory TF-IDF index (no external deps)                   */
/* ------------------------------------------------------------------ */

interface EmbedDoc {
  id: string;
  text: string;
  metadata?: Record<string, string>;
}

const STOP = new Set([
  'de', 'do', 'da', 'dos', 'das', 'em', 'para', 'com', 'por',
  'um', 'uma', 'uns', 'umas', 'no', 'na', 'nos', 'nas',
  'ao', 'aos', 'à', 'às', 'e', 'ou', 'que', 'se',
  'nao', 'não', 'é', 'como', 'mais', 'menos', 'tem', 'entre',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9]+/gi, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function tf(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const len = tokens.length || 1;
  return Object.fromEntries(
    Object.entries(freq).map(([k, v]) => [k, v / len])
  );
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  let ab = 0, aa = 0, bb = 0;
  for (const k of Object.keys(a)) {
    if (b[k]) ab += a[k] * b[k];
    aa += a[k] * a[k];
    bb += (b[k] || 0) * (b[k] || 0);
  }
  return aa && bb ? ab / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}

/* ------------------------------------------------------------------ */
/*  In-memory store                                                    */
/* ------------------------------------------------------------------ */

let docs: EmbedDoc[] = [];
let vectors: Map<string, Record<string, number>> = new Map();

function addDocs(newDocs: EmbedDoc[]): void {
  for (const d of newDocs) {
    docs.push(d);
    vectors.set(d.id, tf(tokenize(d.text)));
  }
}

function search(query: string, topK: number): Array<{ id: string; text: string; score: number; metadata?: Record<string, string> }> {
  const qVec = tf(tokenize(query));
  const scored = docs.map((d) => {
    const docVec = vectors.get(d.id);
    if (!docVec) return { ...d, score: 0 };
    return { ...d, score: cosine(qVec, docVec) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

/* ------------------------------------------------------------------ */
/*  Router                                                             */
/* ------------------------------------------------------------------ */

export function createEmbeddingsRouter() {
  const router = new Hono<Env>();

  /** POST /embeddings/index — indexa documentos */
  router.post('/index', async (c) => {
    const body = await c.req.json<EmbedDoc[]>();
    if (!Array.isArray(body)) {
      return c.json({ error: 'Body must be an array of { id, text, metadata? }' }, 400);
    }
    addDocs(body);
    return c.json({ indexed: body.length, total: docs.length });
  });

  /** POST /embeddings/similarity — busca imóveis similares */
  router.post('/similarity', async (c) => {
    const { propertyId, limit = 5 } = await c.req.json<{ propertyId: string; limit?: number }>();

    // Find the indexed property and use its text as query
    const sourceDoc = docs.find((d) => d.id === propertyId);
    if (!sourceDoc) {
      return c.json({ error: `Property "${propertyId}" not indexed` }, 404);
    }

    const results = search(sourceDoc.text, limit + 1)
      .filter((r) => r.id !== propertyId)
      .slice(0, limit);

    return c.json({
      propertyId,
      similar: results.map((r) => ({ id: r.id, text: r.text, score: r.score, metadata: r.metadata })),
      total: results.length,
    });
  });

  /** GET /embeddings/search?q=texto */
  router.get('/search', async (c) => {
    const q = c.req.query('q');
    const limitRaw = c.req.query('limit');
    const limit = limitRaw ? parseInt(limitRaw, 10) : 5;

    if (!q) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    const results = search(q, limit);
    return c.json({
      query: q,
      results: results.map((r) => ({ id: r.id, text: r.text, score: r.score, metadata: r.metadata })),
      total: results.length,
    });
  });

  return router;
}
