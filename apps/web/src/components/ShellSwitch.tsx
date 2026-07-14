'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppShell } from './AppShell';

// Rotas publicas (/, auth, plans, onboarding) sao "bare" como a referencia Lovable
// (sem navbar/footer). O resto usa o AppShell autenticado (sidebar 68px + header).
const PUBLIC_SEGMENTS = ['auth', 'plans', 'onboarding'];

export function ShellSwitch({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const seg = pathname.split('/').filter(Boolean); // ['pt-BR','dashboard']
  const usePublic = !seg[1] || PUBLIC_SEGMENTS.includes(seg[1]);

  if (usePublic) {
    return (
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
