import { Hono } from 'hono';
import { retrievalQaChain } from '@landmap/llm';
import { inMemoryIndex, retrieve, ragIndexStats } from '@landmap/llm/rag.js';
import type { Env } from '../index.js';
import { emitWebhook } from '../webhooks/store.js';

export function createRagRouter() {
  const router = new Hono<Env>();

  router.get('/status', (c) => {
    const stats = ragIndexStats();
    return c.json({
      ok: true,
      ...stats,
      mode: process.env.LANDMAP_LLM_KEY ? 'llm' : 'demo',
      generatedAt: new Date().toISOString(),
    });
  });

  router.post('/retrieve', async (c) => {
    let body: { query?: string; top?: number } = {};
    try {
      body = await c.req.json<{ query?: string; top?: number }>();
    } catch {
      body = {};
    }
    const query = (body.query ?? '').toString().trim();
    if (!query) return c.json({ ok: false, error: 'Field "query" is required' }, 400);
    const top = Math.min(Math.max(Number(body.top) || 4, 1), 12);
    const chunks = inMemoryIndex();
    const hits = retrieve(query, chunks, top).map((r) => ({
      title: r.chunk.title,
      path: r.chunk.path,
      score: r.score,
      snippet: r.chunk.text.slice(0, 280),
    }));
    return c.json({ ok: true, query, sources: hits, generatedAt: new Date().toISOString() });
  });

  router.post('/query', async (c) => {
    let body: { query?: string } = {};
    try {
      body = await c.req.json<{ query?: string }>();
    } catch {
      body = {};
    }

    const query = (body.query ?? '').toString().trim();
    if (!query) {
      return c.json({ ok: false, error: 'Field "query" is required' }, 400);
    }

    const chunks = inMemoryIndex();
    const top = retrieve(query, chunks, 4);
    const sources = top.map((r) => ({
      title: r.chunk.title,
      path: r.chunk.path,
      score: r.score,
    }));

    let answer = '';
    let usedMock = false;
    try {
      answer = await retrievalQaChain(
        query,
        top.map((t) => t.chunk.text),
      );
      usedMock = answer.includes('modo demo');
    } catch {
      answer =
        'Recuperação local concluída. Resposta gerada por LLM requer LANDMAP_LLM_KEY configurada.';
      usedMock = true;
    }

    void emitWebhook('rag.query', {
      query,
      sourcesCount: sources.length,
      usedMock,
    }).catch(() => {});

    return c.json({
      ok: true,
      query,
      answer,
      sources,
      usedMock,
      generatedAt: new Date().toISOString(),
    });
  });

  return router;
}
