import type { Deal, Lead, SalesTask, SalesChannel } from './types.js';
import { SalesStore } from './store.js';
import { createRoster } from './agents.js';

/** Build a fully-seeded store for demos, the cockpit and tests. */
export function createInitialStore(): SalesStore {
  const store = new SalesStore();
  store.agents = createRoster();

  const leads: Lead[] = [
    { id: 'lead-1', name: 'Ana Silva', email: 'ana@email.com', phone: '(41) 99800-1234', city: 'Curitiba', state: 'PR', source: 'orgânico', interest: 'Apartamento 2 quartos', budgetMin: 350000, budgetMax: 520000, signals: ['queda de preço 8%', 'pré-aprovação de crédito'], createdAt: '2026-08-01T10:00:00Z', engagementCount: 3, score: 88, tier: 'hot', worked: true },
    { id: 'lead-2', name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '(48) 99700-2233', city: 'Florianópolis', state: 'SC', source: 'campanha', interest: 'Casa com piscina', budgetMin: 600000, budgetMax: 950000, signals: ['novo lançamento na região'], createdAt: '2026-08-02T09:00:00Z', engagementCount: 2, score: 71, tier: 'warm', worked: true },
    { id: 'lead-3', name: 'Marina Santos', email: 'marina@email.com', phone: '(11) 99600-3344', city: 'São Paulo', state: 'SP', source: 'indicação', interest: 'Cobertura centro', budgetMin: 800000, budgetMax: 1400000, signals: ['mudança de empresa', 'ampliação de família'], createdAt: '2026-08-03T14:00:00Z', engagementCount: 0 },
    { id: 'lead-4', name: 'Rafael Costa', email: 'rafael@email.com', phone: '(31) 99500-4455', city: 'Belo Horizonte', state: 'MG', source: 'outbound', interest: 'Terreno 360 m²', budgetMin: 200000, budgetMax: 400000, signals: ['reinício de FGTS'], createdAt: '2026-08-04T11:00:00Z', engagementCount: 0 },
    { id: 'lead-5', name: 'Juliana Lima', email: 'ju@email.com', phone: '(51) 99400-5566', city: 'Porto Alegre', state: 'RS', source: 'inbound', interest: 'Studio para investimento', budgetMin: 250000, budgetMax: 480000, signals: ['queda de preço 8%'], createdAt: '2026-08-01T08:00:00Z', engagementCount: 4, score: 84, tier: 'hot', worked: true },
    { id: 'lead-6', name: 'Pedro Almeida', email: 'pedro@email.com', phone: '(81) 99300-6677', city: 'Recife', state: 'PE', source: 'orgânico', interest: 'Sala comercial', budgetMin: 150000, budgetMax: 300000, signals: ['aniversário de cidade'], createdAt: '2026-08-02T16:00:00Z', engagementCount: 1, score: 58, tier: 'cold' },
    { id: 'lead-7', name: 'Larissa Souza', email: 'larissa@email.com', phone: '(41) 99200-7788', city: 'Curitiba', state: 'PR', source: 'campanha', interest: 'Casa de campo', budgetMin: 700000, budgetMax: 1200000, signals: ['visitou 3 imóveis esta semana'], createdAt: '2026-08-03T10:00:00Z', engagementCount: 3, score: 79, tier: 'warm', worked: true },
    { id: 'lead-8', name: 'Gabriel Pereira', email: 'gabriel@email.com', phone: '(48) 99100-8899', city: 'Florianópolis', state: 'SC', source: 'indicação', interest: 'Apartamento de frente ao mar', budgetMin: 900000, budgetMax: 1600000, signals: ['novo lançamento na região', 'ampliação de família'], createdAt: '2026-08-04T09:00:00Z', engagementCount: 0 },
  ];
  leads.forEach((l) => store.addLead(l));

  const deals: Deal[] = [
    { id: 'deal-1', leadId: 'lead-1', title: 'Apartamento 2 quartos — Ana Silva', stage: 'qualified', amount: 480000, currency: 'BRL', probability: 0.4, ownerAgent: 'agent-qualifier', property: 'Apartamento 2 quartos', nextAction: 'Agendar visita', lastActivityAt: '2026-08-05T10:00:00Z', createdAt: '2026-08-01T10:00:00Z' },
    { id: 'deal-2', leadId: 'lead-5', title: 'Studio para investimento — Juliana Lima', stage: 'scheduled', amount: 450000, currency: 'BRL', probability: 0.55, ownerAgent: 'agent-closer', property: 'Studio para investimento', nextAction: 'Visita agendada', lastActivityAt: '2026-08-06T10:00:00Z', createdAt: '2026-08-02T08:00:00Z' },
    { id: 'deal-3', leadId: 'lead-2', title: 'Casa com piscina — Carlos Oliveira', stage: 'proposal', amount: 890000, currency: 'BRL', probability: 0.7, ownerAgent: 'agent-closer', property: 'Casa com piscina', nextAction: 'Aguardando proposta', lastActivityAt: '2026-08-06T12:00:00Z', createdAt: '2026-08-03T09:00:00Z' },
    { id: 'deal-4', leadId: 'lead-7', title: 'Casa de campo — Larissa Souza', stage: 'negotiation', amount: 1150000, currency: 'BRL', probability: 0.85, ownerAgent: 'agent-closer', property: 'Casa de campo', nextAction: 'Tratar objeções de preço', lastActivityAt: '2026-08-07T09:00:00Z', createdAt: '2026-08-03T10:00:00Z' },
    { id: 'deal-5', leadId: 'lead-3', title: 'Cobertura centro — Marina Santos', stage: 'captured', amount: 1300000, currency: 'BRL', probability: 0.1, ownerAgent: 'agent-prospector', property: 'Cobertura centro', nextAction: 'Qualificar lead', lastActivityAt: '2026-08-04T14:00:00Z', createdAt: '2026-08-04T14:00:00Z' },
    { id: 'deal-6', leadId: 'lead-6', title: 'Sala comercial — Pedro Almeida', stage: 'closed_won', amount: 280000, currency: 'BRL', probability: 1, ownerAgent: 'agent-closer', property: 'Sala comercial', nextAction: 'Contrato assinado', lastActivityAt: '2026-08-05T15:00:00Z', createdAt: '2026-08-02T16:00:00Z', notes: 'Fechado.' },
  ];
  deals.forEach((d) => store.addDeal(d));

  const tasks: SalesTask[] = [
    { id: 'task-1', kind: 'outreach', agentId: 'agent-outreacher', leadId: 'lead-2', title: 'Outreach e-mail → Carlos Oliveira', detail: 'Oi Carlos, vi que você busca Casa com piscina em Florianópolis — e notei novo lançamento na região. Posso te enviar 3 opções?', draft: 'Oi Carlos, vi que você busca Casa com piscina em Florianópolis — e notei novo lançamento na região. Posso te enviar 3 opções?', channel: 'email', status: 'pending', createdAt: '2026-08-06T08:00:00Z' },
    { id: 'task-2', kind: 'review', agentId: 'agent-qualifier', leadId: 'lead-1', title: 'Abrir negócio: Ana Silva', detail: 'Lead quente detectado. Criar oportunidade de 480000 BRL.', channel: 'email', createDeal: { amount: 480000, title: 'Apartamento 2 quartos — Ana Silva' }, status: 'pending', createdAt: '2026-08-05T10:00:00Z' },
  ];
  tasks.forEach((t) => store.addTask(t));

  store.channelStats = {
    email: { sent: 14, replies: 4 },
    whatsapp: { sent: 9, replies: 3 },
    sms: { sent: 0, replies: 0 },
    call: { sent: 5, replies: 2 },
    social: { sent: 3, replies: 1 },
  } as Record<SalesChannel, { sent: number; replies: number }>;

  store.recomputeAnalytics();
  return store;
}

