/**
 * Core domain types for the LandMap autonomous Sales Agent.
 *
 * The agent mirrors the architecture of best-in-class revenue engines
 * (11x.ai, Clay, Salesforce Agentforce, Artisan Ava, Regie.ai, Attio):
 * a reasoning core decomposes the sales motion into specialised
 * sub-agents orchestrated under a single autonomy policy with
 * human-in-the-loop escalation.
 */

export type AutonomyLevel = 'off' | 'copilot' | 'autopilot';

export type SalesChannel = 'email' | 'whatsapp' | 'sms' | 'call' | 'social';

export type PipelineStage =
  | 'captured'
  | 'contacted'
  | 'qualified'
  | 'scheduled'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export const PIPELINE_STAGES: PipelineStage[] = [
  'captured',
  'contacted',
  'qualified',
  'scheduled',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

export const STAGE_LABEL: Record<PipelineStage, string> = {
  captured: 'Captado',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  scheduled: 'Reunião agendada',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed_won: 'Fechado (ganho)',
  closed_lost: 'Fechado (perdido)',
};

export type LeadTier = 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  /** Acquisition source (organic, referral, campaign, outbound, inbound). */
  source: string;
  /** Stated interest, e.g. "Apartamento 2 quartos Curitiba". */
  interest: string;
  budgetMin?: number;
  budgetMax?: number;
  /** Detected buying signals (funding, job change, price drop, etc.). */
  signals: string[];
  createdAt: string;
  engagementCount: number;
  /** 0–100 fit score, populated by the Qualifier agent. */
  score?: number;
  tier?: LeadTier;
  /** Whether the lead has been promoted into the pipeline as a Deal. */
  worked?: boolean;
}

export interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: PipelineStage;
  /** Expected value in BRL. */
  amount: number;
  currency: string;
  /** 0–1 win probability, maintained by the Forecaster. */
  probability: number;
  /** Agent id currently owning the deal. */
  ownerAgent: string;
  property?: string;
  nextAction?: string;
  lastActivityAt: string;
  createdAt: string;
  notes?: string;
}

export type TaskKind =
  | 'outreach'
  | 'follow_up'
  | 'schedule'
  | 'proposal'
  | 'handoff'
  | 'review'
  | 'forecast';

export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'done';

export interface SalesTask {
  id: string;
  kind: TaskKind;
  agentId: string;
  dealId?: string;
  leadId?: string;
  title: string;
  detail: string;
  channel?: SalesChannel;
  /** Generated 1:1 personalised draft (email / WhatsApp / proposal). */
  draft?: string;
  /** When approved/auto-run, the deal advances to this stage. */
  advanceTo?: PipelineStage;
  /** When approved/auto-run, create a deal for the linked lead. */
  createDeal?: { amount: number; title: string };
  /** The concrete mutation this task performs when approved/auto-run. */
  effect?: SalesEffect;
  status: TaskStatus;
  createdAt: string;
  dueAt?: string;
}

export type AgentRole =
  | 'prospector'
  | 'qualifier'
  | 'outreacher'
  | 'closer'
  | 'account_manager'
  | 'forecaster';

export interface SalesAgent {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'paused';
  currentTask?: string;
  actionsToday: number;
  successToday: number;
  /** Last action summary for the cockpit roster. */
  lastActionAt?: string;
}

export type EventKind =
  | 'prospect'
  | 'score'
  | 'outreach'
  | 'reply'
  | 'meeting'
  | 'stage'
  | 'forecast'
  | 'handoff'
  | 'note';

export type EventLevel = 'info' | 'success' | 'warn' | 'escalation';

export interface AgentEvent {
  id: string;
  at: string;
  agentId: string;
  kind: EventKind;
  title: string;
  detail?: string;
  dealId?: string;
  leadId?: string;
  level: EventLevel;
}

export interface ChannelPerf {
  channel: SalesChannel;
  sent: number;
  replies: number;
  replyRate: number;
}

export interface SalesAnalytics {
  funnel: { stage: PipelineStage; count: number; value: number }[];
  totals: {
    pipelineValue: number;
    weightedPipeline: number;
    wonValue: number;
    wonCount: number;
    lostCount: number;
    winRate: number;
    avgDealSize: number;
    meetingsBooked: number;
    forecasts: number;
  };
  channelPerformance: ChannelPerf[];
  forecast: { period: string; expectedValue: number; confidence: number };
  agentProductivity: { agentId: string; name: string; actions: number; success: number }[];
}

/** A unit of work an agent wants to apply to the world. */
export type SalesEffect =
  | { type: 'lead'; lead: Lead }
  | { type: 'deal'; deal: Deal }
  | { type: 'event'; event: AgentEvent }
  | { type: 'task'; task: SalesTask }
  | { type: 'updateLead'; id: string; patch: Partial<Lead> }
  | { type: 'updateDeal'; id: string; patch: Partial<Deal> };

/** Adapter that pushes closed/won deals and captured leads into an external CRM. */
export interface CrmAdapter {
  syncDeal(deal: Deal): void | Promise<void>;
  syncLead?(lead: Lead): void | Promise<void>;
}

export interface AgentContext {
  store: import('./store.js').SalesStore;
  autonomy: AutonomyLevel;
  rng: () => number;
  now: () => string;
  /** Optional LLM hook. When provided, drafts are composed by the model. */
  compose?: (prompt: string) => string | Promise<string>;
  /** Optional CRM sink (e.g. Twenty) for syncing deals/leads on close. */
  crm?: CrmAdapter;
}

export interface SalesState {
  autonomy: AutonomyLevel;
  agents: SalesAgent[];
  leads: Lead[];
  deals: Deal[];
  tasks: SalesTask[];
  events: AgentEvent[];
  analytics: SalesAnalytics;
  generatedAt: string;
}

export interface CycleResult {
  events: AgentEvent[];
  tasks: SalesTask[];
  leads: Lead[];
  deals: Deal[];
  autonomy: AutonomyLevel;
  generatedAt: string;
}
