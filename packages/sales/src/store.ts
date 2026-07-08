import type {
  AgentEvent,
  AutonomyLevel,
  CycleResult,
  Deal,
  Lead,
  PipelineStage,
  SalesAgent,
  SalesAnalytics,
  SalesChannel,
  SalesEffect,
  SalesState,
  SalesTask,
} from './types.js';
import { PIPELINE_STAGES } from './types.js';

export interface ChannelStats {
  sent: number;
  replies: number;
}

function emptyAnalytics(): SalesAnalytics {
  return {
    funnel: PIPELINE_STAGES.map((stage) => ({ stage, count: 0, value: 0 })),
    totals: {
      pipelineValue: 0,
      weightedPipeline: 0,
      wonValue: 0,
      wonCount: 0,
      lostCount: 0,
      winRate: 0,
      avgDealSize: 0,
      meetingsBooked: 0,
      forecasts: 0,
    },
    channelPerformance: [],
    forecast: { period: 'Próximos 30 dias', expectedValue: 0, confidence: 0 },
    agentProductivity: [],
  };
}

/**
 * Single source of truth for the autonomous sales engine. Holds the live
 * roster, leads, deals, tasks and the event stream, and recomputes the
 * analytics view the cockpit renders.
 */
export class SalesStore {
  autonomy: AutonomyLevel = 'copilot';
  agents: SalesAgent[] = [];
  leads: Lead[] = [];
  deals: Deal[] = [];
  tasks: SalesTask[] = [];
  events: AgentEvent[] = [];
  analytics: SalesAnalytics = emptyAnalytics();
  channelStats: Record<SalesChannel, ChannelStats> = {
    email: { sent: 0, replies: 0 },
    whatsapp: { sent: 0, replies: 0 },
    sms: { sent: 0, replies: 0 },
    call: { sent: 0, replies: 0 },
    social: { sent: 0, replies: 0 },
  };

  constructor(init?: Partial<SalesStore>) {
    if (init) Object.assign(this, init);
  }

  /* ─── Leads ─── */
  addLead(lead: Lead): Lead {
    this.leads.push(lead);
    return lead;
  }
  getLead(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }
  updateLead(id: string, patch: Partial<Lead>): Lead | undefined {
    const lead = this.getLead(id);
    if (lead) Object.assign(lead, patch);
    return lead;
  }

  /* ─── Deals ─── */
  addDeal(deal: Deal): Deal {
    this.deals.push(deal);
    return deal;
  }
  getDeal(id: string): Deal | undefined {
    return this.deals.find((d) => d.id === id);
  }
  updateDeal(id: string, patch: Partial<Deal>): Deal | undefined {
    const deal = this.getDeal(id);
    if (deal) Object.assign(deal, patch);
    return deal;
  }

  /* ─── Tasks ─── */
  addTask(task: SalesTask): SalesTask {
    this.tasks.push(task);
    return task;
  }
  getTask(id: string): SalesTask | undefined {
    return this.tasks.find((t) => t.id === id);
  }
  updateTask(id: string, patch: Partial<SalesTask>): SalesTask | undefined {
    const task = this.getTask(id);
    if (task) Object.assign(task, patch);
    return task;
  }

  /* ─── Events ─── */
  addEvent(event: AgentEvent): AgentEvent {
    this.events.unshift(event);
    if (this.events.length > 200) this.events.length = 200;
    return event;
  }
  getAgent(id: string): SalesAgent | undefined {
    return this.agents.find((a) => a.id === id);
  }

  pendingTasks(): SalesTask[] {
    return this.tasks.filter((t) => t.status === 'pending');
  }
  openDeals(): Deal[] {
    return this.deals.filter(
      (d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost',
    );
  }

  /** Recompute the analytics view from current state. */
  recomputeAnalytics(): SalesAnalytics {
    const funnel = PIPELINE_STAGES.map((stage: PipelineStage) => {
      const deals = this.deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: deals.length,
        value: deals.reduce((sum, d) => sum + d.amount, 0),
      };
    });

    const open = this.openDeals();
    const won = this.deals.filter((d) => d.stage === 'closed_won');
    const lost = this.deals.filter((d) => d.stage === 'closed_lost');
    const pipelineValue = open.reduce((s, d) => s + d.amount, 0);
    const weightedPipeline = open.reduce((s, d) => s + d.amount * d.probability, 0);
    const wonValue = won.reduce((s, d) => s + d.amount, 0);
    const totalClosed = won.length + lost.length;

    const channelPerformance = (Object.keys(this.channelStats) as SalesChannel[]).map(
      (channel) => {
        const s = this.channelStats[channel];
        return {
          channel,
          sent: s.sent,
          replies: s.replies,
          replyRate: s.sent ? Number((s.replies / s.sent).toFixed(2)) : 0,
        };
      },
    );

    const meetingsBooked = this.deals.filter(
      (d) =>
        d.stage === 'scheduled' ||
        d.stage === 'proposal' ||
        d.stage === 'negotiation',
    ).length;

    const analytics: SalesAnalytics = {
      funnel,
      totals: {
        pipelineValue,
        weightedPipeline: Math.round(weightedPipeline),
        wonValue,
        wonCount: won.length,
        lostCount: lost.length,
        winRate: totalClosed ? Number((won.length / totalClosed).toFixed(2)) : 0,
        avgDealSize: won.length ? Math.round(wonValue / won.length) : 0,
        meetingsBooked,
        forecasts: this.events.filter((e) => e.kind === 'forecast').length,
      },
      channelPerformance,
      forecast: {
        period: 'Próximos 30 dias',
        expectedValue: Math.round(weightedPipeline),
        confidence: Math.min(0.95, 0.4 + open.length * 0.05),
      },
      agentProductivity: this.agents.map((a) => ({
        agentId: a.id,
        name: a.name,
        actions: a.actionsToday,
        success: a.successToday,
      })),
    };
    this.analytics = analytics;
    return analytics;
  }

  toState(): SalesState {
    return {
      autonomy: this.autonomy,
      agents: this.agents.map((a) => ({ ...a })),
      leads: this.leads.map((l) => ({ ...l })),
      deals: this.deals.map((d) => ({ ...d })),
      tasks: this.tasks.map((t) => ({ ...t })),
      events: this.events.map((e) => ({ ...e })),
      analytics: this.analytics,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Snapshot of the effects applied during one cycle, for the UI. */
  static cycleResult(
    store: SalesStore,
    effects: SalesEffect[],
    autonomy: AutonomyLevel,
  ): CycleResult {
    const pick = <T extends SalesEffect['type']>(type: T) =>
      effects
        .filter((e) => e.type === type)
        .map((e) => (e as Extract<SalesEffect, { type: T }>) as any);
    return {
      events: pick('event'),
      tasks: pick('task'),
      leads: pick('lead'),
      deals: pick('deal'),
      autonomy,
      generatedAt: new Date().toISOString(),
    };
  }
}

