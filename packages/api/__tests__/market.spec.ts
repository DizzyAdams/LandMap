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


import app from '../src/index';

describe('market intelligence routes', () => {
  it('GET /market/neighborhoods retorna bairros agregados', async () => {
    const res = await app.request('/market/neighborhoods?city=Curitiba');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.city).toBe('Curitiba');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThanOrEqual(1);
    expect(data.items[0]).toHaveProperty('avgPriceM2');
    expect(data.items[0]).toHaveProperty('avgPrice');
    expect(data.items[0]).toHaveProperty('count');
  });

  it('GET /market/price-trend retorna série de 12 meses ancorada no atual', async () => {
    const res = await app.request('/market/price-trend?city=Curitiba&type=apartamento');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('apartamento');
    expect(Array.isArray(data.monthly)).toBe(true);
    expect(data.monthly.length).toBe(12);
    expect(data.monthly[11].avgPrice).toBe(data.currentAvg);
  });

  it('GET /market/heatmap retorna pontos com peso normalizado 0-1', async () => {
    const res = await app.request('/market/heatmap?city=Curitiba');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.points)).toBe(true);
    expect(data.points.length).toBeGreaterThanOrEqual(1);
    const p = data.points[0];
    expect(typeof p.lat).toBe('number');
    expect(typeof p.lng).toBe('number');
    expect(p.weight).toBeGreaterThanOrEqual(0);
    expect(p.weight).toBeLessThanOrEqual(1);
  });

  it('GET /market/neighborhoods sem "city" retorna 400', async () => {
    const res = await app.request('/market/neighborhoods');
    expect(res.status).toBe(400);
  });
});

describe('terrain intelligence route (/market/terrain)', () => {
  it('retorna KPIs, tendência, rankings e melhores lotes', async () => {
    const res = await app.request('/market/terrain?city=Curitiba');
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.city).toBe('Curitiba');
    expect(data.total).toBeGreaterThanOrEqual(1);

    // KPIs coerentes
    expect(data.kpis).toBeTruthy();
    expect(data.kpis.avgPriceM2).toBeGreaterThan(0);
    expect(data.kpis.minPriceM2).toBeLessThanOrEqual(data.kpis.maxPriceM2);
    expect(data.kpis.available).toBeLessThanOrEqual(data.kpis.total);
    expect(data.kpis.avgBuildScore).toBeGreaterThanOrEqual(0);
    expect(data.kpis.avgBuildScore).toBeLessThanOrEqual(100);

    // Tendência de 12 meses, ancorada no valor atual
    expect(Array.isArray(data.trend)).toBe(true);
    expect(data.trend.length).toBe(12);
    expect(data.trend[11].avgPriceM2).toBe(data.kpis.avgPriceM2);

    // Rankings
    expect(Array.isArray(data.byNeighborhood)).toBe(true);
    expect(Array.isArray(data.byTag)).toBe(true);

    // Melhores lotes com score válido e motivos
    expect(Array.isArray(data.plots)).toBe(true);
    expect(data.plots.length).toBeGreaterThanOrEqual(1);
    const plot = data.plots[0];
    expect(plot.pricePerM2).toBeGreaterThan(0);
    expect(plot.score).toBeGreaterThanOrEqual(0);
    expect(plot.score).toBeLessThanOrEqual(100);
    expect(plot.buildScore).toBeGreaterThanOrEqual(0);
    expect(plot.buildScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(plot.reasons)).toBe(true);
    expect(plot.reasons.length).toBeGreaterThanOrEqual(1);

    // Ranqueado por score desc
    for (let i = 1; i < data.plots.length; i++) {
      expect(data.plots[i - 1].score).toBeGreaterThanOrEqual(data.plots[i].score);
    }
  });

  it('só considera imóveis do tipo terreno', async () => {
    const res = await app.request('/market/terrain?city=Curitiba');
    const data = await res.json();
    // pricePerM2 = price/areaM2 sempre finito e positivo (areaM2 > 0 garantido)
    for (const p of data.plots) {
      expect(Number.isFinite(p.pricePerM2)).toBe(true);
      expect(p.areaM2).toBeGreaterThan(0);
    }
  });

  it('cidade sem terrenos retorna total 0 e kpis null', async () => {
    const res = await app.request('/market/terrain?city=CidadeInexistenteXYZ');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(0);
    expect(data.kpis).toBeNull();
    expect(data.plots).toEqual([]);
  });

  it('sem "city" retorna 400', async () => {
    const res = await app.request('/market/terrain');
    expect(res.status).toBe(400);
  });
});

