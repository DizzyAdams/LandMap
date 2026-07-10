/**
 * 10-investment-agent.snippet.ts  —  REFERÊNCIA (fora de src)
 * ---------------------------------------------------------------------------
 * Mostra o registro EXATO de `investment_advisor` seguindo o padrão de
 * `packages/sales/src` (AgentRole → AgentDef → AGENTS[]).
 *
 * PROVA DE QUE NÃO PRECISA MEXER EM autonomy.ts / orchestrator.ts:
 *   - `runCycle()` itera o array `AGENTS` genérico  -> o novo agente roda só de
 *     estar no array.
 *   - `applyEffectsUnderAutonomy()` trata `event` (sempre loga) e `task`
 *     (pending em copilot / aprovado em autopilot). O `kind:'deal_alert'` é só
 *     mais um valor do union `TaskKind` -> cai no fluxo de aprovação existente
 *     (`POST /sales/approve/:id`).
 *   - `syncClosedDeals()` (CRM) e `recomputeAnalytics()` já cobrem o novo estado.
 *
 * Este arquivo é DOCUMENTAÇÃO. Os trechos comentados marcam os pontos exatos
 * onde se editaria `packages/sales/src/types.ts` e `packages/sales/src/agents.ts`.
 * ---------------------------------------------------------------------------
 */

/* 1) ESTENDER O UNION `AgentRole`  --  packages/sales/src/types.ts
 *
 *   export type AgentRole =
 *     | 'prospector' | 'qualifier' | 'outreacher' | 'closer'
 *     | 'account_manager' | 'forecaster'
 *     | 'investment_advisor';   // <- NOVO
 */

/* 2) (OPCIONAL) ESTENDER O UNION `TaskKind`  --  packages/sales/src/types.ts
 *
 *   export type TaskKind =
 *     | 'outreach' | 'follow_up' | 'schedule' | 'proposal'
 *     | 'handoff' | 'review' | 'forecast'
 *     | 'deal_alert';   // <- NOVO (usado pelo investment_advisor)
 */

/* 3) IMPORTS  --  packages/sales/src/agents.ts */

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

// Engine de investimento (já exporta analyze / scoreNeighborhood /
// rankOpportunities / estimateMonthlyRent e os tipos NeighborhoodStat /
// PriceTrendPoint / HeatmapPoint). Espelha exatamente packages/api/.../market.ts.
import {
  rankOpportunities,
  scoreNeighborhood,
  estimateMonthlyRent,
  type NeighborhoodStat,
  type OpportunityScore,
} from '@landmap/invest';

// ─── Reference data (watchlist espelhada do /market/neighborhoods) ───────────

/** Score mínimo (0..100) para virar deal alertado. 65 = nota B+ (ver grade()). */
const OPPORTUNITY_THRESHOLD = 65;

/**
 * Watchlist de bairros monitorados. Em produção, viria de
 * `GET /market/neighborhoods?city=X` (ou de um arquivo de config do agente).
 * Mantido inline aqui apenas para o snippet ser autocontido e determinístico.
 */
const WATCHLIST: NeighborhoodStat[] = [
  { name: 'Batel', city: 'Curitiba', state: 'PR', count: 42, avgPriceM2: 9100, avgPrice: 1_250_000 },
  { name: 'Centro', city: 'Florianópolis', state: 'SC', count: 18, avgPriceM2: 7800, avgPrice: 980_000 },
  { name: 'Boa Viagem', city: 'Recife', state: 'PE', count: 27, avgPriceM2: 6400, avgPrice: 720_000 },
  { name: 'Moinhos de Vento', city: 'Porto Alegre', state: 'RS', count: 31, avgPriceM2: 8200, avgPrice: 1_050_000 },
];

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/* 4) DEFINIR O AgentDef */

export const investmentAdvisor: AgentDef = {
  id: 'agent-investment_advisor',
  role: 'investment_advisor',
  name: 'Consultora de Investimentos',
  description: 'Monitora oportunidades de investimento (score de bairro) e emite alertas/deals.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];

    // 1) Ranqueia a watchlist com o engine PURO de @landmap/invest
    const ranked = rankOpportunities(WATCHLIST.map((stat) => ({ stat })))
      .filter((r) => r.score.score >= OPPORTUNITY_THRESHOLD);
    if (!ranked.length) return effects;

    for (const { stat, score } of ranked) {
      const dealId = `deal-inv-${slug(`${stat.city}-${stat.name}`)}`;
      const leadId = `lead-inv-${slug(`${stat.city}-${stat.name}`)}`;
      if (store.deals.some((d) => d.id === dealId)) continue; // idempotente

      const monthlyRent = estimateMonthlyRent(stat.avgPrice);
      const amount = Math.round(stat.avgPrice);
      const gradeLabel = String(score.grade);

      // Evento SEMPRE logado (transparência, independente da autonomia)
      const event: AgentEvent = {
        id: uid('evt'),
        at: ctx.now(),
        agentId: this.id,
        kind: 'note',
        level: gradeLabel === 'A' ? 'success' : 'info',
        title: `Oportunidade: ${stat.name}/${stat.city} (${gradeLabel})`,
        detail: `score ${Math.round(score.score)} · ${score.reasons.join(' · ')}`,
        dealId,
      };
      effects.push({ type: 'event', event });

      // Deal de investimento. Em copilot -> vira SalesTask pendente (HITL);
      // em autopilot -> aplicado na hora; em off -> runCycle nem executa o agente.
      const deal: Deal = {
        id: dealId,
        leadId,
        title: `Oportunidade · ${stat.name}/${stat.city}`,
        stage: 'captured',
        amount,
        currency: 'BRL',
        probability: Number((score.score / 100).toFixed(2)),
        ownerAgent: this.id,
        property: `${stat.name} — grade ${gradeLabel}`,
        nextAction: 'Validar oportunidade e abordar investidor',
        lastActivityAt: ctx.now(),
        createdAt: ctx.now(),
        notes: `cap rate ${score.yieldPct.toFixed(2)}% · valorização ${score.appreciationPct.toFixed(1)}% · aluguel ~R$ ${Math.round(monthlyRent)}/mês`,
      };

      const task: SalesTask = {
        id: uid('task'),
        kind: 'deal_alert',
        agentId: this.id,
        dealId,
        title: `Deal de investimento: ${stat.name}`,
        detail: `${stat.city}/${stat.state} · score ${Math.round(score.score)} (${gradeLabel}) · aluguel estimado R$ ${Math.round(monthlyRent)}/mês`,
        draft: JSON.stringify({ stat, score, monthlyRent }),
        status: 'pending', // applyEffectsUnderAutonomy decide aprovar/em pending
        createdAt: ctx.now(),
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        // Mutação concreta executada ao aprovar (copilot) ou na hora (autopilot)
        effect: { type: 'deal', deal },
      };
      effects.push({ type: 'task', task });

      // (Opcional) push direto p/ o CRM Twenty SÓ em autopilot. Em copilot, o
      // human aprova a task e, quando o deal chega a closed_won, o fluxo já
      // existente `syncClosedDeals()` empurra para o Twenty — respeitando HITL.
      if (ctx.autonomy === 'autopilot' && ctx.crm) {
        const lead: Lead = {
          id: leadId,
          name: `Oportunidade · ${stat.name}/${stat.city}`,
          source: 'investment',
          interest: `Investimento: ${stat.name} — grade ${gradeLabel}`,
          city: stat.city,
          state: stat.state,
          budgetMin: Math.round(amount * 0.6),
          budgetMax: amount,
          signals: [
            `score ${Math.round(score.score)}`,
            `cap rate ${score.yieldPct.toFixed(2)}%`,
            `valorização ${score.appreciationPct.toFixed(1)}%`,
          ],
          createdAt: ctx.now(),
          engagementCount: 0,
        };
        try {
          ctx.crm.syncLead?.(lead);
        } catch {
          /* best-effort */
        }
      }
    }
    return effects;
  },
};

/* 5) ADICIONAR AO ROSTER (createRoster) e ao array AGENTS  --  agents.ts
 *
 * Em createRoster(), inclua a linha no array `base`:
 *
 *   const base: Array<[AgentRole, string, string]> = [
 *     // ... 6 originais ...
 *     ['investment_advisor', 'Consultora de Investimentos',
 *       'Monitora oportunidades de investimento e emite alertas/deals.'],
 *   ];
 *
 * No final do arquivo, estenda AGENTS:
 *
 *   export const AGENTS: AgentDef[] = [
 *     prospector, qualifier, outreacher, closer, accountManager, forecaster,
 *     investmentAdvisor, // <- NOVO
 *   ];
 *
 * Pronto. Nada em autonomy.ts / orchestrator.ts precisa mudar.
 */

