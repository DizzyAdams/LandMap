// packages/invest/src/types.ts
//
// Domínio de métricas de investimento imobiliário do LandMap.
//
// ALINHAMENTO COM OS AGENTES IRMÃOS:
//   - `packages/api/src/routes/market.ts` expõe preços de bairro/cidade
//     (price-trend, heatmap) que alimentam `price`/`monthlyRent` aqui.
//   - O agente de oportunidade e o mapa de calor consomem `analyze()`
//     para ranquear imóveis (ver docs/war-room/06-invest-metrics.md).
//   - Tudo é em BRL e usa convenções BR (vacância, despesas operacionais,
//     IR sobre ganho de capital). Nada é editado nos arquivos centrais.

/** Pressupostos de entrada para a análise de um imóvel. Todos os valores em BRL. */
export interface InvestmentAssumptions {
  /** Preço de compra (BRL). */
  price: number;
  /** Aluguel mensal de mercado (BRL). */
  monthlyRent: number;
  /** Entrada como fração de 0..1 (ex.: 0.20 = 20%). */
  downPaymentPct: number;
  /** Taxa de juros anual do financiamento em % (ex.: 7.0). */
  interestRatePct: number;
  /** Prazo do financiamento em anos (ex.: 30). */
  loanTermYears: number;
  /** Despesas operacionais como % da renda bruta anual (ex.: 0.35). */
  annualExpensesPct: number;
  /** Vacância como fração de 0..1 (0.08 = 8% do tempo sem inquilino). */
  vacancyPct: number;
  /** Valorização anual esperada como fração (ex.: 0.05 = 5%). */
  annualAppreciationPct: number;
  /** Horizonte de investimento em anos (ex.: 5). */
  holdingYears: number;
  /** IR sobre ganho de capital em % (opcional, default 0). */
  taxRatePct?: number;
}

/** Nota qualitativa do investimento, derivada do score 0..100. */
export type InvestmentGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/** Resultado completo de `analyze()` — todas as métricas calculadas. */
export interface InvestmentResult {
  /** Entrada paga (BRL). */
  downPayment: number;
  /** Saldo financiado (BRL). */
  loanAmount: number;
  /** Prestação mensal (BRL). */
  monthlyMortgage: number;
  /** Renda bruta anual (BRL). */
  grossAnnualRent: number;
  /** Renda efetiva (já descontada a vacância) (BRL). */
  effectiveGrossIncome: number;
  /** Despesas operacionais anuais (BRL). */
  operatingExpenses: number;
  /** NOI — Net Operating Income anual (BRL). */
  netOperatingIncome: number;
  /** Cap rate (NOI / preço). Fração 0..1. */
  capRate: number;
  /** Cash-on-cash (fluxo de caixa anual / capital investido). Fração. */
  cashOnCash: number;
  /** Price-to-rent (preço / renda anual). Adimensional. */
  priceToRent: number;
  /** Gross Rent Multiplier (preço / renda anual). Adimensional. */
  grossRentMultiplier: number;
  /** Fluxo de caixa mensal (BRL, pode ser negativo). */
  monthlyCashflow: number;
  /** Fluxo de caixa anual (BRL, pode ser negativo). */
  annualCashflow: number;
  /** Saldo devedor remanescente ao fim do horizonte (BRL). */
  remainingLoanBalance: number;
  /** Patrimônio líquido ao fim do horizonte (BRL). */
  totalEquityEnd: number;
  /** Retorno total em % (fluxo acumulado + ganho de capital líquido de IR). */
  totalReturnPct: number;
  /** Taxa interna de retorno (IRR) em fração (ex.: 0.12 = 12%). */
  irrPct: number;
  /** Score composto 0..100. */
  score: number;
  /** Nota qualitativa A..F. */
  grade: InvestmentGrade;
}
