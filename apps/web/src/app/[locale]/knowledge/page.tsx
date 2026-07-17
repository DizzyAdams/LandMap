'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { BookOpen, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const DOCS = [
  { title: 'Arquitetura do mapa intelligence', tag: 'mapa', href: '/map' },
  { title: 'Camadas e Score LandMap', tag: 'score', href: '/glossary' },
  { title: 'Como usar alertas', tag: 'ops', href: '/alerts' },
  { title: 'Pipeline de leads', tag: 'vendas', href: '/leads' },
  { title: 'Base RAG e markdowns', tag: 'ia', href: '/rag' },
  { title: 'API REST', tag: 'dev', href: '/developers' },
  { title: 'Integrações live', tag: 'dev', href: '/integrations' },
  { title: 'Playbooks de due diligence', tag: 'legal', href: '/resources' },
];

export default function KnowledgePage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <BookOpen className="h-3 w-3" /> Conhecimento
        </>
      }
      title="Base de conhecimento"
      description="Documentação interna e playbooks — espelha a suite IA e o mapa."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Artigos" value={String(DOCS.length)} />
        <Stat label="Temas" value="6" />
        <Stat label="Atualização" value="hoje" />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={lh('/rag')} className={cn(buttonVariants({ size: 'sm' }))}>
          Perguntar ao RAG
        </Link>
        <Link href={lh('/glossary')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Glossário
        </Link>
        <Link href={lh('/resources')} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          Recursos
        </Link>
      </div>

      <Reveal className="mt-6 grid gap-3 sm:grid-cols-2">
        {DOCS.map((d) => (
          <Card key={d.title} variant="interactive" className="p-4">
            <Link href={lh(d.href)} className="block">
              <Badge variant="outline">{d.tag}</Badge>
              <p className="mt-2 font-semibold">{d.title}</p>
            </Link>
          </Card>
        ))}
      </Reveal>
    </ProductPageShell>
  );
}
