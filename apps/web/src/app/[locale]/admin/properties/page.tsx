'use client';

import { useEffect, useState, useCallback } from 'react';
import { LANDMAP_API_BASE } from '../../../../lib/api';
import { Building2, Plus, Trash2, X } from '../../../../components/lovable/icons';

type Property = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  type: string;
  modality: string;
  status: string;
  available: boolean;
  bedrooms?: number;
};

type EditForm = {
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  type: string;
  modality: string;
  status: string;
  bedrooms: number;
};

const INITIAL_EDIT: EditForm = {
  title: '',
  city: '',
  state: '',
  price: 0,
  areaM2: 0,
  type: 'apartamento',
  modality: 'venda',
  status: 'active',
  bedrooms: 0,
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(INITIAL_EDIT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${LANDMAP_API_BASE}/admin/properties?pageSize=100`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setProperties(data.items ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(p: Property) {
    setEditId(p.id);
    setEditForm({
      title: p.title,
      city: p.city,
      state: p.state,
      price: p.price,
      areaM2: p.areaM2,
      type: p.type,
      modality: p.modality,
      status: p.status,
      bedrooms: p.bedrooms ?? 0,
    });
  }

  function closeEdit() {
    setEditId(null);
    setEditForm(INITIAL_EDIT);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    try {
      await fetch(`${LANDMAP_API_BASE}/admin/properties/${editId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      closeEdit();
      await load();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este imóvel?')) return;
    try {
      await fetch(`${LANDMAP_API_BASE}/admin/properties/${id}`, { method: 'DELETE' });
      await load();
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--muted)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--primary)]">Catálogo de imóveis</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">Imóveis</h1>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {properties.length} imóvel(is) cadastrado(s)
            </p>
          </div>
        </header>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-1.5 text-[11px] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Atualizar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]">
              <tr>
                <Th>Título</Th>
                <Th>Cidade</Th>
                <Th>Preço</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] transition hover:bg-[var(--muted)]"
                >
                  <td className="px-4 py-3 text-[var(--foreground)]">{p.title}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {p.city}/{p.state}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)] font-mono text-xs">
                    {formatBRL(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="mr-2 inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--destructive)] transition hover:bg-[var(--destructive)]/10"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/40 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--foreground)]">Editar Imóvel</h3>
              <button
                type="button"
                onClick={closeEdit}
                aria-label="Fechar"
                className="rounded-md p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">ID: {editId}</p>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Título">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Preço (R$)">
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </Field>
                <Field label="Área (m²)">
                  <input
                    type="number"
                    value={editForm.areaM2}
                    onChange={(e) => setEditForm((f) => ({ ...f, areaM2: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo">
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </Field>
                <Field label="Modalidade">
                  <select
                    value={editForm.modality}
                    onChange={(e) => setEditForm((f) => ({ ...f, modality: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="lancamento">Lançamento</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="active">Ativo</option>
                    <option value="sold">Vendido</option>
                    <option value="rented">Alugado</option>
                    <option value="reserved">Reservado</option>
                  </select>
                </Field>
                <Field label="Quartos">
                  <input
                    type="number"
                    value={editForm.bedrooms}
                    onChange={(e) => setEditForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary)]/90 disabled:opacity-40"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ─── */

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] ${className ?? ''}`}>
      {children}
    </th>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'border-[var(--border)] text-[var(--success)]',
    sold: 'border-[var(--border)] text-[var(--destructive)]',
    rented: 'border-[var(--border)] text-[var(--ring)]',
    reserved: 'border-[var(--border)] text-[var(--primary)]',
  };
  const labels: Record<string, string> = {
    active: 'Ativo',
    sold: 'Vendido',
    rented: 'Alugado',
    reserved: 'Reservado',
  };
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${colors[status] ?? 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}
