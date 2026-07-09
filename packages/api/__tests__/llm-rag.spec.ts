import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { createLLMRagRouter } from '../src/routes/llm/rag';

function makeApp() {
  const app = new Hono();
  app.route('/llm/rag', createLLMRagRouter());
  return app;
}

const json = (body: unknown) => ({
  method: 'POST' as const,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('packages/api — llm/rag router', () => {
  it('ingests documents and retrieves them by similarity', async () => {
    const app = makeApp();
    const ingest = await app.request(
      '/llm/rag/ingest',
      json([
        { path: 'd1', title: 'Doc1', text: 'apartamento venda sao paulo' },
        { path: 'd2', title: 'Doc2', text: 'casa campo piscina' },
      ]),
    );
    expect(ingest.status).toBe(200);
    const ing = await ingest.json();
    expect(ing.indexed).toBe(2);
    expect(ing.total).toBeGreaterThanOrEqual(2);

    const search = await app.request(
      '/llm/rag/searchSimilar',
      json({ query: 'apartamento venda sao paulo', top: 2 }),
    );
    expect(search.status).toBe(200);
    const s = await search.json();
    expect(s.results.length).toBeGreaterThan(0);
    expect(s.results[0].id).toBe('d1');
  });

  it('rejects an empty ingest array with 400', async () => {
    const res = await makeApp().request('/llm/rag/ingest', json([]));
    expect(res.status).toBe(400);
  });

  it('requires a query on /searchSimilar', async () => {
    const res = await makeApp().request('/llm/rag/searchSimilar', json({}));
    expect(res.status).toBe(400);
  });
});
