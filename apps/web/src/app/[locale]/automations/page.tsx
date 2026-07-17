'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Workflow } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const RULES = [
  { name: 'Score ≥ 90 → favoritar', on: true, runs: 128 },
  { name: 'Valorização 12m > 6% → alerta', on: true, runs: 86 },
  { name: 'Risco enchente alto → e-mail', on: true, runs: 12 },
  { name: 'Novo lead em Meireles → CRM', on: false, runs: 0 },
  { name: 'Digest semanal → WhatsApp', on: true, runs: 4 },
  { name: 'Markdown novo → index RAG', on: true, runs: 3000 },
];

export default function AutomationsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const on = RULES.filter((r) => r.on).length;

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <Workflow className="h-3 w-3" /> Automações
        </>
      }
      title="Regras que rodam sozinhas"
      description="Gatilhos sobre Score, camadas e leads — conectados aos fluxos."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Regras" value={String(RULES.length)} />
        <Stat label="Ativas" value={String(on)} />
        <Stat label="Execuções" value={String(RULES.reduce((s, r) => s + r.runs, 0))} />
      </section>

      <div className="mt-4 flex gap-2">
        <Link href={lh('/workflows')} className={cn(buttonVariants({ size: 'sm' }))}>
          Fluxos
        </Link>
        <Link href={lh('/alerts')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Alertas
        </Link>
      </div>

      <Reveal className="mt-6 space-y-3">
        {RULES.map((r) => (
          <Card key={r.name} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.runs} execuções</p>
            </div>
            <Badge variant={r.on ? 'success' : 'outline'}>{r.on ? 'on' : 'off'}</Badge>
          </Card>
        ))}
      </Reveal>
    </ProductPageShell>
  );
}
