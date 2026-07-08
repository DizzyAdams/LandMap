import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('packages/api — langflow + rag', () => {
  it('GET /langflow/workflows lists built-in workflows', async () => {
    const res = await app.request('/langflow/workflows');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.items.length).toBe(3);
    expect(data.items.map((w: { id: string }) => w.id)).toContain('market-report');
  });

  it('POST /langflow/workflows/market-report/run executes the workflow', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    const res = await app.request('/langflow/workflows/market-report/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'Brasil', stats: { total: 1500, avgPrice: 500000 } }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.result.status).toBe('ok');
  });

  it('POST /langflow/workflows/unknown/run returns 422', async () => {
    const res = await app.request('/langflow/workflows/unknown/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('POST /rag/query returns answer + sources', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    const res = await app.request('/rag/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'apartamento centro' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(typeof data.answer).toBe('string');
    expect(Array.isArray(data.sources)).toBe(true);
  });

  it('POST /rag/query rejects empty query', async () => {
    const res = await app.request('/rag/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});
