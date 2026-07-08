import { Hono } from 'hono';
import type { Env } from '../../index.js';
import { ingestDocuments, retrieve, type Chunk } from '@landmap/llm/rag.js';

export function createLLMRagRouter() {
  const router = new Hono<Env>();

  router.post('/ingest', async (c) => {
    const body = await c.req.json<Array<{ path: string; title: string; text: string }>>();
    if (!Array.isArray(body) || body.length === 0) {
      return c.json({ error: 'Body must be a non-empty array of { path, title, text }' }, 400);
    }

    const chunks = ingestDocuments();
    const added: Chunk[] = body.map((d, i) => ({
      id: String(d.path || d.title || `doc_${chunks.length + i}`),
      path: d.path,
      title: d.title,
      text: d.text,
      tokens: d.text.split(/\s+/).filter(Boolean).length,
    }));

    for (const chunk of added) {
      (chunks as Chunk[]).push(chunk);
    }

    return c.json({ indexed: added.length, total: chunks.length });
  });

  router.post('/searchSimilar', async (c) => {
    const body = await c.req.json<{ query: string; top?: number }>();
    if (!body.query || typeof body.query !== 'string') {
      return c.json({ error: 'Field "query" is required' }, 400);
    }

    const top = typeof body.top === 'number' ? body.top : 3;
    const chunks = ingestDocuments();
    const results = retrieve(body.query, chunks, top);
    return c.json({ query: body.query, top, results: results.map((r) => ({ id: r.chunk.id, text: r.chunk.text, score: r.score })) });
  });

  return router;
}
