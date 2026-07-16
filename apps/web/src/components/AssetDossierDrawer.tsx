'use client';

import { Badge, Button, Card, cn } from '@landmap/ui';
import { MapPin, TrendingUp, X } from './lovable/icons';
import type { Property } from '../lib/api';
import { gradeToken, propertyGrade, propertyScore } from '../lib/geoMath';

function brl(n?: number) {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(frac?: number) {
  if (frac == null || !Number.isFinite(frac)) return '—';
  return `${(frac * 100).toFixed(2)}%`;
}

type Props = {
  asset: Property | null;
  onClose: () => void;
  locale?: string;
};

/**
 * Drawer de dossiê investidor — só tokens Lovable + @landmap/ui.
 */
export function AssetDossierDrawer({ asset, onClose }: Props) {
  if (!asset) return null;

  const grade = propertyGrade(asset);
  const score = propertyScore(asset);
  const inv = asset.invest || {};
  const market = asset.market || {};
  const thesis = asset.thesis || [];
  const drivers = asset.drivers || [];
  const risks = asset.risks || [];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[600] mx-auto max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md sm:px-0"
      role="dialog"
      aria-modal="true"
      aria-label={`Dossiê ${asset.title}`}
    >
      <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)]/95 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)]/60 px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold text-[var(--primary-foreground)]"
                style={{ background: gradeToken(grade) }}
              >
                {grade}
              </span>
              <Badge variant="info">{asset.type}</Badge>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Free · schema v2
              </span>
            </div>
            <h2 className="mt-1.5 truncate font-display text-base font-semibold tracking-tight text-[var(--foreground)]">
              {asset.title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {asset.neighborhood ? `${asset.neighborhood}, ` : ''}
                {asset.city}/{asset.state}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar dossiê"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Score</p>
            <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
              {Math.round(score)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Cap rate</p>
            <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-[var(--primary)]">
              {pct(asset.capRate ?? inv.capRate)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Preço</p>
            <p className="mt-0.5 truncate font-display text-sm font-bold tabular-nums text-[var(--foreground)]">
              {brl(asset.price)}
            </p>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <span>
              {asset.areaM2} m² · {brl(asset.pricePerM2 ?? (asset.areaM2 ? asset.price / asset.areaM2 : 0))}/m²
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-[var(--primary)]" />
              IRR {pct(inv.irrPct)} · CoC {pct(inv.cashOnCash)}
            </span>
          </div>

          {thesis.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Tese
              </p>
              <ul className="mt-1.5 space-y-1">
                {thesis.slice(0, 3).map((t) => (
                  <li key={t} className="text-sm leading-snug text-[var(--foreground)]/85">
                    · {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(drivers.length > 0 || risks.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {drivers.slice(0, 3).map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]"
                >
                  {d.replace(/_/g, ' ')}
                </span>
              ))}
              {risks.slice(0, 2).map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-[var(--warning)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--warning)]"
                >
                  risco: {r.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {market.liquidityScore != null && (
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Liquidez bairro {market.liquidityScore}/100 · demanda {market.demandWeight ?? '—'} · m²
              médio {brl(market.neighborhoodAvgPricePerM2)}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" className="flex-1" onClick={onClose}>
              Continuar no mapa
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AssetDossierDrawerBackdrop({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <button
      type="button"
      aria-label="Fechar"
      className={cn(
        'fixed inset-0 z-[590] bg-[var(--foreground)]/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-0',
      )}
      onClick={onClose}
    />
  );
}
