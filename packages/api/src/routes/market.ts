import { Hono } from 'hono';
import type { Env } from '../index.js';
import type { Property } from '@landmap/db';
import { z } from 'zod';
import allPropertiesData from '../data/properties.json';

const allProperties = allPropertiesData as unknown as Property[];

export type NeighborhoodStat = {
  name: string;
  city: string;
  state: string;
  count: number;
  avgPriceM2: number;
  avgPrice: number;
};

export type PriceTrendPoint = {
  month: string;
  avgPrice: number;
};

export type HeatmapPoint = {
  lat: number;
  lng: number;
  weight: number;
  neighborhood: string;
  avgPrice: number;
};

const citySchema = z.object({
  city: z.string().min(1, 'O parâmetro "city" é obrigatório'),
});

const cityTypeSchema = z.object({
  city: z.string().min(1, 'O parâmetro "city" é obrigatório'),
  type: z.enum(['apartamento', 'casa', 'terreno', 'comercial']).optional(),
});

function filterByCity(city: string): Property[] {
  const target = city.trim().toLowerCase();
  return allProperties.filter((p) => p.city.toLowerCase() === target);
}

type Agg = {
  name: string;
  city: string;
  state: string;
  count: number;
  priceSum: number;
  priceM2Sum: number;
  priceM2Count: number;
  latSum: number;
  lngSum: number;
  coordCount: number;
};

function aggregateByNeighborhood(props: Property[]): Map<string, Agg> {
  const map = new Map<string, Agg>();
  for (const p of props) {
    const name = p.neighborhood?.trim();
    if (!name) continue;
    let agg = map.get(name);
    if (!agg) {
      agg = {
        name,
        city: p.city,
        state: p.state,
        count: 0,
        priceSum: 0,
        priceM2Sum: 0,
        priceM2Count: 0,
        latSum: 0,
        lngSum: 0,
        coordCount: 0,
      };
      map.set(name, agg);
    }
    agg.count += 1;
    agg.priceSum += p.price;
    if (p.areaM2 > 0) {
      agg.priceM2Sum += p.price / p.areaM2;
      agg.priceM2Count += 1;
    }
    if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
      agg.latSum += p.latitude;
      agg.lngSum += p.longitude;
      agg.coordCount += 1;
    }
  }
  return map;
}

/** Hash determinístico (FNV-1a) -> [0, 1). Garante série estável por cidade/tipo. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export const marketApp = new Hono<Env>();

/* GET /market/neighborhoods?city=X[&type=apartamento] */
marketApp.get('/neighborhoods', (c) => {
  const result = cityTypeSchema.safeParse({
    city: c.req.query('city') ?? '',
    type: c.req.query('type'),
  });
  if (!result.success) {
    return c.json({ error: 'O parâmetro "city" é obrigatório', issues: result.error.issues }, 400);
  }
  const parsed = result.data;

  let props = filterByCity(parsed.city);
  if (parsed.type) props = props.filter((p) => p.type === parsed.type);

  const items: NeighborhoodStat[] = Array.from(
    aggregateByNeighborhood(props).values(),
  )
    .map((a) => ({
      name: a.name,
      city: a.city,
      state: a.state,
      count: a.count,
      avgPriceM2: a.priceM2Count > 0 ? Math.round(a.priceM2Sum / a.priceM2Count) : 0,
      avgPrice: Math.round(a.priceSum / a.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return c.json({
    city: parsed.city,
    type: parsed.type ?? 'todos',
    total: items.length,
    items,
  });
});

/* GET /market/price-trend?city=X[&type=apartamento] */
marketApp.get('/price-trend', (c) => {
  const result = cityTypeSchema.safeParse({
    city: c.req.query('city') ?? '',
    type: c.req.query('type'),
  });
  if (!result.success) {
    return c.json({ error: 'O parâmetro "city" é obrigatório', issues: result.error.issues }, 400);
  }
  const parsed = result.data;

  let props = filterByCity(parsed.city);
  if (parsed.type) props = props.filter((p) => p.type === parsed.type);

  const currentAvg = props.length
    ? Math.round(props.reduce((s, p) => s + p.price, 0) / props.length)
    : 0;

  const now = new Date();
  const phase = hash01(parsed.city.toLowerCase()) * Math.PI * 2;
  const months: string[] = [];
  const factors: number[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    const season = Math.sin(((d.getMonth() + 1) / 12) * Math.PI * 2 + phase) * 0.05;
    const trend = (i / 11) * 0.08 - 0.04; // mais antigo ~ -4%, mais recente ~ +4%
    const noise =
      (hash01(`${parsed.city}|${parsed.type ?? 'all'}|${d.getMonth()}`) * 2 - 1) * 0.02;
    factors.push(1 + season + trend + noise);
  }

  // Ancora o mês mais recente em currentAvg (fator = 1) para série estável.
  const lastFactor = factors[factors.length - 1] || 1;
  const monthly: PriceTrendPoint[] = months.map((month, idx) => ({
    month,
    avgPrice: Math.round((currentAvg * factors[idx]) / lastFactor),
  }));

  return c.json({
    city: parsed.city,
    type: parsed.type ?? 'todos',
    currentAvg,
    monthly,
  });
});

/* GET /market/heatmap?city=X -> densidade por bairro (peso = preço médio normalizado 0-1) */
marketApp.get('/heatmap', (c) => {
  const result = citySchema.safeParse({ city: c.req.query('city') ?? '' });
  if (!result.success) {
    return c.json({ error: 'O parâmetro "city" é obrigatório', issues: result.error.issues }, 400);
  }
  const parsed = result.data;

  const props = filterByCity(parsed.city);
  const agg = aggregateByNeighborhood(props);
  const withCoords = Array.from(agg.values()).filter((a) => a.coordCount > 0);

  const avgPrices = withCoords.map((a) => a.priceSum / a.count);
  const minAvg = avgPrices.length ? Math.min(...avgPrices) : 0;
  const maxAvg = avgPrices.length ? Math.max(...avgPrices) : 0;
  const span = maxAvg - minAvg || 1;

  const points: HeatmapPoint[] = withCoords.map((a) => {
    const avgPrice = Math.round(a.priceSum / a.count);
    const weight = Number((((avgPrice - minAvg) / span)).toFixed(3));
    return {
      lat: Number((a.latSum / a.coordCount).toFixed(5)),
      lng: Number((a.lngSum / a.coordCount).toFixed(5)),
      weight,
      neighborhood: a.name,
      avgPrice,
    };
  });

  return c.json({ city: parsed.city, total: points.length, points });
});

export default marketApp;
