'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Activity, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Progress, buttonVariants, cn } from '@landmap/ui';

const STAGES = [
  { name: 'Ingestão', pct: 100, detail: 'Markdowns + geo' },
  { name: 'Scoring', pct: 100, detail: 'Score LandMap' },
  { name: 'Radar', pct: 92, detail: 'Oportunidades' },
  { name: 'Alertas', pct: 78, detail: 'Regras ativas' },
  { name: 'CRM', pct: 64, detail: 'Leads sync' },
  { name: 'Export', pct: 40, detail: 'Webhooks' },
];

export default function PipelinePage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <Activity className="h-3 w-3" /> Pipeline IA
        </>
      }
      title="Pipeline de inteligência"
      description="Do dado bruto ao lead — etapas do fluxo LandMap."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Etapas" value={String(STAGES.length)} />
        <Stat label="Saudável" value="4/6" />
        <Stat label="Throughput" value="3k/dia" trend={12} />
      </section>

      <Reveal className="mt-6 space-y-4">
        {STAGES.map((s) => (
          <Card key={s.name} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{s.name}</p>
              <Badge variant={s.pct >= 90 ? 'success' : s.pct >= 60 ? 'info' : 'warning'}>
                {s.pct}%
              </Badge>
            </div>
            <Progress value={s.pct} />
            <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
          </Card>
        ))}
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={lh('/leads')} className={cn(buttonVariants({ size: 'sm' }))}>
          Leads
        </Link>
        <Link href={lh('/kpis')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          KPIs
        </Link>
        <Link href={lh('/map')} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          Mapa
        </Link>
      </div>
    </ProductPageShell>
  );
}
