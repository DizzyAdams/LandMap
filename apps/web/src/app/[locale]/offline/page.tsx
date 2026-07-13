'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Logo } from '../../../components/Logo';
import { localeHref } from '../../../lib/locale';

// Client component: the reload button needs an onClick handler, which is
// only valid inside a Client Component boundary.
export default function OfflinePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-[var(--foreground)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 cadastre-grid opacity-[0.04]" />

      </div>
      <div className="max-w-md text-center">
        <Logo className="mx-auto h-10 w-10" />

        <span className="kicker mt-6">Conexão</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gradient">
          Sem conexão
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Você está offline. Verifique sua internet e tente novamente — o LandMap
          volta assim que a rede retornar.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="cta-glow glow-primary inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
          >
            Recarregar
          </button>
          <Link
            href={localeHref('/', locale)}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-5 text-sm text-[var(--muted-foreground)] transition hover:border-[var(--border)] hover:text-[var(--foreground)]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}

