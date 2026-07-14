'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { buttonVariants } from '@landmap/ui';
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--background)] px-6 py-6 text-[var(--foreground)]">
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/landmap-lovabale-logo.png"
            alt="LandMap"
            width={0}
            height={0}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <Link
          href={lh('/auth')}
          className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
        >
          Pular
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
          <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-primary/10">
            <Icon className="h-11 w-11 text-primary" />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{SLIDES[i].title}</h1>
          <p className="mt-4 max-w-sm text-base text-[var(--foreground)]/60">
            {SLIDES[i].body}
          </p>
        </div>
      </main>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {SLIDES.map((_, n) => (
            <button
              key={n}
              aria-label={`Ir para slide ${n + 1}`}
              onClick={() => setI(n)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                n === i
                  ? 'w-8 bg-[var(--primary)]'
                  : 'w-1.5 bg-[color:color-mix(in_srgb,var(--foreground)_15%,transparent)]'
              }`}
            />
          ))}
        </div>
        {last ? (
          <Link
            href={lh('/auth')}
            className={buttonVariants({
              variant: 'default',
              className:
                'inline-flex items-center justify-center gap-2 rounded-md h-9 px-4 py-2 text-sm font-medium cursor-pointer transition-colors [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
            })}
          >
            Começar
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setI((v) => Math.min(SLIDES.length - 1, v + 1))}
            className="inline-flex items-center justify-center gap-2 rounded-md h-9 px-4 py-2 text-sm font-medium cursor-pointer transition-colors bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card)] hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <Link
        href={lh('/auth')}
        className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-[var(--foreground)]/60 transition-colors hover:text-[var(--foreground)]"
      >
        Já tenho conta
      </Link>
    </div>
  );
}
