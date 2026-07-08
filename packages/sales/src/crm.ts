import type { CrmAdapter, Deal, Lead } from './types.js';

/** Default adapter: no external CRM configured. */
export class NoopCrm implements CrmAdapter {
  syncDeal(_deal: Deal): void {}
  syncLead?(_lead: Lead): void {}
}

/** Adapter that records synced records locally — handy for demos and tests. */
export class CollectingCrm implements CrmAdapter {
  deals: Deal[] = [];
  leads: Lead[] = [];
  syncDeal(deal: Deal): void {
    this.deals.push(deal);
  }
  syncLead?(lead: Lead): void {
    this.leads.push(lead);
  }
}
