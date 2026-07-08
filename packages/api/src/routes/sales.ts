import { Hono } from 'hono';
import {
  createInitialStore,
  runCycle,
  approveTask,
  rejectTask,
  setAutonomy,
  mulberry32,
  NoopCrm,
} from '@landmap/sales';
import type { AutonomyLevel, SalesStore } from '@landmap/sales';

/* Persist the engine across warm serverless invocations. Cold starts
   re-seed a fresh demo store. */
const g = globalThis as unknown as { __landmapSalesStore?: SalesStore };
function getStore(): SalesStore {
  if (!g.__landmapSalesStore) g.__landmapSalesStore = createInitialStore();
  return g.__landmapSalesStore;
}

function makeCtx(store: SalesStore) {
  const rng = mulberry32((Date.now() & 0xffffffff) || 1);
  return {
    store,
    autonomy: store.autonomy,
    rng,
    now: () => new Date().toISOString(),
    crm: new NoopCrm(),
  };
}

export function createSalesRouter() {
  const app = new Hono();

  app.get('/state', (c) => {
    const store = getStore();
    store.recomputeAnalytics();
    return c.json(store.toState());
  });

  app.post('/cycle', async (c) => {
    const store = getStore();
    const body = (await c.req.json().catch(() => ({}))) as { autonomy?: AutonomyLevel };
    if (body.autonomy) setAutonomy(store, body.autonomy);
    const result = await runCycle(store, makeCtx(store));
    return c.json({ result, state: store.toState() });
  });

  app.post('/autonomy', async (c) => {
    const store = getStore();
    const body = (await c.req.json().catch(() => ({}))) as { level?: AutonomyLevel };
    if (body.level) setAutonomy(store, body.level);
    return c.json({ autonomy: store.autonomy });
  });

  app.post('/approve/:id', (c) => {
    const store = getStore();
    const task = approveTask(store, c.req.param('id'));
    store.recomputeAnalytics();
    return c.json({ task, state: store.toState() });
  });

  app.post('/reject/:id', (c) => {
    const store = getStore();
    const task = rejectTask(store, c.req.param('id'));
    store.recomputeAnalytics();
    return c.json({ task, state: store.toState() });
  });

  return app;
}
