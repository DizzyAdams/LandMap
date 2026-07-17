/**
 * CRM adapter for the sales engine.
 * - Always writes to an in-process LandMap CRM ledger (real data plane for admin).
 * - When TWENTY_BASE_URL + TWENTY_API_KEY are set, also pushes to Twenty CRM.
 */
import type { CrmAdapter, Deal, Lead } from '@landmap/sales';

export type CrmSyncRecord = {
  id: string;
  at: string;
  kind: 'lead' | 'deal';
  entityId: string;
  title: string;
  target: 'landmap' | 'twenty' | 'both';
  ok: boolean;
  error?: string;
  externalId?: string;
};

export type CrmStatus = {
  mode: 'live' | 'ledger';
  twentyConfigured: boolean;
  twentyBaseUrl?: string;
  ledgerLeads: number;
  ledgerDeals: number;
  recentSyncs: number;
};

type LedgerLead = Lead & { crmId: string; syncedAt: string };
type LedgerDeal = Deal & { crmId: string; syncedAt: string };

const g = globalThis as unknown as {
  __landmapCrmLeads?: Map<string, LedgerLead>;
  __landmapCrmDeals?: Map<string, LedgerDeal>;
  __landmapCrmSyncs?: CrmSyncRecord[];
};

function ledgerLeads() {
  if (!g.__landmapCrmLeads) g.__landmapCrmLeads = new Map();
  return g.__landmapCrmLeads;
}
function ledgerDeals() {
  if (!g.__landmapCrmDeals) g.__landmapCrmDeals = new Map();
  return g.__landmapCrmDeals;
}
function ledgerSyncs() {
  if (!g.__landmapCrmSyncs) g.__landmapCrmSyncs = [];
  return g.__landmapCrmSyncs;
}

function pushSync(rec: CrmSyncRecord) {
  const list = ledgerSyncs();
  list.unshift(rec);
  if (list.length > 200) list.length = 200;
}

function twentyConfig(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = (process.env.TWENTY_BASE_URL || '').replace(/\/$/, '');
  const apiKey = process.env.TWENTY_API_KEY || '';
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey };
}

async function twentyRequest<T>(
  cfg: { baseUrl: string; apiKey: string },
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Twenty ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Map LandMap pipeline stages to Twenty subset. */
function toTwentyStage(stage: string): string {
  const allowed = new Set([
    'captured',
    'contacted',
    'qualified',
    'scheduled',
    'closed_won',
    'closed_lost',
  ]);
  if (allowed.has(stage)) return stage;
  if (stage === 'proposal' || stage === 'negotiation') return 'scheduled';
  return 'captured';
}

export function getCrmStatus(): CrmStatus {
  const cfg = twentyConfig();
  return {
    mode: cfg ? 'live' : 'ledger',
    twentyConfigured: Boolean(cfg),
    twentyBaseUrl: cfg?.baseUrl,
    ledgerLeads: ledgerLeads().size,
    ledgerDeals: ledgerDeals().size,
    recentSyncs: ledgerSyncs().length,
  };
}

export function listCrmLedger() {
  return {
    leads: [...ledgerLeads().values()],
    deals: [...ledgerDeals().values()],
    syncs: ledgerSyncs().slice(0, 50),
    status: getCrmStatus(),
  };
}

export class LandMapCrmAdapter implements CrmAdapter {
  async syncLead(lead: Lead): Promise<void> {
    const at = new Date().toISOString();
    const crmId = `lm_lead_${lead.id}`;
    ledgerLeads().set(lead.id, { ...lead, crmId, syncedAt: at });

    const cfg = twentyConfig();
    let externalId: string | undefined;
    let ok = true;
    let error: string | undefined;
    let target: CrmSyncRecord['target'] = 'landmap';

    if (cfg) {
      target = 'both';
      try {
        const res = await twentyRequest<{ data?: { lead?: { id?: string }; person?: { id?: string } } }>(
          cfg,
          '/leads',
          {
            method: 'POST',
            body: JSON.stringify({
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              status: lead.tier ?? 'new',
              source: lead.source ?? 'landmap',
              score: lead.score,
            }),
          },
        );
        externalId = res?.data?.lead?.id;
      } catch (e) {
        ok = false;
        error = e instanceof Error ? e.message : 'twenty error';
      }
    }

    pushSync({
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      at,
      kind: 'lead',
      entityId: lead.id,
      title: lead.name,
      target,
      ok,
      error,
      externalId,
    });
  }

  async syncDeal(deal: Deal): Promise<void> {
    const at = new Date().toISOString();
    const crmId = `lm_deal_${deal.id}`;
    ledgerDeals().set(deal.id, { ...deal, crmId, syncedAt: at });

    const cfg = twentyConfig();
    let externalId: string | undefined;
    let ok = true;
    let error: string | undefined;
    let target: CrmSyncRecord['target'] = 'landmap';

    if (cfg) {
      target = 'both';
      try {
        const res = await twentyRequest<{ data?: { opportunity?: { id?: string } } }>(cfg, '/opportunities', {
          method: 'POST',
          body: JSON.stringify({
            title: deal.title,
            stage: toTwentyStage(deal.stage),
            amount: deal.amount,
            currency: deal.currency || 'BRL',
            leadId: deal.leadId,
            notes: deal.notes,
          }),
        });
        externalId = res?.data?.opportunity?.id;
      } catch (e) {
        ok = false;
        error = e instanceof Error ? e.message : 'twenty error';
      }
    }

    pushSync({
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      at,
      kind: 'deal',
      entityId: deal.id,
      title: deal.title,
      target,
      ok,
      error,
      externalId,
    });
  }
}

export function createCrmAdapter(): CrmAdapter {
  return new LandMapCrmAdapter();
}

/** Sync all open leads + deals currently in the sales store. */
export async function syncStoreToCrm(store: {
  leads: Lead[];
  deals: Deal[];
}): Promise<{ leads: number; deals: number; status: CrmStatus }> {
  const crm = createCrmAdapter();
  for (const lead of store.leads) {
    await crm.syncLead?.(lead);
  }
  for (const deal of store.deals) {
    await crm.syncDeal(deal);
  }
  return {
    leads: store.leads.length,
    deals: store.deals.length,
    status: getCrmStatus(),
  };
}
