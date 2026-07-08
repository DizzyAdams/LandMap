import { Hono } from 'hono';
import type { Env } from '../../index.js';

export function createLLMHealthcheckRouter() {
  const router = new Hono<Env>();

  router.get('/healthcheck', (c) => {
    return c.json({ status: 'ok', module: '@landmap/llm', checkedAt: new Date().toISOString() });
  });

  return router;
}
