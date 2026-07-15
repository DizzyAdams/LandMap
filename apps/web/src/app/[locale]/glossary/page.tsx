'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, BookA, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const TERMS = [
  { term: 'Liquidez', def: 'Facilidade de vender o ativo sem perda significativa de preço.' },
  { term: 'Valorização', def: 'Variação percentual do preço/m² em um período.' },
  { term: 'Yield', def: 'Retorno anual estimado sobre o capital investido.' },
  { term: 'Zoneamento', def: 'Classificação de uso do solo (residencial, comercial, misto).' },
  { term: 'Cap rate', def: 'Taxa de capitalização: renda líquida sobre o valor do imóvel.' },
];

export default function GlossaryPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/knowledge')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BookA className="h-3 w-3" />
          Glossário
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Termos de mercado</h1>
        <p className="mt-2 text-sm text-foreground/60">O vocabulário que usamos na plataforma.</p>
      </div>

      <Reveal className="mt-6 flex flex-col gap-3">
        {TERMS.map((t) => (
          <Card key={t.term} variant="interactive">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{t.term}</p>
                  <Badge variant="outline">termo</Badge>
                </div>
                <p className="mt-1 text-sm text-foreground/70">{t.def}</p>
              </div>
            </div>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
