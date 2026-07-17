'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { BookOpen, Sparkles, MapPin } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const POSTS = [
  { title: 'Como ler o Score LandMap', cat: 'plataforma', read: '5 min', href: '/glossary' },
  { title: 'Camadas de inteligência: guia prático', cat: 'mapa', read: '7 min', href: '/map' },
  { title: '3 sinais de valorização precoce', cat: 'estratégia', read: '6 min', href: '/valorization' },
  { title: 'Risco regulatório e zoneamento', cat: 'técnico', read: '8 min', href: '/glossary' },
  { title: 'Due diligence para terrenos', cat: 'tutorial', read: '9 min', href: '/knowledge' },
  { title: 'Heatmap de preço: o que o peso significa', cat: 'mapa', read: '4 min', href: '/map' },
  { title: 'Comparar regiões sem viés', cat: 'análise', read: '5 min', href: '/compare' },
  { title: 'Montando uma carteira territorial', cat: 'invest', read: '6 min', href: '/portfolio' },
];

const GUIDES = [
  { title: 'Onboarding da plataforma', href: '/onboarding' },
  { title: 'Planos e limites', href: '/plans' },
  { title: 'API para desenvolvedores', href: '/developers' },
];

export default function ResourcesPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/"
      eyebrow={
        <>
          <BookOpen className="h-3 w-3" /> Recursos
        </>
      }
      title="Blog & materiais"
      description="Conteúdo para decidir melhor — alinhado ao mapa intelligence e ao Score LandMap."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Artigos" value={String(POSTS.length)} />
        <Stat label="Guias" value={String(GUIDES.length)} />
        <Stat label="Categorias" value="6" />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={lh('/map')} className={cn(buttonVariants({ size: 'sm' }))}>
          <MapPin className="mr-1 h-3.5 w-3.5" /> Abrir mapa
        </Link>
        <Link href={lh('/glossary')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Glossário
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-muted-foreground">Guias rápidos</h2>
      <Reveal className="mt-3 grid gap-2 sm:grid-cols-3">
        {GUIDES.map((g) => (
          <Card key={g.href} variant="interactive" className="p-3">
            <Link href={lh(g.href)} className="text-sm font-medium text-primary">
              {g.title}
            </Link>
          </Card>
        ))}
      </Reveal>

      <h2 className="mt-8 text-sm font-semibold text-muted-foreground">Artigos</h2>
      <Reveal className="mt-3 flex flex-col gap-3">
        {POSTS.map((p) => (
          <Card key={p.title} variant="interactive">
            <Link href={lh(p.href)} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.read} de leitura</p>
              </div>
              <Badge variant="outline">{p.cat}</Badge>
            </Link>
          </Card>
        ))}
      </Reveal>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Curadoria da equipe LandMap · padrão visual Lovable indigo.
      </div>
    </ProductPageShell>
  );
}
