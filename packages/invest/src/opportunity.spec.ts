// packages/invest/src/opportunity.spec.ts
import { describe, it, expect } from 'vitest';
import {
  estimateMonthlyRent,
  appreciationFromTrend,
  toAssumptions,
  scoreNeighborhood,
  rankOpportunities,
  OPPORTUNITY_WEIGHTS,
} from './opportunity';
import { grade } from './metrics';
import type {
  HeatmapPoint,
  NeighborhoodStat,
  PriceTrendPoint,
} from './opportunity';

// ─── Helpers de dados sintéticos ──────────────────────────────────────────────
function makeStat(over: Partial<NeighborhoodStat> = {}): NeighborhoodStat {
  return {
    name: 'Bairro Teste',
    city: 'Cidade',
    state: 'SP',
    count: 20,
    avgPriceM2: 5000,
    avgPrice: 300000,
    ...over,
  };
}

function risingTrend(from = 100000, to = 110000): PriceTrendPoint[] {
  return [
    { month: '2024-01', avgPrice: from },
    { month: '2024-12', avgPrice: to },
  ];
}

function fallingTrend(): PriceTrendPoint[] {
  return [
    { month: '2024-01', avgPrice: 100000 },
    { month: '2024-12', avgPrice: 90000 },
  ];
}

function heat(weight: number): HeatmapPoint {
  return { lat: -23.5, lng: -46.6, weight, neighborhood: 'Bairro Teste', avgPrice: 300000 };
}

// ─── estimateMonthlyRent ──────────────────────────────────────────────────────
describe('estimateMonthlyRent', () => {
  it('usa yield padrão 6% sobre 600k -> 3000/mês', () => {
    expect(estimateMonthlyRent(600000)).toBeCloseTo(3000, 6);
    expect(estimateMonthlyRent(600000, 0.06)).toBeCloseTo(3000, 6);
  });

  it('aceita yield customizado (8% sobre 600k -> 4000)', () => {
    expect(estimateMonthlyRent(600000, 0.08)).toBeCloseTo(4000, 6);
  });

  it('preço zero -> aluguel zero', () => {
    expect(estimateMonthlyRent(0, 0.06)).toBe(0);
  });

  it('500k a 6% -> 2500', () => {
    expect(estimateMonthlyRent(500000, 0.06)).toBeCloseTo(2500, 6);
  });

  it('fórmula exata avgPrice*yield/12', () => {
    expect(estimateMonthlyRent(450000, 0.1)).toBeCloseTo((450000 * 0.1) / 12, 6);
  });
});

// ─── appreciationFromTrend ────────────────────────────────────────────────────
describe('appreciationFromTrend', () => {
  it('ausente / vazio -> 0', () => {
    expect(appreciationFromTrend(undefined)).toBe(0);
    expect(appreciationFromTrend([])).toBe(0);
  });

  it('menos de 2 pontos -> 0', () => {
    expect(appreciationFromTrend([{ month: '2024-01', avgPrice: 100 }])).toBe(0);
  });

  it('série plana -> 0', () => {
    expect(appreciationFromTrend([{ month: '2024-01', avgPrice: 100 }, { month: '2024-02', avgPrice: 100 }])).toBe(0);
  });

  it('alta de 100k para 110k -> +10%', () => {
    expect(appreciationFromTrend(risingTrend(100000, 110000))).toBeCloseTo(0.1, 6);
  });

  it('queda de 110k para 100k -> -10%', () => {
    expect(appreciationFromTrend(fallingTrend())).toBeCloseTo(-0.1, 6);
  });

  it('usa primeiro e último (3 pontos, pico no meio)', () => {
    const t: PriceTrendPoint[] = [
      { month: 'a', avgPrice: 100 },
      { month: 'b', avgPrice: 130 },
      { month: 'c', avgPrice: 120 },
    ];
    expect(appreciationFromTrend(t)).toBeCloseTo(0.2, 6);
  });

  it('primeiro preço inválido (<=0) -> 0', () => {
    expect(appreciationFromTrend([{ month: 'a', avgPrice: 0 }, { month: 'b', avgPrice: 100 }])).toBe(0);
  });
});

// ─── toAssumptions ────────────────────────────────────────────────────────────
describe('toAssumptions', () => {
  it('mapeia stat e aplica defaults do investidor BR', () => {
    const a = toAssumptions(makeStat({ avgPrice: 500000 }));
    expect(a.price).toBe(500000);
    expect(a.monthlyRent).toBeCloseTo(2500, 6);
    expect(a.downPaymentPct).toBe(0.2);
    expect(a.interestRatePct).toBe(7);
    expect(a.loanTermYears).toBe(30);
    expect(a.annualExpensesPct).toBe(0.35);
    expect(a.vacancyPct).toBe(0.08);
    expect(a.holdingYears).toBe(5);
    expect(a.annualAppreciationPct).toBeCloseTo(0.05, 6); // sem trend
  });

  it('deriva valorização da tendência quando presente', () => {
    const a = toAssumptions(makeStat(), { trend: risingTrend(100000, 110000) });
    expect(a.annualAppreciationPct).toBeCloseTo(0.1, 6);
  });

  it('respeita overrides explícitos', () => {
    const a = toAssumptions(makeStat(), {
      downPaymentPct: 0.3,
      annualAppreciationPct: 0.09,
      annualRentYieldPct: 0.08,
    });
    expect(a.downPaymentPct).toBe(0.3);
    expect(a.annualAppreciationPct).toBeCloseTo(0.09, 6);
    expect(a.monthlyRent).toBeCloseTo((300000 * 0.08) / 12, 6);
  });

  it('override de valorização sobrepõe a tendência', () => {
    const a = toAssumptions(makeStat(), {
      trend: risingTrend(100000, 120000),
      annualAppreciationPct: 0.04,
    });
    expect(a.annualAppreciationPct).toBeCloseTo(0.04, 6);
  });
});

// ─── scoreNeighborhood ────────────────────────────────────────────────────────
describe('scoreNeighborhood', () => {
  it('bairro ideal (yield alto, valorização, liquidez e demanda máx) -> nota A', () => {
    const s = scoreNeighborhood(makeStat({ avgPrice: 200000, count: 80 }), risingTrend(100000, 110000), heat(1), {
      annualRentYieldPct: 0.12,
    });
    expect(s.score).toBeGreaterThanOrEqual(80);
    expect(s.grade).toBe('A');
    expect(s.score).toBeLessThanOrEqual(100);
  });

  it('sem tendência usa valorização default 5% e documenta no reasons', () => {
    const s = scoreNeighborhood(makeStat());
    expect(s.appreciationPct).toBeCloseTo(5, 6);
    expect(s.reasons.some((r) => r.includes('sem tendência'))).toBe(true);
  });

  it('liquidez zero (count=0) -> liquidityPct 0', () => {
    const s = scoreNeighborhood(makeStat({ count: 0 }));
    expect(s.liquidityPct).toBe(0);
  });

  it('demanda ausente (sem heat) -> demandPct 0', () => {
    const s = scoreNeighborhood(makeStat());
    expect(s.demandPct).toBe(0);
  });

  it('demanda via número (peso 0.7) -> 70', () => {
    const s = scoreNeighborhood(makeStat(), undefined, 0.7);
    expect(s.demandPct).toBeCloseTo(70, 5);
  });

  it('demanda via HeatmapPoint (weight 0.9) -> 90', () => {
    const s = scoreNeighborhood(makeStat(), undefined, heat(0.9));
    expect(s.demandPct).toBeCloseTo(90, 5);
  });

  it('demanda é travada em 100 mesmo com peso > 1', () => {
    const s = scoreNeighborhood(makeStat(), undefined, 5);
    expect(s.demandPct).toBe(100);
  });

  it('liquidez satura em 100 para count muito acima da referência', () => {
    const s = scoreNeighborhood(makeStat({ count: 200 }));
    expect(s.liquidityPct).toBe(100);
  });

  it('yield mais alto eleva o score (ceteris paribus)', () => {
    const base = makeStat({ avgPrice: 300000 });
    const low = scoreNeighborhood(base, undefined, undefined, { annualRentYieldPct: 0.06 });
    const high = scoreNeighborhood(base, undefined, undefined, { annualRentYieldPct: 0.12 });
    expect(high.score).toBeGreaterThan(low.score);
  });

  it('mais liquidez eleva o score', () => {
    const low = scoreNeighborhood(makeStat({ avgPrice: 300000, count: 0 }));
    const high = scoreNeighborhood(makeStat({ avgPrice: 300000, count: 80 }));
    expect(high.score).toBeGreaterThan(low.score);
  });

  it('mais demanda eleva o score', () => {
    const noDemand = scoreNeighborhood(makeStat({ avgPrice: 300000 }));
    const withDemand = scoreNeighborhood(makeStat({ avgPrice: 300000 }), undefined, heat(1));
    expect(withDemand.score).toBeGreaterThan(noDemand.score);
  });

  it('valorização positiva eleva o score vs negativa', () => {
    const up = scoreNeighborhood(makeStat({ avgPrice: 300000 }), risingTrend(100000, 110000));
    const down = scoreNeighborhood(makeStat({ avgPrice: 300000 }), fallingTrend());
    expect(up.score).toBeGreaterThan(down.score);
  });

  it('avgPrice zero não produz NaN e mantém score em [0,100]', () => {
    const s = scoreNeighborhood(makeStat({ avgPrice: 0, count: 0 }));
    expect(Number.isFinite(s.score)).toBe(true);
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(s.score).toBeLessThanOrEqual(100);
  });

  it('reasons nunca está vazio e cobre os 4 fatores', () => {
    const s = scoreNeighborhood(makeStat(), risingTrend(), heat(0.6));
    expect(s.reasons.length).toBe(4);
    expect(s.reasons.every((r) => r.length > 0)).toBe(true);
  });

  it('nota é consistente com grade(score)', () => {
    const s = scoreNeighborhood(makeStat(), risingTrend(), heat(0.5));
    expect(s.grade).toBe(grade(s.score));
  });

  it('pesos somam 1.0', () => {
    const sum =
      OPPORTUNITY_WEIGHTS.yield +
      OPPORTUNITY_WEIGHTS.appreciation +
      OPPORTUNITY_WEIGHTS.liquidity +
      OPPORTUNITY_WEIGHTS.demand;
    expect(sum).toBeCloseTo(1, 6);
  });
});

// ─── rankOpportunities ────────────────────────────────────────────────────────
describe('rankOpportunities', () => {
  const ideal = makeStat({ name: 'Premium', avgPrice: 200000, count: 80 });
  const mid = makeStat({ name: 'Medio', avgPrice: 300000, count: 20 });
  const low = makeStat({ name: 'Fraco', avgPrice: 300000, count: 0 });

  it('ordena de forma decrescente por score', () => {
    const ranked = rankOpportunities([
      { stat: mid },
      { stat: ideal, trend: risingTrend(100000, 110000), heat: heat(1) },
      { stat: low },
    ]);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score.score).toBeGreaterThanOrEqual(ranked[i].score.score);
    }
  });

  it('preserva o número de entradas', () => {
    const list = [
      { stat: mid },
      { stat: ideal, trend: risingTrend(100000, 110000), heat: heat(1) },
      { stat: low },
    ];
    expect(rankOpportunities(list).length).toBe(list.length);
  });

  it('o primeiro lugar é o bairro de maior score', () => {
    const ranked = rankOpportunities([
      { stat: mid },
      { stat: ideal, trend: risingTrend(100000, 110000), heat: heat(1) },
      { stat: low },
    ]);
    expect(ranked[0].stat.name).toBe('Premium');
  });

  it('score ranqueado é igual ao scoreNeighborhood individual', () => {
    const ranked = rankOpportunities([{ stat: mid }]);
    const direct = scoreNeighborhood(mid);
    expect(ranked[0].score.score).toBeCloseTo(direct.score, 6);
    expect(ranked[0].score.grade).toBe(direct.grade);
  });
});

