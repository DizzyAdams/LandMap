import { Hono } from 'hono';
import type { Env } from '../index.js';
import type { Property } from '@landmap/db';
import { z } from 'zod';
import { analyze, estimateMonthlyRent } from '@landmap/invest';
import type { InvestmentAssumptions, InvestmentResult } from '@landmap/invest';
import { loadProperties } from '../loadJson.js';
const allPropertiesData = loadProperties();

const allProperties = allPropertiesData as unknown as Property[];

function filterByCity(city: string): Property[] {
  const target = city.trim().toLowerCase();
  return allProperties.filter((p) => p.city.toLowerCase() === target);
}

/* Validação dos parâmetros de query de /invest/analyze (strings → números).
   Parâmetros de investimento têm defaults do investidor BR; apenas price e
   monthlyRent são obrigatórios. `.default()` só age quando o valor é `undefined`
   (por isso o parse passa `?? undefined` para os opcionais). */
const analyzeQuerySchema = z.object({
  price: z.coerce.number().positive('price deve ser > 0'),
  monthlyRent: z.coerce.number().positive('monthlyRent deve ser > 0'),
  downPaymentPct: z.coerce.number().min(0).max(1).default(0.2),
  interestRatePct: z.coerce.number().min(0).default(7),
  loanTermYears: z.coerce.number().positive().int().default(30),
  annualExpensesPct: z.coerce.number().min(0).max(1).default(0.35),
  vacancyPct: z.coerce.number().min(0).max(1).default(0.08),
  annualAppreciationPct: z.coerce.number().min(0).max(1).default(0.05),
  holdingYears: z.coerce.number().positive().default(5),
  taxRatePct: z.coerce.number().min(0).max(1).optional(),
});

/* Validação do body JSON de /invest/score (InvestmentAssumptions). */
const assumptionsBodySchema = z.object({
  price: z.number().positive('price deve ser > 0'),
  monthlyRent: z.number().positive('monthlyRent deve ser > 0'),
  downPaymentPct: z.number().min(0).max(1),
  interestRatePct: z.number().min(0),
  loanTermYears: z.number().positive().int(),
  annualExpensesPct: z.number().min(0).max(1),
  vacancyPct: z.number().min(0).max(1),
  annualAppreciationPct: z.number().min(0).max(1),
  holdingYears: z.number().positive(),
  taxRatePct: z.number().min(0).max(1).optional(),
});

/** Pressupostos padrão do investidor BR para o ranqueamento de oportunidades. */
function defaultAssumptions(price: number): InvestmentAssumptions {
  return {
    price,
    monthlyRent: estimateMonthlyRent(price),
    downPaymentPct: 0.2,
    interestRatePct: 7,
    loanTermYears: 30,
    annualExpensesPct: 0.35,
    vacancyPct: 0.08,
    annualAppreciationPct: 0.05,
    holdingYears: 5,
  };
}

/* Mapeia o resultado do parse (zod) para InvestmentAssumptions, garantindo
   todos os campos obrigatórios mesmo que o infer do zod os deixe opcionais. */
type LooseQuery = {
  price?: number;
  monthlyRent?: number;
  downPaymentPct?: number;
  interestRatePct?: number;
  loanTermYears?: number;
  annualExpensesPct?: number;
  vacancyPct?: number;
  annualAppreciationPct?: number;
  holdingYears?: number;
  taxRatePct?: number;
};
function toAssumptions(d: LooseQuery): InvestmentAssumptions {
  return {
    price: d.price ?? 0,
    monthlyRent: d.monthlyRent ?? 0,
    downPaymentPct: d.downPaymentPct ?? 0.2,
    interestRatePct: d.interestRatePct ?? 7,
    loanTermYears: d.loanTermYears ?? 30,
    annualExpensesPct: d.annualExpensesPct ?? 0.35,
    vacancyPct: d.vacancyPct ?? 0.08,
    annualAppreciationPct: d.annualAppreciationPct ?? 0.05,
    holdingYears: d.holdingYears ?? 5,
    taxRatePct: d.taxRatePct,
  };
}

export const investApp = new Hono<Env>();

/* GET /invest/analyze?price=...&monthlyRent=...&... → InvestmentResult */
investApp.get('/analyze', (c) => {
  const result = analyzeQuerySchema.safeParse({
    price: c.req.query('price') ?? undefined,
    monthlyRent: c.req.query('monthlyRent') ?? undefined,
    downPaymentPct: c.req.query('downPaymentPct') ?? undefined,
    interestRatePct: c.req.query('interestRatePct') ?? undefined,
    loanTermYears: c.req.query('loanTermYears') ?? undefined,
    annualExpensesPct: c.req.query('annualExpensesPct') ?? undefined,
    vacancyPct: c.req.query('vacancyPct') ?? undefined,
    annualAppreciationPct: c.req.query('annualAppreciationPct') ?? undefined,
    holdingYears: c.req.query('holdingYears') ?? undefined,
    taxRatePct: c.req.query('taxRatePct') ?? undefined,
  });
  if (!result.success) {
    return c.json(
      { error: 'Parâmetros inválidos para analyze()', issues: result.error.issues },
      400,
    );
  }
  const analysis: InvestmentResult = analyze(toAssumptions(result.data));
  return c.json(analysis);
});

/* GET /invest/opportunities?city=X[&limit=N] → top N imóveis por score desc */
investApp.get('/opportunities', (c) => {
  const city = c.req.query('city') ?? '';
  if (!city.trim()) {
    return c.json({ error: 'O parâmetro "city" é obrigatório' }, 400);
  }

  const limitRaw = Number(c.req.query('limit') ?? '10');
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50)
    : 10;

  const ranked = filterByCity(city)
    .map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      state: p.state,
      price: p.price,
      result: analyze(defaultAssumptions(p.price)),
    }))
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, limit);

  return c.json(ranked);
});

/* POST /invest/score → analyze(body: InvestmentAssumptions) */
investApp.post('/score', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body JSON inválido' }, 400);
  }

  const result = assumptionsBodySchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: 'InvestmentAssumptions inválidos', issues: result.error.issues },
      400,
    );
  }
  const analysis: InvestmentResult = analyze(toAssumptions(result.data));
  return c.json(analysis);
});

export default investApp;
