'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import { Sparkles, Lock } from './lovable/icons';
import { Card, Badge, buttonVariants, cn } from '@landmap/ui';
import { usePlan } from '../lib/usePlan';
import { formatBRL, planMeta, type PlanId } from '../lib/plans';

/**
 * Shows children only if the user has reached `required` plan tier (demo-mode,
 * localStorage). Otherwise renders an upgrade prompt (or `fallback`).
 */
export function PlanGate({
  required,
  children,
  fallback,
  upgradeHref = '/plans',
}: {
  required: PlanId;
  children: ReactNode;
  fallback?: ReactNode;
  upgradeHref?: string;
}) {
  const { has } = usePlan();
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  if (has(required)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  const meta = planMeta(required);

  return (
    <Card variant="highlight" className="flex flex-col items-center gap-3 p-6 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
        <Lock className="h-3 w-3" /> Recurso {meta ? meta.name.replace('LandMap ', '') : ''}
      </span>
      <h3 className="font-display text-lg font-semibold">Exclusivo para planos pagos</h3>
      <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
        Este recurso está disponível a partir do <strong>{meta?.name ?? required}</strong>. Faça
        upgrade para desbloquear relatórios, monitoramento e muito mais.
      </p>
      <div className="flex items-center gap-3">
        <Link href={lh(upgradeHref)} className={cn(buttonVariants({ size: 'md' }))}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Assinar {meta?.name ?? 'plano'}
          {meta && <span className="ml-1.5 text-xs opacity-80">R$ {formatBRL(meta.priceBRL)}/mês</span>}
        </Link>
      </div>
    </Card>
  );
}

/** Inline badge reflecting the current plan (used in the Navbar). */
export function PlanBadge() {
  const { plan, planName } = usePlan();
  const locale = useLocale();
  if (plan === 'free') return null;
  return (
    <Link
      href={`/${locale}/plans/manage`}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)] transition hover:border-[var(--ring)]"
      title={planName}
    >
      <Sparkles className="h-3 w-3" />
      {planName.replace('LandMap ', '')}
    </Link>
  );
}
