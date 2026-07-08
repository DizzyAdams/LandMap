import type { MarketKpis, MarketFeatures, RulerScore, RulerName } from './types.js';
import { kpisToFeatures } from './engine.js';

/* ------------------------------------------------------------------ */
/*  Investment "rulers" — different analytical lenses                   */
/* ------------------------------------------------------------------ */

/**
 * Claude lens — product-led growth.
 * Favours markets with strong organic growth signal, healthy density and
 * broad affordability (more reachable buyers → compounding adoption).
 */
function claudeRuler(f: MarketFeatures): { score: number; commentary: string } {
  const score = Math.round((f.growthSignal * 0.45 + f.density * 0.3 + f.affordability * 0.25) * 100);
  const commentary =
    score >= 70
      ? 'Mercado com forte tração orgânica e base de compradores acessível — bom para crescimento composto.'
      : score >= 45
        ? 'Crescimento moderado; monitorar gargalos de liquidez e acessibilidade.'
        : 'Tração fraca ou mercado saturado/caro — priorizar nichos de adoção.';
  return { score, commentary };
}

/**
 * JPMorgan lens — risk-adjusted return.
 * Rewards liquidity and affordability, penalises extreme price levels (bubble
 * risk) and illiquidity.
 */
function jpmorganRuler(f: MarketFeatures): { score: number; commentary: string } {
  const bubblePenalty = f.priceLevel > 0.7 ? (f.priceLevel - 0.7) * 0.5 : 0;
  const score = Math.round(
    Math.max(0, (f.liquidity * 0.4 + f.affordability * 0.35 + (1 - f.priceLevel) * 0.25 - bubblePenalty) * 100),
  );
  const commentary =
    score >= 70
      ? 'Retorno ajustado ao risco atrativo: boa liquidez e preços sustentáveis.'
      : score >= 45
        ? 'Retorno neutro; atenção à qualidade do crédito e à profundidade do mercado.'
        : 'Risco elevado (iliquidez ou caro demais) — exigir prêmio de risco maior.';
  return { score, commentary };
}

/**
 * Quantum lens — probabilistic / regime view.
 * Treats the city distribution as a probability mass and uses its entropy as a
 * "regime dispersion" signal; rewards balanced, diversified markets and high
 * density (more samples → tighter confidence intervals).
 */
function quantumRuler(kpis: MarketKpis, f: MarketFeatures): { score: number; commentary: string } {
  const counts = kpis.cities.map((c) => c.count);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  let entropy = 0;
  for (const c of counts) {
    const p = c / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  const maxEntropy = Math.log2(Math.max(counts.length, 1));
  const dispersion = maxEntropy ? entropy / maxEntropy : 0;

  const score = Math.round((dispersion * 0.5 + f.density * 0.5) * 100);
  const commentary =
    score >= 70
      ? 'Regime diversificado e amostra robusta — baixa incerteza de estimativa.'
      : score >= 45
        ? 'Dispersão média; concentrar cobertura nas cidades-âncora.'
        : 'Mercado concentrado (baixa entropia) — estimativas com maior variância.';
  return { score, commentary };
}

const RULERS: Record<RulerName, (k: MarketKpis, f: MarketFeatures) => { score: number; commentary: string }> = {
  claude: (_k, f) => claudeRuler(f),
  jpmorgan: (_k, f) => jpmorganRuler(f),
  quantum: (k, f) => quantumRuler(k, f),
};

const RULER_LABELS: Record<RulerName, string> = {
  claude: 'Claude — crescimento orgânico',
  jpmorgan: 'JPMorgan — retorno ajustado ao risco',
  quantum: 'Quantum — visão probabilística',
};

/**
 * Apply every ruler to the computed KPIs and return a scored breakdown.
 */
export function applyRulers(kpis: MarketKpis): RulerScore[] {
  const features = kpisToFeatures(kpis);
  return (Object.keys(RULERS) as RulerName[]).map((name) => {
    const { score, commentary } = RULERS[name](kpis, features);
    return {
      ruler: name,
      score: Math.max(0, Math.min(100, score)),
      label: RULER_LABELS[name],
      commentary,
    };
  });
}

export function applyRuler(name: RulerName, kpis: MarketKpis): RulerScore {
  return applyRulers(kpis).find((r) => r.ruler === name) ?? {
    ruler: name,
    score: 0,
    label: RULER_LABELS[name],
    commentary: 'Sem dados.',
  };
}
