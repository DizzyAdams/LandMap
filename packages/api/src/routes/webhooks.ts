import { Hono } from 'hono';
import type { Env } from '../index.js';
import {
  createEndpoint,
  deleteEndpoint,
  emitWebhook,
  getEndpoint,
  isAllowedWebhookUrl,
  listDeliveries,
  listEndpoints,
  listWebhookEvents,
  updateEndpoint,
} from '../webhooks/store.js';
import { WEBHOOK_EVENTS, type WebhookEvent } from '../webhooks/types.js';

function parseEvents(raw: unknown): WebhookEvent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const allowed = new Set<string>(WEBHOOK_EVENTS);
  return raw.filter((e): e is WebhookEvent => typeof e === 'string' && allowed.has(e));
}

export function createWebhooksRouter() {
  const router = new Hono<Env>();

  router.get('/events', (c) => {
    return c.json({
      ok: true,
      events: listWebhookEvents(),
      sample: {
        id: 'evt_sample',
        type: 'ping',
        createdAt: new Date().toISOString(),
        data: { message: 'hello from LandMap' },
      },
      headers: {
        'X-LandMap-Event': 'event type',
        'X-LandMap-Delivery': 'delivery id',
        'X-LandMap-Signature': 'sha256=<hmac hex of raw body>',
      },
    });
  });

  router.get('/endpoints', (c) => {
    const items = listEndpoints().map((e) => ({
      ...e,
      secretPreview: `${e.secret.slice(0, 6)}…`,
    }));
    return c.json({ ok: true, items, total: items.length });
  });

  router.post('/endpoints', async (c) => {
    let body: { name?: string; url?: string; events?: unknown } = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ ok: false, error: 'JSON inválido' }, 400);
    }
    const url = (body.url ?? '').toString().trim();
    const check = isAllowedWebhookUrl(url);
    if (!check.ok) return c.json({ ok: false, error: check.error }, 400);

    const ep = createEndpoint({
      name: (body.name ?? 'Meu projeto').toString(),
      url,
      events: parseEvents(body.events),
    });
    return c.json({ ok: true, endpoint: ep }, 201);
  });

  router.patch('/endpoints/:id', async (c) => {
    const id = c.req.param('id');
    let body: Record<string, unknown> = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ ok: false, error: 'JSON inválido' }, 400);
    }
    if (typeof body.url === 'string') {
      const check = isAllowedWebhookUrl(body.url);
      if (!check.ok) return c.json({ ok: false, error: check.error }, 400);
    }
    const ep = updateEndpoint(id, {
      name: typeof body.name === 'string' ? body.name : undefined,
      url: typeof body.url === 'string' ? body.url : undefined,
      active: typeof body.active === 'boolean' ? body.active : undefined,
      events: parseEvents(body.events),
    });
    if (!ep) return c.json({ ok: false, error: 'Endpoint não encontrado' }, 404);
    return c.json({ ok: true, endpoint: ep });
  });

  router.delete('/endpoints/:id', (c) => {
    const id = c.req.param('id');
    if (!deleteEndpoint(id)) return c.json({ ok: false, error: 'Endpoint não encontrado' }, 404);
    return c.json({ ok: true });
  });

  router.post('/endpoints/:id/test', async (c) => {
    const id = c.req.param('id');
    if (!getEndpoint(id)) return c.json({ ok: false, error: 'Endpoint não encontrado' }, 404);
    const results = await emitWebhook(
      'ping',
      { message: 'LandMap webhook test', at: new Date().toISOString() },
      { endpointId: id },
    );
    return c.json({ ok: true, deliveries: results });
  });

  router.get('/deliveries', (c) => {
    const limit = Number(c.req.query('limit') || 50);
    return c.json({ ok: true, items: listDeliveries(limit) });
  });

  router.post('/emit', async (c) => {
    let body: { type?: string; data?: Record<string, unknown>; endpointId?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ ok: false, error: 'JSON inválido' }, 400);
    }
    const type = (body.type ?? '').toString() as WebhookEvent;
    if (!(WEBHOOK_EVENTS as readonly string[]).includes(type)) {
      return c.json(
        { ok: false, error: `type inválido. Use: ${WEBHOOK_EVENTS.join(', ')}` },
        400,
      );
    }
    const results = await emitWebhook(type, body.data ?? {}, {
      endpointId: body.endpointId,
    });
    return c.json({ ok: true, deliveries: results });
  });

  return router;
}
