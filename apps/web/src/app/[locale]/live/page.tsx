'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Activity, Sparkles, BellRing } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, AnimatedNumber } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Pulse = {
  id: string;
  city: string;
  event: string;
  delta: number;
  time: string;
};

const PULSES: Pulse[] = [
  { id: 'p1', city: 'São Paulo', event: 'Nova valorização detectada · Pinheiros', delta: 2.4, time: 'há 4 min' },
  { id: 'p2', city: 'Curitiba', event: 'Alerta de queda · Água Verde', delta: -1.1, time: 'há 11 min' },
  { id: 'p3', city: 'Florianópolis', event: 'Pico de buscas · Campeche', delta: 5.6, time: 'há 23 min' },
  { id: 'p4', city: 'Belo Horizonte', event: 'Oportunidade aberta · Lourdes', delta: 3.0, time: 'há 38 min' },
  { id: 'p5', city: 'Recife', event: 'Volume de ofertas estável · Boa Viagem', delta: 0.2, time: 'há 52 min' },
];

export default function LivePage() {
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
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Ao vivo
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Pulso do mercado</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Eventos de valorização e movimento de demanda atualizados em tempo real.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-xs text-muted-foreground">Eventos hoje</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            <AnimatedNumber value={128} />
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground">Cidades ativas</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            <AnimatedNumber value={10} />
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground">Latência</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            <AnimatedNumber value={42} suffix="ms" />
          </p>
        </Card>
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {PULSES.map((p) => (
          <Card key={p.id} variant="interactive">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.event}</p>
                <p className="text-xs text-muted-foreground">
                  {p.city} · {p.time}
                </p>
              </div>
              <Badge variant={p.delta >= 0 ? 'success' : 'destructive'}>
                {p.delta >= 0 ? '+' : ''}
                {p.delta}%
              </Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <BellRing className="h-4 w-4" />
        Ative alertas inteligentes no plano Plus.
      </div>
    </main>
  );
}
