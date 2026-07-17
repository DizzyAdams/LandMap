'use client';

import { useMemo, useState } from 'react';
import { BookA, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { INTELLIGENCE_LAYERS } from '../../../lib/mapIntelligence';

const CORE = [
  { term: 'Score LandMap', def: 'Índice composto de valorização, infraestrutura e crescimento (0–100).', cat: 'plataforma' },
  { term: 'Valorização m²', def: 'Variação percentual do preço por metro quadrado em um período.', cat: 'mercado' },
  { term: 'Liquidez', def: 'Facilidade de negociar o ativo sem perda significativa de preço.', cat: 'mercado' },
  { term: 'Yield', def: 'Retorno anual estimado sobre o capital investido.', cat: 'invest' },
  { term: 'Cap rate', def: 'Taxa de capitalização: renda líquida anual sobre o valor do imóvel.', cat: 'invest' },
  { term: 'Zoneamento', def: 'Classificação municipal de uso do solo (ZR, ZC, ZEIS, etc.).', cat: 'técnico' },
  { term: 'Heatmap', def: 'Camada visual de densidade/intensidade de um indicador no mapa.', cat: 'plataforma' },
  { term: 'Camada de inteligência', def: 'Indicador territorial (infra, segurança, mobilidade…) sobre o mapa.', cat: 'plataforma' },
  { term: 'Due diligence', def: 'Investigação jurídica, urbanística e financeira antes da compra.', cat: 'técnico' },
  { term: 'IDH', def: 'Índice de Desenvolvimento Humano da região.', cat: 'socio' },
  { term: 'Risco ambiental', def: 'Exposição a contaminação, APP, áreas protegidas ou erosão.', cat: 'risco' },
  { term: 'Risco enchente', def: 'Probabilidade de alagamento com base em relevo e histórico.', cat: 'risco' },
  { term: 'Comps', def: 'Imóveis comparáveis usados para ancorar preço de mercado.', cat: 'análise' },
  { term: 'Radar de oportunidades', def: 'Lista de regiões com score/crescimento acima do limiar.', cat: 'plataforma' },
];

export default function GlossaryPage() {
  const [q, setQ] = useState('');
  const layerTerms = useMemo(
    () =>
      INTELLIGENCE_LAYERS.map((l) => ({
        term: l.label,
        def: `Camada de inteligência do mapa LandMap: indicador “${l.label}”.`,
        cat: 'camada',
      })),
    [],
  );
  const all = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...CORE, ...layerTerms].filter(
      (t) => !s || t.term.toLowerCase().includes(s) || t.def.toLowerCase().includes(s),
    );
  }, [q, layerTerms]);

  return (
    <ProductPageShell
      backHref="/knowledge"
      eyebrow={
        <>
          <BookA className="h-3 w-3" /> Glossário
        </>
      }
      title="Termos de mercado"
      description="Vocabulário da plataforma e das camadas do mapa intelligence."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Termos" value={String(all.length)} />
        <Stat label="Camadas" value={String(INTELLIGENCE_LAYERS.length)} />
        <Stat label="Categorias" value="7" />
      </section>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar termo…"
        className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none focus:border-primary"
      />

      <Reveal className="mt-6 flex flex-col gap-3">
        {all.map((t) => (
          <Card key={t.term} variant="interactive">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{t.term}</p>
                  <Badge variant="outline">{t.cat}</Badge>
                </div>
                <p className="mt-1 text-sm text-foreground/70">{t.def}</p>
              </div>
            </div>
          </Card>
        ))}
      </Reveal>
    </ProductPageShell>
  );
}
