'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
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
    title: 'Mapeie qualquer território',
    body: 'Visualize 1.500 imóveis em 10 cidades com sobreposições de preço, zoneamento e infraestrutura.',
  },
  {
    icon: TrendingUp,
    title: 'Entenda a valorização',
    body: 'Séries históricas, delta de mercado e projeção de IA por bairro e tipologia.',
  },
  {
    icon: BellRing,
    title: 'Receba alertas inteligentes',
    body: 'Avise quando um imóvel bater seu filtro de preço, localização ou oportunidade.',
  },
  {
    icon: ShieldCheck,
    title: 'Dados soberanos e abertos',
    body: 'Sem amarras, sem custo e sem login para explorar. Sua inteligência, sua decisão.',
  },
];

export default function OnboardingPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const Icon = SLIDES[i].icon;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--background)] px-6 py-6 text-[var(--foreground)]">
      <header className="flex items-center justify-between">
        <LandMapWordmark />
        <Link
          href={lh('/dashboard')}
          className="text-sm text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)] hover:text-[var(--foreground)]"
        >
          Pular
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={i} className="flex flex-col items-center">
          <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
            <Icon className="h-11 w-11 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{SLIDES[i].title}</h1>
          <p className="mt-4 max-w-sm text-base text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)]">
            {SLIDES[i].body}
          </p>
        </div>
      </main>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, n) => (
          <button
            key={n}
            aria-label={`Ir para slide ${n + 1}`}
            onClick={() => setI(n)}
            className={`h-1.5 rounded-full ${
              n === i
                ? 'w-8 bg-[var(--primary)]'
                : 'w-1.5 bg-[color:color-mix(in_srgb,var(--foreground)_15%,transparent)]'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {last ? (
          <Link
            href={lh('/auth')}
            className="inline-flex h-12 w-full items-center justify-center gap-1 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
          >
            Começar
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setI((v) => Math.min(SLIDES.length - 1, v + 1))}
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
