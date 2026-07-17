import { Hono } from 'hono';
import {
  createInitialStore,
  runCycle,
  runFollowUpCycle,
  runStandbyTick,
  approveTask,
  rejectTask,
  setAutonomy,
  mulberry32,
} from '@landmap/sales';
import type { AutonomyLevel, SalesStore } from '@landmap/sales';
import { emitWebhook } from '../webhooks/store.js';
import { createCrmAdapter, getCrmStatus, listCrmLedger, syncStoreToCrm } from '../crm/adapter.js';
import { computeDueAlerts, dueAlertSummary } from '../crm/due-alerts.js';

const g = globalThis as unknown as {
  __landmapSalesStore?: SalesStore;
  __landmapSalesLastTick?: string;
  __landmapSalesTickCount?: number;
  __landmapDueAlerted?: Set<string>;
};

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
    crm: createCrmAdapter(),
  };
}

function metaOf(store: SalesStore) {
  const followUps = store.pendingTasks().filter((t) => t.kind === 'follow_up');
  const due = computeDueAlerts(store);
  return {
    teamSize: store.agents.length,
    standby: store.agents.filter((a) => a.status === 'idle' || a.status === 'paused').length,
    running: store.agents.filter((a) => a.status === 'running').length,
    pendingFollowUps: followUps.length,
    pendingTasks: store.pendingTasks().length,
    lastTickAt: g.__landmapSalesLastTick ?? null,
    tickCount: g.__landmapSalesTickCount ?? 0,
    followupSquad: store.agents
      .filter((a) => ['followup', 'cold_recovery', 'waba_followup'].includes(a.role))
      .map((a) => a.id),
    dueAlerts: dueAlertSummary(due),
    crm: getCrmStatus(),
  };
}

/** Emit webhook once per overdue task until approved/rejected. */
function fireDueWebhooks(store: SalesStore) {
  if (!g.__landmapDueAlerted) g.__landmapDueAlerted = new Set();
  const alerts = computeDueAlerts(store);
  for (const a of alerts) {
    if (a.severity !== 'overdue') continue;
    if (g.__landmapDueAlerted.has(a.taskId)) continue;
    g.__landmapDueAlerted.add(a.taskId);
    void emitWebhook('alert.fired', {
      kind: 'follow_up.due',
      severity: a.severity,
      taskId: a.taskId,
      title: a.title,
      dueAt: a.dueAt,
      hoursDelta: a.hoursDelta,
    }).catch(() => {});
  }
  // clear resolved
  for (const id of [...g.__landmapDueAlerted]) {
    const still = store.pendingTasks().some((t) => t.id === id && t.kind === 'follow_up');
    if (!still) g.__landmapDueAlerted.delete(id);
  }
}

export function createSalesRouter() {
  const app = new Hono();

  app.get('/state', (c) => {
    const store = getStore();
    store.recomputeAnalytics();
    fireDueWebhooks(store);
    return c.json({
      ...store.toState(),
      meta: metaOf(store),
    });
  });

  app.get('/agents', (c) => {
    const store = getStore();
    return c.json({
      ok: true,
      autonomy: store.autonomy,
      agents: store.agents.map((a) => ({ ...a })),
      teamSize: store.agents.length,
      meta: metaOf(store),
    });
  });

  app.get('/followups', (c) => {
    const store = getStore();
    const items = store
      .pendingTasks()
      .filter((t) => t.kind === 'follow_up')
      .map((t) => ({
        ...t,
        lead: t.leadId ? store.getLead(t.leadId) : undefined,
        deal: t.dealId ? store.getDeal(t.dealId) : undefined,
      }));
    return c.json({ ok: true, items, total: items.length });
  });

  app.get('/alerts/due', (c) => {
    const store = getStore();
    const items = computeDueAlerts(store);
    fireDueWebhooks(store);
    return c.json({ ok: true, items, summary: dueAlertSummary(items) });
  });

  app.get('/crm', (c) => {
    return c.json({ ok: true, ...listCrmLedger() });
  });

  app.post('/crm/sync', async (c) => {
    const store = getStore();
    const result = await syncStoreToCrm(store);
    void emitWebhook('lead.updated', {
      kind: 'crm.sync',
      ...result,
    }).catch(() => {});
    return c.json({ ok: true, ...result, ledger: listCrmLedger() });
  });

  app.post('/cycle', async (c) => {
    const store = getStore();
    const body = (await c.req.json().catch(() => ({}))) as { autonomy?: AutonomyLevel };
    if (body.autonomy) setAutonomy(store, body.autonomy);
    const result = await runCycle(store, makeCtx(store));
    g.__landmapSalesLastTick = new Date().toISOString();
    g.__landmapSalesTickCount = (g.__landmapSalesTickCount ?? 0) + 1;
    fireDueWebhooks(store);
    void emitWebhook('score.updated', {
      kind: 'sales.cycle',
      autonomy: store.autonomy,
      tasks: result.tasks?.length ?? 0,
    }).catch(() => {});
    return c.json({ result, state: { ...store.toState(), meta: metaOf(store) } });
  });

  app.post('/followups/run', async (c) => {
    const store = getStore();
    const body = (await c.req.json().catch(() => ({}))) as { autonomy?: AutonomyLevel };
    if (body.autonomy) setAutonomy(store, body.autonomy);
    const result = await runFollowUpCycle(store, makeCtx(store));
    g.__landmapSalesLastTick = new Date().toISOString();
    g.__landmapSalesTickCount = (g.__landmapSalesTickCount ?? 0) + 1;
    fireDueWebhooks(store);
    void emitWebhook('lead.updated', {
      kind: 'followup.cycle',
      enqueued: result.tasks?.filter((t) => t.kind === 'follow_up').length ?? 0,
    }).catch(() => {});
    return c.json({ result, state: { ...store.toState(), meta: metaOf(store) } });
  });

  app.post('/tick', async (c) => {
    const store = getStore();
    const body = (await c.req.json().catch(() => ({}))) as {
      mode?: 'followup' | 'full';
    };
    if (store.autonomy === 'off') {
      return c.json({
        ok: true,
        skipped: true,
        reason: 'autonomy_off',
        state: { ...store.toState(), meta: metaOf(store) },
      });
    }
    const result =
      body.mode === 'full'
        ? await runCycle(store, makeCtx(store))
        : await runStandbyTick(store, makeCtx(store));
    g.__landmapSalesLastTick = new Date().toISOString();
    g.__landmapSalesTickCount = (g.__landmapSalesTickCount ?? 0) + 1;
    fireDueWebhooks(store);
    return c.json({
      ok: true,
      skipped: false,
      result,
      state: { ...store.toState(), meta: metaOf(store) },
    });
  });

  app.post('/autonomy', async (c) => {
    const store = getStore();
    const body = (await c.req.json().catch(() => ({}))) as { level?: AutonomyLevel };
    if (body.level) setAutonomy(store, body.level);
    for (const a of store.agents) {
      if (store.autonomy === 'off') {
        a.status = 'paused';
        a.currentTask = 'Em espera (autonomia off)';
      } else if (a.status === 'paused') {
        a.status = 'idle';
        a.currentTask = 'Em espera na fila';
      }
    }
    return c.json({ autonomy: store.autonomy, agents: store.agents, meta: metaOf(store) });
  });

  app.post('/approve/:id', async (c) => {
    const store = getStore();
    const task = approveTask(store, c.req.param('id'));
    store.recomputeAnalytics();
    const crm = createCrmAdapter();
    if (task?.leadId) {
      const lead = store.getLead(task.leadId);
      if (lead) await crm.syncLead?.(lead);
    }
    if (task?.dealId) {
      const deal = store.getDeal(task.dealId);
      if (deal) await crm.syncDeal(deal);
    }
    if (task?.kind === 'follow_up') {
      void emitWebhook('lead.updated', {
        kind: 'follow_up.approved',
        taskId: task.id,
        leadId: task.leadId,
      }).catch(() => {});
    }
    return c.json({ task, state: { ...store.toState(), meta: metaOf(store) } });
  });

  app.post('/reject/:id', (c) => {
    const store = getStore();
    const task = rejectTask(store, c.req.param('id'));
    store.recomputeAnalytics();
    return c.json({ task, state: { ...store.toState(), meta: metaOf(store) } });
  });

  app.post('/approve-all-followups', async (c) => {
    const store = getStore();
    const ids = store.pendingTasks().filter((t) => t.kind === 'follow_up').map((t) => t.id);
    const crm = createCrmAdapter();
    const approved = [];
    for (const id of ids) {
      const task = approveTask(store, id);
      if (task) {
        approved.push(task);
        if (task.leadId) {
          const lead = store.getLead(task.leadId);
          if (lead) await crm.syncLead?.(lead);
        }
      }
    }
    store.recomputeAnalytics();
    return c.json({
      ok: true,
      count: approved.length,
      state: { ...store.toState(), meta: metaOf(store) },
    });
  });

  return app;
}
