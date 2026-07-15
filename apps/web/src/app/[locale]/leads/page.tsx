'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, User, Sparkles, LandMapWordmark } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';

const LEADS = [
  { name: 'Construtora Aurora', source: 'Site', score: 92, stage: 'qualificado' },
  { name: 'Investidor João P.', source: 'Indicação', score: 81, stage: 'contato' },
  { name: 'Family Office Beta', source: 'RAG', score: 76, stage: 'nutrição' },
];

export default function LeadsPage() {
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

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <User className="h-3 w-3" />
          Leads
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Seus leads</h1>
        <p className="mt-2 text-sm text-foreground/60">Oportunidades rankeadas e qualificadas por IA.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Leads" value="3" />
        <Stat label="Score médio" value="83" trend={7} />
        <Stat label="Pipeline" value="R$ 4.1M" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {LEADS.map((l) => (
          <Card key={l.name} variant="interactive">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{l.name}</p>
                  <Badge variant="info">{l.score}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">origem: {l.source}</p>
              </div>
              <Badge variant="outline">{l.stage}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
