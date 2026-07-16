'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LandMapWordmark, Lock } from './lovable/icons';
import { Reveal } from './Motion';
import { ensureFreeAccess } from '../lib/mockAuth';

/**
 * Guarda de acesso (mock). Acesso gratuito por padrão:
 * se não houver sessão, cria visitante plan=free e libera a rota
 * (mapa, regiões, favoritos, etc.) sem redirecionar para /auth.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const t = useTranslations('auth');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    ensureFreeAccess();
    setChecked(true);
  }, []);

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
