'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Bot, Sparkles, LandMapWordmark } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge } from '@landmap/ui';
import { ApiNotice } from '../../../components/ApiNotice';

type Agent = {
  id: string;
  name: string;
  role: string;
  status: 'pronto' | 'treinando' | 'beta';
};

const AGENTS: Agent[] = [
  { id: 'a1', name: 'Scout', role: 'Busca e qualifica terrenos', status: 'pronto' },
  { id: 'a2', name: 'Analyzer', role: 'Cruza dados e gera relatório de risco', status: 'pronto' },
  { id: 'a3', name: 'Writer', role: 'Redige anúncios e e-mails', status: 'pronto' },
  { id: 'a4', name: 'Negotiator', role: 'Sugere estratégia de proposta', status: 'beta' },
  { id: 'a5', name: 'Closer', role: 'Acompanha pipeline até o fechamento', status: 'treinando' },
];

const variant = (s: Agent['status']) => (s === 'pronto' ? 'success' : s === 'beta' ? 'warning' : 'outline');

export default function AgentsPage() {
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
          <Bot className="h-3 w-3" />
          Catálogo de agentes
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Agentes IA LandMap</h1>
        <p className="mt-2 text-sm text-foreground/60">Especialistas autônomos para cada etapa do seu funil.</p>
      </div>

      <ApiNotice variant="api" className="mt-4" />

      <Reveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {AGENTS.map((a) => (
          <Card key={a.id} variant="interactive">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.name}</p>
                  <Badge variant={variant(a.status)}>{a.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Orquestre agentes no plano Business.
      </div>
    </main>
  );
}
