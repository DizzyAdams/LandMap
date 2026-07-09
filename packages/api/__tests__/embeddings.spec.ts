import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { createEmbeddingsRouter } from '../src/routes/embeddings';

function makeApp() {
  const app = new Hono();
  app.route('/embeddings', createEmbeddingsRouter());
  return app;
}

const json = (body: unknown) => ({
  method: 'POST' as const,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('packages/api — embeddings router', () => {
  it('rejects a non-array body with 400', async () => {
    const res = await makeApp().request('/embeddings/index', json({ foo: 'bar' }));
    expect(res.status).toBe(400);
  });

  it('indexes documents and reports the count', async () => {
    const res = await makeApp().request(
      '/embeddings/index',
      json([
        { id: 'docA', text: 'apartamento luxo rooftop piscina' },
        { id: 'docB', text: 'terreno rural arvores' },
        { id: 'docC', text: 'sala comercial centro financiada' },
      ]),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.indexed).toBe(3);
    expect(data.total).toBeGreaterThanOrEqual(3);
  });

  it('returns the most similar doc first for a search query', async () => {
    const app = makeApp();
    await app.request('/embeddings/index', json([{ id: 'uniq1', text: 'xyzzy unicorn magical castle' }]));
    const res = await app.request('/embeddings/search?q=' + encodeURIComponent('xyzzy unicorn'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.query).toBe('xyzzy unicorn');
    expect(data.results[0].id).toBe('uniq1');
  });

  it('rejects a search without the q parameter', async () => {
    const res = await makeApp().request('/embeddings/search');
    expect(res.status).toBe(400);
  });

  it('returns similar docs excluding the source and sorted by score', async () => {
    const app = makeApp();
    await app.request(
      '/embeddings/index',
      json([
        { id: 'sim1', text: 'apartamento venda sao paulo capital' },
        { id: 'sim2', text: 'casa campo piscina' },
        { id: 'sim3', text: 'apartamento venda rio de janeiro' },
      ]),
    );
    const res = await app.request('/embeddings/similarity', json({ propertyId: 'sim1', limit: 3 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.propertyId).toBe('sim1');
    expect(data.similar.find((r: { id: string }) => r.id === 'sim1')).toBeUndefined();
    expect(data.similar.length).toBeGreaterThan(0);
  });

  it('returns 404 for a similarity search on an unindexed property', async () => {
    const res = await makeApp().request('/embeddings/similarity', json({ propertyId: 'nope' }));
    expect(res.status).toBe(404);
  });
});
