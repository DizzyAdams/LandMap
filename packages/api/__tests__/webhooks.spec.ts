import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createWebhooksRouter } from '../src/routes/webhooks';
import { __resetWebhooksForTests, signBody } from '../src/webhooks/store';

function makeApp() {
  const app = new Hono();
  app.route('/webhooks', createWebhooksRouter());
  return app;
}

const json = (body: unknown) => ({
  method: 'POST' as const,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('packages/api — webhooks router', () => {
  beforeEach(() => {
    __resetWebhooksForTests();
  });

  it('GET /webhooks/events lists event types', async () => {
    const res = await makeApp().request('/webhooks/events');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.events).toContain('ping');
    expect(data.events).toContain('rag.query');
  });

  it('rejects non-https URLs (except localhost)', async () => {
    const res = await makeApp().request(
      '/webhooks/endpoints',
      json({ name: 'x', url: 'http://evil.example/hook' }),
    );
    expect(res.status).toBe(400);
  });

  it('creates endpoint and returns secret', async () => {
    const res = await makeApp().request(
      '/webhooks/endpoints',
      json({
        name: 'test-app',
        url: 'http://127.0.0.1:9/nope',
        events: ['ping', 'rag.query'],
      }),
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.endpoint.id).toMatch(/^wh_/);
    expect(data.endpoint.secret.length).toBeGreaterThan(10);
  });

  it('lists endpoints after create', async () => {
    const app = makeApp();
    await app.request(
      '/webhooks/endpoints',
      json({ name: 'a', url: 'https://example.com/h', events: ['ping'] }),
    );
    const res = await app.request('/webhooks/endpoints');
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.items[0].secretPreview).toBeTruthy();
  });

  it('signBody is deterministic', () => {
    const a = signBody('sec', '{"a":1}');
    const b = signBody('sec', '{"a":1}');
    expect(a).toBe(b);
    expect(a.startsWith('sha256=')).toBe(true);
  });

  it('DELETE removes endpoint', async () => {
    const app = makeApp();
    const created = await app.request(
      '/webhooks/endpoints',
      json({ name: 'a', url: 'https://example.com/h' }),
    );
    const { endpoint } = await created.json();
    const del = await app.request(`/webhooks/endpoints/${endpoint.id}`, { method: 'DELETE' });
    expect(del.status).toBe(200);
    const list = await (await app.request('/webhooks/endpoints')).json();
    expect(list.total).toBe(0);
  });
});
