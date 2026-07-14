'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createAlert, deleteAlert, getAlerts, clearAlerts } from '../../../lib/alerts';
import type { AlertFilter } from '../../../lib/alerts';
import { localeHref } from '../../../lib/locale';
import { EmptyState, Skeleton } from '@landmap/ui';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type FormState = {
  label: string;
  city: string;
  type: string;
  modality: string;
  maxPrice: string;
  minArea: string;
};

const EMPTY_FORM: FormState = {
  label: '',
  city: '',
  type: '',
  modality: '',
  maxPrice: '',
  minArea: '',
};

const TYPE_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
];

const MODALITY_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: 'venda', label: 'Venda' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'lancamento', label: 'Lançamento' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertFilter[]>([]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

  useEffect(() => {
    setMounted(true);
    setAlerts(getAlerts());
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) return;

    const next = createAlert({
      label: form.label.trim(),
      city: form.city.trim() || undefined,
      type: form.type || undefined,
      modality: form.modality || undefined,
      maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
      minArea: form.minArea ? Number(form.minArea) : undefined,
    });
    setAlerts(next);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id: string) {
    setAlerts(deleteAlert(id));
  }

  function handleClear() {
    clearAlerts();
    setAlerts([]);
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-10" aria-busy="true">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Alertas</h1>
          <div className="mt-6 grid gap-3" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--primary)]">Monitoramento de busca</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Alertas</h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Salve filtros de busca para consultar rapidamente depois.
            </p>
          </div>
          <Link
            href={localeHref('/', locale)}
            className="text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            Voltar para Home
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 mt-8 p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Novo Alerta</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Label */}
            <div>
              <label className="block mb-1 text-xs text-[var(--muted-foreground)]">
                Nome do alerta <span aria-hidden="true">*</span>
              </label>
              <input
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Ex: Apartamentos SP até 500k"
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition focus:border-[var(--border)]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block mb-1 text-xs text-[var(--muted-foreground)]">Cidade</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition focus:border-[var(--border)]"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block mb-1 text-xs text-[var(--muted-foreground)]">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border)]"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Modality */}
            <div>
              <label className="block mb-1 text-xs text-[var(--muted-foreground)]">Modalidade</label>
              <select
                name="modality"
                value={form.modality}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border)]"
              >
                {MODALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block mb-1 text-xs text-[var(--muted-foreground)]">Preço máx. (R$)</label>
              <input
                name="maxPrice"
                type="number"
                value={form.maxPrice}
                onChange={handleChange}
                placeholder="500000"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition focus:border-[var(--border)]"
              />
            </div>

            {/* Min Area */}
            <div>
              <label className="block mb-1 text-xs text-[var(--muted-foreground)]">Área mín. (m²)</label>
              <input
                name="minArea"
                type="number"
                value={form.minArea}
                onChange={handleChange}
                placeholder="50"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition focus:border-[var(--border)]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!form.label.trim()}
              className="rounded-lg bg-[var(--primary)] px-5 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--card)] disabled:opacity-40"
            >
              Salvar Alerta
            </button>
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className="rounded-lg border border-[var(--border)] px-5 py-2 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              Limpar
            </button>
          </div>
        </form>
        </div>

        {/* Alert list */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 mt-10 p-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} salvo{alerts.length !== 1 ? 's' : ''}
            </p>
            {alerts.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-[var(--destructive)] transition hover:text-[var(--destructive)]"
              >
                Limpar todos
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <EmptyState
              title="Nenhum alerta salvo ainda"
              description="Use o formulário acima para criar o primeiro."
            />
          ) : (
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Alert card                                                        */
/* ------------------------------------------------------------------ */

function AlertCard({
  alert,
  onDelete,
}: {
  alert: AlertFilter;
  onDelete: (id: string) => void;
}) {
  const alertParams = useParams();
  const alertLocale = (alertParams.locale as string) || 'pt-BR';
  const params = new URLSearchParams();
  if (alert.city) params.set('city', alert.city);
  if (alert.type) params.set('type', alert.type);
  if (alert.modality) params.set('modality', alert.modality);
  if (alert.maxPrice) params.set('maxPrice', String(alert.maxPrice));
  if (alert.minArea) params.set('minArea', String(alert.minArea));
  const qs = params.toString();

  const chips: string[] = [];
  if (alert.city) chips.push(alert.city);
  if (alert.type) chips.push({ apartamento: 'Apartamento', casa: 'Casa', terreno: 'Terreno', comercial: 'Comercial' }[alert.type] ?? alert.type);
  if (alert.modality) chips.push({ venda: 'Venda', aluguel: 'Aluguel', lancamento: 'Lançamento' }[alert.modality] ?? alert.modality);
  if (alert.maxPrice) chips.push(`Até ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(alert.maxPrice)}`);
  if (alert.minArea) chips.push(`${alert.minArea}m²+`);

  const createdDate = new Date(alert.createdAt).toLocaleDateString('pt-BR');

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 transition hover:border-[var(--border)]">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{alert.label}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"
            >
              {chip}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">Criado em {createdDate}</p>
      </div>

      <div className="ml-4 flex items-center gap-2 shrink-0">
        <Link
          href={localeHref(`/search${qs ? `?${qs}` : ''}`, alertLocale)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--muted-foreground)] transition hover:border-[var(--border)] hover:text-[var(--foreground)]"
        >
          Buscar
        </Link>
        <button
          onClick={() => onDelete(alert.id)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-red-400 transition hover:border-red-500/50 hover:text-red-300"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
