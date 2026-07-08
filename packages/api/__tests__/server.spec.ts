import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('packages/api', () => {
  it('responde em /health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });

  it('responde em /markdowns com filtro simples', async () => {
    const res = await app.request('/markdowns?city=Curitiba');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBeGreaterThanOrEqual(1);
    expect(data.items).toBeInstanceOf(Array);
  });

  it('aceita /search via body e valida schema', async () => {
    const res = await app.request('/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ city: 'Curitiba', type: 'apartamento' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.query.city).toBe('Curitiba');
  });
});
