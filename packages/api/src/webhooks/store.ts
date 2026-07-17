import { createHmac, randomBytes, randomUUID } from 'crypto';
import type {
  WebhookDelivery,
  WebhookEndpoint,
  WebhookEnvelope,
  WebhookEvent,
} from './types.js';
import { WEBHOOK_EVENTS } from './types.js';

const MAX_DELIVERIES = 100;
const endpoints = new Map<string, WebhookEndpoint>();
const deliveries: WebhookDelivery[] = [];

function newSecret() {
  return randomBytes(24).toString('hex');
}

export function listWebhookEvents() {
  return [...WEBHOOK_EVENTS];
}

export function listEndpoints(): WebhookEndpoint[] {
  return [...endpoints.values()].map((e) => ({ ...e }));
}

export function getEndpoint(id: string) {
  const e = endpoints.get(id);
  return e ? { ...e } : null;
}

export function createEndpoint(input: {
  name: string;
  url: string;
  events?: WebhookEvent[];
}): WebhookEndpoint {
  const id = `wh_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const ep: WebhookEndpoint = {
    id,
    name: input.name.trim() || 'Webhook',
    url: input.url.trim(),
    secret: newSecret(),
    events: input.events?.length ? input.events : ['ping'],
    active: true,
    createdAt: new Date().toISOString(),
  };
  endpoints.set(id, ep);
  return { ...ep };
}

export function updateEndpoint(
  id: string,
  patch: Partial<Pick<WebhookEndpoint, 'name' | 'url' | 'events' | 'active'>>,
): WebhookEndpoint | null {
  const cur = endpoints.get(id);
  if (!cur) return null;
  const next: WebhookEndpoint = {
    ...cur,
    ...patch,
    name: patch.name?.trim() || cur.name,
    url: patch.url?.trim() || cur.url,
  };
  endpoints.set(id, next);
  return { ...next };
}

export function deleteEndpoint(id: string) {
  return endpoints.delete(id);
}

export function listDeliveries(limit = 50): WebhookDelivery[] {
  return deliveries.slice(0, Math.min(limit, MAX_DELIVERIES));
}

export function signBody(secret: string, rawBody: string) {
  const hex = createHmac('sha256', secret).update(rawBody).digest('hex');
  return `sha256=${hex}`;
}

export function isAllowedWebhookUrl(url: string): { ok: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: 'URL inválida' };
  }
  if (parsed.protocol === 'https:') return { ok: true };
  if (
    parsed.protocol === 'http:' &&
    (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
  ) {
    return { ok: true };
  }
  return { ok: false, error: 'Use https:// (ou http://localhost em dev)' };
}

async function deliverOne(
  ep: WebhookEndpoint,
  envelope: WebhookEnvelope,
): Promise<WebhookDelivery> {
  const raw = JSON.stringify(envelope);
  const start = Date.now();
  const deliveryId = envelope.id;
  let status: number | null = null;
  let ok = false;
  let error: string | undefined;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(ep.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LandMap-Event': envelope.type,
        'X-LandMap-Delivery': deliveryId,
        'X-LandMap-Signature': signBody(ep.secret, raw),
        'User-Agent': 'LandMap-Webhooks/1.0',
      },
      body: raw,
      signal: controller.signal,
    });
    clearTimeout(timer);
    status = res.status;
    ok = res.ok;
    if (!ok) error = `HTTP ${res.status}`;
  } catch (e) {
    error = e instanceof Error ? e.message : 'network error';
  }

  const durationMs = Date.now() - start;
  const delivery: WebhookDelivery = {
    id: deliveryId,
    endpointId: ep.id,
    event: envelope.type,
    url: ep.url,
    status,
    ok,
    error,
    createdAt: new Date().toISOString(),
    durationMs,
  };

  deliveries.unshift(delivery);
  if (deliveries.length > MAX_DELIVERIES) deliveries.length = MAX_DELIVERIES;

  const cur = endpoints.get(ep.id);
  if (cur) {
    cur.lastDeliveryAt = delivery.createdAt;
    cur.lastStatus = status ?? undefined;
    endpoints.set(ep.id, cur);
  }

  return delivery;
}

export async function emitWebhook(
  type: WebhookEvent,
  data: Record<string, unknown> = {},
  opts?: { endpointId?: string },
): Promise<WebhookDelivery[]> {
  const envelope: WebhookEnvelope = {
    id: `evt_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    type,
    createdAt: new Date().toISOString(),
    data,
  };

  const targets = [...endpoints.values()].filter((ep) => {
    if (!ep.active) return false;
    if (opts?.endpointId && ep.id !== opts.endpointId) return false;
    if (type === 'ping' && opts?.endpointId) return true;
    return ep.events.includes(type);
  });

  const results: WebhookDelivery[] = [];
  for (const ep of targets) {
    results.push(await deliverOne(ep, envelope));
  }
  return results;
}

export function __resetWebhooksForTests() {
  endpoints.clear();
  deliveries.length = 0;
}
