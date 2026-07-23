import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../index.js';

/**
 * Real-time property valuation — TypeScript port of the calibrated numpy prior
 * from the Python `landmap-serving` service, so a live estimate is available
 * directly in the Next/Hono deployment with sub-millisecond latency (no extra
 * service hop). The Python PyTorch refiner remains the "deep" upgrade path.
 *
 * The math is intentionally identical to `landmap_serving.realtime` so results
 * are consistent across engines.
 */

const DEFAULT_PPM2 = 6_000;
const REF_AREA = 250;

const TYPE_MULT: Record<string, number> = {
  apartamento: 1.0,
  casa: 0.95,
  terreno: 0.7,
  comercial: 1.15,
};

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export type RealtimeValuation = {
  predictedPrice: number;
  pricePerM2: number;
  engine: 'numpy-ts';
  latencyUs: number;
};

export function valueRealtime(input: {
  areaM2?: number;
  type?: string;
  bedrooms?: number;
  basePpm2?: number | null;
  yoyPct?: number;
  volatility?: number;
  isLaunch?: boolean;
}): RealtimeValuation {
  const t0 = performance.now();
  const area = Math.max(input.areaM2 ?? 0, 0);
  const base = input.basePpm2 && input.basePpm2 > 0 ? input.basePpm2 : DEFAULT_PPM2;
  const tmult = TYPE_MULT[input.type ?? 'apartamento'] ?? 1.0;
  const launchMult = input.isLaunch ? 1.08 : 1.0;
  const yoyMult = 1.0 + clamp(input.yoyPct ?? 0, -0.5, 0.5) * 0.3;
  const volPenalty = 1.0 - clamp(input.volatility ?? 0, 0, 1) * 0.05;
  const areaEff = Math.pow(Math.max(area, 1) / REF_AREA, -0.03);
  const bedBonus = 1.0 + Math.min(input.bedrooms ?? 0, 6) * 0.01;

  const ppm2 = base * tmult * launchMult * yoyMult * volPenalty * areaEff * bedBonus;
  const predicted = ppm2 * area;
  const latencyUs = (performance.now() - t0) * 1000;

  return {
    predictedPrice: Math.round(predicted * 100) / 100,
    pricePerM2: Math.round(ppm2 * 100) / 100,
    engine: 'numpy-ts',
    latencyUs: Math.round(latencyUs * 100) / 100,
  };
}

const bodySchema = z.object({
  areaM2: z.coerce.number().positive('areaM2 deve ser > 0'),
  area_m2: z.coerce.number().positive().optional(),
  type: z.enum(['apartamento', 'casa', 'terreno', 'comercial']).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  basePpm2: z.coerce.number().positive().nullable().optional(),
  yoyPct: z.coerce.number().optional(),
  volatility: z.coerce.number().optional(),
  isLaunch: z.coerce.boolean().optional(),
}).transform((d) => ({ ...d, areaM2: d.areaM2 ?? d.area_m2 ?? 0 }));

const batchSchema = z.object({
  items: z.array(bodySchema).min(1, 'items não pode ser vazio').max(500),
});

export const valuationApp = new Hono<Env>();

/* POST /value/realtime — single valuation, sub-ms, with latency telemetry. */
valuationApp.post('/realtime', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body JSON inválido' }, 400);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Parâmetros inválidos', issues: parsed.error.issues }, 400);
  }
  return c.json(valueRealtime(parsed.data));
});

/* GET /value/realtime?areaM2=..&type=.. — query variant (fácil de plugar em UI). */
valuationApp.get('/realtime', (c) => {
  const parsed = bodySchema.safeParse({
    areaM2: c.req.query('areaM2') ?? c.req.query('area_m2') ?? undefined,
    type: c.req.query('type') ?? undefined,
    bedrooms: c.req.query('bedrooms') ?? undefined,
    basePpm2: c.req.query('basePpm2') ?? undefined,
    yoyPct: c.req.query('yoyPct') ?? undefined,
    volatility: c.req.query('volatility') ?? undefined,
    isLaunch: c.req.query('isLaunch') ?? undefined,
  });
  if (!parsed.success) {
    return c.json({ error: 'Parâmetros inválidos', issues: parsed.error.issues }, 400);
  }
  return c.json(valueRealtime(parsed.data));
});

/* POST /value/realtime/batch — throughput para feeds/dashboards. */
valuationApp.post('/realtime/batch', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Body JSON inválido' }, 400);
  }
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Parâmetros inválidos', issues: parsed.error.issues }, 400);
  }
  const items = parsed.data.items.map((it) => valueRealtime(it));
  const total = items.reduce((s, v) => s + v.latencyUs, 0);
  return c.json({
    items,
    count: items.length,
    totalLatencyUs: Math.round(total * 100) / 100,
    avgLatencyUs: items.length ? Math.round((total / items.length) * 100) / 100 : 0,
    engine: 'numpy-ts',
  });
});

export default valuationApp;
