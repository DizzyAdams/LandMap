import React from 'react';
import { cn } from '@landmap/ui';

/*
 * Local mirror of the @landmap/invest InvestmentGrade / InvestmentResult types.
 *
 * apps/web does not declare @landmap/invest as a dependency yet, and its
 * tsconfig @landmap/* wildcard resolves to ../<pkg>/src/index.ts (i.e. apps/invest,
 * which does not exist) - so a real import would break typecheck. We keep this
 * component self-contained and type-safe.
 *
 * When @landmap/invest is added to @landmap/web dependencies (and built),
 * replace the two types below with:
 *   import type { InvestmentResult, InvestmentGrade } from '@landmap/invest';
 * The field names here match packages/invest/src/types.ts 1:1.
 */
export type InvestmentGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/** Subset of InvestmentResult consumed by this card. */
export interface InvestmentResultLike {
  /** Cap rate (NOI / price). Fraction 0..1. */
  capRate: number;
  /** Fluxo de caixa mensal (BRL, pode ser negativo). */
  monthlyCashflow: number;
  /** Retorno total em % (fluxo acumulado + ganho de capital liquido de IR). */
  totalReturnPct: number;
  /** Nota qualitativa A..F. */
  grade: InvestmentGrade;
}

export interface InvestmentCardProps {
  title: string;
  subtitle?: string;
  /** Purchase price (BRL) - not present on InvestmentResult, passed separately. */
  price: number;
  result: InvestmentResultLike;
  href?: string;
  className?: string;
}

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const pct = (frac: number) => `${(frac * 100).toFixed(1)}%`;

// Grade A-F -> brand-accent treatment (matches the design-system token palette).
const gradeStyle: Record<InvestmentGrade, React.CSSProperties> = {
  A: { color: 'var(--emerald-bright)', borderColor: 'color-mix(in srgb, var(--emerald) 50%, transparent)', background: 'var(--emerald-tint)' },
  B: { color: 'var(--cyan)', borderColor: 'color-mix(in srgb, var(--cyan) 50%, transparent)', background: 'var(--cyan-tint)' },
  C: { color: 'var(--violet)', borderColor: 'color-mix(in srgb, var(--violet) 50%, transparent)', background: 'var(--violet-tint)' },
  D: { color: 'var(--gold-soft)', borderColor: 'color-mix(in srgb, var(--gold) 50%, transparent)', background: 'var(--gold-tint)' },
  F: { color: '#ff8a8a', borderColor: 'color-mix(in srgb, var(--danger) 50%, transparent)', background: 'color-mix(in srgb, var(--danger) 14%, transparent)' },
};

/*
 * Presentational card that renders an InvestmentResultLike (mirror of
 * @landmap/invest InvestmentResult). Shows the A-F grade chip plus
 * cap-rate / monthly-cashflow / ROI tiles.
 */
export function InvestmentCard({ title, subtitle, price, result, href, className }: InvestmentCardProps) {
  const g = gradeStyle[result.grade];
  const cashflowTone: 'emerald' | 'danger' = result.monthlyCashflow >= 0 ? 'emerald' : 'danger';
  const roiTone: 'emerald' | 'danger' = result.totalReturnPct > 0 ? 'emerald' : 'danger';

  const body = (
    <div
      className={cn('glass', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 18,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-strong, #fff)', margin: 0 }}>{title}</p>
          {subtitle ? (
            <p style={{ fontSize: 12, color: 'var(--muted, #a3a3a3)', margin: '4px 0 0' }}>{subtitle}</p>
          ) : null}
        </div>
        <div
          aria-label={`Nota de investimento ${result.grade}`}
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: `1px solid ${g.borderColor}`,
            background: g.background,
            color: g.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {result.grade}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted, #a3a3a3)' }}>
        Preco{' '}
        <span style={{ color: 'var(--text-strong, #fff)', fontWeight: 600 }}>{brl(price)}</span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <MiniStat label="Cap rate" value={pct(result.capRate)} tone="emerald" />
        <MiniStat label="Cashflow/mes" value={brl(result.monthlyCashflow)} tone={cashflowTone} />
        <MiniStat label="ROI" value={pct(result.totalReturnPct)} tone={roiTone} />
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none', display: 'block' }} className="motion-reduce:transition-none focus-visible:shadow-[var(--ring)] outline-none">
        {body}
      </a>
    );
  }
  return body;
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'emerald' | 'danger';
}) {
  const color = tone === 'emerald' ? 'var(--emerald-bright)' : '#ff8a8a';
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--muted, #a3a3a3)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
