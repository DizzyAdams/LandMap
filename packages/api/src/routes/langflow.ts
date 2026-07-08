import { Hono } from 'hono';
import {
  listWorkflows,
  runWorkflowById,
  getWorkflowDefinition,
} from '@landmap/llm/langflow/registry.js';
import type { Env } from '../index.js';

export function createLangflowRouter() {
  const router = new Hono<Env>();

  router.get('/workflows', (c) => {
    return c.json({ ok: true, items: listWorkflows() });
  });

  router.get('/workflows/:id', (c) => {
    const id = c.req.param('id');
    const def = getWorkflowDefinition(id);
    if (!def) {
      return c.json({ ok: false, error: 'Workflow not found' }, 404);
    }
    return c.json({ ok: true, data: def });
  });

  router.post('/workflows/:id/run', async (c) => {
    const id = c.req.param('id');
    let body: Record<string, unknown> = {};
    try {
      body = await c.req.json<Record<string, unknown>>();
    } catch {
      body = {};
    }

    const result = await runWorkflowById(id, body);
    const status = result.status === 'error' ? 422 : 200;
    return c.json({ ok: result.status !== 'error', result }, status);
  });

  return router;
}
