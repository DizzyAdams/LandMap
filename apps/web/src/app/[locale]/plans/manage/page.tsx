'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Sparkles, Check, ArrowLeft, LandMapWordmark } from '../../../../components/lovable/icons';
import { Card, Badge, buttonVariants, cn } from '@landmap/ui';
import { usePlan } from '../../../../lib/usePlan';
import { PLANS, formatBRL, type PlanId } from '../../../../lib/plans';

export default function PlansManagePage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const { plan, planName, upgrade, reset } = usePlan();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/plans')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Gerenciar assinatura
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Sua assinatura</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Plano atual: <strong>{planName}</strong>. No modo demonstração você pode alternar
          planos livremente (sem cobrança real) para explorar os recursos pagos.
        </p>
      </div>

      <section className="mt-6 grid gap-3">
        {PLANS.map((p) => {
          const isActive = p.id === plan;
          return (
            <Card
              key={p.id}
              variant={isActive ? 'highlight' : 'default'}
              className={cn('flex items-center justify-between p-4', !isActive && 'cursor-default')}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  {isActive && <Badge variant="success">ativo</Badge>}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {p.tagline} · R$ {formatBRL(p.priceBRL)}/mês
                </p>
              </div>
              {isActive ? (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => upgrade(p.id as PlanId)}
                  className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
                >
                  Ativar demo
                </button>
              )}
            </Card>
          );
        })}
      </section>

      {plan !== 'free' && (
        <button
          type="button"
          onClick={reset}
          className="mt-4 self-start text-xs text-[var(--muted-foreground)] underline-offset-2 hover:text-[var(--destructive)] hover:underline"
        >
          Voltar para o plano grátis (demo)
        </button>
      )}

      <p className="mt-6 text-center text-[11px] text-foreground/40">
        Pagamento não ativado — fluxo de demonstração.
      </p>
    </main>
  );
}
