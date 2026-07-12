'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../../../components/Logo';

const LOCALES = ['pt-BR', 'en-US', 'es-ES'];

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const seg = pathname?.split('/').filter(Boolean)[0];
  const locale = LOCALES.includes(seg as string) ? (seg as string) : 'pt-BR';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[#050505]" />
      <Logo className="h-10 w-10" />
      <span className="mt-8 text-8xl font-bold tracking-tight text-gradient">500</span>
      <h1 className="mt-2 text-xl font-medium text-[var(--foreground)]">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--muted-foreground-lovable)]">
        Não foi possível carregar os resultados da busca. Tente novamente.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="glow-primary inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-lovable)]"
        >
          Tentar novamente
        </button>
        <Link
          href={`/${locale}/search`}
          className="inline-flex h-10 items-center rounded-lg border border-[var(--border-lovable)] px-5 text-sm text-[var(--muted-foreground-lovable)] transition hover:border-[var(--border-lovable)] hover:text-[var(--foreground)]"
        >
          Voltar para busca
        </Link>
      </div>
    </div>
  );
}
