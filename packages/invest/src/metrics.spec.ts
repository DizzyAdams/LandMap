// packages/invest/src/metrics.spec.ts
import { describe, it, expect } from 'vitest';
import {
  analyze,
  annualCashflow,
  capRate,
  cashOnCash,
  downPayment,
  effectiveGrossIncome,
  grade,
  grossAnnualRent,
  grossRentMultiplier,
  irrPct,
  loanAmount,
  monthlyCashflow,
  mortgageMonthlyPayment,
  netOperatingIncome,
  operatingExpenses,
  priceToRent,
  projectEquity,
  remainingLoanBalanceAfter,
  score,
  totalReturnPct,
} from './metrics';
import type { InvestmentAssumptions } from './types';

// Pressupostos do caso-âncora do LandMap War Room.
const anchor: InvestmentAssumptions = {
  price: 500000,
  monthlyRent: 3000,
  downPaymentPct: 0.2,
  interestRatePct: 7.0,
  loanTermYears: 30,
  annualExpensesPct: 0.35,
  vacancyPct: 0.08,
  annualAppreciationPct: 0.05,
  holdingYears: 5,
};

// ─── Entrada / Financiamento ────────────────────────────────────────────────
describe('downPayment / loanAmount', () => {
  it('calcula entrada e financiamento do âncora', () => {
    expect(downPayment(500000, 0.2)).toBeCloseTo(100000, 2);
    expect(loanAmount(500000, 0.2)).toBeCloseTo(400000, 2);
  });
  it('entrada de 100% não deixa financiamento', () => {
    expect(downPayment(500000, 1)).toBeCloseTo(500000, 2);
    expect(loanAmount(500000, 1)).toBeCloseTo(0, 2);
  });
});

// ─── Prestação (PMT, sistema francês) ──────────────────────────────────────
describe('mortgageMonthlyPayment', () => {
  it('PMT do âncora ≈ 2661.21 (7% a.a., 30 anos, 400k)', () => {
    expect(mortgageMonthlyPayment(400000, 7, 30)).toBeCloseTo(2661.21, 1);
  });
  it('taxa zero => principal / meses (sem juros)', () => {
    expect(mortgageMonthlyPayment(400000, 0, 30)).toBeCloseTo(400000 / 360, 4);
  });
  it('prazo zero => 0', () => {
    expect(mortgageMonthlyPayment(400000, 7, 0)).toBe(0);
  });
});

// ─── Renda ──────────────────────────────────────────────────────────────────
describe('renda (bruta / efetiva / despesas / NOI)', () => {
  it('renda bruta anual = mensal * 12', () => {
    expect(grossAnnualRent(3000)).toBeCloseTo(36000, 2);
  });
  it('renda efetiva desconta a vacância', () => {
    expect(effectiveGrossIncome(3000, 0.08)).toBeCloseTo(33120, 2);
  });
  it('despesas = renda bruta * % despesas', () => {
    expect(operatingExpenses(36000, 0.35)).toBeCloseTo(12600, 2);
  });
  it('NOI = renda efetiva - despesas', () => {
    expect(netOperatingIncome(33120, 12600)).toBeCloseTo(20520, 2);
  });
});

// ─── Métricas de retorno ────────────────────────────────────────────────────
describe('capRate / cashOnCash / priceToRent / GRM', () => {
  it('cap rate do âncora ≈ 4,10%', () => {
    expect(capRate(20520, 500000)).toBeCloseTo(0.04104, 2);
  });
  it('cash-on-cash do âncora é negativo (~ -11,4%)', () => {
    expect(cashOnCash(-11414.52, 100000)).toBeCloseTo(-0.1141, 2);
  });
  it('price-to-rent = preço / renda anual', () => {
    expect(priceToRent(500000, 36000)).toBeCloseTo(13.8889, 2);
  });
  it('GRM é idêntico ao price-to-rent', () => {
    expect(grossRentMultiplier(500000, 36000)).toBeCloseTo(
      priceToRent(500000, 36000),
      6,
    );
  });
  it('divisão por zero é segura', () => {
    expect(capRate(100, 0)).toBe(0);
    expect(priceToRent(100, 0)).toBe(0);
    expect(cashOnCash(100, 0)).toBe(0);
  });
});

// ─── Fluxo de caixa ─────────────────────────────────────────────────────────
describe('monthlyCashflow / annualCashflow', () => {
  it('fluxo mensal do âncora ≈ -951,21', () => {
    expect(monthlyCashflow(20520, 2661.21)).toBeCloseTo(-951.21, 1);
  });
  it('fluxo anual = mensal * 12', () => {
    expect(annualCashflow(-951.21)).toBeCloseTo(-11414.52, 1);
  });
// ─── Amortização (saldo devedor) ────────────────────────────────────────────
describe('remainingLoanBalanceAfter', () => {
  it('mês 0 => saldo total', () => {
    expect(remainingLoanBalanceAfter(400000, 7, 30, 0)).toBeCloseTo(400000, 2);
  });
  it('fim do prazo => 0', () => {
    expect(remainingLoanBalanceAfter(400000, 7, 30, 360)).toBe(0);
  });
  it('saldo do âncora após 5 anos ≈ 376526,36', () => {
    expect(remainingLoanBalanceAfter(400000, 7, 30, 60)).toBeCloseTo(
      376526.36,
      0,
    );
  });
  it('taxa zero decai linearmente (metade do prazo => metade)', () => {
    expect(remainingLoanBalanceAfter(400000, 0, 30, 180)).toBeCloseTo(
      200000,
      2,
    );
  });
});

// ─── Projeção de patrimônio ─────────────────────────────────────────────────
describe('projectEquity', () => {
  it('patrimônio do âncora (5 anos, +5% a.a.)', () => {
    const eq = projectEquity(500000, 400000, 0.05, 5, 7, 30);
    expect(eq.remainingLoanBalance).toBeCloseTo(376526.36, 0);
    // futurePrice = 500000 * 1.05^5 = 638140.78
    expect(eq.totalEquityEnd).toBeCloseTo(261614.42, 0);
  });
});

// ─── Retorno total (ROI) ────────────────────────────────────────────────────
describe('totalReturnPct', () => {
  it('sem IR: (~81,07%)', () => {
    expect(
      totalReturnPct({
        initialCash: 100000,
        annualCashflow: -11414.52,
        holdingYears: 5,
        futurePrice: 638140.78,
        price: 500000,
        taxRatePct: 0,
      }),
    ).toBeCloseTo(81.07, 1);
  });
  it('com IR de 15% reduz o retorno (~60,35%)', () => {
    expect(
      totalReturnPct({
        initialCash: 100000,
        annualCashflow: -11414.52,
        holdingYears: 5,
        futurePrice: 638140.78,
        price: 500000,
        taxRatePct: 15,
      }),
    ).toBeCloseTo(60.35, 1);
  });
});

// ─── IRR (busca binária) ────────────────────────────────────────────────────
describe('irrPct', () => {
  it('caso simples: -1000 hoje, +1100 em 1 ano => 10%', () => {
    expect(
      irrPct({
        initialCash: 1000,
        annualCashflow: 0,
        totalEquityEnd: 1100,
        holdingYears: 1,
      }),
    ).toBeCloseTo(0.1, 4);
  });
  it('IRR do âncora ≈ 13,35%', () => {
    expect(
      irrPct({
        initialCash: 100000,
        annualCashflow: -11414.52,
        totalEquityEnd: 261614.42,
        holdingYears: 5,
      }),
    ).toBeCloseTo(0.1335, 2);
  });
  it('sem raiz no intervalo => retorna 0', () => {
    expect(
      irrPct({
        initialCash: 1000,
        annualCashflow: -100,
        totalEquityEnd: 0,
        holdingYears: 5,
      }),
    ).toBe(0);
  });
});

// ─── Score e nota ───────────────────────────────────────────────────────────
describe('score', () => {
  it('imóvel forte (cap alto, +cashflow) => score alto', () => {
    expect(
      score({
        capRate: 0.09,
        cashOnCash: 0.1,
        priceToRent: 8,
        annualAppreciationPct: 0.06,
      }),
    ).toBeGreaterThan(80);
  });
  it('imóvel fraco (cap baixo, -cashflow, P/R alto) => score baixo', () => {
    expect(
      score({
        capRate: 0.02,
        cashOnCash: -0.15,
        priceToRent: 25,
        annualAppreciationPct: 0,
      }),
    ).toBeLessThan(35);
  });
  it('score travado em [0, 100]', () => {
    expect(
      score({ capRate: 1, cashOnCash: 1, priceToRent: 1, annualAppreciationPct: 1 }),
    ).toBeLessThanOrEqual(100);
    expect(
      score({ capRate: -1, cashOnCash: -1, priceToRent: 100, annualAppreciationPct: -1 }),
    ).toBeGreaterThanOrEqual(0);
  });
});

describe('grade', () => {
  it('limiares A/B/C/D/F', () => {
    expect(grade(100)).toBe('A');
    expect(grade(80)).toBe('A');
    expect(grade(79.9)).toBe('B');
    expect(grade(65)).toBe('B');
    expect(grade(64.9)).toBe('C');
    expect(grade(50)).toBe('C');
    expect(grade(49.9)).toBe('D');
    expect(grade(35)).toBe('D');
    expect(grade(34.9)).toBe('F');
    expect(grade(0)).toBe('F');
  });
});

// ─── analyze() — orquestração ───────────────────────────────────────────────
describe('analyze (âncora)', () => {
  const r = analyze(anchor);
  it('reproduz todas as métricas conhecidas', () => {
    expect(r.downPayment).toBeCloseTo(100000, 2);
    expect(r.loanAmount).toBeCloseTo(400000, 2);
    expect(r.monthlyMortgage).toBeCloseTo(2661.21, 1);
    expect(r.grossAnnualRent).toBeCloseTo(36000, 2);
    expect(r.effectiveGrossIncome).toBeCloseTo(33120, 2);
    expect(r.operatingExpenses).toBeCloseTo(12600, 2);
    expect(r.netOperatingIncome).toBeCloseTo(20520, 2);
    expect(r.capRate).toBeCloseTo(0.04104, 2);
    expect(r.cashOnCash).toBeCloseTo(-0.1141, 2);
    expect(r.priceToRent).toBeCloseTo(13.8889, 2);
    expect(r.grossRentMultiplier).toBeCloseTo(13.8889, 2);
    expect(r.monthlyCashflow).toBeCloseTo(-951.21, 1);
    expect(r.annualCashflow).toBeCloseTo(-11414.52, 1);
    expect(r.remainingLoanBalance).toBeCloseTo(376526.36, 0);
    expect(r.totalEquityEnd).toBeCloseTo(261614.42, 0);
    expect(r.totalReturnPct).toBeCloseTo(81.07, 1);
    expect(r.irrPct).toBeCloseTo(0.1335, 2);
  });
  it('score baixo e nota C/D (âncora negativa no fluxo)', () => {
    expect(r.score).toBeCloseTo(42.82, 1);
    expect(r.grade).toBe('D');
  });
});

describe('analyze (casos extremos)', () => {
  it('entrada 100%: sem financiamento, cash-on-cash == cap rate', () => {
    const r = analyze({ ...anchor, downPaymentPct: 1 });
    expect(r.monthlyMortgage).toBe(0);
    expect(r.cashOnCash).toBeCloseTo(r.capRate, 6);
  });
  it('taxa de juros zero: prestação = principal / meses', () => {
    const r = analyze({ ...anchor, interestRatePct: 0 });
    expect(r.monthlyMortgage).toBeCloseTo(400000 / 360, 4);
  });
  it('horizonte de 1 ano mantém saldo e patrimônio consistentes', () => {
    const r = analyze({ ...anchor, holdingYears: 1 });
    expect(r.remainingLoanBalance).toBeGreaterThan(0);
    expect(r.remainingLoanBalance).toBeLessThan(r.loanAmount);
    expect(r.irrPct).toBeGreaterThan(-0.99);
    expect(r.irrPct).toBeLessThanOrEqual(1);
  });
  it('price-to-rent alto (25) e baixo (10)', () => {
    const high = analyze({ ...anchor, price: 900000 });
    const low = analyze({ ...anchor, price: 360000 });
    expect(high.priceToRent).toBeCloseTo(25, 4);
    expect(low.priceToRent).toBeCloseTo(10, 4);
    // menor P/R => score maior
    expect(low.score).toBeGreaterThan(high.score);
  });
  it('fluxo fortemente negativo => nota F', () => {
    const r = analyze({
      price: 600000,
      monthlyRent: 1000,
      downPaymentPct: 0.1,
      interestRatePct: 15,
      loanTermYears: 30,
      annualExpensesPct: 0.4,
      vacancyPct: 0.1,
      annualAppreciationPct: 0.01,
      holdingYears: 5,
    });
    expect(r.grade).toBe('F');
    expect(r.score).toBeLessThan(35);
  });
  it('respeita IR opcional sobre o ganho de capital', () => {
    const semIR = analyze(anchor);
    const comIR = analyze({ ...anchor, taxRatePct: 15 });
    expect(comIR.totalReturnPct).toBeLessThan(semIR.totalReturnPct);
  });
});

});
