'use client';

import { useMemo } from 'react';
import { Activity } from '../../../../components/lovable/icons';

type AuditEvent = {
  id: number;
  date: string;
  action: string;
  user: string;
  details: string;
};

const ACTIONS = [
  'Imóvel criado',
  'Imóvel atualizado',
  'Imóvel excluído',
  'Lead criado',
  'Lead atualizado',
  'Exportação realizada',
  'Configuração alterada',
  'Webhook configurado',
  'Usuário logado',
  'Senha alterada',
];

const USERS = [
  'admin@landmap.com.br',
  'joao@landmap.com.br',
  'maria@landmap.com.br',
  'sistema',
];

function generateAuditEvents(): AuditEvent[] {
  const events: AuditEvent[] = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setHours(d.getHours() - i * 2 - Math.floor(Math.random() * 4));
    events.push({
      id: i,
      date: d.toISOString(),
      action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
      user: USERS[Math.floor(Math.random() * USERS.length)],
      details: `Detalhes da ação #${i}`,
    });
  }
  return events;
}

export default function AdminAuditPage() {
  const events = useMemo(() => generateAuditEvents(), []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)]">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Trilha de auditoria</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">Auditoria</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">Registro de eventos do sistema</p>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="space-y-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 transition hover:bg-[var(--accent)]"
            >
              {/* Time */}
              <div className="w-32 shrink-0">
                <p className="text-xs text-[var(--muted-foreground)] font-mono">
                  {new Date(event.date).toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Action badge */}
              <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--accent)] px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)]">
                {event.action}
              </span>

              {/* User */}
              <span className="shrink-0 text-[11px] text-[var(--muted-foreground)] font-mono">
                {event.user}
              </span>

              {/* Details */}
              <p className="text-xs text-[var(--muted-foreground)] truncate">{event.details}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Exibindo {events.length} eventos simulados
      </p>
    </div>
  );
}
