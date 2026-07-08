'use client';

import { useMemo } from 'react';

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
    <div>
      <h2 className="text-lg font-medium text-neutral-50">Auditoria</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Registro de eventos do sistema
      </p>

      <div className="mt-8 space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-4 rounded-lg border border-neutral-800/50 bg-neutral-900/20 px-4 py-3 transition hover:bg-neutral-900/40"
          >
            {/* Time */}
            <div className="w-32 shrink-0">
              <p className="text-xs text-neutral-500 font-mono">
                {new Date(event.date).toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Action badge */}
            <span className="shrink-0 rounded-md border border-neutral-800 bg-neutral-950/60 px-2 py-0.5 text-[11px] text-neutral-300">
              {event.action}
            </span>

            {/* User */}
            <span className="shrink-0 text-[11px] text-neutral-500 font-mono">
              {event.user}
            </span>

            {/* Details */}
            <p className="text-xs text-neutral-600 truncate">{event.details}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-neutral-700">
        Exibindo {events.length} eventos simulados
      </p>
    </div>
  );
}
