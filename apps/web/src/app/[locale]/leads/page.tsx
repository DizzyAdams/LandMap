'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { User, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';
import { INTELLIGENCE_REGIONS } from '../../../lib/mapIntelligence';

type Lead = {
  id: string;
  name: string;
  interest: string;
  region: string;
  stage: 'novo' | 'qualificado' | 'proposta' | 'ganho';
  score: number;
};

const STAGES: Lead['stage'][] = ['novo', 'qualificado', 'proposta', 'ganho'];

export default function LeadsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [filter, setFilter] = useState<Lead['stage'] | 'all'>('all');

  const leads = useMemo((): Lead[] => {
    const names = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Nunes', 'Eva Rocha', 'Felipe Mota'];
    return INTELLIGENCE_REGIONS.slice(0, 6).map((r, i) => ({
      id: `lead-${r.id}`,
      name: names[i] ?? `Lead ${i + 1}`,
      interest: i % 2 === 0 ? 'Terreno residencial' : 'Lote comercial',
      region: r.name,
      stage: STAGES[i % STAGES.length],
      score: r.score,
    }));
  }, []);

  const visible = filter === 'all' ? leads : leads.filter((l) => l.stage === filter);

  return (
    <ProductPageShell
      backHref="/pipeline"
      eyebrow={
        <>
          <User className="h-3 w-3" /> Leads
        </>
      }
      title="Pipeline de leads"
      description="Interessados por região do mapa intelligence — demo comercial."
    >
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Leads" value={String(leads.length)} />
        <Stat label="Qualificados" value={String(leads.filter((l) => l.stage === 'qualificado').length)} />
        <Stat label="Propostas" value={String(leads.filter((l) => l.stage === 'proposta').length)} />
        <Stat label="Ganhos" value={String(leads.filter((l) => l.stage === 'ganho').length)} />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', ...STAGES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              filter === s
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-[var(--border)] text-muted-foreground hover:text-foreground',
            )}
          >
            {s === 'all' ? 'Todos' : s}
          </button>
        ))}
      </div>

      <Reveal className="mt-6 space-y-3">
        {visible.map((l) => (
          <Card key={l.id} variant="interactive" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {l.interest} · {l.region}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline">{l.stage}</Badge>
                <p className="mt-1 text-xs tabular-nums text-primary">Score {l.score}</p>
              </div>
            </div>
            <Link href={lh('/map')} className="mt-2 inline-block text-xs font-medium text-primary">
              Ver região no mapa
            </Link>
          </Card>
        ))}
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={lh('/pipeline')} className={cn(buttonVariants({ size: 'sm' }))}>
          Pipeline IA
        </Link>
        <Link href={lh('/admin/leads')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Admin leads
        </Link>
      </div>
    </ProductPageShell>
  );
}
