'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, BookOpen, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const DOCS = [
  { title: 'Como ler o índice de liquidez', tag: 'guia', read: '4 min' },
  { title: 'Validação de zoneamento', tag: 'técnico', read: '7 min' },
  { title: 'Pipeline de automação passo a passo', tag: 'tutorial', read: '6 min' },
  { title: 'Glossário de indicadores', tag: 'referência', read: '3 min' },
];

export default function KnowledgePage() {
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
          <BookOpen className="h-3 w-3" />
          Central de conhecimento
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Aprenda o método LandMap</h1>
        <p className="mt-2 text-sm text-foreground/60">Guias, tutoriais e referências para usar a plataforma como um pro.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Artigos" value="42" />
        <Stat label="Tutoriais" value="11" trend={9} />
        <Stat label="Categorias" value="5" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {DOCS.map((d) => (
          <Card key={d.title} variant="interactive">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{d.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.read} de leitura</p>
              </div>
              <Badge variant="outline">{d.tag}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Conteúdo curado pela equipe LandMap.
      </div>
    </main>
  );
}
