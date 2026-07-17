/**
 * Side-effect-free platform surface (RAG + webhooks) for Next.js /api proxy.
 * Does NOT load properties.json or full admin stack.
 */
import { Hono } from 'hono';
import { createRagRouter } from './routes/rag.js';
import { createWebhooksRouter } from './routes/webhooks.js';
import { createSalesRouter } from './routes/sales.js';

export { createRagRouter } from './routes/rag.js';
export { createWebhooksRouter } from './routes/webhooks.js';
export { createSalesRouter } from './routes/sales.js';
export { emitWebhook, signBody } from './webhooks/store.js';

const platform = new Hono();
platform.route('/rag', createRagRouter());
platform.route('/webhooks', createWebhooksRouter());
platform.route('/sales', createSalesRouter());


export default platform;

/** Forward a Next.js Request under /api/* into this Hono app (strips /api). */
export async function platformFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const target = new URL(path + url.search, 'http://landmap.platform');
  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }
  return platform.fetch(new Request(target, init));
}
