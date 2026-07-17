'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Activity, Check, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const SERVICES = [
  { name: 'Web (Next.js)', status: 'operational', latency: '42ms' },
  { name: 'Mapa intelligence', status: 'operational', latency: '—' },
  { name: 'API /api/markdowns', status: 'operational', latency: '95ms' },
  { name: 'API /api/market/heatmap', status: 'operational', latency: '110ms' },
  { name: 'Geo autocomplete', status: 'operational', latency: '180ms' },
  { name: 'Opportunities', status: 'operational', latency: '88ms' },
  { name: 'RAG /rag/query', status: 'operational', latency: 'TF-IDF' },
  { name: 'Webhooks dispatcher', status: 'operational', latency: 'HMAC' },
  { name: 'Integrações live', status: 'operational', latency: 'var' },
];

const INCIDENTS = [
  { date: '2026-07-10', title: 'Latência elevada no RAG', resolved: true },
  { date: '2026-07-05', title: 'Manutenção programada heatmap', resolved: true },
];

export default function StatusPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const up = SERVICES.filter((s) => s.status === 'operational').length;

  return (
    <ProductPageShell
      backHref="/developers"
      eyebrow={
        <>
          <Activity className="h-3 w-3" /> Status
        </>
      }
      title="Status da plataforma"
      description="Saúde dos serviços LandMap — demo com latências ilustrativas."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Serviços" value={String(SERVICES.length)} />
        <Stat label="Operacionais" value={String(up)} />
        <Stat label="Degradados" value={String(SERVICES.length - up)} />
      </section>

      <Card className="mt-4 border-primary/20 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Check className="h-4 w-4" />
          Todos os sistemas críticos do mapa estão operacionais.
        </p>
      </Card>

      <Reveal className="mt-6 space-y-2">
        {SERVICES.map((s) => (
          <Card key={s.name} className="flex items-center justify-between p-3">
            <span className="text-sm font-medium">{s.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">{s.latency}</span>
              <Badge variant={s.status === 'operational' ? 'success' : 'warning'}>
                {s.status}
              </Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <h2 className="mt-8 text-sm font-semibold">Incidentes recentes</h2>
      <ul className="mt-3 space-y-2">
        {INCIDENTS.map((i) => (
          <li key={i.date} className="flex justify-between text-sm text-muted-foreground">
            <span>
              {i.date} · {i.title}
            </span>
            <Badge variant="outline">resolvido</Badge>
          </li>
        ))}
      </ul>

      <Link href={lh('/developers')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6')}>
        API docs
      </Link>
    </ProductPageShell>
  );
}
