'use client';

import { useMemo } from 'react';
import {
  Button,
  Card,
  Badge,
  Segmented,
  Stat,
  Progress,
  Avatar,
  Tabs,
  EmptyState,
} from '@landmap/ui';
import { Reveal, Stagger } from '../../../components/Motion';
import type {
  AutonomyLevel,
  Deal,
  AgentEvent,
  PipelineStage,
  SalesChannel,
  SalesTask,
  SalesState,
  LeadTier,
  EventLevel,
  TaskKind,
} from '@landmap/sales';
import { useSalesEngine } from './useSalesEngine';

const BRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

const STAGE_LABEL: Record<PipelineStage, string> = {
  captured: 'Captado',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  scheduled: 'Agendado',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed_won: 'Ganho',
  closed_lost: 'Perdido',
};

const STAGE_ORDER: PipelineStage[] = [
  'captured',
  'contacted',
  'qualified',
  'scheduled',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const TIER_COLOR: Record<LeadTier, string> = {
  hot: 'text-red-300 border-red-800/60 bg-red-950/40',
  warm: 'text-amber-300 border-amber-800/60 bg-amber-950/40',
  cold: 'text-sky-300 border-sky-800/60 bg-sky-950/40',
};

const STAGE_COLOR: Record<PipelineStage, string> = {
  captured: 'text-neutral-300',
  contacted: 'text-sky-300',
  qualified: 'text-cyan-300',
  scheduled: 'text-amber-300',
  proposal: 'text-violet-300',
  negotiation: 'text-fuchsia-300',
  closed_won: 'text-emerald-300',
  closed_lost: 'text-red-300',
};

const LEVEL_COLOR: Record<EventLevel, string> = {
  info: 'border-l-sky-500/60',
  success: 'border-l-emerald-500/60',
  warn: 'border-l-amber-500/60',
  escalation: 'border-l-red-500/60',
};

const CHANNEL_LABEL: Record<SalesChannel, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  call: 'Ligação',
  social: 'Social',
};

const TASK_LABEL: Record<TaskKind, string> = {
  outreach: 'Outbound',
  follow_up: 'Follow-up',
  schedule: 'Agendar',
  proposal: 'Proposta',
  handoff: 'Handoff',
  review: 'Revisão',
  forecast: 'Previsão',
};

const AUTONOMY_OPTIONS: { value: AutonomyLevel; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'autopilot', label: 'Autopilot' },
];

export default function SalesCockpitPage() {
  const { state, running, cycle, setLevel, approve, reject } = useSalesEngine();
  const { analytics } = state;

  const agentName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of state.agents) map[a.id] = a.name;
    return map;
  }, [state.agents]);

  const pending = state.tasks.filter((t) => t.status === 'pending');

  return (
    <main className="relative min-h-screen grid-bg text-neutral-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(40rem_28rem_at_70%_-10%,rgba(52,211,153,0.10),transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-24">
        <Reveal>
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-[11px] uppercase tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Agente Autônomo de Vendas
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gradient">
              Sales Cockpit
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-400">
              Um esquadrão de agentes (Caçadora, Qualificadora, Outbound, Fechadora, Sucesso e
              Previsora) opera o funil de forma autônoma, com política de autonomia e
              human-in-the-loop.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <Segmented options={AUTONOMY_OPTIONS} value={state.autonomy} onChange={(v) => setLevel(v)} />
            <Button onClick={() => cycle()} disabled={running || state.autonomy === 'off'}>
              {running ? 'Rodando ciclo…' : '▶ Rodar ciclo de agentes'}
            </Button>
          </div>
        </div>
        </Reveal>

        <Stagger className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Pipeline" value={BRL(analytics.totals.pipelineValue)} hint="em aberto" />
          <Stat label="Ponderado" value={BRL(analytics.totals.weightedPipeline)} hint="prob. × valor" />
          <Stat
            label="Taxa de fechamento"
            value={`${Math.round(analytics.totals.winRate * 100)}%`}
            hint={`${analytics.totals.wonCount} ganho / ${analytics.totals.lostCount} perdido`}
          />
          <Stat label="Reuniões" value={analytics.totals.meetingsBooked} hint="agendadas" />
          <Stat label="Ticket médio" value={BRL(analytics.totals.avgDealSize)} hint="fechados" />
          <Stat label="Previsões" value={analytics.totals.forecasts} hint="ciclos" />
        </Stagger>

        <Tabs
          tabs={[
            { id: 'pipeline', label: 'Funil' },
            { id: 'agents', label: 'Agentes' },
            { id: 'activity', label: 'Atividade' },
            { id: 'channels', label: 'Canais' },
            { id: 'forecast', label: 'Previsão' },
          ]}
        >
          {(tab) => (
            <div>
              {tab === 'pipeline' && <PipelineView state={state} agentName={agentName} />}
              {tab === 'agents' && <AgentsView state={state} />}
              {tab === 'activity' && <ActivityView events={state.events} />}
              {tab === 'channels' && <ChannelsView state={state} />}
              {tab === 'forecast' && <ForecastView state={state} />}
            </div>
          )}
        </Tabs>

        {/* Task inbox (human-in-the-loop) */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Caixa de aprovação</h2>
            <Badge variant={pending.length ? 'warning' : 'success'}>
              {pending.length} pendente{pending.length === 1 ? '' : 's'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            No modo Copilot, as ações dos agentes aguardam sua aprovação. No Autopilot, são
            executadas automaticamente.
          </p>

          <div className="mt-5 space-y-3">
            {pending.length === 0 && (
              <EmptyState
                title="Nenhuma ação pendente"
                description="Os agentes estão em dia — rode um ciclo para gerar novas tarefas."
              />
            )}
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                agentName={agentName[task.agentId] ?? task.agentId}
                onApprove={() => approve(task.id)}
                onReject={() => reject(task.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


/* ─── Sub-views ─── */

function PipelineView({ state, agentName }: { state: SalesState; agentName: Record<string, string> }) {
  const byStage = (stage: PipelineStage) => state.deals.filter((d) => d.stage === stage);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAGE_ORDER.map((stage) => {
        const deals = byStage(stage);
        const value = deals.reduce((s, d) => s + d.amount, 0);
        return (
          <div key={stage} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${STAGE_COLOR[stage]}`}>{STAGE_LABEL[stage]}</span>
              <span className="text-[11px] text-neutral-500">{deals.length}</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">{BRL(value)}</p>
            <div className="mt-3 space-y-2">
              {deals.map((d) => (
                <DealCard key={d.id} deal={d} agentName={agentName[d.ownerAgent] ?? d.ownerAgent} />
              ))}
              {deals.length === 0 && <p className="py-4 text-center text-[11px] text-neutral-500">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealCard({ deal, agentName }: { deal: Deal; agentName: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01]">
      <p className="text-xs font-medium leading-tight text-neutral-100">{deal.title}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{BRL(deal.amount)}</p>
      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-[10px] text-neutral-500">
          <span>{Math.round(deal.probability * 100)}% chance</span>
          <span>{agentName}</span>
        </div>
        <Progress value={deal.probability * 100} />
      </div>
      {deal.nextAction && <p className="mt-2 text-[11px] text-neutral-500">→ {deal.nextAction}</p>}
    </div>
  );
}

function AgentsView({ state }: { state: SalesState }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {state.agents.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center gap-3">
            <Avatar name={a.name} status={a.status} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-100">{a.name}</p>
              <p className="text-[11px] capitalize text-emerald-300/80">{a.role}</p>
            </div>
            <Badge
              variant={a.status === 'running' ? 'success' : a.status === 'paused' ? 'warning' : 'default'}
              className="ml-auto"
            >
              {a.status === 'running' ? 'ativo' : a.status === 'paused' ? 'pausado' : 'ocioso'}
            </Badge>
          </div>
          <p className="mt-3 text-xs text-neutral-400">{a.description}</p>
          <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-500">
            <span>{a.actionsToday} ações hoje</span>
            <span>{a.successToday} sucessos</span>
          </div>
          {a.lastActionAt && (
            <p className="mt-1 text-[10px] text-neutral-500">
              última ação: {new Date(a.lastActionAt).toLocaleTimeString('pt-BR')}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}


function ActivityView({ events }: { events: AgentEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="Sem atividade ainda" description="Rode um ciclo para ver os agentes em ação." />;
  }
  return (
    <div className="space-y-2">
      {events.slice(0, 30).map((e) => (
        <div
          key={e.id}
          className={`rounded-lg border-l-2 border border-white/10 bg-white/[0.03] px-4 py-3 ${LEVEL_COLOR[e.level]}`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-100">{e.title}</p>
            <span className="shrink-0 text-[10px] text-neutral-500">
              {new Date(e.at).toLocaleTimeString('pt-BR')}
            </span>
          </div>
          {e.detail && <p className="mt-1 text-xs text-neutral-500">{e.detail}</p>}
        </div>
      ))}
    </div>
  );
}

function ChannelsView({ state }: { state: SalesState }) {
  const max = Math.max(1, ...state.analytics.channelPerformance.map((c) => c.sent));
  return (
    <div className="space-y-4">
      {state.analytics.channelPerformance.map((c) => (
        <div key={c.channel} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-100">{CHANNEL_LABEL[c.channel]}</span>
            <span className="text-xs text-neutral-500">
              {c.sent} envios · {c.replies} respostas · {Math.round(c.replyRate * 100)}% CTR
            </span>
          </div>
          <div className="mt-3">
            <Progress value={(c.sent / max) * 100} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ForecastView({ state }: { state: SalesState }) {
  const { analytics } = state;
  const forecast = analytics.forecast;
  const max = Math.max(1, ...analytics.funnel.map((f) => f.value));
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
        <h3 className="text-sm font-medium text-neutral-200">Funil por valor</h3>
        <div className="mt-4 space-y-3">
          {analytics.funnel.map((f) => (
            <div key={f.stage} className="flex items-center gap-3">
              <span className={`w-24 shrink-0 text-xs ${STAGE_COLOR[f.stage]}`}>{STAGE_LABEL[f.stage]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300"
                  style={{ width: `${(f.value / max) * 100}%` }}
                />
              </div>
              <span className="w-28 shrink-0 text-right text-xs tabular-nums text-neutral-300">{BRL(f.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-5">
        <h3 className="text-sm font-medium text-emerald-200">Previsão de receita</h3>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-gradient">{BRL(forecast.expectedValue)}</p>
        <p className="mt-1 text-xs text-neutral-500">{forecast.period}</p>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Confiança do modelo</span>
            <span>{Math.round(forecast.confidence * 100)}%</span>
          </div>
          <Progress value={forecast.confidence * 100} />
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Pipeline ponderado de {BRL(analytics.totals.weightedPipeline)} considerando a
          probabilidade de fechamento de cada negócio.
        </p>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  agentName,
  onApprove,
  onReject,
}: {
  task: SalesTask;
  agentName: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="info">{TASK_LABEL[task.kind]}</Badge>
        <span className="text-sm font-medium text-neutral-100">{task.title}</span>
        <span className="text-[11px] text-neutral-500">por {agentName}</span>
        {task.channel && (
          <span className="text-[11px] text-neutral-500">· {CHANNEL_LABEL[task.channel]}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={onReject}>
            Rejeitar
          </Button>
          <Button onClick={onApprove}>Aprovar</Button>
        </div>
      </div>
      {task.draft && (
        <p className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-neutral-300">
          {task.draft}
        </p>
      )}
      {!task.draft && task.detail && (
        <p className="mt-2 text-xs text-neutral-500">{task.detail}</p>
      )}
    </div>
  );
}

