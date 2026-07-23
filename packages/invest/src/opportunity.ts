// packages/invest/src/opportunity.ts
//
// Scoring de OPORTUNIDADE por bairro — camada aditiva sobre a engine PURA de
// métricas (analyze/score/grade). Tudo determinístico e testável: usa apenas
// `Math` e NUNCA chama Date.now()/Math.random().
//
// ALINHAMENTO COM OS AGENTES IRMÃOS:
//   - `packages/api/src/routes/market.ts` expõe `NeighborhoodStat`,
//     `PriceTrendPoint` e `HeatmapPoint`. Para manter este engine PURA sem
//     acoplar ao pacote `@landmap/api` (que não é dependência deste pacote e
//     cujo `dist` não é consumido aqui), os tipos são ESPELHADOS abaixo com
//     exata mesma forma. Os agentes de API/mapa podem consumir
//     `scoreNeighborhood()` / `rankOpportunities()` diretamente.
//
// Convenções BR: valores em BRL; taxas como frações (0.06 = 6%). Ver
// docs/war-room/07-invest-opportunity.md para a composição do score.

import { analyze, grade } from './metrics.js';
import type { InvestmentAssumptions, InvestmentGrade } from './types.js';

// ─── Tipos de entrada (espelham packages/api/src/routes/market.ts) ────────────

/** Estatística agregada de um bairro (vem de /market/neighborhoods). */
export type NeighborhoodStat = {
  name: string;
  city: string;
  state: string;
  count: number;
  avgPriceM2: number;
  avgPrice: number;
};

/** Ponto da série histórica de preço médio (vem de /market/price-trend). */
export type PriceTrendPoint = {
  month: string;
  avgPrice: number;
};

/** Ponto de densidade do mapa de calor (vem de /market/heatmap). */
export type HeatmapPoint = {
  lat: number;
  lng: number;
  weight: number;
  neighborhood: string;
  avgPrice: number;
};

// ─── Resultado de scoring de oportunidade ─────────────────────────────────────

/**
 * Score composto de oportunidade de investimento para um bairro.
 * `score` é 0..100; `grade` é a nota qualitativa A..F (via grade() do engine).
 * `yieldPct`/`appreciationPct` são expressos em %; `liquidityPct`/`demandPct`
 * são fatores normalizados 0..100. `reasons` explica cada fator.
 */
export interface OpportunityScore {
  /** Score composto 0..100. */
  score: number;
  /** Nota qualitativa A..F. */
  grade: InvestmentGrade;
  /** Cap rate em % (ex.: 6.84 = 6.84% de retorno operacional). */
  yieldPct: number;
  /** Valorização anual em % (ex.: 10 = +10%/ano). */
  appreciationPct: number;
  /** Liquidez normalizada 0..100 (volume de anúncios / transações). */
  liquidityPct: number;
  /** Demanda normalizada 0..100 (peso do heatmap). */
  demandPct: number;
  /** Explicação legível de cada fator que compõe o score. */
  reasons: string[];
}

// ─── Opções de scoring / assumptions ──────────────────────────────────────────

/**
 * Overrides opcionais. `trend` é usado por `toAssumptions` para derivar a
 * valorização; os demais sobrepõem os defaults do investidor BR.
 */
export interface OpportunityOptions {
  /** Série de preço (usada para derivar a valorização anual). */
  trend?: PriceTrendPoint[];
  /** Valorização anual explícita (fração); sobrepõe a derivada da tendência. */
  annualAppreciationPct?: number;
  /** Yield de aluguel anual assumido (fração, default 0.06 = 6%). */
  annualRentYieldPct?: number;
  /** Entrada como fração (default 0.20). */
  downPaymentPct?: number;
  /** Taxa de juros anual do financiamento em % (default 7). */
  interestRatePct?: number;
  /** Prazo do financiamento em anos (default 30). */
  loanTermYears?: number;
  /** Despesas operacionais como % da renda bruta (default 0.35). */
  annualExpensesPct?: number;
  /** Vacância como fração (default 0.08). */
  vacancyPct?: number;
  /** Horizonte de investimento em anos (default 5). */
  holdingYears?: number;
  /** IR sobre ganho de capital em % (opcional, default 0). */
  taxRatePct?: number;
}

// ─── Constantes de normalização e pesos ──────────────────────────────────────

/** Cap rate ~8% é tratado como teto de referência para normalização. */
const YIELD_BENCH = 0.08;
/** Valorização ~7%/ano é tratada como teto de referência. */
const APPRECIATION_BENCH = 0.07;
/** 50 anúncios = liquidez máxima (satura em 1). */
const LIQUIDITY_REF_COUNT = 50;

/**
 * Pesos do score de oportunidade (somam 1.0):
 *   yield         0.30  retorno operacional do ativo (cap rate de analyze())
 *   appreciation  0.25  valorização esperada (slope da tendência de preço)
 *   liquidity     0.25  volume de oferta/transações (count do bairro)
 *   demand        0.20  procura de mercado (peso do heatmap)
 */
export const OPPORTUNITY_WEIGHTS = {
  yield: 0.3,
  appreciation: 0.25,
  liquidity: 0.25,
  demand: 0.2,
} as const;

/** Trava um valor no intervalo [0, 1]; NaN vira 0. */
function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

// ─── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Aluguel mensal estimado a partir do preço médio do bairro.
 *   aluguelMensal = avgPrice * annualRentYieldPct / 12
 * `annualRentYieldPct` é uma fração (default 0.06 = 6% de yield ao ano).
 */
export function estimateMonthlyRent(
  avgPrice: number,
  annualRentYieldPct = 0.06,
): number {
  return (avgPrice * annualRentYieldPct) / 12;
}

/**
 * Valorização anual derivada da tendência de preço (slope % último vs primeiro).
 *   slope = last.avgPrice / first.avgPrice - 1
 * A janela do /market/price-trend é de ~12 meses, então lê como valorização
 * anual. Retorna 0 se a tendência estiver ausente ou tiver menos de 2 pontos,
 * ou se o primeiro preço for inválido (<= 0).
 */
export function appreciationFromTrend(trend?: PriceTrendPoint[]): number {
  if (!trend || trend.length < 2) return 0;
  const first = trend[0].avgPrice;
  const last = trend[trend.length - 1].avgPrice;
  if (first <= 0) return 0;
  return last / first - 1;
}

/** Resolve a valorização anual: override explícito > tendência > default 5%. */
function resolveAppreciation(
  trend?: PriceTrendPoint[],
  override?: number,
): number {
  if (override !== undefined) return override;
  if (trend && trend.length >= 2) return appreciationFromTrend(trend);
  return 0.05;
}

/**
 * Converte uma estatística de bairro em `InvestmentAssumptions` para o engine.
 *   price        = stat.avgPrice
 *   monthlyRent  = estimateMonthlyRent(stat.avgPrice, annualRentYieldPct)
 *   down         = 0.20  rate = 7   term = 30
 *   expenses     = 0.35  vacancy = 0.08
 *   appr         = derivado da tendência (ou 0.05 se ausente)
 *   hold         = 5
 * Qualquer um pode ser sobreposto via `opts`.
 */
export function toAssumptions(
  stat: NeighborhoodStat,
  opts: OpportunityOptions = {},
): InvestmentAssumptions {
  const annualRentYieldPct = opts.annualRentYieldPct ?? 0.06;
  const monthlyRent = estimateMonthlyRent(stat.avgPrice, annualRentYieldPct);
  const annualAppreciationPct = resolveAppreciation(opts.trend, opts.annualAppreciationPct);

  return {
    price: stat.avgPrice,
    monthlyRent,
    downPaymentPct: opts.downPaymentPct ?? 0.2,
    interestRatePct: opts.interestRatePct ?? 7,
    loanTermYears: opts.loanTermYears ?? 30,
    annualExpensesPct: opts.annualExpensesPct ?? 0.35,
    vacancyPct: opts.vacancyPct ?? 0.08,
    annualAppreciationPct,
    holdingYears: opts.holdingYears ?? 5,
    taxRatePct: opts.taxRatePct,
  };
}

/** Extrai o fator de demanda 0..1 a partir do heatmap (HeatmapPoint ou peso). */
function demandFromHeat(heat?: HeatmapPoint | number): number {
  if (heat == null) return 0;
  const weight = typeof heat === 'number' ? heat : heat.weight;
  return clamp01(weight);
}

/**
 * Score de oportunidade de um bairro, combinando 4 fatores normalizados 0..1
 * e ponderados (ver OPPORTUNITY_WEIGHTS):
 *   - yield        : cap rate de analyze() / YIELD_BENCH
 *   - appreciation : slope da tendência / APPRECIATION_BENCH
 *   - liquidity    : count do bairro / LIQUIDITY_REF_COUNT (satura em 1)
 *   - demand       : peso do heatmap (HeatmapPoint.weight ou número) 0..1
 * O score final é travado em [0, 100] e a nota vem de grade().
 * `reasons` documenta cada fator (sempre não-vazio).
 */
export function scoreNeighborhood(
  stat: NeighborhoodStat,
  trend?: PriceTrendPoint[],
  heat?: HeatmapPoint | number,
  opts: OpportunityOptions = {},
): OpportunityScore {
  const assumptions = toAssumptions(stat, { ...opts, trend });
  const result = analyze(assumptions);

  const capRate = result.capRate; // fração
  const appreciation = resolveAppreciation(trend, opts.annualAppreciationPct); // fração

  const yieldN = clamp01(capRate / YIELD_BENCH);
  const apprN = clamp01(appreciation / APPRECIATION_BENCH);
  const liquidityN = clamp01(stat.count / LIQUIDITY_REF_COUNT);
  const demandN = demandFromHeat(heat);

  const composite =
    OPPORTUNITY_WEIGHTS.yield * yieldN +
    OPPORTUNITY_WEIGHTS.appreciation * apprN +
    OPPORTUNITY_WEIGHTS.liquidity * liquidityN +
    OPPORTUNITY_WEIGHTS.demand * demandN;

  const scoreValue = Math.min(100, Math.max(0, composite * 100));
  const gr = grade(scoreValue);

  const reasons: string[] = [
    `Yield (cap rate): ${(capRate * 100).toFixed(2)}% — retorno operacional do ativo`,
    `Valorização anual: ${(appreciation * 100).toFixed(2)}%` +
      (trend && trend.length >= 2
        ? ' (derivada da tendência de preço)'
        : ' (sem tendência — default 5%)'),
    `Liquidez: ${stat.count} anúncios — fator ${(liquidityN * 100).toFixed(0)}/100`,
    `Demanda (heatmap): peso ${demandN.toFixed(2)} — fator ${(demandN * 100).toFixed(0)}/100`,
  ];

  return {
    score: scoreValue,
    grade: gr,
    yieldPct: capRate * 100,
    appreciationPct: appreciation * 100,
    liquidityPct: liquidityN * 100,
    demandPct: demandN * 100,
    reasons,
  };
}

/** Entrada de `rankOpportunities`. */
export interface OpportunityRankInput {
  stat: NeighborhoodStat;
  trend?: PriceTrendPoint[];
  heat?: HeatmapPoint;
}

/**
 * Ranqueia bairros por score de oportunidade (ordem decrescente).
 * Cada item sai com seu `OpportunityScore` já calculado.
 */
export function rankOpportunities(
  list: OpportunityRankInput[],
): { stat: NeighborhoodStat; score: OpportunityScore }[] {
  return list
    .map((item) => ({
      stat: item.stat,
      score: scoreNeighborhood(item.stat, item.trend, item.heat),
    }))
    .sort((a, b) => b.score.score - a.score.score);
}

