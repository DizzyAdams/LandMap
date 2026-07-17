'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Bot, Sparkles } from '../../../../components/lovable/icons';
import {
  approveAllFollowups,
  approveSalesTask,
  getCrmLedger,
  getDueAlerts,
  getSalesFollowups,
  getSalesState,
  rejectSalesTask,
  runFollowUpCycle,
  runSalesCycle,
  salesTick,
  setSalesAutonomy,
  syncCrm,
  type AutonomyLevel,
  type CrmLedger,
  type DueAlert,
  type SalesAgentView,
  type SalesStateView,
  type SalesTaskView,
} from '../../../../lib/api';

const STATUS_LABEL: Record<string, string> = {
  idle: 'Em espera',
  running: 'Rodando',
  paused: 'Pausado',
};

const AUTONOMY_HELP: Record<AutonomyLevel, string> = {
  off: 'Time inteiro em standby — nenhum ciclo executa.',
  copilot: 'Agentes geram tarefas; admin aprova follow-ups e outreach.',
  autopilot: 'Ciclos aplicam efeitos sozinhos (HITL mínimo).',
};

const LOOP_KEY = 'landmap_admin_agent_loop';
const INTERVAL_KEY = 'landmap_admin_agent_interval_s';

const DEFAULT_INTERVAL_S = 45;

export default function AdminAgentsPage() {
  const [state, setState] = useState<SalesStateView | null>(null);
  const [followUps, setFollowUps] = useState<SalesTaskView[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<SalesTaskView | null>(null);
  const [autoLoop, setAutoLoop] = useState(false);
  const [intervalS, setIntervalS] = useState(DEFAULT_INTERVAL_S);
  const [countdown, setCountdown] = useState(DEFAULT_INTERVAL_S);
  const [tickLog, setTickLog] = useState<string[]>([]);
  const [dueAlerts, setDueAlerts] = useState<DueAlert[]>([]);
  const [crm, setCrm] = useState<CrmLedger | null>(null);
  const loopingRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    try {
      setAutoLoop(localStorage.getItem(LOOP_KEY) === '1');
      const s = Number(localStorage.getItem(INTERVAL_KEY));
      if (s >= 15 && s <= 300) setIntervalS(s);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const s = await getSalesState();
      setState(s);
      try {
        const fu = await getSalesFollowups();
        setFollowUps(fu.items);
      } catch {
        setFollowUps(
          (s.tasks || []).filter((t) => t.kind === 'follow_up' && t.status === 'pending'),
        );
      }
      try {
        const due = await getDueAlerts();
        setDueAlerts(due.items);
      } catch {
        setDueAlerts([]);
      }
      try {
        setCrm(await getCrmLedger());
      } catch {
        setCrm(null);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'API /sales indisponível');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const agents: SalesAgentView[] = state?.agents ?? [];
  const meta = state?.meta;
  const autonomy = state?.autonomy ?? 'copilot';

  const standbyCount = useMemo(
    () => agents.filter((a) => a.status === 'idle' || a.status === 'paused').length,
    [agents],
  );

  const squadIds = useMemo(
    () => new Set(meta?.followupSquad ?? ['agent-followup', 'agent-cold_recovery', 'agent-waba_followup']),
    [meta?.followupSquad],
  );

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    busyRef.current = true;
    setMsg(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  function toggleLoop(on: boolean) {
    setAutoLoop(on);
    try {
      localStorage.setItem(LOOP_KEY, on ? '1' : '0');
    } catch {
      /* ignore */
    }
    setCountdown(intervalS);
    setMsg(on ? `Auto-loop ON · squad de follow-up a cada ${intervalS}s` : 'Auto-loop OFF · time em espera');
  }

  // Countdown + auto tick while page is open
  useEffect(() => {
    if (!autoLoop || autonomy === 'off') {
      setCountdown(intervalS);
      return;
    }
    setCountdown(intervalS);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return 0;
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [autoLoop, intervalS, autonomy]);

  useEffect(() => {
    if (!autoLoop || autonomy === 'off' || countdown > 0) return;
    if (busyRef.current || loopingRef.current) return;

    loopingRef.current = true;
    void (async () => {
      try {
        const res = await salesTick('followup');
        if (res.skipped) {
          setTickLog((l) => [`${new Date().toLocaleTimeString()} · skip (${res.reason})`, ...l].slice(0, 12));
        } else {
          setTickLog((l) =>
            [
              `${new Date().toLocaleTimeString()} · tick #${res.state?.meta?.tickCount ?? '—'} · fila FU ${(res.state?.meta?.pendingFollowUps ?? '—') as number}`,
              ...l,
            ].slice(0, 12),
          );
          setState(res.state);
          try {
            const fu = await getSalesFollowups();
            setFollowUps(fu.items);
          } catch {
            /* keep */
          }
        }
      } catch (e) {
        setTickLog((l) =>
          [
            `${new Date().toLocaleTimeString()} · erro ${e instanceof Error ? e.message : 'tick'}`,
            ...l,
          ].slice(0, 12),
        );
      } finally {
        loopingRef.current = false;
        setCountdown(intervalS);
      }
    })();
  }, [countdown, autoLoop, autonomy, intervalS]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--primary)]">Admin · só interno</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Time de agentes
            </h1>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {standbyCount}/{agents.length || '—'} em espera · squad follow-up · auto-loop opcional
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['off', 'copilot', 'autopilot'] as AutonomyLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              disabled={busy}
              onClick={() =>
                void withBusy(async () => {
                  await setSalesAutonomy(level);
                  setMsg(`Autonomia → ${level}`);
                })
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                autonomy === level
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </header>

      <p className="text-xs text-[var(--muted-foreground)]">{AUTONOMY_HELP[autonomy]}</p>

      {/* Standby + auto-loop bar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                autoLoop && autonomy !== 'off'
                  ? 'animate-pulse bg-[var(--primary)]'
                  : 'bg-[var(--muted-foreground)]/40'
              }`}
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {autoLoop && autonomy !== 'off'
                  ? `Em espera · próximo tick em ${countdown}s`
                  : 'Time parado em espera (sem auto-loop)'}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Ticks: {meta?.tickCount ?? 0}
                {meta?.lastTickAt ? ` · último ${meta.lastTickAt.slice(11, 19)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              Intervalo
              <select
                value={intervalS}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setIntervalS(v);
                  setCountdown(v);
                  try {
                    localStorage.setItem(INTERVAL_KEY, String(v));
                  } catch {
                    /* ignore */
                  }
                }}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--foreground)]"
              >
                {[20, 30, 45, 60, 90, 120].map((n) => (
                  <option key={n} value={n}>
                    {n}s
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={autonomy === 'off'}
              onClick={() => toggleLoop(!autoLoop)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                autoLoop
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] hover:border-[var(--primary)]'
              } disabled:opacity-40`}
            >
              {autoLoop ? 'Auto-loop ON' : 'Ligar auto-loop'}
            </button>
          </div>
        </div>
        {tickLog.length > 0 && (
          <ul className="mt-3 max-h-20 space-y-0.5 overflow-y-auto font-mono text-[10px] text-[var(--muted-foreground)]">
            {tickLog.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
          {error}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Time', value: meta?.teamSize ?? agents.length },
          { label: 'Em espera', value: meta?.standby ?? standbyCount },
          { label: 'Follow-ups fila', value: meta?.pendingFollowUps ?? followUps.length },
          {
            label: 'Due overdue',
            value: meta?.dueAlerts?.overdue ?? dueAlerts.filter((d) => d.severity === 'overdue').length,
          },
          {
            label: 'Due soon',
            value: meta?.dueAlerts?.dueSoon ?? dueAlerts.filter((d) => d.severity === 'due_soon').length,
          },
          {
            label: 'CRM',
            value: meta?.crm?.mode ?? crm?.status.mode ?? '—',
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
          >
            <p className="text-[11px] text-[var(--muted-foreground)]">{c.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {c.value}
            </p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || autonomy === 'off'}
          onClick={() =>
            void withBusy(async () => {
              await runSalesCycle();
              setMsg('Ciclo completo do time executado');
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" /> Rodar ciclo (time inteiro)
        </button>
        <button
          type="button"
          disabled={busy || autonomy === 'off'}
          onClick={() =>
            void withBusy(async () => {
              await runFollowUpCycle();
              setMsg('Squad follow-up (FU + resgate + WABA) processado');
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium hover:border-[var(--primary)] disabled:opacity-50"
        >
          <Activity className="h-3.5 w-3.5" /> Squad follow-up
        </button>
        <button
          type="button"
          disabled={busy || followUps.length === 0}
          onClick={() =>
            void withBusy(async () => {
              const r = await approveAllFollowups();
              setMsg(`${r.count} follow-ups aprovados`);
            })
          }
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium hover:border-[var(--primary)] disabled:opacity-50"
        >
          Aprovar todos follow-ups
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void withBusy(async () => {
              const r = await syncCrm();
              setMsg(
                `CRM sync · ${r.leads} leads · ${r.deals} deals · modo ${r.status.mode}` +
                  (r.status.twentyConfigured ? ' (Twenty live)' : ' (ledger LandMap)'),
              );
            })
          }
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium hover:border-[var(--primary)] disabled:opacity-50"
        >
          Sync CRM
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)]"
        >
          Atualizar
        </button>
      </div>

      {msg && <p className="text-xs text-[var(--primary)]">{msg}</p>}

      {/* Due alerts */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Alertas de due ({dueAlerts.length})
        </h2>
        <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
          Overdue e due em &lt;24h · webhook <code className="font-mono">alert.fired</code> no overdue
        </p>
        <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {dueAlerts.map((a) => (
            <li
              key={a.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                a.severity === 'overdue'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-[var(--primary)]/25 bg-[var(--primary)]/5'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="font-mono text-[10px] text-[var(--muted-foreground)]">
                  {a.severity} · {a.hoursDelta}h · {a.channel ?? '—'} · {a.dueAt.slice(0, 16)}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void withBusy(async () => {
                      await approveSalesTask(a.taskId);
                      setMsg(`Aprovado due: ${a.title}`);
                    })
                  }
                  className="rounded-lg bg-[var(--primary)] px-2 py-1 text-[10px] text-[var(--primary-foreground)]"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void withBusy(async () => {
                      await rejectSalesTask(a.taskId);
                      setMsg(`Dispensado: ${a.title}`);
                    })
                  }
                  className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10px]"
                >
                  Dispensar
                </button>
              </div>
            </li>
          ))}
          {dueAlerts.length === 0 && (
            <li className="text-xs text-[var(--muted-foreground)]">Nenhum due urgente agora.</li>
          )}
        </ul>
      </section>

      {/* CRM */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">CRM</h2>
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
              Ledger LandMap sempre · Twenty quando{' '}
              <code className="font-mono">TWENTY_BASE_URL</code> +{' '}
              <code className="font-mono">TWENTY_API_KEY</code>
            </p>
          </div>
          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
            {crm?.status.mode ?? meta?.crm?.mode ?? '…'}
            {crm?.status.twentyConfigured || meta?.crm?.twentyConfigured
              ? ' · Twenty'
              : ' · ledger'}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs">
            Leads no ledger: {crm?.status.ledgerLeads ?? meta?.crm?.ledgerLeads ?? 0}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs">
            Deals no ledger: {crm?.status.ledgerDeals ?? meta?.crm?.ledgerDeals ?? 0}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs">
            Syncs: {crm?.status.recentSyncs ?? meta?.crm?.recentSyncs ?? 0}
          </div>
        </div>
        <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto font-mono text-[10px] text-[var(--muted-foreground)]">
          {(crm?.syncs ?? []).slice(0, 12).map((s) => (
            <li key={s.id}>
              [{s.at.slice(11, 19)}] {s.kind} · {s.title} · {s.target} ·{' '}
              {s.ok ? 'ok' : s.error || 'fail'}
            </li>
          ))}
          {!crm?.syncs?.length && (
            <li>Sem syncs ainda — aprove follow-ups ou clique Sync CRM.</li>
          )}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Bot className="h-4 w-4 text-[var(--primary)]" />
            Roster · em espera ({agents.length})
          </h2>
          <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
            {agents.map((a) => {
              const isSquad = squadIds.has(a.id);
              return (
                <li
                  key={a.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                    isSquad
                      ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5'
                      : 'border-[var(--border)] bg-[var(--muted)]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {a.name}
                      {isSquad && (
                        <span className="ml-1.5 text-[10px] font-normal text-[var(--primary)]">
                          squad FU
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{a.role}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                      {a.currentTask || a.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        a.status === 'running'
                          ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                          : a.status === 'paused'
                            ? 'bg-[var(--muted-foreground)]/20 text-[var(--muted-foreground)]'
                            : 'bg-[var(--accent)] text-[var(--primary)]'
                      }`}
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                    <p className="mt-1 font-mono text-[10px] text-[var(--muted-foreground)]">
                      {a.actionsToday} acts · {a.successToday} ok
                    </p>
                  </div>
                </li>
              );
            })}
            {agents.length === 0 && (
              <li className="text-xs text-[var(--muted-foreground)]">Carregando time…</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Fila de follow-ups ({followUps.length})
          </h2>
          <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
            {followUps.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{t.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--muted-foreground)]">
                      {t.channel ?? '—'} · {t.agentId} ·{' '}
                      {t.dueAt ? `due ${t.dueAt.slice(0, 10)}` : 'sem due'}
                    </p>
                    {t.lead && (
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {t.lead.name}
                        {t.lead.city ? ` · ${t.lead.city}` : ''}
                        {t.lead.tier ? ` · ${t.lead.tier}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setSelectedDraft(t)}
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10px]"
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void withBusy(async () => {
                          await approveSalesTask(t.id);
                          setMsg(`Aprovado: ${t.title}`);
                        })
                      }
                      className="rounded-lg bg-[var(--primary)] px-2 py-1 text-[10px] text-[var(--primary-foreground)]"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void withBusy(async () => {
                          await rejectSalesTask(t.id);
                          setMsg(`Rejeitado: ${t.title}`);
                        })
                      }
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10px] text-red-500"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {followUps.length === 0 && (
              <li className="text-xs text-[var(--muted-foreground)]">
                Nenhum follow-up pendente. Ligue auto-loop ou rode o squad.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">Stream de eventos</h2>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-[10px] text-[var(--muted-foreground)]">
          {(state?.events ?? []).slice(0, 40).map((e) => (
            <li key={e.id}>
              [{e.at.slice(11, 19)}] {e.level} · {e.title}
              {e.detail ? ` — ${e.detail}` : ''}
            </li>
          ))}
          {!state?.events?.length && <li>Sem eventos ainda.</li>}
        </ul>
      </section>

      {selectedDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          onClick={() => setSelectedDraft(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold">{selectedDraft.title}</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-[var(--muted)] p-3 text-xs text-[var(--foreground)]">
              {selectedDraft.draft || selectedDraft.detail}
            </pre>
            <button
              type="button"
              className="mt-4 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs text-[var(--primary-foreground)]"
              onClick={() => setSelectedDraft(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
