'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BellRing,
  MapPinned,
  TrendingUp,
  ArrowRight,
} from '../../../components/lovable/icons';

/** Slides 1:1 Lovable onboarding.chunk.js */
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
  const router = useRouter();
  const lh = (p: string) => `/${locale}${p}`;
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const Icon = SLIDES[i].icon;
  const slide = SLIDES[i];

  const onPrimary = () => {
    if (last) {
      router.push(lh('/plans'));
      return;
    }
    setI((v) => Math.min(SLIDES.length - 1, v + 1));
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center">
          {/* Lovable uses PNG logo — keep img for 1:1 parity */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landmap-logo-transparent.png"
            alt="LandMap"
            className="h-12 w-auto object-contain"
          />
        </div>
        <Link href={lh('/plans')} className="text-sm text-foreground/60 hover:text-foreground">
          Pular
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          key={i}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex w-full flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="mb-8 grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-primary/10">
            <Icon className="h-11 w-11 text-primary" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{slide.title}</h1>
          <p className="mt-4 max-w-sm text-base text-foreground/60">{slide.body}</p>
        </div>
      </main>

      <div
        className="mb-6 flex justify-center gap-2"
        role="tablist"
        aria-label="Slides do onboarding"
      >
        {SLIDES.map((s, n) => (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={n === i}
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

      <div className="flex flex-col gap-3 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onPrimary}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          {last ? 'Ver planos' : 'Continuar'}
          <ArrowRight className="h-4 w-4" />
        </button>
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
