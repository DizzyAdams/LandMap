'use client';

import { useState } from 'react';
import { PenLine, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Button, Stat } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtDelta,
  fmtPriceSqm,
  scoreLabel,
} from '../../../lib/mapIntelligence';

export default function WriterPage() {
  const [regionId, setRegionId] = useState(INTELLIGENCE_REGIONS[0].id);
  const [tone, setTone] = useState<'investor' | 'buyer' | 'broker'>('investor');
  const [output, setOutput] = useState('');

  const region = INTELLIGENCE_REGIONS.find((r) => r.id === regionId) ?? INTELLIGENCE_REGIONS[0];

  function generate() {
    const who =
      tone === 'investor'
        ? 'investidores institucionais'
        : tone === 'broker'
          ? 'corretores parceiros'
          : 'compradores finais';
    setOutput(
      `${region.name} (${region.city}/${region.state}) apresenta Score LandMap ${region.score} (${scoreLabel(region.score)}), com preço médio de ${fmtPriceSqm(region.priceSqm)}/m² e variação de ${fmtDelta(region.priceSqmDelta12m)} nos últimos 12 meses. ` +
        `A camada de valorização está em ${region.layerScores.valorization} e a infraestrutura em ${region.layerScores.infrastructure}. ` +
        `${region.highlights[0]} Ideal para ${who}. Zoneamento: ${region.zoning}. ` +
        `Riscos: ambiental ${region.environmentalRisk}, enchente ${region.floodRisk}.`,
    );
  }

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <PenLine className="h-3 w-3" /> Redator IA
        </>
      }
      title="Descrições de região"
      description="Gera copy com dados reais do mapa intelligence (demo local)."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Regiões" value={String(INTELLIGENCE_REGIONS.length)} />
        <Stat label="Tons" value="3" />
        <Stat label="Campos" value="score · m² · 12m" />
      </section>

      <Card className="mt-6 space-y-4 p-4">
        <label className="block text-xs font-medium text-muted-foreground">
          Região
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm"
          >
            {INTELLIGENCE_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.city}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          {(['investor', 'buyer', 'broker'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                tone === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-[var(--border)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Button type="button" onClick={generate} className="w-full sm:w-auto">
          <Sparkles className="mr-1.5 h-4 w-4" /> Gerar descrição
        </Button>
      </Card>

      {output && (
        <Card className="mt-4 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="success">gerado</Badge>
            <span className="text-xs text-muted-foreground">{region.name}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{output}</p>
        </Card>
      )}
    </ProductPageShell>
  );
}
