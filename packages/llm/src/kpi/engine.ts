import type { Property, MarketKpis, MarketFeatures, CityAggregate } from './types.js';

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function pricePerSqm(p: Property): number | null {
  if (!p.areaM2 || p.areaM2 <= 0) return null;
  return p.price / p.areaM2;
}

/**
 * Compute a compact set of market KPIs from a property catalog.
 * Pure and deterministic — safe to call on the server or in tests.
 */
export function computeMarketKpis(properties: Property[]): MarketKpis {
  const total = properties.length;
  const prices = properties.map((p) => p.price).filter((v) => Number.isFinite(v));
  const psqm = properties.map(pricePerSqm).filter((v): v is number => v !== null);

  const byType: Record<string, number> = {};
  const byModality: Record<string, number> = {};
  let available = 0;
  let rent = 0;

  for (const p of properties) {
    byType[p.type] = (byType[p.type] ?? 0) + 1;
    byModality[p.modality] = (byModality[p.modality] ?? 0) + 1;
    if (p.available && p.status === 'active') available++;
    if (p.modality === 'aluguel') rent++;
  }

  // City aggregation
  const cityMap = new Map<string, { city: string; state: string; count: number; total: number; psqmTotal: number; psqmCount: number }>();
  for (const p of properties) {
    const key = `${p.city}|${p.state}`;
    const entry = cityMap.get(key) ?? { city: p.city, state: p.state, count: 0, total: 0, psqmTotal: 0, psqmCount: 0 };
    entry.count++;
    entry.total += p.price;
    const per = pricePerSqm(p);
    if (per !== null) {
      entry.psqmTotal += per;
      entry.psqmCount++;
    }
    cityMap.set(key, entry);
  }

  const cities: CityAggregate[] = Array.from(cityMap.values())
    .map((e) => ({
      city: e.city,
      state: e.state,
      count: e.count,
      avgPrice: Math.round(e.total / Math.max(e.count, 1)),
      avgPricePerSqm: e.psqmCount ? Math.round(e.psqmTotal / e.psqmCount) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    medianPrice: Math.round(median(prices)),
    avgPricePerSqm: psqm.length ? Math.round(psqm.reduce((a, b) => a + b, 0) / psqm.length) : 0,
    medianPricePerSqm: Math.round(median(psqm)),
    availabilityRate: total ? available / total : 0,
    rentShare: total ? rent / total : 0,
    byType,
    byModality,
    cities,
  };
}

/**
 * Project KPIs into normalized 0..1 features used by the rulers.
 * Reference anchors are chosen for the Brazilian mid-market (~R$ 500k median,
 * ~R$ 7k/m²). They can be overridden for other markets.
 */
export function kpisToFeatures(
  kpis: MarketKpis,
  anchors: { medianPrice: number; medianPsqm: number } = { medianPrice: 500_000, medianPsqm: 7_000 },
): MarketFeatures {
  const priceLevel = clamp01(kpis.medianPrice / (anchors.medianPrice * 2));
  const density = clamp01(kpis.total / 200);
  const affordability = clamp01(anchors.medianPrice / Math.max(kpis.medianPrice, 1));
  const liquidity = clamp01(kpis.availabilityRate);
  const growthSignal = clamp01(1 - kpis.rentShare);
  return { priceLevel, density, affordability, liquidity, growthSignal };
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
