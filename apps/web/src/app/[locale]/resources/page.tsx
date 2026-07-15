'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, BookOpen, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const POSTS = [
  { title: 'Como ler o índice de liquidez', cat: 'análise', read: '4 min' },
  { title: '3 sinais de valorização precoce', cat: 'estratégia', read: '6 min' },
  { title: 'Risco regulatório: o que mudou', cat: 'técnico', read: '7 min' },
  { title: 'Guia de due diligence para terrenos', cat: 'tutorial', read: '9 min' },
];

export default function ResourcesPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BookOpen className="h-3 w-3" />
          Recursos
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Blog & materiais</h1>
        <p className="mt-2 text-sm text-foreground/60">Conteúdo para decidir melhor, mais rápido.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Artigos" value="48" />
        <Stat label="Guias" value="14" trend={8} />
        <Stat label="Categorias" value="6" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {POSTS.map((p) => (
          <Card key={p.title} variant="interactive">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.read} de leitura</p>
              </div>
              <Badge variant="outline">{p.cat}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Curadoria da equipe LandMap.
      </div>
    </main>
  );
}
