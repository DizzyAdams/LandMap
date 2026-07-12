'use client';

import { useCallback, useState } from 'react';
import { ArrowUpDown } from '../../../../components/lovable/icons';

export default function AdminExportsPage() {
  const [exporting, setExporting] = useState<'properties' | 'leads' | 'report' | null>(null);

  const exportPropertiesCSV = useCallback(async () => {
    setExporting('properties');
    try {
      const res = await fetch('/api/admin/properties?pageSize=5000', { cache: 'no-store' });
      const data = await res.json();
      const items: Record<string, unknown>[] = data.items ?? [];

      const headers = ['ID', 'Título', 'Cidade', 'Estado', 'Preço', 'Área (m²)', 'Tipo', 'Modalidade', 'Status', 'Quartos'];
      const rows = items.map((p: Record<string, unknown>) => [
        p.id,
        `"${String(p.title ?? '').replace(/\"/g, '""')}"`,
        p.city,
        p.state,
        p.price,
        p.areaM2,
        p.type,
        p.modality,
        p.status,
        p.bedrooms ?? '',
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      downloadBlob(csv, 'properties.csv', 'text/csv;charset=utf-8;');
    } finally {
      setExporting(null);
    }
  }, []);

  const exportLeadsCSV = useCallback(async () => {
    setExporting('leads');
    try {
      const res = await fetch('/api/admin/leads?pageSize=5000', { cache: 'no-store' });
      const data = await res.json();
      const items: Record<string, unknown>[] = data.items ?? [];

      const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Score', 'Estágio', 'Interesse', 'Data'];
      const rows = items.map((l: Record<string, unknown>) => [
        l.id,
        `"${String(l.name ?? '').replace(/\"/g, '""')}"`,
        l.email,
        l.phone,
        l.score,
        l.stage,
        l.propertyInterest,
        l.createdAt,
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      downloadBlob(csv, 'leads.csv', 'text/csv;charset=utf-8;');
    } finally {
      setExporting(null);
    }
  }, []);

  const exportReportJSON = useCallback(async () => {
    setExporting('report');
    try {
      const [statsRes, citiesRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/cities', { cache: 'no-store' }).then((r) => r.json()),
      ]);

      const report = {
        exportedAt: new Date().toISOString(),
        stats: statsRes,
        cities: citiesRes,
      };

      downloadBlob(
        JSON.stringify(report, null, 2),
        'relatorio-export.json',
        'application/json;charset=utf-8;'
      );
    } finally {
      setExporting(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-lovable)] text-[var(--primary)]">
          <ArrowUpDown className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Dados & relatórios</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">Exportações</h1>
          <p className="mt-1 text-[var(--muted-foreground-lovable)]">Exportar dados do LandMap</p>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <ExportCard
            title="Properties (CSV)"
            description="Exportar todos os imóveis cadastrados"
            onClick={exportPropertiesCSV}
            loading={exporting === 'properties'}
          />
          <ExportCard
            title="Leads (CSV)"
            description="Exportar todos os leads"
            onClick={exportLeadsCSV}
            loading={exporting === 'leads'}
          />
          <ExportCard
            title="Relatório (JSON)"
            description="Exportar relatório completo com estatísticas"
            onClick={exportReportJSON}
            loading={exporting === 'report'}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function ExportCard({
  title,
  description,
  onClick,
  loading,
}: {
  title: string;
  description: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] p-5 text-left transition hover:bg-[var(--muted-lovable)] hover:border-[var(--primary)] disabled:opacity-50"
    >
      <p className="text-sm font-medium text-[var(--foreground)]">{loading ? 'Exportando...' : title}</p>
      <p className="mt-2 text-xs text-[var(--muted-foreground-lovable)]">{description}</p>
    </button>
  );
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([`﻿${content}`], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
