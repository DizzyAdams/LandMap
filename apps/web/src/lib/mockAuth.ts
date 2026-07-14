'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Autenticação MOCKADA do Google.
 *
 * Não faz nenhuma chamada de rede nem OAuth real — apenas simula o fluxo
 * (latência + gravação de uma "sessão" em localStorage) para que o design de
 * login social fique 100% visível e testável em qualquer ambiente, inclusive
 * no deploy estático. Trocar por OAuth real depois é só substituir
 * `signInWithGoogleMock` por `signInWithGoogle` do provedor escolhido.
 */

export type MockUser = {
  id: string;
  name: string;
  email: string;
  provider: 'google';
};

const STORAGE_KEY = 'landmap_mock_user';

const MOCK_GOOGLE_USER: MockUser = {
  id: 'google_' + Math.random().toString(36).slice(2, 10),
  name: 'Usuário Google',
  email: 'usuario@gmail.com',
  provider: 'google',
};

export function readMockUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

/** Simula o popup/redirect do Google. Resolve após ~600ms com um perfil fake. */
export function signInWithGoogleMock(): Promise<MockUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_GOOGLE_USER));
      }
      resolve(MOCK_GOOGLE_USER);
    }, 600);
  });
}

export function signOutMock(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
}

/** Hook de sessão mockada — fonte única de verdade do estado "logado". */
export function useMockUser() {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(readMockUser());
  }, []);

  const signIn = useCallback(async (): Promise<MockUser> => {
    const u = await signInWithGoogleMock();
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    signOutMock();
    setUser(null);
  }, []);

  return { user, signIn, signOut };
}
