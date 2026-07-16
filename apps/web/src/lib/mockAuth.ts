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
  provider: 'google' | 'email';
  userType?: UserType;
};

export type UserType =
  | 'corretor'
  | 'investidor'
  | 'fundo'
  | 'incorporadora'
  | 'comprador';

const STORAGE_KEY = 'landmap_mock_user';
const USER_TYPE_KEY = 'landmap_user_type';

/** Persiste o segmento escolhido no cadastro (usado também sem login real). */
export function storeUserType(type: UserType): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USER_TYPE_KEY, type);
  } catch {
    /* ignore */
  }
}

export function readUserType(): UserType | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_TYPE_KEY);
    return raw ? (raw as UserType) : null;
  } catch {
    return null;
  }
}

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

function writeMockUser(user: MockUser): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (user.userType) storeUserType(user.userType);
  } catch {
    /* ignore */
  }
}

/** Simula o popup/redirect do Google. Resolve após ~600ms com um perfil fake. */
export function signInWithGoogleMock(userType?: UserType): Promise<MockUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: MockUser = {
        ...MOCK_GOOGLE_USER,
        id: 'google_' + Math.random().toString(36).slice(2, 10),
        userType,
      };
      writeMockUser(user);
      resolve(user);
    }, 600);
  });
}

/** Login e-mail/senha mock — grava sessão local para passar o RequireAuth. */
export function signInWithEmailMock(opts?: {
  email?: string;
  name?: string;
  userType?: UserType;
}): Promise<MockUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: MockUser = {
        id: 'email_' + Math.random().toString(36).slice(2, 10),
        name: opts?.name?.trim() || 'Usuário LandMap',
        email: opts?.email?.trim() || 'usuario@landmap.app',
        provider: 'email',
        userType: opts?.userType ?? readUserType() ?? undefined,
      };
      writeMockUser(user);
      resolve(user);
    }, 400);
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

  const signIn = useCallback(async (userType?: UserType): Promise<MockUser> => {
    const u = await signInWithGoogleMock(userType);
    setUser(u);
    return u;
  }, []);

  const signInEmail = useCallback(
    async (opts?: { email?: string; name?: string; userType?: UserType }): Promise<MockUser> => {
      const u = await signInWithEmailMock(opts);
      setUser(u);
      return u;
    },
    [],
  );

  const signOut = useCallback(() => {
    signOutMock();
    setUser(null);
  }, []);

  return { user, signIn, signInEmail, signOut };
}
