/**
 * CORE — Oportunidades & KPIs de mercado.
 *
 * Camada de dominio (sem React, sem Next) consumida por API routes e pages.
 * Mantem o ULTIMATE DESIGN STANDARD: dados, nao UI.
 */

import type { Property } from './api';

export type OpportunityType =
  | 'preco_abaixo_media'
  | 'valorizacao_yoy'
  | 'nova_oferta'
  | 'zona_quente'
  | 'alto_score';

export type OpportunitySeverity = 'baixa' | 'media' | 'alta';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  severity: OpportunitySeverity;
  title: string;
  description: string;
  city: string;
  state: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  pricePerM2?: number;
  deltaPct?: number;
  score: number; // 0..100
  /** timestamp ISO */
  createdAt: string;
}

export interface KpiSnapshot {
  total: number;
  avgPricePerSqm: number;
  medianPricePerSqm: number;
  avgPrice: number;
  avgAppreciationYoy: number;
  availabilityRate: number;
  confidence: number; // 0..100 (mock determinístico derivado da cobertura)
  byType: Record<string, number>;
  byModality: Record<string, number>;
  topCities: { city: string; state: string; count: number; avgPrice: number }[];
  generatedAt: string;
}

export interface AlertRule {
  id: string;
  type: OpportunityType;
  label: string;
  enabled: boolean;
  /** limiar usado na avaliacao */
  threshold: number;
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  { id: 'rule_preco', type: 'preco_abaixo_media', label: 'Preço abaixo da média', enabled: true, threshold: 8 },
  { id: 'rule_yoy', type: 'valorizacao_yoy', label: 'Valorização acima de YoY', enabled: true, threshold: 4 },
  { id: 'rule_quente', type: 'zona_quente', label: 'Zona quente', enabled: true, threshold: 12 },
  { id: 'rule_score', type: 'alto_score', label: 'Alto score de oportunidade', enabled: true, threshold: 80 },
];

function round(n: number, d = 0): number {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Deriva um KpiSnapshot a partir do dataset de imoveis.
 * Confianca e valorizacao sao derivadas deterministicamente (mock de mercado)
 * para manter paridade visual com o padrao Lovable.
 */
export function computeKpis(properties: Property[]): KpiSnapshot {
  const priced = properties.filter((p) => p.price > 0 && p.areaM2 > 0);
  const ppm2 = priced.map((p) => p.price / p.areaM2);
  const avgPpm2 = ppm2.length ? round(ppm2.reduce((a, b) => a + b, 0) / ppm2.length) : 0;
  const medPpm2 = round(median(ppm2));
  const avgPrice = priced.length ? round(priced.reduce((a, p) => a + p.price, 0) / priced.length) : 0;
  const available = properties.filter((p) => p.available).length;
  const availabilityRate = properties.length ? round((available / properties.length) * 100) : 0;

  // Valorizacao YoY determinística: base 2.4% + variacao por cobertura de preco.
  const coverage = priced.length / Math.max(1, properties.length);
  const avgAppreciationYoy = round(2.4 + coverage * 1.8, 1);

  // Confianca: quanto maior a amostra e a cobertura de coordenadas, maior.
  const withGeo = properties.filter((p) => p.latitude != null && p.longitude != null).length;
  const geoRate = properties.length ? withGeo / properties.length : 0;
  const confidence = round(Math.min(98, 70 + coverage * 18 + geoRate * 12));

  const byType: Record<string, number> = {};
  const byModality: Record<string, number> = {};
  for (const p of properties) {
    byType[p.type] = (byType[p.type] || 0) + 1;
    byModality[p.modality] = (byModality[p.modality] || 0) + 1;
  }

  const cityMap = new Map<string, { city: string; state: string; count: number; sum: number }>();
  for (const p of priced) {
    const key = `${p.city}|${p.state}`;
    const cur = cityMap.get(key) || { city: p.city, state: p.state, count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += p.price;
    cityMap.set(key, cur);
  }
  const topCities = Array.from(cityMap.values())
    .map((c) => ({ city: c.city, state: c.state, count: c.count, avgPrice: round(c.sum / c.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    total: properties.length,
    avgPricePerSqm: avgPpm2,
    medianPricePerSqm: medPpm2,
    avgPrice,
    avgAppreciationYoy,
    availabilityRate,
    confidence,
    byType,
    byModality,
    topCities,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Computa oportunidades a partir do dataset, aplicando as regras de alerta.
 * `rules` pode ser omitido para usar DEFAULT_ALERT_RULES.
 */
export function computeOpportunities(
  properties: Property[],
  rules: AlertRule[] = DEFAULT_ALERT_RULES,
): Opportunity[] {
  const kpis = computeKpis(properties);
  const out: Opportunity[] = [];
  const now = Date.now();

  for (const p of properties) {
    if (p.latitude == null || p.longitude == null) continue;
    if (p.price <= 0 || p.areaM2 <= 0) continue;

    const ppm2 = p.price / p.areaM2;
    const deltaPct = kpis.avgPricePerSqm ? round(((ppm2 - kpis.avgPricePerSqm) / kpis.avgPricePerSqm) * 100, 1) : 0;

    // Prefer invest score from schema v2 dataset; fallback to heuristic
    const investScore = p.score ?? p.invest?.score;
    let score = 50;
    if (typeof investScore === 'number' && investScore > 0) {
      score = Math.max(0, Math.min(100, round(investScore)));
    } else {
      if (deltaPct < 0) score += Math.min(25, -deltaPct * 1.5);
      score += Math.min(15, (p.tags?.length ?? 0) * 3);
      if (p.modality === 'lancamento') score += 5;
      score = Math.max(0, Math.min(100, round(score)));
    }
    const grade = (p.grade || p.invest?.grade || '').toUpperCase();

    const push = (type: OpportunityType, severity: OpportunitySeverity, title: string, description: string, delta?: number) => {
      const rule = rules.find((r) => r.type === type && r.enabled);
      if (!rule) return;
      out.push({
        id: `opp_${p.id}_${type}`,
        type,
        severity,
        title,
        description,
        city: p.city,
        state: p.state,
        neighborhood: p.neighborhood,
        latitude: p.latitude,
        longitude: p.longitude,
        price: p.price,
        pricePerM2: round(ppm2),
        deltaPct: delta,
        score,
        createdAt: new Date(now - Math.abs(deltaPct) * 3600_000).toISOString(),
      });
    };

    const precoRule = rules.find((r) => r.type === 'preco_abaixo_media' && r.enabled);
    if (precoRule && deltaPct <= -precoRule.threshold) {
      push(
        'preco_abaixo_media',
        deltaPct <= -20 ? 'alta' : deltaPct <= -12 ? 'media' : 'baixa',
        'Abaixo da média de mercado',
        `${p.title} está ${Math.abs(deltaPct)}% abaixo do preço/m² médio de ${p.city}.`,
        deltaPct,
      );
    }

    const yoyRule = rules.find((r) => r.type === 'valorizacao_yoy' && r.enabled);
    if (yoyRule && kpis.avgAppreciationYoy >= yoyRule.threshold) {
      push(
        'valorizacao_yoy',
        kpis.avgAppreciationYoy >= 6 ? 'alta' : 'media',
        'Alta valorização na região',
        `${p.city} (${p.state}) com valorização média de +${kpis.avgAppreciationYoy}% a.a.`,
        kpis.avgAppreciationYoy,
      );
    }

    const scoreRule = rules.find((r) => r.type === 'alto_score' && r.enabled);
    if (scoreRule && (score >= scoreRule.threshold || grade === 'A' || grade === 'B')) {
      push(
        'alto_score',
        grade === 'A' || score >= 90 ? 'alta' : 'media',
        grade ? `Grade ${grade} · radar investidor` : 'Alto score de oportunidade',
        `${p.title} pontua ${score}/100${grade ? ` (grade ${grade})` : ''} no índice LandMap.`,
        score,
      );
    }

    const quenteRule = rules.find((r) => r.type === 'zona_quente' && r.enabled);
    if (quenteRule) {
      const cityCount = kpis.topCities.find((c) => c.city === p.city)?.count ?? 0;
      if (cityCount >= quenteRule.threshold) {
        push('zona_quente', 'media', 'Zona quente', `${p.city} concentra ${cityCount} imóveis — oferta líquida aquecida.`, cityCount);
      }
    }
  }

  // Ordena por score desc
  return out.sort((a, b) => b.score - a.score);
}

export function opportunitySeverityColor(sev: OpportunitySeverity): string {
  switch (sev) {
    case 'alta':
      return 'var(--destructive)';
    case 'media':
      return 'var(--accent)';
    default:
      return 'var(--primary)';
  }
}

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  preco_abaixo_media: 'Preço abaixo da média',
  valorizacao_yoy: 'Valorização YoY',
  nova_oferta: 'Nova oferta',
  zona_quente: 'Zona quente',
  alto_score: 'Alto score',
};
