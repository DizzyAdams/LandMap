'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import { ArrowLeft, LandMapWordmark } from './lovable/icons';
import { cn } from '@landmap/ui';

type Props = {
  backHref?: string;
  eyebrow: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: '3xl' | '5xl' | '7xl';
  className?: string;
  /** Full-bleed (sem max-width interno no children). */
  flush?: boolean;
};

/**
 * Shell de produto LandMap — chrome Lovable (wordmark, back, eyebrow, H1 display).
 * Use em páginas de mercado/IA/docs para manter paridade visual.
 */
export function ProductPageShell({
  backHref,
  eyebrow,
  title,
  description,
  children,
  maxWidth = '3xl',
  className,
  flush,
}: Props) {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const back = backHref ? (backHref.startsWith('/') ? lh(backHref) : lh(`/${backHref}`)) : lh('/map');
  const max =
    maxWidth === '7xl' ? 'max-w-7xl' : maxWidth === '5xl' ? 'max-w-5xl' : 'max-w-3xl';

  return (
    <main
      className={cn(
        'mx-auto flex min-h-screen flex-col bg-background px-4 pb-28 pt-6',
        max,
        className,
      )}
    >
      <header className="flex items-center justify-between">
        <Link
          href={back}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {eyebrow}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-foreground/60">{description}</p>
        )}
      </div>

      <div className={cn('mt-6', flush && 'flex-1')}>{children}</div>
    </main>
  );
}
