'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import {
  MapPinned,
  TrendingUp,
  BellRing,
  ShieldCheck,
  ArrowRight,
  LandMapWordmark,
} from '../../../components/lovable/icons';

const SLIDES = [
  {
    icon: MapPinned,
    title: 'Todo o Brasil no mapa',
    desc: 'Explore terrenos e regiões nas principais cidades com preço por m², filtros e camadas de calor.',
  },
  {
    icon: TrendingUp,
    title: 'Valorização em tempo real',
    desc: 'Veja tendências de subida, estabilidade ou queda por bairro e o histórico de preço da região.',
  },
  {
    icon: BellRing,
    title: 'Radar de oportunidades',
    desc: 'Alertas inteligentes de valorização e queda de preço direto no seu bolso — não perca janelas.',
  },
  {
    icon: ShieldCheck,
    title: 'Decisão com confiança',
    desc: 'Dados cruzados de fontes verificadas, com nível de confiança em cada registro.',
  },
];

export default function IntroPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const Icon = slide.icon;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--background)] px-6 py-6 text-[var(--foreground)]">
      <header className="flex items-center justify-between">
        <LandMapWordmark />
        <Link
          href={lh('/plans')}
          className="text-sm text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)] hover:text-[var(--foreground)]"
        >
          Pular
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={index} className="flex flex-col items-center">
          <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
            <Icon className="h-11 w-11 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{slide.title}</h1>
          <p className="mt-4 max-w-sm text-base text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)]">
            {slide.desc}
          </p>
        </div>
      </main>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full ${
              i === index
                ? 'w-8 bg-[var(--primary)]'
                : 'w-1.5 bg-[color:color-mix(in_srgb,var(--foreground)_15%,transparent)]'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {isLast ? (
          <Link
            href={lh('/plans')}
            className="inline-flex h-12 w-full items-center justify-center gap-1 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
          >
            Ver planos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="inline-flex h-12 w-full items-center justify-center gap-1 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
          >
            Continuar
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        )}
        <Link
          href={lh('/auth')}
          className="inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-[color:color-mix(in_srgb,var(--foreground)_70%,transparent)] transition hover:bg-[var(--muted)]"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
