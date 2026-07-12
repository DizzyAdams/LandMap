'use client';

import { useState, useMemo } from 'react';
import { Star, Filter } from '../../../../components/lovable/icons';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  stage: string;
  propertyInterest: string;
  createdAt: string;
};

const STAGES = [
  'Novo',
  'Contatado',
  'Agendou Visita',
  'Negociação',
  'Fechado',
  'Perdido',
];

const FIRST_NAMES = [
  'Ana Silva', 'Carlos Oliveira', 'Marina Santos', 'Rafael Costa',
  'Juliana Lima', 'Pedro Almeida', 'Larissa Souza', 'Gabriel Pereira',
  'Fernanda Rodrigues', 'Lucas Martins', 'Beatriz Carvalho', 'Thiago Gomes',
  'Amanda Nunes', 'Bruno Ribeiro', 'Camila Barbosa', 'Diego Araújo',
  'Patrícia Dias', 'Vinícius Moreira', 'Letícia Teixeira', 'Eduardo Rocha',
];

function generateLeads(): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < 20; i++) {
    const score = Math.floor(Math.random() * 40) + 60; // 60–99
    const stageIdx = Math.min(
      Math.floor(Math.random() * STAGES.length),
      score < 75 ? 2 : score < 90 ? 4 : 5
    );
    const daysAgo = Math.floor(Math.random() * 30);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);

    leads.push({
      id: `lead-${i + 1}`,
      name: FIRST_NAMES[i % FIRST_NAMES.length],
      email: `contato${i + 1}@email.com`,
      phone: `(41) 9${String(9000 + i).slice(0, 4)}-${String(1000 + i).slice(0, 4)}`,
      score,
      stage: STAGES[stageIdx],
      propertyInterest: ['Apartamento', 'Casa', 'Terreno', 'Comercial'][
        Math.floor(Math.random() * 4)
      ],
      createdAt: d.toISOString(),
    });
  }
  return leads;
}

export default function AdminLeadsPage() {
  const [leads] = useState<Lead[]>(generateLeads);
  const [filterStage, setFilterStage] = useState('');

  const filtered = useMemo(
    () =>
      filterStage ? leads.filter((l) => l.stage === filterStage) : leads,
    [leads, filterStage]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-lovable)] text-[var(--primary)]">
          <Star className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Pipeline de contatos</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">Leads</h1>
          <p className="mt-1 text-[var(--muted-foreground-lovable)]">{leads.length} leads simulados</p>
        </div>
      </header>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-[11px] text-[var(--muted-foreground-lovable)]">Filtrar por estágio:</label>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground-lovable)]" />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="rounded-lg border border-[var(--border-lovable)] bg-[var(--card)] py-1.5 pl-8 pr-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">Todos</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-lovable)] bg-[var(--muted-lovable)]">
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Score</Th>
                <Th>Estágio</Th>
                <Th>Interesse</Th>
                <Th>Data</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-[var(--border-lovable)] transition hover:bg-[var(--muted-lovable)]"
                >
                  <td className="px-4 py-3 text-[var(--foreground)]">{lead.name}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground-lovable)] text-[13px]">{lead.email}</td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={lead.stage} />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground-lovable)] text-[13px]">{lead.propertyInterest}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground-lovable)] text-[13px]">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--muted-foreground-lovable)]">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground-lovable)]">
      {children}
    </th>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'text-[var(--primary)] border-[var(--border-lovable)]'
      : score >= 75
        ? 'text-[var(--ring-lovable)] border-[var(--border-lovable)]'
        : 'text-[var(--muted-foreground-lovable)] border-[var(--border-lovable)]';
  return (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-mono ${color}`}>
      {score}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    Novo: 'text-[var(--ring-lovable)] border-[var(--border-lovable)]',
    Contatado: 'text-[var(--ring-lovable)] border-[var(--border-lovable)]',
    'Agendou Visita': 'text-[var(--primary)] border-[var(--border-lovable)]',
    'Negociação': 'text-[var(--primary)] border-[var(--border-lovable)]',
    'Fechado': 'text-[var(--success)] border-[var(--border-lovable)]',
    'Perdido': 'text-[var(--destructive)] border-[var(--border-lovable)]',
  };
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${colors[stage] ?? 'text-[var(--muted-foreground-lovable)] border-[var(--border-lovable)]'}`}
    >
      {stage}
    </span>
  );
}
