'use client';

import { useEffect, type ReactNode } from 'react';
import { ensureFreeAccess } from '../lib/mockAuth';

/**
 * Acesso gratuito (paridade produto + sem paywall).
 * Não bloqueia a UI com tela de "Redirecionando…" — só garante sessão free no client.
 * Lovable SPA também hidrata sem gate de loading visível no HTML.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureFreeAccess();
  }, []);

  return <>{children}</>;
}
