'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Sparkles, ShieldCheck, Activity, LandMapWordmark } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { ApiNotice } from '../../../components/ApiNotice';

type Service = {
  name: string;
  status: 'operational' | 'degraded' | 'maintenance';
  latency: number;
  uptime: number;
};

const SERVICES: Service[] = [
  { name: 'API de markdowns', status: 'operational', latency: 38, uptime: 99.98 },
  { name: 'Mapa de valoração', status: 'operational', latency: 44, uptime: 99.95 },
  { name: 'Radar de oportunidades', status: 'operational', latency: 51, uptime: 99.91 },
  { name: 'Autenticação', status: 'degraded', latency: 120, uptime: 99.7 },
  { name: 'Processamento de IA', status: 'maintenance', latency: 0, uptime: 99.4 },
];

const statusBadge = (s: Service['status']) =>
  s === 'operational' ? 'success' : s === 'degraded' ? 'warning' : 'outline';

const statusLabel = (s: Service['status']) =>
  s === 'operational' ? 'Operacional' : s === 'degraded' ? 'Degradado' : 'Manutenção';

export default function StatusPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/map')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Activity className="h-3 w-3" />
          Status do sistema
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Tudo operando</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Acompanhe a saúde dos serviços LandMap em tempo real.
        </p>
      </div>

      <ApiNotice variant="datadog" className="mt-4" />

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Uptime global" value="99,9%" />
        <Stat label="Serviços ativos" value="5" />
        <Stat label="Incidentes (30d)" value="0" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {SERVICES.map((s) => (
          <Card key={s.name} variant="interactive">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.status === 'maintenance' ? 'Em manutenção' : `${s.latency}ms · uptime ${s.uptime}%`}
                </p>
              </div>
              <Badge variant={statusBadge(s.status)}>{statusLabel(s.status)}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        SLA LandMap Plus e acima.
      </div>
    </main>
  );
}
