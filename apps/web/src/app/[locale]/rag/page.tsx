'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, BookOpen, Search, FileText, LandMapWordmark } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Tabs, Accordion, Input, Button } from '@landmap/ui';
import { ApiNotice } from '../../../components/ApiNotice';

type Doc = { id: string; title: string; source: string; snippet: string };

const DOCS: Doc[] = [
  { id: 'd1', title: 'Metodologia de valoração LandMap', source: 'docs/valuation.md', snippet: 'Combina preço/m² de transações, valorização 12m e liquidez por bairro.' },
  { id: 'd2', title: 'Risco regulatório por zona', source: 'docs/risk.md', snippet: 'Classifica zones quanto a restrições de construção e distanciamento.' },
  { id: 'd3', title: 'Glossário de indicadores', source: 'docs/glossary.md', snippet: 'Yield, cap rate, liquidez e valorização explicados.' },
];

const RESULTS = [
  { q: 'como a LandMap calcula valorização?', a: 'A LandMap cruza o preço/m² de transações recentes com a variação dos últimos 12 meses e o volume de buscas na região. (docs/valuation.md)' },
  { q: 'o que é liquidez de um terreno?', a: 'Liquidez mede a facilidade de venda: tempo médio de estoque e número de compradores ativos. (docs/glossary.md)' },
];

export default function RagPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [query, setQuery] = useState('');
  const [asked, setAsked] = useState(false);

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
          <BookOpen className="h-3 w-3" />
          RAG · Base de conhecimento
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Pergunte à base</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Respostas fundamentadas nos documentos oficiais da LandMap.
        </p>
      </div>

      <ApiNotice variant="api" className="mt-4" />

      <Card className="mt-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setAsked(true)}
            placeholder="Faça uma pergunta..."
            aria-label="Pergunta"
            className="border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
      </Card>

      <Tabs tabs={[{ id: 'ask', label: 'Perguntar' }, { id: 'sources', label: 'Fontes' }]} defaultId="ask">
        {(active) =>
          active === 'ask' ? (
            <Reveal className="mt-6 flex flex-col gap-3">
              {asked || query
                ? RESULTS.map((r, i) => (
                    <Card key={i} variant="highlight">
                      <p className="text-sm font-medium">{r.q}</p>
                      <p className="mt-2 text-sm text-foreground/70">{r.a}</p>
                    </Card>
                  ))
                : (
                  <Card>
                    <p className="text-sm text-muted-foreground">Digite uma pergunta para ver respostas da base.</p>
                  </Card>
                )}
            </Reveal>
          ) : (
            <Reveal className="mt-6">
              <Accordion
                type="single"
                defaultValue={['d1']}
                items={DOCS.map((d) => ({
                  id: d.id,
                  title: (
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {d.title}
                    </span>
                  ),
                  content: (
                    <div>
                      <Badge variant="outline">{d.source}</Badge>
                      <p className="mt-2 text-sm text-foreground/70">{d.snippet}</p>
                    </div>
                  ),
                }))}
              />
            </Reveal>
          )
        }
      </Tabs>
    </main>
  );
}
