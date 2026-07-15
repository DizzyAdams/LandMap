'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Sparkles, MessageSquare, PenLine, BookOpen, Workflow, Bot, Star } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const FEATURES = [
  { href: 'chat', icon: MessageSquare, title: 'LandBot', desc: 'Converse com a IA sobre qualquer região.' },
  { href: 'writer', icon: PenLine, title: 'Redator IA', desc: 'Gere descrições de anúncios.' },
  { href: 'rag', icon: BookOpen, title: 'Base de conhecimento', desc: 'Perguntas sobre RAG da LandMap.' },
  { href: 'automations', icon: Workflow, title: 'Automações', desc: 'Regras que rodam sozinhas.' },
  { href: 'agents', icon: Bot, title: 'Agentes IA', desc: 'Catálogo de agentes especializados.' },
  { href: 'recommendations', icon: Star, title: 'Recomendações', desc: 'Matching inteligente de terrenos.' },
];

export default function AssistantPage() {
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
          <Sparkles className="h-3 w-3" />
          Suite de IA LandMap
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Seu assistente imobiliário</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Chat, RAG, automações e agentes — tudo com o padrão de design LandMap.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Modelos ativos" value="6" />
        <Stat label="Consultas/mês" value="24k" trend={31} />
        <Stat label="Precisão RAG" value="96%" />
      </section>

      <Reveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.href} variant="interactive">
            <Link href={lh(`/${f.href}`)} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
