import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('packages/api — novas rotas', () => {
  it('GET /favorites retorna imóveis por IDs', async () => {
    const res = await app.request('/favorites?ids=1,2');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(2);
    expect(data.items[0].id).toBe('1');
    expect(data.items[1].id).toBe('2');
  });

  it('GET /favorites sem ids retorna vazio', async () => {
    const res = await app.request('/favorites');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it('GET /compare compara 2 imóveis', async () => {
    const res = await app.request('/compare?ids=1,2');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(2);
    expect(data.diffs).toHaveLength(1);
    expect(typeof data.diffs[0].priceDiff).toBe('number');
    expect(typeof data.diffs[0].priceDiffPercent).toBe('number');
  });

  it('GET /compare com < 2 IDs retorna 400', async () => {
    const res = await app.request('/compare?ids=1');
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('GET /cities retorna agregação em items[]', async () => {
    const res = await app.request('/cities');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeInstanceOf(Array);
    expect(data.total).toBeGreaterThanOrEqual(1);
    expect(data.items[0]).toHaveProperty('city');
    expect(data.items[0]).toHaveProperty('count');
    expect(data.items[0]).toHaveProperty('avgPrice');
  });

  it('GET /stats retorna estatísticas', async () => {
    const res = await app.request('/stats');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalProperties).toBeGreaterThanOrEqual(1);
    expect(data.totalCities).toBeGreaterThanOrEqual(1);
    expect(data.avgPrice).toBeGreaterThan(0);
    expect(data.byType).toBeInstanceOf(Object);
    expect(data.byModality).toBeInstanceOf(Object);
  });

  it('POST /properties cria novo imóvel e retorna direto', async () => {
    const res = await app.request('/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Novo imóvel teste',
        city: 'São Paulo',
        state: 'SP',
        price: 500000,
        areaM2: 100,
        type: 'apartamento',
        modality: 'venda',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.title).toBe('Novo imóvel teste');
    expect(data.id).toBeDefined();
    expect(data.status).toBe('active');
  });

  it('PUT /properties/:id atualiza imóvel e retorna direto', async () => {
    const res = await app.request('/properties/1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Atualizado' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Atualizado');
  });

  it('DELETE /properties/:id faz soft delete', async () => {
    const res = await app.request('/properties/1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.id).toBe('1');
  });
});
