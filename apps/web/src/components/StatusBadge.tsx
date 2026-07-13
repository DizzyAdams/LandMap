'use client';

type Status = 'active' | 'inactive' | 'pending' | 'sold' | 'reserved';

const colorMap: Record<Status, string> = {
  active: 'border-[var(--success)] text-[var(--success)] bg-[var(--success)]/30',
  inactive: 'border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--muted)]',
  pending: 'border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/30',
  sold: 'border-[var(--destructive)] text-[var(--destructive)] bg-[var(--destructive)]/30',
  reserved: 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/30',
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
      role="status"
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${colorMap[status] ?? 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
    >
      {label ?? labelMap[status] ?? status}
    </span>
  );
}
