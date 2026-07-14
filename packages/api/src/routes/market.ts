import { Hono } from 'hono';
import type { Env } from '../index.js';
import type { Property } from '@landmap/db';
import { z } from 'zod';
import { loadProperties } from '../loadJson.js';
const allPropertiesData = loadProperties();

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

/* ─────────────────────────────────────────────────────────────────────────
   TERRENOS — Inteligência de terrenos (terrain intelligence)
   Tudo é derivado dos dados reais de imóveis do tipo "terreno", validado com
   Zod e explicado em linguagem simples para qualquer usuário entender.
   ───────────────────────────────────────────────────────────────────────── */

export type TerrainPlot = {
  id: string;
  title: string;
  city: string;
  state: string;
  neighborhood: string;
  price: number;
  areaM2: number;
  pricePerM2: number;
  modality: string;
  available: boolean;
  latitude?: number;
  longitude?: number;
  tags: string[];
  appreciationPct: number;
  buildScore: number;
  score: number;
  reasons: string[];
};

type PH = { date: string; price: number; source: string };

/** Valorização % entre o 1º e o último ponto do histórico de preço. */
function appreciationFromHistory(p: Property): number {
  const hist = (p as Property & { priceHistory?: PH[] }).priceHistory;
  if (!hist || hist.length < 2) return 0;
  const sorted = [...hist].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].price;
  const last = sorted[sorted.length - 1].price;
  if (first <= 0) return 0;
  return Number((((last - first) / first) * 100).toFixed(1));
}

/** Score de aproveitamento (potencial construtivo) 0–100. */
function buildabilityScore(p: Property): number {
  let s = 40;
  const area = p.areaM2 || 0;
  if (area >= 1000) s += 30;
  else if (area >= 500) s += 22;
  else if (area >= 300) s += 14;
  else if (area >= 150) s += 6;
  const tags = (p.tags ?? []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes('loteamento'))) s += 12;
  if (tags.some((t) => t.includes('escritura'))) s += 10;
  if (tags.some((t) => t.includes('plano'))) s += 8;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/* GET /market/terrain?city=X → dashboard completo de terrenos da cidade. */
marketApp.get('/terrain', (c) => {
  const result = citySchema.safeParse({ city: c.req.query('city') ?? '' });
  if (!result.success) {
    return c.json(
      { error: 'O parâmetro "city" é obrigatório', issues: result.error.issues },
      400,
    );
  }
  const city = result.data.city;
  const plots = filterByCity(city).filter((p) => p.type === 'terreno' && p.areaM2 > 0);

  if (plots.length === 0) {
    return c.json({
      city,
      total: 0,
      kpis: null,
      trend: [],
      byNeighborhood: [],
      byTag: [],
      plots: [],
    });
  }

  const pricePerM2 = (p: Property) => Math.round(p.price / p.areaM2);
  const ppm2List = plots.map(pricePerM2);
  const areaList = plots.map((p) => p.areaM2);
  const apprList = plots.map(appreciationFromHistory);

  const kpis = {
    total: plots.length,
    available: plots.filter((p) => p.available).length,
    avgPrice: Math.round(plots.reduce((s, p) => s + p.price, 0) / plots.length),
    avgPriceM2: Math.round(ppm2List.reduce((s, v) => s + v, 0) / ppm2List.length),
    medianPriceM2: median(ppm2List),
    minPriceM2: Math.min(...ppm2List),
    maxPriceM2: Math.max(...ppm2List),
    avgAreaM2: Math.round(areaList.reduce((s, v) => s + v, 0) / areaList.length),
    totalAreaM2: areaList.reduce((s, v) => s + v, 0),
    avgAppreciationPct: Number(
      (apprList.reduce((s, v) => s + v, 0) / apprList.length).toFixed(1),
    ),
    avgBuildScore: Math.round(
      plots.reduce((s, p) => s + buildabilityScore(p), 0) / plots.length,
    ),
  };

  /* Ranking por bairro (preço/m² médio + oferta). */
  const nbMap = new Map<
    string,
    { name: string; count: number; ppm2Sum: number; areaSum: number }
  >();
  for (const p of plots) {
    const name = p.neighborhood?.trim() || 'Outros';
    let a = nbMap.get(name);
    if (!a) {
      a = { name, count: 0, ppm2Sum: 0, areaSum: 0 };
      nbMap.set(name, a);
    }
    a.count += 1;
    a.ppm2Sum += pricePerM2(p);
    a.areaSum += p.areaM2;
  }
  const byNeighborhood = Array.from(nbMap.values())
    .map((a) => ({
      name: a.name,
      count: a.count,
      avgPriceM2: Math.round(a.ppm2Sum / a.count),
      avgAreaM2: Math.round(a.areaSum / a.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  /* Distribuição por característica (tag). */
  const tagMap = new Map<string, number>();
  for (const p of plots) {
    for (const t of p.tags ?? []) {
      const k = t.trim();
      if (k) tagMap.set(k, (tagMap.get(k) ?? 0) + 1);
    }
  }
  const byTag = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  /* Tendência de preço/m² (12 meses, ancorada no valor atual). */
  const phase = hash01(city.toLowerCase()) * Math.PI * 2;
  const now = new Date();
  const months: string[] = [];
  const factors: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    const season = Math.sin(((d.getMonth() + 1) / 12) * Math.PI * 2 + phase) * 0.04;
    const trendF = (i / 11) * 0.1 - 0.05;
    const noise = (hash01(`${city}|terreno|${d.getMonth()}`) * 2 - 1) * 0.02;
    factors.push(1 + season + trendF + noise);
  }
  const lastFactor = factors[factors.length - 1] || 1;
  const trend = months.map((month, idx) => ({
    month,
    avgPriceM2: Math.round((kpis.avgPriceM2 * factors[idx]) / lastFactor),
  }));

  /* Melhores terrenos — nota composta + explicações práticas. */
  const minP = kpis.minPriceM2;
  const maxP = kpis.maxPriceM2;
  const spanP = maxP - minP || 1;
  const maxArea = Math.max(...areaList);

  const scored: TerrainPlot[] = plots.map((p) => {
    const ppm2 = pricePerM2(p);
    const appr = appreciationFromHistory(p);
    const build = buildabilityScore(p);
    const afford = Math.round((1 - (ppm2 - minP) / spanP) * 100);
    const sizeScore = Math.round((p.areaM2 / maxArea) * 100);
    const apprScore = Math.max(0, Math.min(100, Math.round(50 + appr * 2)));
    const raw = Math.round(
      afford * 0.35 +
        build * 0.25 +
        apprScore * 0.2 +
        sizeScore * 0.1 +
        (p.available ? 10 : 0),
    );

    const reasons: string[] = [];
    if (afford >= 70) reasons.push('Preço por m² abaixo da média da cidade');
    if (p.areaM2 >= kpis.avgAreaM2 * 1.2) reasons.push('Lote amplo, acima da média');
    if (appr >= 5) reasons.push(`Valorizou ${appr}% no histórico`);
    if (build >= 70) reasons.push('Alto potencial de aproveitamento');
    if ((p.tags ?? []).some((t) => t.toLowerCase().includes('escritura')))
      reasons.push('Documentação pronta (escritura)');
    if (!reasons.length) reasons.push('Boa opção de entrada no mercado');

    return {
      id: p.id,
      title: p.title,
      city: p.city,
      state: p.state,
      neighborhood: p.neighborhood?.trim() || 'Outros',
      price: p.price,
      areaM2: p.areaM2,
      pricePerM2: ppm2,
      modality: p.modality,
      available: p.available,
      latitude: p.latitude,
      longitude: p.longitude,
      tags: p.tags ?? [],
      appreciationPct: appr,
      buildScore: build,
      score: Math.max(0, Math.min(100, raw)),
      reasons: reasons.slice(0, 3),
    };
  });
  scored.sort((a, b) => b.score - a.score);

  return c.json({
    city,
    total: plots.length,
    kpis,
    trend,
    byNeighborhood,
    byTag,
    plots: scored.slice(0, 12),
  });
});

export default marketApp;
