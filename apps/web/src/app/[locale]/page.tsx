'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { buttonVariants, cn } from '@landmap/ui/server';

export default function LocaleHomePage() {
  const locale = useLocale();
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center text-[var(--foreground)]">
      <Link
        href={`/${locale}/onboarding`}
        className="absolute right-4 top-4 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] animate-in fade-in duration-500"
      >
        Pular
      </Link>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-balance text-4xl font-bold tracking-tight opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 sm:text-5xl lg:text-6xl">
          Todo o Brasil no mapa
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 sm:text-lg">
          Explore terrenos e regiões nas principais cidades com preço por m²,
          filtros e camadas de calor.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link
            href={`/${locale}/onboarding`}
            className={cn(buttonVariants({ variant: 'default' }), 'group h-12 px-6 rounded-full')}
          >
            Continuar
          </Link>
          <Link
            href={`/${locale}/auth`}
            className={cn(buttonVariants({ variant: 'outline' }), 'group h-12 px-6 rounded-full')}
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </main>
  );
}
