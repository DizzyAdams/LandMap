'use client';

import Link from 'next/link';
import { Logo } from '../components/Logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 cadastre-grid opacity-[0.04]" />

      </div>
      <Logo className="h-10 w-10" />
      <span className="mt-8 text-8xl font-bold tracking-tight text-gradient">500</span>
      <h1 className="mt-2 text-xl font-medium text-[var(--foreground)]">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--muted-foreground-lovable)]">
        Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando
        para resolver o problema.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="glow-primary inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-lovable)]"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-[var(--border-lovable)] px-5 text-sm text-[var(--muted-foreground-lovable)] transition hover:border-[var(--border-lovable)] hover:text-[var(--foreground)]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

