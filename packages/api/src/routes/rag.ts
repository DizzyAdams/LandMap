import { Hono } from 'hono';
import { retrievalQaChain } from '@landmap/llm';
import { inMemoryIndex, retrieve } from '@landmap/llm/rag.js';
import type { Env } from '../index.js';

export function createRagRouter() {
  const router = new Hono<Env>();

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
      answer = await retrievalQaChain(query, top.map((t) => t.chunk.text));
      usedMock = answer.includes('modo demo');
    } catch {
      answer =
        'Recuperação local concluída. Resposta gerada por LLM requer LANDMAP_LLM_KEY configurada.';
    }

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
