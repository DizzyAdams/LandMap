import { describe, it, expect } from 'vitest';
import { computeMarketKpis, kpisToFeatures, applyRulers } from '../src/kpi/index';
import type { Property } from '../src/kpi/types';

function makeProperty(over: Partial<Property> = {}): Property {
  return {
    id: '1',
    title: 'Imóvel',
    city: 'Curitiba',
    state: 'PR',
    price: 450000,
    areaM2: 72,
    type: 'apartamento',
    modality: 'venda',
    available: true,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    images: [],
    tags: [],
    ...over,
  };
}

describe('llm/kpi', () => {
  it('computes aggregate KPIs from a catalog', () => {
    const properties = [
      makeProperty({ id: '1', price: 300000, areaM2: 60, city: 'Curitiba', state: 'PR' }),
      makeProperty({ id: '2', price: 500000, areaM2: 100, city: 'Curitiba', state: 'PR' }),
      makeProperty({ id: '3', price: 900000, areaM2: 180, city: 'Floripa', state: 'SC', modality: 'aluguel' }),
    ];

    const kpis = computeMarketKpis(properties);
    expect(kpis.total).toBe(3);
    expect(kpis.avgPrice).toBe(566667);
    expect(kpis.availabilityRate).toBeCloseTo(1);
    expect(kpis.rentShare).toBeCloseTo(1 / 3);
    expect(kpis.cities[0].city).toBe('Curitiba');
    expect(kpis.cities[0].count).toBe(2);
  });

  it('clamps features into 0..1', () => {
    const features = kpisToFeatures(computeMarketKpis([makeProperty({ price: 9_000_000 })]));
    for (const value of Object.values(features)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('applies every ruler and returns a scored breakdown', () => {
    const kpis = computeMarketKpis([
      makeProperty({ price: 400000, areaM2: 70 }),
      makeProperty({ price: 600000, areaM2: 120, city: 'Floripa', state: 'SC' }),
    ]);
    const scores = applyRulers(kpis);
    const rulers = scores.map((s) => s.ruler).sort();
    expect(rulers).toEqual(['claude', 'jpmorgan', 'quantum']);
    for (const s of scores) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
      expect(s.commentary.length).toBeGreaterThan(0);
    }
  });
});
