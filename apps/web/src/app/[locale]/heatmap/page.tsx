'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Button } from '@landmap/ui';
import { Flame, MapPin, Activity } from '../../../components/lovable/icons';
import { apiUrl } from '../../../lib/api';
import { formatBRL } from '../../../lib/plans';

interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
  neighborhood: string;
  avgPrice: number;
}

export default function HeatmapPage() {
  const locale = useLocale();
  const [city, setCity] = useState('São Paulo');
  const [points, setPoints] = useState<HeatPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetch(apiUrl(`/market/heatmap?city=${encodeURIComponent(city)}`), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('sem dados'))))
      .then((d) => {
        if (!active) return;
        setPoints(d.points ?? []);
      })
      .catch(() => active && setError('Sem dados de heatmap para esta cidade.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [city]);

  const max = points.reduce((m, p) => Math.max(m, p.avgPrice), 0) || 1;

  return (
    <ProductPageShell
      backHref={`/${locale}`}
      eyebrow="Mapa de calor"
      title="Heatmap Explorer"
      description="Densidade de preço por bairro, derivada do dataset vivo de imóveis."
      maxWidth="7xl"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte', 'Florianópolis'].map((c) => (
          <Button key={c} variant={c === city ? 'default' : 'ghost'} onClick={() => setCity(c)}>
            {c}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[var(--muted-foreground)]">
          <Activity className="h-5 w-5 animate-spin" /> Calculando densidade…
        </div>
      ) : error ? (
        <Card variant="default" className="py-14 text-center text-sm text-[var(--muted-foreground)]">
          {error}
        </Card>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Flame className="h-4 w-4 text-[var(--primary)]" /> {points.length} bairros · calor = preço/m²
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {points
              .slice()
              .sort((a, b) => b.avgPrice - a.avgPrice)
              .map((p) => {
                const intensity = p.avgPrice / max;
                return (
                  <Card
                    key={p.neighborhood}
                    variant="interactive"
                    className="relative overflow-hidden p-4"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, var(--primary) ${Math.round(
                        intensity * 55,
                      )}%, var(--card)), var(--card))`,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{p.neighborhood}</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{formatBRL(p.avgPrice)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">preço/m² médio</p>
                  </Card>
                );
              })}
          </div>
        </>
      )}
    </ProductPageShell>
  );
}
