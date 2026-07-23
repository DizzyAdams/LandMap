import { Hono } from 'hono';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Minimal funnel analytics — self-hosted, zero deps beyond Hono, zero vendors.
// Events persisted to NDJSON (same philosophy as .tokenwise): no PostHog/Mixpanel needed.
// POST /funnel/event  { event, userId?, plan?, meta? }   (events: signup | activation | checkout | churn)
// GET  /funnel/report ?days=30                            (conversion rates signup→activation→checkout)

const DATA_FILE = join(process.cwd(), 'data', 'funnel-events.ndjson');
const KNOWN = new Set(['signup', 'activation', 'checkout', 'churn']);

type FunnelEvent = {
  ts: string;
  event: string;
  userId?: string;
  plan?: string;
  meta?: Record<string, unknown>;
};

function readEvents(): FunnelEvent[] {
  if (!existsSync(DATA_FILE)) return [];
  return readFileSync(DATA_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l) as FunnelEvent; } catch { return null; } })
    .filter((e): e is FunnelEvent => e !== null);
}

export function createFunnelRouter() {
  const app = new Hono();

  app.post('/event', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body.event !== 'string' || !KNOWN.has(body.event)) {
      return c.json({ error: `event must be one of: ${[...KNOWN].join(', ')}` }, 400);
    }
    const entry: FunnelEvent = {
      ts: new Date().toISOString(),
      event: body.event,
      userId: typeof body.userId === 'string' ? body.userId.slice(0, 64) : undefined,
      plan: typeof body.plan === 'string' ? body.plan.slice(0, 32) : undefined,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : undefined,
    };
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    appendFileSync(DATA_FILE, JSON.stringify(entry) + '\n');
    return c.json({ ok: true });
  });

  app.get('/report', (c) => {
    const days = Math.min(+(c.req.query('days') || 30), 365);
    const since = Date.now() - days * 864e5;
    const events = readEvents().filter((e) => new Date(e.ts).getTime() >= since);

    const unique = (name: string) => new Set(events.filter((e) => e.event === name).map((e) => e.userId ?? e.ts)).size;
    const signup = unique('signup');
    const activation = unique('activation');
    const checkout = unique('checkout');
    const churn = unique('churn');

    const byPlan: Record<string, number> = {};
    for (const e of events) if (e.event === 'checkout' && e.plan) byPlan[e.plan] = (byPlan[e.plan] ?? 0) + 1;

    return c.json({
      windowDays: days,
      totals: { signup, activation, checkout, churn },
      conversion: {
        signupToActivation: signup ? +(activation / signup).toFixed(3) : null,
        activationToCheckout: activation ? +(checkout / activation).toFixed(3) : null,
        signupToCheckout: signup ? +(checkout / signup).toFixed(3) : null,
      },
      checkoutByPlan: byPlan,
      note: 'LTV/CAC/churn do modelo financeiro só são reais quando este funil estiver alimentado.',
    });
  });

  return app;
}
