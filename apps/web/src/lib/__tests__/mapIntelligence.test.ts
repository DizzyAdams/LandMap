import { describe, it, expect } from 'vitest';
import {
  COPY,
  INTELLIGENCE_REGIONS,
  INTELLIGENCE_LAYERS,
  scoreLabel,
  scoreColor,
  heatScaleGradient,
  layerValue,
  topByScore,
  topByValorization,
  filterRegions,
  fmtDelta,
  fmtPriceSqm,
} from '../mapIntelligence';

describe('mapIntelligence — data integrity', () => {
  it('has exactly 8 intelligence layers', () => {
    expect(INTELLIGENCE_LAYERS).toHaveLength(8);
  });

  it('has 9 regions, all with required fields', () => {
    expect(INTELLIGENCE_REGIONS).toHaveLength(9);
    for (const r of INTELLIGENCE_REGIONS) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.layerScores).toBeTruthy();
      expect(Object.keys(r.layerScores)).toHaveLength(8);
      expect(r.priceHistory).toBeInstanceOf(Array);
      expect(r.highlights).toBeInstanceOf(Array);
      expect(r.timeline).toBeInstanceOf(Array);
      expect(typeof r.priceSqm).toBe('number');
      expect(typeof r.population).toBe('number');
      expect(typeof r.incomeAvg).toBe('number');
      expect(typeof r.hdi).toBe('number');
      expect(Array.isArray(r.zoning)).toBe(false);
      expect(typeof r.environmentalRisk).toBe('string');
      expect(typeof r.floodRisk).toBe('string');
    }
  });

  it('every region has real Fortaleza-like coordinates', () => {
    for (const r of INTELLIGENCE_REGIONS) {
      expect(r.lat).toBeGreaterThan(-4);
      expect(r.lat).toBeLessThan(-3);
      expect(r.lng).toBeGreaterThan(-39);
      expect(r.lng).toBeLessThan(-38);
    }
  });
});

describe('scoreLabel — band alignment', () => {
  it.each([
    [20, 'Crítico'],
    [35, 'Baixo'],
    [50, 'Médio'],
    [65, 'Alto potencial'],
    [85, 'Excepcional'],
  ])('score %i -> %s', (score, label) => {
    expect(scoreLabel(score)).toBe(label);
  });
});

describe('scoreColor — band thresholds (jsdom falls back to concrete hex)', () => {
  // resolveToken returns '' in jsdom -> non-destructive bands fall back to '#575ECF'
  it.each([
    [20, '#dc2626'], // <35 destructive -> distinct fallback
    [40, '#575ECF'], // 35-49 warning (no real var in jsdom)
    [55, '#575ECF'], // 50-64 accent
    [70, '#575ECF'], // 65-79 accent
    [90, '#575ECF'], // >=80 primary
  ])('score %i -> %s', (score, hex) => {
    expect(scoreColor(score)).toBe(hex);
  });
});

describe('ranking helpers', () => {
  it('topByValorization returns 3 sorted desc by delta', () => {
    const top = topByValorization(3);
    expect(top).toHaveLength(3);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].priceSqmDelta12m).toBeGreaterThanOrEqual(top[i].priceSqmDelta12m);
    }
  });

  it('topByScore returns 3 sorted desc by score', () => {
    const top = topByScore(3);
    expect(top).toHaveLength(3);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].score).toBeGreaterThanOrEqual(top[i].score);
    }
  });

  it('filterRegions is case-insensitive on name', () => {
    const found = filterRegions('meireles');
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].id).toBe('meireles');
    expect(filterRegions('zzz-nope')).toHaveLength(0);
  });
});

describe('formatters', () => {
  it('fmtDelta renders percent with sign', () => {
    expect(fmtDelta(12.4)).toContain('%');
    expect(fmtDelta(-3.1)).toContain('-');
  });
  it('fmtPriceSqm renders BRL', () => {
    expect(fmtPriceSqm(8500)).toContain('R$');
  });
});

describe('COPY keys used by map/page exist', () => {
  const USED = [
    'score', 'scoreHint', 'topValorization', 'topOpportunities', 'indexFlow',
    'hottest', 'historyRange', 'avgPrice', 'population', 'income', 'idh',
    'zoning', 'envRisk', 'floodRisk', 'failMap', 'layersTitle', 'heat',
    'heatScale', 'critical', 'medium', 'exceptional', 'composition',
    'compare', 'regions', 'stateRank', 'nationalRank', 'last7Years', 'history',
  ];
  it.each(USED)('COPY.%s is defined', (k) => {
    expect((COPY as Record<string, string>)[k]).toBeTruthy();
  });
});
