'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, BellRing, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Button } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const ALERTS = [
  { title: 'Pinheiros subiu 5% no m²', where: 'São Paulo', kind: 'valorização' },
  { title: 'Novo terreno em Batel', where: 'Curitiba', kind: 'oportunidade' },
  { title: 'Risco regulatório atualizado', where: 'Florianópolis', kind: 'alerta' },
];

const v = (k: string) => (k === 'oportunidade' ? 'success' : k === 'alerta' ? 'warning' : 'info');

export default function AlertsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/dashboard')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BellRing className="h-3 w-3" />
            Alertas
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Seus alertas</h1>
          <p className="mt-2 text-sm text-foreground/60">Acompanhe movimentos das suas regiões.</p>
        </div>
        <Button className="h-9 shrink-0 !px-3 text-xs">
          <BellRing className="h-4 w-4" />
          Configurar
        </Button>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Ativos" value="3" />
        <Stat label="Hoje" value="1" />
        <Stat label="Lidas" value="0" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {ALERTS.map((a) => (
          <Card key={a.title} variant="interactive">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{a.title}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.where}</p>
              </div>
              <Badge variant={v(a.kind)}>{a.kind}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
