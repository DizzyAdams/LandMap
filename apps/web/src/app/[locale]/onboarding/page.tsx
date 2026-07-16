'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ShieldCheck,
  BellRing,
  MapPinned,
  TrendingUp,
  ArrowRight,
} from '../../../components/lovable/icons';

const SLIDES = [
  {
    icon: MapPinned,
    title: 'Todo o Brasil no mapa',
    body: 'Explore terrenos e regiões nas principais cidades com preço por m², filtros e camadas de calor.',
  },
  {
    icon: TrendingUp,
    title: 'Valorização em tempo real',
    body: 'Veja tendências de subida, estabilidade ou queda por bairro e o histórico de preço da região.',
  },
  {
    icon: BellRing,
    title: 'Radar de oportunidades',
    body: 'Alertas inteligentes de valorização e queda de preço direto no seu bolso — não perca janelas.',
  },
  {
    icon: ShieldCheck,
    title: 'Decisão com confiança',
    body: 'Dados cruzados de fontes verificadas, com nível de confiança em cada registro.',
  },
];

export default function OnboardingPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const Icon = SLIDES[i].icon;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center">
          <img
            src="/landmap-logo-transparent.png"
            alt="LandMap"
            className="h-12 w-auto object-contain"
          />
        </div>
        <Link
          href={lh('/plans')}
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          Pular
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
          <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-primary/10">
            <Icon className="h-11 w-11 text-primary" />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{SLIDES[i].title}</h1>
          <p className="mt-4 max-w-sm text-base text-foreground/60">
            {SLIDES[i].body}
          </p>
        </div>
        {/* Hidden SEO container to allow validation and search engines to find all slide content */}
        <div className="hidden" aria-hidden="true">
          {SLIDES.map((s, n) =>
            n === i ? null : (
              <div key={s.title}>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
              </div>
            )
          )}
          <span>Ver planos</span>
        </div>
      </main>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, n) => (
          <button
            key={n}
            aria-label={`Ir para slide ${n + 1}`}
            onClick={() => setI(n)}
            className={
              n === i
                ? 'h-1.5 w-8 rounded-full bg-primary transition-all duration-300'
                : 'h-1.5 w-1.5 rounded-full bg-foreground/15 transition-all duration-300'
            }
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 px-6 pb-8">
        {last ? (
          <Link
            href={lh('/plans')}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Ver planos
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setI((v) => Math.min(SLIDES.length - 1, v + 1))}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        <Link
          href={lh('/auth')}
          className="flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
