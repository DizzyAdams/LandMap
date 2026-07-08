import { describe, it, expect } from 'vitest';
import { createMarketRouter } from '../src/market.js';

describe('market API', () => {
  it('GET /market/trends retorna tendências', async () => {
    const app = createMarketRouter();
    const res = await app.request('/trends');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('avgPriceChange', '+5.2%');
    expect(data).toHaveProperty('demandIndex', 78);
    expect(data.hotCities.length).toBeGreaterThanOrEqual(3);
  });

  it('GET /market/comparison retorna comparação entre cidades', async () => {
    const app = createMarketRouter();
    const res = await app.request('/comparison?city=Curitiba&city=Florianópolis');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items.length).toBe(2);
    expect(data.items[0].city).toBe('Curitiba');
    expect(data.items[1].city).toBe('Florianópolis');
    expect(data.items[0]).toHaveProperty('avgPrice');
    expect(data.items[0]).toHaveProperty('demandScore');
  });

  it('GET /market/comparison sem cities retorna 400', async () => {
    const app = createMarketRouter();
    const res = await app.request('/comparison');
    expect(res.status).toBe(400);
  });
});
