'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Workflow, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const FLOWS = [
  { name: 'Onboarding de lead', steps: 4, status: 'ativo' },
  { name: 'Qualificação automática', steps: 3, status: 'ativo' },
  { name: 'Follow-up de proposta', steps: 5, status: 'ativo' },
  { name: 'Pós-venda', steps: 3, status: 'beta' },
];

export default function WorkflowsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/assistant')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Workflow className="h-3 w-3" />
          Fluxos de trabalho
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Automação ponta a ponta</h1>
        <p className="mt-2 text-sm text-foreground/60">Templates de fluxo prontos para o seu operacional.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Fluxos" value="4" />
        <Stat label="Passos no total" value="15" />
        <Stat label="Ativos" value="3" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {FLOWS.map((f) => (
          <Card key={f.name} variant={f.status === 'ativo' ? 'interactive' : 'default'}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{f.name}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.steps} passos</p>
              </div>
              <Badge variant={f.status === 'ativo' ? 'success' : 'warning'}>{f.status}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Editor visual no plano Pro.
      </div>
    </main>
  );
}
