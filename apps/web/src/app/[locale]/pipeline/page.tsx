'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, GitBranch, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Segmented, Button } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const STAGES = [
  { value: 'scout', label: 'Scout' },
  { value: 'analyze', label: 'Análise' },
  { value: 'write', label: 'Redação' },
  { value: 'notify', label: 'Notificar' },
];

const DESCR: Record<string, string> = {
  scout: 'O agente Scout varre a base e qualifica terrenos por critérios de yield e liquidez.',
  analyze: 'O Analyzer gera o relatório de risco e valorização da região.',
  write: 'O Writer redige a descrição do anúncio e o e-mail de abordagem.',
  notify: 'O pipeline dispara notificação no app e cria a tarefa de follow-up.',
};

export default function PipelinePage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [stage, setStage] = useState('scout');

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
          <GitBranch className="h-3 w-3" />
          Pipeline de IA
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Funil autônomo</h1>
        <p className="mt-2 text-sm text-foreground/60">Visualize e conecte cada estágio do seu pipeline.</p>
      </div>

      <Card className="mt-6">
        <Segmented aria-label="Estágio" options={STAGES} value={stage} onChange={setStage} />
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm text-foreground/70">{DESCR[stage]}</p>
        </div>
        <Button className="mt-4 w-full">
          <GitBranch className="h-4 w-4" />
          Executar pipeline
        </Button>
      </Card>

      <Reveal className="mt-6 flex flex-col gap-2">
        {STAGES.map((s, i) => (
          <Card key={s.value} variant={s.value === stage ? 'highlight' : 'default'}>
            <p className="text-sm">
              <span className="mr-2 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </p>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
