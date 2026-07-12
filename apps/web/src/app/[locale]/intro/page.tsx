'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { MapPinned, LandMapWordmark } from '../../../components/lovable/icons';

const SLIDES = [
  {
    title: 'Todo o Brasil no mapa',
    desc: 'Explore terrenos e regiões nas principais cidades com preço por m², filtros e camadas de calor.',
  },
  {
    title: 'Preço por m² na palma da mão',
    desc: 'Veja o valor do metro quadrado por bairro e cidade, com histórico e tendência de preços.',
  },
  {
    title: 'Filtros que encontram o terreno certo',
    desc: 'Por tipo, modalidade, localização e faixa de preço — em segundos.',
  },
  {
    title: 'Camadas de calor e decisão',
    desc: 'Mapas térmicos de preço e ROI para comparar regiões com confiança.',
  },
];

export default function IntroPage() {
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-[var(--background)] px-6 py-6 text-[var(--foreground)]">
      <header className="flex items-center justify-between">
        <LandMapWordmark />
        <Link
          href={lh('/plans')}
          className="text-sm text-[var(--muted-foreground-lovable)] transition-colors hover:text-[var(--foreground)]"
        >
          Pular
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={index} className="page-enter flex flex-col items-center">
          <div
            className="mb-8 grid h-24 w-24 place-items-center rounded-3xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
          >
            <MapPinned size={44} className="text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{slide.title}</h1>
          <p className="mt-4 max-w-sm text-base text-[var(--muted-foreground-lovable)]">
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
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? '2rem' : '0.375rem',
              backgroundColor:
                i === index ? 'var(--primary)' : 'color-mix(in srgb, var(--foreground) 15%, transparent)',
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={lh('/plans')}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[var(--primary-glow)]"
        >
          Começar
        </Link>
        <Link
          href={lh('/auth')}
          className="inline-flex h-12 items-center justify-center rounded-full border text-sm font-semibold transition hover:bg-[var(--muted-lovable)]"
          style={{ borderColor: 'var(--border-lovable)', color: 'var(--foreground)' }}
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
