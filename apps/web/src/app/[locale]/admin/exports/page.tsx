'use client';

import { useCallback, useState } from 'react';

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
        `"${String(p.title ?? '').replace(/"/g, '""')}"`,
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
        `"${String(l.name ?? '').replace(/"/g, '""')}"`,
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
    <div>
      <h2 className="text-lg font-medium text-neutral-50">Exportações</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Exportar dados do LandMap
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
      className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 text-left transition hover:border-neutral-600 hover:bg-neutral-900/60 disabled:opacity-50"
    >
      <p className="text-sm font-medium text-neutral-50">{loading ? 'Exportando...' : title}</p>
      <p className="mt-2 text-xs text-neutral-500">{description}</p>
    </button>
  );
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
