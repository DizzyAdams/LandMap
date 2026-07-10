'use client';

import { useState, useMemo } from 'react';

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
    <div>
      <h2 className="text-lg font-medium text-neutral-50">Leads</h2>
      <p className="mt-1 text-xs text-neutral-400">
        {leads.length} leads simulados
      </p>

      {/* Filter */}
      <div className="mt-6 flex items-center gap-3">
        <label className="text-[11px] text-neutral-400">Filtrar por estágio:</label>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-50 outline-none focus:border-neutral-500"
        >
          <option value="">Todos</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900/60">
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
                className="border-b border-neutral-800/50 transition hover:bg-neutral-900/20"
              >
                <td className="px-4 py-3 text-neutral-50">{lead.name}</td>
                <td className="px-4 py-3 text-neutral-400 text-[13px]">{lead.email}</td>
                <td className="px-4 py-3">
                  <ScoreBadge score={lead.score} />
                </td>
                <td className="px-4 py-3">
                  <StageBadge stage={lead.stage} />
                </td>
                <td className="px-4 py-3 text-neutral-400 text-[13px]">{lead.propertyInterest}</td>
                <td className="px-4 py-3 text-neutral-400 text-[13px]">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
      {children}
    </th>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'text-emerald-400 border-emerald-800'
      : score >= 75
        ? 'text-violet-400 border-violet-800'
        : 'text-neutral-400 border-neutral-700';
  return (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-mono ${color}`}>
      {score}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    Novo: 'text-cyan-400 border-cyan-800',
    Contatado: 'text-cyan-400 border-cyan-800',
    'Agendou Visita': 'text-violet-400 border-violet-800',
    'Negociação': 'text-violet-400 border-violet-800',
    'Fechado': 'text-emerald-400 border-emerald-800',
    'Perdido': 'text-red-400 border-red-800',
  };
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${colors[stage] ?? 'text-neutral-400 border-neutral-700'}`}
    >
      {stage}
    </span>
  );
}
