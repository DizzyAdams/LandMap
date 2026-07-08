'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6">
      <span className="text-7xl font-bold tracking-tight text-neutral-800">500</span>
      <h1 className="mt-4 text-xl font-medium text-neutral-100">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-center text-sm text-neutral-500">
        Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando
        para resolver o problema.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-neutral-800 px-5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
