'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '../../../components/Logo';

const slides = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
    title: 'Mapeie qualquer território',
    body: 'Visualize 1.500 imóveis em 10 cidades com sobreposições de preço, zoneamento e infraestrutura.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 17l5-5 4 3 6-7" />
        <path d="M3 21h18" />
        <path d="M16 4h4v4" />
      </svg>
    ),
    title: 'Entenda a valorização',
    body: 'Séries históricas, delta de mercado e projeção de IA por bairro e tipologia.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10 21a2 2 0 0 0 4 0" />
      </svg>
    ),
    title: 'Receba alertas inteligentes',
    body: 'Avise quando um imóvel bater seu filtro de preço, localização ou oportunidade.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Dados soberanos e abertos',
    body: 'Sem amarras, sem custo e sem login para explorar. Sua inteligência, sua decisão.',
  },
];

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="relative w-full max-w-md">
        <Link href="/" aria-label="LandMap" className="mx-auto mb-10 flex w-fit items-center gap-2">
          <Logo className="h-8 w-8" />
        </Link>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-card)]">
          <div
            key={i}
            className="flex flex-col items-center text-center"
            style={{ animation: 'fadeUp .4s ease both' }}
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/20">
              {slides[i].icon}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{slides[i].title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{slides[i].body}</p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((_, n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]'}`}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--primary)]/40 disabled:opacity-40"
            >
              Voltar
            </button>
            {last ? (
              <Link
                href="/auth"
                className="rounded-xl bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--primary-bright)]"
              >
                Começar
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setI((v) => Math.min(slides.length - 1, v + 1))}
                className="rounded-xl bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--primary-bright)]"
              >
                Continuar
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          LandMap — inteligência imobiliária aberta.
        </p>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </main>
  );
}
