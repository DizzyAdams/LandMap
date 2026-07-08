'use client';

type Status = 'active' | 'inactive' | 'pending' | 'sold' | 'reserved';

const colorMap: Record<Status, string> = {
  active: 'border-emerald-800 text-emerald-400 bg-emerald-950/40',
  inactive: 'border-neutral-700 text-neutral-400 bg-neutral-950/40',
  pending: 'border-amber-800 text-amber-400 bg-amber-950/40',
  sold: 'border-red-800 text-red-400 bg-red-950/40',
  reserved: 'border-blue-800 text-blue-400 bg-blue-950/40',
};

const labelMap: Record<Status, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  sold: 'Vendido',
  reserved: 'Reservado',
};

export function StatusBadge({
  status,
  label,
}: {
  status: Status;
  label?: string;
}) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${colorMap[status] ?? 'border-neutral-800 text-neutral-400'}`}
    >
      {label ?? labelMap[status] ?? status}
    </span>
  );
}
