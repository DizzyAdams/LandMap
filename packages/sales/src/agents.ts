import type {
  AgentContext,
  AgentEvent,
  AgentRole,
  Deal,
  Lead,
  SalesAgent,
  SalesEffect,
  SalesTask,
} from './types.js';
import { SalesStore } from './store.js';
import { clamp, pick, uid } from './util.js';

export interface AgentDef {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  run(ctx: AgentContext, store: SalesStore): SalesEffect[];
}

/* ─── Reference data (personas, markets, signals) ─── */

const FIRST_NAMES = [
  'Ana', 'Carlos', 'Marina', 'Rafael', 'Juliana', 'Pedro', 'Larissa', 'Gabriel',
  'Fernanda', 'Lucas', 'Beatriz', 'Thiago', 'Amanda', 'Bruno', 'Camila', 'Diego',
  'Patrícia', 'Vinícius', 'Letícia', 'Eduardo',
];
const LAST_NAMES = [
  'Silva', 'Oliveira', 'Santos', 'Costa', 'Lima', 'Almeida', 'Souza', 'Pereira',
  'Rodrigues', 'Martins', 'Carvalho', 'Gomes', 'Nunes', 'Ribeiro', 'Barbosa', 'Araújo',
];
const CITIES = [
  { city: 'Curitiba', state: 'PR' },
  { city: 'Florianópolis', state: 'SC' },
  { city: 'São Paulo', state: 'SP' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Recife', state: 'PE' },
];
const INTERESTS = [
  'Apartamento 2 quartos',
  'Casa com piscina',
  'Cobertura centro',
  'Terreno 360 m²',
  'Studio para investimento',
  'Sala comercial',
  'Casa de campo',
  'Apartamento de frente ao mar',
];
const SIGNALS = [
  'queda de preço 8%',
  'novo lançamento na região',
  'mudança de empresa',
  'pré-aprovação de crédito',
  'visitou 3 imóveis esta semana',
  'aniversário de cidade',
  'reinício de FGTS',
  'ampliação de família',
];
const SOURCES = ['orgânico', 'campanha', 'indicação', 'outbound', 'inbound'];

function sampleSignals(rng: () => number): string[] {
  const n = 1 + Math.floor(rng() * 3);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(pick(SIGNALS, rng));
  return Array.from(new Set(out));
}

function scoreLead(lead: Lead, rng: () => number): { score: number; tier: 'hot' | 'warm' | 'cold' } {
  let score = 45;
  score += lead.signals.length * 7;
  if (lead.budgetMax && lead.budgetMax > 500000) score += 12;
  else if (lead.budgetMax && lead.budgetMax > 250000) score += 6;
  score += Math.min(lead.engagementCount, 5) * 2;
  score += rng() * 6;
  score = clamp(Math.round(score), 0, 100);
  const tier: Lead['tier'] = score >= 80 ? 'hot' : score >= 64 ? 'warm' : 'cold';
  return { score, tier };
}

export function createRoster(): SalesAgent[] {
  const base: Array<[AgentRole, string, string]> = [
    ['prospector', 'Caçadora', 'Explora sinais de mercado e gera novos leads qualificados.'],
    ['qualifier', 'Qualificadora', 'Pontua fit e intenção, promovendo leads quentes a negócios.'],
    ['outreacher', 'Outbound', 'Redige e dispara mensagens 1:1 multicanal (e-mail/WhatsApp).'],
    ['closer', 'Fechadora', 'Agenda visitas, envia propostas e conduz a negociação.'],
    ['account_manager', 'Sucesso', 'Cuida do pós-venda, handoff e sincroniza o CRM.'],
    ['forecaster', 'Previsora', 'Recalcula probabilidade e prevê receita do pipeline.'],
  ];
  return base.map(([role, name, description]) => ({
    id: `agent-${role}`,
    role,
    name,
    description,
    status: 'idle',
    actionsToday: 0,
    successToday: 0,
  }));
}

/* ─── Prospector ─── */

export const prospector: AgentDef = {
  id: 'agent-prospector',
  role: 'prospector',
  name: 'Caçadora',
  description: 'Explora sinais de mercado e gera novos leads qualificados.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    const n = 1 + Math.floor(ctx.rng() * 2);
    for (let i = 0; i < n; i++) {
      const place = pick(CITIES, ctx.rng);
      const interest = pick(INTERESTS, ctx.rng);
      const budgetMax = 220000 + Math.floor(ctx.rng() * 900000);
      const lead: Lead = {
        id: uid('lead'),
        name: `${pick(FIRST_NAMES, ctx.rng)} ${pick(LAST_NAMES, ctx.rng)}`,
        email: `contato${store.leads.length + i + 1}@email.com`,
        phone: `(41) 9${String(9000 + Math.floor(ctx.rng() * 999)).slice(0, 4)}-${String(1000 + Math.floor(ctx.rng() * 8999)).slice(0, 4)}`,
        city: place.city,
        state: place.state,
        source: pick(SOURCES, ctx.rng),
        interest,
        budgetMin: Math.round(budgetMax * 0.6),
        budgetMax,
        signals: sampleSignals(ctx.rng),
        createdAt: ctx.now(),
        engagementCount: 0,
      };
      const event: AgentEvent = {
        id: uid('evt'),
        at: ctx.now(),
        agentId: this.id,
        kind: 'prospect',
        title: `Novo lead: ${lead.name}`,
        detail: `${lead.interest} · ${lead.city}/${lead.state} · sinais: ${lead.signals.join(', ')}`,
        leadId: lead.id,
        level: 'info',
      };
      effects.push({ type: 'lead', lead }, { type: 'event', event });
    }
    return effects;
  },
};

/* ─── Qualifier ─── */

export const qualifier: AgentDef = {
  id: 'agent-qualifier',
  role: 'qualifier',
  name: 'Qualificadora',
  description: 'Pontua fit e intenção, promovendo leads quentes a negócios.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    for (const lead of store.leads) {
      if (lead.score !== undefined) continue;
      const { score, tier } = scoreLead(lead, ctx.rng);
      effects.push({ type: 'updateLead', id: lead.id, patch: { score, tier } });
      const event: AgentEvent = {
        id: uid('evt'),
        at: ctx.now(),
        agentId: this.id,
        kind: 'score',
        title: `${lead.name} · ${tier.toUpperCase()} (${score})`,
        detail: `Interesse: ${lead.interest} · orçamento até ${lead.budgetMax}`,
        leadId: lead.id,
        level: tier === 'hot' ? 'success' : tier === 'warm' ? 'info' : 'warn',
      };
      effects.push({ type: 'event', event });

      if (tier === 'hot' && !store.deals.some((d) => d.leadId === lead.id)) {
        const amount = Math.round((lead.budgetMax ?? 400000) * 0.95);
        const deal: Deal = {
          id: uid('deal'),
          leadId: lead.id,
          title: `${lead.interest} — ${lead.name}`,
          stage: 'qualified',
          amount,
          currency: 'BRL',
          probability: 0.4,
          ownerAgent: this.id,
          property: lead.interest,
          nextAction: 'Qualificar interesse e agendar visita',
          lastActivityAt: ctx.now(),
          createdAt: ctx.now(),
        };
        const task: SalesTask = {
          id: uid('task'),
          kind: 'review',
          agentId: this.id,
          leadId: lead.id,
          title: `Abrir negócio: ${lead.name}`,
          detail: `Lead quente detectado. Criar oportunidade de ${amount} BRL.`,
          channel: 'email',
          createDeal: { amount, title: deal.title },
          effect: { type: 'deal', deal },
          status: 'pending',
          createdAt: ctx.now(),
        };
        effects.push({ type: 'task', task });
      }
    }
    return effects;
  },
};

/* ─── Outreacher (Regie.ai-style 1:1 drafts) ─── */

function draftOutreach(lead: Lead, channel: 'email' | 'whatsapp', ctx: AgentContext): string {
  const hook = lead.signals[0] ?? 'seu interesse imobiliário';
  const base = `Oi ${lead.name.split(' ')[0]}, vi que você busca ${lead.interest} em ${lead.city} — e notei ${hook}.`;
  const cta =
    channel === 'email'
      ? 'Posso te enviar 3 opções que encaixam no seu orçamento de até ' +
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.budgetMax ?? 0) +
        '?'
      : 'Te mando 3 opções agora? 🙂';
  const body = `${base} ${cta}`;
  if (ctx.compose) {
    try {
      const composed = ctx.compose(`Escreva uma mensagem de prospecção 1:1, curta e com valor, para ${lead.name} sobre ${lead.interest} em ${lead.city}. Sinal: ${hook}.`);
      if (typeof composed === 'string' && composed.trim()) return composed;
    } catch {
      /* fall back to template */
    }
  }
  return body;
}

export const outreacher: AgentDef = {
  id: 'agent-outreacher',
  role: 'outreacher',
  name: 'Outbound',
  description: 'Redige e dispara mensagens 1:1 multicanal (e-mail/WhatsApp).',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    const targets = store.leads.filter(
      (l) => !l.worked && (l.tier === 'hot' || l.tier === 'warm') && l.engagementCount < 2,
    );
    for (const lead of targets.slice(0, 3)) {
      const channel = ctx.rng() > 0.5 ? 'email' : 'whatsapp';
      const draft = draftOutreach(lead, channel, ctx);
      const task: SalesTask = {
        id: uid('task'),
        kind: ctx.rng() > 0.6 ? 'follow_up' : 'outreach',
        agentId: this.id,
        leadId: lead.id,
        title: `Outreach ${channel} → ${lead.name}`,
        detail: draft,
        draft,
        channel,
        status: 'pending',
        createdAt: ctx.now(),
      };
      const event: AgentEvent = {
        id: uid('evt'),
        at: ctx.now(),
        agentId: this.id,
        kind: 'outreach',
        title: `Rascunho ${channel} pronto`,
        detail: `${lead.name} · ${lead.tier}`,
        leadId: lead.id,
        level: 'info',
      };
      effects.push({ type: 'task', task }, { type: 'event', event });
    }
    return effects;
  },
};


/* ─── Closer ─── */

const STAGE_PROB: Record<string, number> = {
  captured: 0.1,
  contacted: 0.15,
  qualified: 0.4,
  scheduled: 0.55,
  proposal: 0.7,
  negotiation: 0.82,
  closed_won: 1,
  closed_lost: 0,
};

export const closer: AgentDef = {
  id: 'agent-closer',
  role: 'closer',
  name: 'Fechadora',
  description: 'Agenda visitas, envia propostas e conduz a negociação.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    const open = store.openDeals().filter((d) => d.stage !== 'captured' && d.stage !== 'contacted');
    for (const deal of open.slice(0, 2)) {
      const lead = store.getLead(deal.leadId);
      if (deal.stage === 'qualified') {
        const task = buildDealTask(this.id, deal, 'schedule', 'scheduled', 0.55, ctx, lead, 'Agendar visita presencial ou virtual.');
        effects.push({ type: 'task', task }, eventFor(this.id, 'meeting', `Visita agendada: ${deal.title}`, deal.id, ctx, 'info'));
      } else if (deal.stage === 'scheduled') {
        const objection =
          'Se o preço for o obstáculo, proponho parcelamento ou ajuste por frente de pagamento.';
        const task = buildDealTask(this.id, deal, 'proposal', 'proposal', 0.7, ctx, lead, `Proposta enviada. ${objection}`);
        effects.push({ type: 'task', task }, eventFor(this.id, 'stage', `Proposta enviada: ${deal.title}`, deal.id, ctx, 'info'));
      } else if (deal.stage === 'proposal') {
        const task = buildDealTask(this.id, deal, 'review', 'negotiation', 0.82, ctx, lead, 'Avançar para negociação e tratar objeções.');
        effects.push({ type: 'task', task }, eventFor(this.id, 'stage', `Em negociação: ${deal.title}`, deal.id, ctx, 'info'));
      } else if (deal.stage === 'negotiation' && deal.probability >= 0.7) {
        const task = buildDealTask(this.id, deal, 'review', 'closed_won', 1, ctx, lead, 'Fechar negócio e iniciar contrato.');
        effects.push({ type: 'task', task }, eventFor(this.id, 'stage', `Negócio fechado: ${deal.title}`, deal.id, ctx, 'success'));
      }
    }
    return effects;
  },
};

function buildDealTask(
  agentId: string,
  deal: Deal,
  kind: SalesTask['kind'],
  advanceTo: Deal['stage'],
  probability: number,
  ctx: AgentContext,
  lead: Lead | undefined,
  note: string,
): SalesTask {
  return {
    id: uid('task'),
    kind,
    agentId,
    dealId: deal.id,
    title: `${kind === 'schedule' ? 'Agendar' : kind === 'proposal' ? 'Propor' : 'Avançar'}: ${deal.title}`,
    detail: note,
    draft: note,
    channel: 'email',
    advanceTo,
    effect: { type: 'updateDeal', id: deal.id, patch: { stage: advanceTo, probability } },
    status: 'pending',
    createdAt: ctx.now(),
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  };
}

function eventFor(
  agentId: string,
  kind: AgentEvent['kind'],
  title: string,
  dealId: string,
  ctx: AgentContext,
  level: AgentEvent['level'],
): SalesEffect {
  return {
    type: 'event',
    event: {
      id: uid('evt'),
      at: ctx.now(),
      agentId,
      kind,
      title,
      dealId,
      level,
    },
  };
}

/* ─── Account manager (post-sale + CRM) ─── */

export const accountManager: AgentDef = {
  id: 'agent-account_manager',
  role: 'account_manager',
  name: 'Sucesso',
  description: 'Cuida do pós-venda, handoff e sincroniza o CRM.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    const won = store.deals.filter((d) => d.stage === 'closed_won');
    for (const deal of won) {
      const already = store.tasks.some((t) => t.kind === 'handoff' && t.dealId === deal.id);
      if (already) continue;
      const task: SalesTask = {
        id: uid('task'),
        kind: 'handoff',
        agentId: this.id,
        dealId: deal.id,
        title: `Onboarding: ${deal.title}`,
        detail: 'Iniciar recepção, documentação e acompanhamento pós-compra.',
        channel: 'email',
        effect: { type: 'updateDeal', id: deal.id, patch: { ownerAgent: this.id, notes: 'Onboarding iniciado pela Sucesso.' } },
        status: 'pending',
        createdAt: ctx.now(),
      };
      effects.push({ type: 'task', task }, eventFor(this.id, 'handoff', `Handoff de sucesso: ${deal.title}`, deal.id, ctx, 'success'));
    }
    return effects;
  },
};

/* ─── Forecaster ─── */

export const forecaster: AgentDef = {
  id: 'agent-forecaster',
  role: 'forecaster',
  name: 'Previsora',
  description: 'Recalcula probabilidade e prevê receita do pipeline.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    let expected = 0;
    for (const deal of store.openDeals()) {
      const lead = store.getLead(deal.leadId);
      const base = STAGE_PROB[deal.stage] ?? 0.3;
      const engagementBonus = Math.min((lead?.engagementCount ?? 0) * 0.02, 0.1);
      const prob = clamp(base + engagementBonus + ctx.rng() * 0.05, 0.05, 0.98);
      effects.push({ type: 'updateDeal', id: deal.id, patch: { probability: Number(prob.toFixed(2)) } });
      expected += deal.amount * prob;
    }
    effects.push(
      eventFor(this.id, 'forecast', `Previsão: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.round(expected))}`, '', ctx, 'info'),
    );
    return effects;
  },
};

/** Ordered roster of specialised agents used by the orchestrator. */
export const AGENTS: AgentDef[] = [
  prospector,
  qualifier,
  outreacher,
  closer,
  accountManager,
  forecaster,
];

