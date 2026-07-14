'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from '@landmap/ui';

// Rotas que usam o shell publico (Navbar/Footer). O resto usa o AppShell
// autenticado do spec landmap-design.zip (sidebar 68px + header + bottom nav).
const PUBLIC_ROUTES = ['', '/auth', '/plans', '/onboarding'];

export function ShellSwitch({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const seg = pathname.split('/').filter(Boolean); // ['pt-BR','dashboard']
  const route = seg.length >= 2 ? '/' + seg.slice(1).join('/') : '';
  const isPublic = PUBLIC_ROUTES.includes(route) || route === '/' + (seg[1] || '');

  // landing (/), auth, plans, intro/onboarding -> shell publico
  const usePublic =
    !seg[1] ||
    ['auth', 'plans', 'onboarding'].includes(seg[1]);

  if (usePublic) {
    return (
      <>
        <Navbar />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  return <AppShell>{children}</AppShell>;
}
