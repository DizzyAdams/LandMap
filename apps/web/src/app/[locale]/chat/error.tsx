'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../../../components/Logo';

const LOCALES = ['pt-BR', 'en-US', 'es-ES'];

export default function ChatError({
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
    <div className='relative flex min-h-screen flex-col items-center justify-center px-6'>
      <div aria-hidden className='pointer-events-none absolute inset-0 -z-10 ' />
      <Logo className='h-10 w-10' />
      <span className='mt-8 text-8xl font-bold tracking-tight text-[var(--foreground)]'>500</span>
      <h1 className='mt-2 text-xl font-medium text-[var(--foreground)]'>Algo deu errado</h1>
      <p className='mt-2 max-w-md text-center text-sm text-[var(--muted-foreground)]'>
        Não foi possível carregar o chat. Tente novamente.
      </p>
      <div className='mt-8 flex items-center gap-3'>
        <button
          type='button'
          onClick={reset}
          className=' inline-flex h-10 items-center rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary)]'
        >
          Tentar novamente
        </button>
        <Link
          href={`/${locale}`}
          className='inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]/50'
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
