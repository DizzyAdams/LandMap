// packages/invest/src/metrics.ts
//
// Engine PURA de métricas de investimento imobiliário — zero dependências
// de React/Next/IO. Toda função é determinística e testável: usa apenas
// `Math` e NUNCA chama Date.now() / Math.random().
//
// Convenções BR: valores em BRL; taxas de juros/despesas/vacância/valorização
// são frações (0.07 = 7%); amortização do financiamento é do tipo FRANCESA
// (prestação fixa). Ver docs/war-room/06-invest-metrics.md para o significado
// de cada métrica para o investidor brasileiro.

import type {
  InvestmentAssumptions,
  InvestmentGrade,
  InvestmentResult,
} from './types';

// ─── Helpers numéricos ──────────────────────────────────────────────────────

/** Trava um valor no intervalo [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Converte uma taxa em % (ex.: 7.0) para fração (0.07). */
function pctToFraction(pct: number): number {
  return pct / 100;
}

// ─── Entrada / Financiamento ───────────────────────────────────────────────

/**
 * Entrada (down payment) em BRL.
 * downPayment = price * downPaymentPct
 */
export function downPayment(price: number, downPaymentPct: number): number {
  return price * downPaymentPct;
}

/**
 * Saldo financiado (loan amount) em BRL.
 * loanAmount = price * (1 - downPaymentPct)
 */
export function loanAmount(price: number, downPaymentPct: number): number {
  return price * (1 - downPaymentPct);
}

/**
 * Prestação mensal (sistema francês / PMT).
 *   r = taxaAnual/12
 *   n = prazoAnos * 12
 *   PMT = P * r * (1+r)^n / ((1+r)^n - 1)
 * Se a taxa for 0, a prestação é o principal dividido pelos meses (sem juros).
 */
export function mortgageMonthlyPayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number {
  const r = pctToFraction(annualRatePct) / 12;
  const n = termYears * 12;
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  const compound = Math.pow(1 + r, n);
  return (principal * r * compound) / (compound - 1);
}

// ─── Renda ──────────────────────────────────────────────────────────────────

/** Renda bruta anual = monthlyRent * 12. */
export function grossAnnualRent(monthlyRent: number): number {
  return monthlyRent * 12;
}

/**
 * Renda efetiva (Effective Gross Income) = renda bruta anual * (1 - vacancyPct).
 * Desconta o período em que o imóvel fica vazio (sem inquilino).
 */
export function effectiveGrossIncome(
  monthlyRent: number,
  vacancyPct: number,
): number {
  return grossAnnualRent(monthlyRent) * (1 - vacancyPct);
}

/**
 * Despesas operacionais anuais = renda bruta anual * annualExpensesPct.
 * Inclui IPTU, condomínio, manutenção, seguro, administração, etc.
 */
export function operatingExpenses(
  grossAnnualRent: number,
  annualExpensesPct: number,
): number {
  return grossAnnualRent * annualExpensesPct;
}

/** NOI (Net Operating Income) = renda efetiva - despesas operacionais. */
export function netOperatingIncome(
  effectiveGrossIncome: number,
  operatingExpenses: number,
): number {
  return effectiveGrossIncome - operatingExpenses;
}

// ─── Métricas de retorno ────────────────────────────────────────────────────

/** Cap rate = NOI / preço (fração). Independe de financiamento. */
export function capRate(noi: number, price: number): number {
  if (price === 0) return 0;
  return noi / price;
}

/**
 * Cash-on-cash = fluxo de caixa anual / capital investido (entrada).
 * Mede o retorno sobre o dinheiro que você efetivamente desembolsou.
 */
export function cashOnCash(annualCashflow: number, initialCash: number): number {
  if (initialCash === 0) return 0;
  return annualCashflow / initialCash;
}

/** Price-to-rent = preço / renda anual. Quantos anos de aluguel custa o imóvel. */
export function priceToRent(price: number, annualRent: number): number {
  if (annualRent === 0) return 0;
  return price / annualRent;
}

/** Gross Rent Multiplier = preço / renda anual (idêntico ao price-to-rent). */
export function grossRentMultiplier(price: number, annualRent: number): number {
  if (annualRent === 0) return 0;
  return price / annualRent;
}

// ─── Fluxo de caixa e amortização ───────────────────────────────────────────

/**
 * Fluxo de caixa mensal = (NOI anual / 12) - prestação mensal.
 * Pode ser negativo (o aluguel não cobre a prestação + custos).
 */
export function monthlyCashflow(
  netOperatingIncome: number,
  debtService: number,
): number {
  return netOperatingIncome / 12 - debtService;
}

/** Fluxo de caixa anual = fluxo mensal * 12. */
export function annualCashflow(monthlyCashflow: number): number {
  return monthlyCashflow * 12;
}

/**
 * Saldo devedor remanescente após `monthsPaid` prestações (amortização francesa).
 *   B = P * [ (1+r)^n - (1+r)^m ] / [ (1+r)^n - 1 ]
 * onde P = principal, r = taxa mensal, n = prazo em meses, m = meses pagos.
 * Se a taxa for 0, decai linearmente: P * (1 - m/n).
 */
export function remainingLoanBalanceAfter(
  principal: number,
  annualRatePct: number,
  termYears: number,
  monthsPaid: number,
): number {
  const r = pctToFraction(annualRatePct) / 12;
  const n = termYears * 12;
  if (n <= 0) return 0;
  if (monthsPaid >= n) return 0;
  if (r === 0) {
    return principal * (1 - monthsPaid / n);
  }
  const compoundN = Math.pow(1 + r, n);
  const compoundM = Math.pow(1 + r, monthsPaid);
  return (principal * (compoundN - compoundM)) / (compoundN - 1);
}

// ─── Projeção de patrimônio ─────────────────────────────────────────────────

/** Entradas de `projectEquity`. */
export interface EquityProjection {
  /** Saldo devedor ao fim do horizonte (BRL). */
  remainingLoanBalance: number;
  /** Patrimônio líquido ao fim do horizonte (BRL). */
  totalEquityEnd: number;
}

/**
 * Projeta o patrimônio ao fim do horizonte:
 *   - saldo devedor = remainingLoanBalanceAfter(loanAmount, taxa, prazo, meses)
 *   - preço futuro = price * (1 + valorização)^holdingYears
 *   - totalEquityEnd = preço futuro - saldo devedor
 */
export function projectEquity(
  price: number,
  loanAmountValue: number,
  annualAppreciationPct: number,
  holdingYears: number,
  annualRatePct: number,
  termYears: number,
): EquityProjection {
  const monthsPaid = holdingYears * 12;
  const remainingLoanBalance = remainingLoanBalanceAfter(
    loanAmountValue,
    annualRatePct,
    termYears,
    monthsPaid,
  );
  const futurePrice = price * Math.pow(1 + annualAppreciationPct, holdingYears);
  const totalEquityEnd = futurePrice - remainingLoanBalance;
  return { remainingLoanBalance, totalEquityEnd };
}

// ─── Retorno total (ROI) ────────────────────────────────────────────────────

/** Entradas de `totalReturnPct`. */
export interface TotalReturnInput {
  /** Capital investido inicialmente (entrada) em BRL. */
  initialCash: number;
  /** Fluxo de caixa anual (BRL). */
  annualCashflow: number;
  /** Horizonte em anos. */
  holdingYears: number;
  /** Preço projetado ao fim do horizonte (BRL). */
  futurePrice: number;
  /** Preço de compra (BRL). */
  price: number;
  /** IR sobre ganho de capital em fração (ex.: 0.15). */
  taxRatePct: number;
}

/**
 * Retorno total em %:
 *   (fluxo de caixa acumulado em holdingYears + ganho de capital líquido de IR)
 *     / capital investido * 100
 * ganho de capital líquido = (futurePrice - price) * (1 - taxRatePct)
 */
export function totalReturnPct(input: TotalReturnInput): number {
  const accumulatedCashflow = input.annualCashflow * input.holdingYears;
  const capitalGain = input.futurePrice - input.price;
  const netCapitalGain = capitalGain * (1 - pctToFraction(input.taxRatePct));
  if (input.initialCash === 0) return 0;
  return ((accumulatedCashflow + netCapitalGain) / input.initialCash) * 100;
}

// ─── IRR (Taxa Interna de Retorno) ──────────────────────────────────────────

/** Entradas de `irrPct`. */
export interface IrrInput {
  /** Capital investido inicialmente (entrada) em BRL. */
  initialCash: number;
  /** Fluxo de caixa anual (BRL). */
  annualCashflow: number;
  /** Patrimônio líquido ao fim do horizonte (BRL). */
  totalEquityEnd: number;
  /** Horizonte em anos. */
  holdingYears: number;
}

/**
 * Monta o vetor de fluxos de caixa para o IRR:
 *   t0 = -initialCash
 *   t1..t(N-1) = +annualCashflow
 *   tN = +annualCashflow + totalEquityEnd
 * Total de holdingYears + 1 períodos.
 */
function buildCashflows(input: IrrInput): number[] {
  const flows: number[] = [-input.initialCash];
  for (let t = 1; t <= input.holdingYears; t++) {
    const isLast = t === input.holdingYears;
    flows.push(input.annualCashflow + (isLast ? input.totalEquityEnd : 0));
  }
  return flows;
}

/** Valor presente líquido (NPV) de `flows` descontado à taxa `rate`. */
function npv(flows: number[], rate: number): number {
  let sum = 0;
  for (let t = 0; t < flows.length; t++) {
    sum += flows[t] / Math.pow(1 + rate, t);
  }
  return sum;
}

/**
 * IRR resolvido por BUSCA BINÁRIA entre -0.99 e 1.0.
 * Tolerância 1e-6, máximo 200 iterações. Retorna 0 se não convergir.
 */
export function irrPct(input: IrrInput): number {
  const flows = buildCashflows(input);
  let lo = -0.99;
  let hi = 1.0;
  const npvLo = npv(flows, lo);
  const npvHi = npv(flows, hi);
  // Sem mudança de sinal → não há raiz no intervalo.
  if (npvLo === 0) return lo;
  if (npvHi === 0) return hi;
  if (npvLo * npvHi > 0) return 0;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npv(flows, mid);
    if (Math.abs(npvMid) < 1e-6) return mid;
    if (npvLo * npvMid < 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return (lo + hi) / 2;
}

// ─── Score composto e nota ──────────────────────────────────────────────────

/** Entradas de `score`. */
export interface ScoreInput {
  capRate: number;
  cashOnCash: number;
  priceToRent: number;
  annualAppreciationPct: number;
}

/**
 * Benchmarks de normalização (fração de referência considerada "máxima").
 * Ajustados para o mercado BR: cap rate ~7%, cash-on-cash mapeado de
 * -10%..+12%, price-to-rent ótimo ~8 (pior ~22), valorização ~7%.
 */
const BENCH = {
  capRate: 0.07,
  cashOnCashNeg: 0.1, // piso para mapear cash-on-cash negativo em 0
  cashOnCashSpan: 0.22, // de -10% até +12%
  priceToRentBest: 8,
  priceToRentWorst: 22,
  appreciation: 0.07,
};

/**
 * Pesos do score composto (somam 1):
 *   capRate            0.35  (rentabilidade operacional do ativo)
 *   cashOnCash         0.30  (retorno sobre o dinheiro investido)
 *   inverso priceToRent 0.20  (quanto menor o P/R, melhor a eficiência)
 *   appreciation       0.15  (valorização esperada)
 */
const WEIGHTS = {
  capRate: 0.35,
  cashOnCash: 0.3,
  priceToRent: 0.2,
  appreciation: 0.15,
};

/**
 * Score composto 0..100. Cada métrica é normalizada para 0..1 e ponderada.
 * O score final é travado em [0, 100].
 */
export function score(input: ScoreInput): number {
  const capScore = clamp(input.capRate / BENCH.capRate, 0, 1);

  // cash-on-cash mapeado de [cashOnCashNeg, cashOnCashNeg+span] -> [0, 1]
  const cocRaw =
    (input.cashOnCash + BENCH.cashOnCashNeg) / BENCH.cashOnCashSpan;
  const cocScore = clamp(cocRaw, 0, 1);

  // price-to-rent: menor é melhor -> (worst - p2r)/(worst - best) em [0,1]
  const p2rScore = clamp(
    (BENCH.priceToRentWorst - input.priceToRent) /
      (BENCH.priceToRentWorst - BENCH.priceToRentBest),
    0,
    1,
  );

  const apprScore = clamp(
    input.annualAppreciationPct / BENCH.appreciation,
    0,
    1,
  );

  const composite =
    WEIGHTS.capRate * capScore +
    WEIGHTS.cashOnCash * cocScore +
    WEIGHTS.priceToRent * p2rScore +
    WEIGHTS.appreciation * apprScore;

  return clamp(composite * 100, 0, 100);
}

/**
 * Converte o score em nota qualitativa:
 *   A >= 80, B >= 65, C >= 50, D >= 35, senão F.
 */
export function grade(scoreValue: number): InvestmentGrade {
  if (scoreValue >= 80) return 'A';
  if (scoreValue >= 65) return 'B';
  if (scoreValue >= 50) return 'C';
  if (scoreValue >= 35) return 'D';
  return 'F';
}

// ─── Orquestração ───────────────────────────────────────────────────────────

/**
 * Orquestra todas as métricas a partir dos pressupostos de entrada.
 * Função central consumida pelos agentes de oportunidade, API e mapa.
 */
export function analyze(a: InvestmentAssumptions): InvestmentResult {
  const downPmt = downPayment(a.price, a.downPaymentPct);
  const loan = loanAmount(a.price, a.downPaymentPct);
  const monthlyMort = mortgageMonthlyPayment(
    loan,
    a.interestRatePct,
    a.loanTermYears,
  );
  const gar = grossAnnualRent(a.monthlyRent);
  const egi = effectiveGrossIncome(a.monthlyRent, a.vacancyPct);
  const opEx = operatingExpenses(gar, a.annualExpensesPct);
  const noi = netOperatingIncome(egi, opEx);
  const cap = capRate(noi, a.price);
  const p2r = priceToRent(a.price, gar);
  const grm = grossRentMultiplier(a.price, gar);
  const mcf = monthlyCashflow(noi, monthlyMort);
  const acf = annualCashflow(mcf);
  const coc = cashOnCash(acf, downPmt);

  const { remainingLoanBalance, totalEquityEnd } = projectEquity(
    a.price,
    loan,
    a.annualAppreciationPct,
    a.holdingYears,
    a.interestRatePct,
    a.loanTermYears,
  );

  const tax = a.taxRatePct ?? 0;
  const futurePrice =
    a.price * Math.pow(1 + a.annualAppreciationPct, a.holdingYears);

  const totalReturn = totalReturnPct({
    initialCash: downPmt,
    annualCashflow: acf,
    holdingYears: a.holdingYears,
    futurePrice,
    price: a.price,
    taxRatePct: tax,
  });

  const irr = irrPct({
    initialCash: downPmt,
    annualCashflow: acf,
    totalEquityEnd,
    holdingYears: a.holdingYears,
  });

  const sc = score({
    capRate: cap,
    cashOnCash: coc,
    priceToRent: p2r,
    annualAppreciationPct: a.annualAppreciationPct,
  });
  const gr = grade(sc);

  return {
    downPayment: downPmt,
    loanAmount: loan,
    monthlyMortgage: monthlyMort,
    grossAnnualRent: gar,
    effectiveGrossIncome: egi,
    operatingExpenses: opEx,
    netOperatingIncome: noi,
    capRate: cap,
    cashOnCash: coc,
    priceToRent: p2r,
    grossRentMultiplier: grm,
    monthlyCashflow: mcf,
    annualCashflow: acf,
    remainingLoanBalance,
    totalEquityEnd,
    totalReturnPct: totalReturn,
    irrPct: irr,
    score: sc,
    grade: gr,
  };
}

