import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { createRagRouter } from '../src/routes/rag';

function makeApp() {
  const app = new Hono();
  app.route('/rag', createRagRouter());
  return app;
}

const json = (body: unknown) => ({
  method: 'POST' as const,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('packages/api — rag router', () => {
  it('POST /rag/query returns ok with a sources array for a valid query', async () => {
    const res = await makeApp().request('/rag/query', json({ query: 'apartamento centro curitiba' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.sources)).toBe(true);
    expect(typeof data.answer).toBe('string');
    expect(typeof data.generatedAt).toBe('string');
  });

  it('POST /rag/query rejects an empty query with 400', async () => {
    const res = await makeApp().request('/rag/query', json({}));
    expect(res.status).toBe(400);
  });

  it('POST /rag/query tolerates a malformed JSON body', async () => {
    const res = await makeApp().request('/rag/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
  });

  it('GET /rag/status returns index stats', async () => {
    const res = await makeApp().request('/rag/status');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(typeof data.chunks).toBe('number');
    expect(typeof data.documents).toBe('number');
    expect(data.chunks).toBeGreaterThan(0);
  });

  it('POST /rag/retrieve returns sources only', async () => {
    const res = await makeApp().request('/rag/retrieve', json({ query: 'Score LandMap' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.sources)).toBe(true);
  });
});

