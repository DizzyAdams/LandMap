'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, Sparkles, Layers, SlidersHorizontal } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Segmented, Tabs } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const LAYERS = [
  { value: 'heat', label: 'Mapa de calor' },
  { value: 'price', label: 'Preço/m²' },
  { value: 'trend', label: 'Valorização' },
  { value: 'demand', label: 'Demanda' },
];

const PRESETS = [
  { id: 'residential', label: 'Residencial' },
  { id: 'commercial', label: 'Comercial' },
  { id: 'invest', label: 'Investimento' },
];

type Style = 'residential' | 'commercial' | 'invest';

export default function StudioPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [layer, setLayer] = useState('heat');
  const [preset, setPreset] = useState<Style>('invest');

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
          <Layers className="h-3 w-3" />
          Studio de mapas
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Monte sua análise</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Combine camadas e estilos para visualizar exatamente o que importa para sua decisão.
        </p>
      </div>

      <Card className="mt-6">
        <p className="text-xs font-medium text-muted-foreground">Camada ativa</p>
        <div className="mt-3">
          <Segmented
            aria-label="Camada do mapa"
            options={LAYERS}
            value={layer}
            onChange={setLayer}
          />
        </div>

        <p className="mt-6 text-xs font-medium text-muted-foreground">Estilo de visualização</p>
        <div className="mt-3">
          <Tabs
            tabs={PRESETS}
            defaultId={preset}
          >
            {(active) => (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id as Style)}
                    className={`rounded-xl border p-4 text-left text-sm transition ${
                      active === p.id || preset === p.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground/70 hover:border-ring'
                    }`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="mt-2 block font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </Card>

      <Reveal className="mt-6">
        <Card variant="highlight">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-semibold">Pré-visualização</p>
            <Badge variant="info">beta</Badge>
          </div>
          <div className="mt-4 grid h-40 place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
            Camada: <span className="ml-1 font-medium text-foreground">{LAYERS.find((l) => l.value === layer)?.label}</span>
            {' · '}Estilo: <span className="ml-1 font-medium text-foreground">{PRESETS.find((p) => p.id === preset)?.label}</span>
          </div>
          <Link
            href={lh('/map')}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary-glow"
          >
            Abrir no mapa
          </Link>
        </Card>
      </Reveal>
    </main>
  );
}
