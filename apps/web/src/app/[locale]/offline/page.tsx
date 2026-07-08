import Link from 'next/link';
import { Logo } from '../../../components/Logo';
import { localeHref } from '../../../lib/locale';

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-neutral-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
      </div>
      <div className="max-w-md text-center">
        <Logo className="mx-auto h-10 w-10" />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gradient">
          Sem conexão
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Você está offline. Verifique sua internet e tente novamente — o LandMap
          volta assim que a rede retornar.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="glow-emerald inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
          >
            Recarregar
          </button>
          <Link
            href={localeHref('/', locale)}
            className="inline-flex h-10 items-center rounded-lg border border-neutral-800 px-5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}

