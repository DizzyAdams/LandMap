'use client';

import { useEffect, useState, useCallback } from 'react';
import { LANDMAP_API_BASE } from '../../../../lib/api';

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
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-900/40" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-neutral-50">Imóveis</h2>
          <p className="mt-1 text-xs text-neutral-500">
            {properties.length} imóvel(is) cadastrado(s)
          </p>
        </div>
        <button
          onClick={() => load()}
          className="rounded-lg border border-neutral-800 px-4 py-1.5 text-[11px] text-neutral-400 transition hover:border-neutral-500 hover:text-white"
        >
          Atualizar
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-900/60">
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
                className="border-b border-neutral-800/50 transition hover:bg-neutral-900/20"
              >
                <td className="px-4 py-3 text-neutral-50">{p.title}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {p.city}/{p.state}
                </td>
                <td className="px-4 py-3 text-neutral-200 font-mono text-xs">
                  {formatBRL(p.price)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-md border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[11px] text-neutral-400">
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(p)}
                    className="mr-2 rounded-md border border-neutral-800 px-2.5 py-1 text-[11px] text-neutral-400 transition hover:border-neutral-500 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-md border border-neutral-800 px-2.5 py-1 text-[11px] text-red-400 transition hover:border-red-500/50 hover:text-red-300"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-600">
                  Nenhum imóvel encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/70 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
          >
            <h3 className="text-sm font-medium text-neutral-50">Editar Imóvel</h3>
            <p className="mt-1 text-[11px] text-neutral-500">ID: {editId}</p>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Título">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Preço (R$)">
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
                  />
                </Field>
                <Field label="Área (m²)">
                  <input
                    type="number"
                    value={editForm.areaM2}
                    onChange={(e) => setEditForm((f) => ({ ...f, areaM2: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo">
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
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
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
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
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
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
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-neutral-500"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-400 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-neutral-50 px-4 py-2 text-xs font-medium text-[#050505] transition hover:bg-neutral-200 disabled:opacity-40"
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
    <th className={`px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 ${className ?? ''}`}>
      {children}
    </th>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'border-emerald-800 text-emerald-400 bg-emerald-950/40',
    sold: 'border-red-800 text-red-400 bg-red-950/40',
    rented: 'border-cyan-800 text-cyan-400 bg-cyan-950/40',
    reserved: 'border-violet-800 text-violet-400 bg-violet-950/40',
  };
  const labels: Record<string, string> = {
    active: 'Ativo',
    sold: 'Vendido',
    rented: 'Alugado',
    reserved: 'Reservado',
  };
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${colors[status] ?? 'border-neutral-800 text-neutral-400'}`}
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
