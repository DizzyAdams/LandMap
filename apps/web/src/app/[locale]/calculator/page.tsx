'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Stat, Badge } from '@landmap/ui';
import { INTELLIGENCE_REGIONS, fmtPriceSqm } from '../../../lib/mapIntelligence';

export default function CalculatorPage() {
  const [regionId, setRegionId] = useState(INTELLIGENCE_REGIONS[0].id);
  const [area, setArea] = useState(400);
  const [rentYield, setRentYield] = useState(6);

  const region = INTELLIGENCE_REGIONS.find((r) => r.id === regionId) ?? INTELLIGENCE_REGIONS[0];

  const result = useMemo(() => {
    const price = region.priceSqm * area;
    const annualRent = price * (rentYield / 100);
    const monthly = annualRent / 12;
    const cap = rentYield;
    return { price, annualRent, monthly, cap };
  }, [region, area, rentYield]);

  return (
    <ProductPageShell
      backHref="/map"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Calculadora
        </>
      }
      title="Estimativa de investimento"
      description="Preço a partir do m² da região no mapa intelligence (ilustrativo)."
    >
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Preço estimado" value={fmtPriceSqm(result.price)} />
        <Stat label="Aluguel/mês" value={fmtPriceSqm(result.monthly)} />
        <Stat label="Yield a.a." value={`${result.cap}%`} />
        <Stat label="Score região" value={String(region.score)} />
      </section>

      <Card className="mt-6 space-y-4 p-4">
        <label className="block text-xs font-medium text-muted-foreground">
          Região
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          >
            {INTELLIGENCE_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {fmtPriceSqm(r.priceSqm)}/m²
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          Área (m²): {area}
          <input
            type="range"
            min={100}
            max={5000}
            step={50}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          Yield anual %: {rentYield}
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={rentYield}
            onChange={(e) => setRentYield(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </label>
        <Badge variant="outline">m² região: {fmtPriceSqm(region.priceSqm)}</Badge>
      </Card>
    </ProductPageShell>
  );
}
