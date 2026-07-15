'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LandMapWordmark, Lock } from './lovable/icons';
import { Reveal } from './Motion';
import { readMockUser } from '../lib/mockAuth';

/**
 * Guarda de autenticação (mock). Espelha o comportamento do Lovable:
 * rotas protegidas (/regions, /favorites, /compare, /dashboard, /admin, /map)
 * redirecionam para /auth quando não há sessão. /plans e / continuam públicas.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('auth');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!readMockUser()) {
      router.replace(`/${locale}/auth`);
    } else {
      setChecked(true);
    }
  }, [locale, router]);

  if (!checked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-6 text-center">
        <LandMapWordmark />
        <Reveal className="flex flex-col items-center gap-2" y={16}>
          <Lock className="h-6 w-6 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            {t('redirecting')}
          </p>
        </Reveal>
      </main>
    );
  }

  return <>{children}</>;
}
