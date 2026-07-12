'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, LandMapWordmark, Lock, Mail, User } from '../../../components/lovable/icons';

type Tab = 'login' | 'register';

const fieldClass =
  'w-full rounded-lg border bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]';

function Field({
  label,
  type = 'text',
  icon,
  ...rest
}: { label: string; type?: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground-lovable)]">
        {label}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground-lovable)]">
          {icon}
        </span>
        <input
          type={isPassword && show ? 'text' : type}
          className={`${fieldClass} pl-10 ${isPassword ? 'pr-10' : ''}`}
          style={{ borderColor: 'var(--border-lovable)' }}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground-lovable)]"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </label>
  );
}
export default function AuthPage() {
  const locale = useLocale();
  const router = useRouter();
  const lh = (p: string) => `/${locale}${p}`;
  const [tab, setTab] = useState<Tab>('login');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(lh('/intro'));
  };

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <aside
        className="relative hidden overflow-hidden p-12 text-[var(--primary-foreground)] lg:flex lg:flex-col lg:justify-between"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: 'var(--gradient-hero-glow)' }}
        />
        <div className="relative">
          <LandMapWordmark className="[color:var(--primary-foreground)]" />
        </div>
        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight">
            Inteligência de terrenos, do mapa à decisão.
          </h2>
          <p className="mt-4 max-w-md text-[color:color-mix(in_srgb,var(--primary-foreground)_80%,transparent)]">
            Preços verificados, comparação de regiões e histórico — em uma única plataforma.
          </p>
        </div>
        <p className="relative text-sm text-[color:color-mix(in_srgb,var(--primary-foreground)_60%,transparent)]">
          © 2026 LandMap
        </p>
      </aside>

      <main className="flex items-center justify-center bg-[var(--background)] p-6 text-[var(--foreground)] md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <LandMapWordmark />
          </div>

          <div
            role="tablist"
            className="grid w-full grid-cols-2 rounded-lg bg-[var(--muted-lovable)] p-1 text-sm font-medium"
          >
            {([
              { id: 'login', label: 'Entrar' },
              { id: 'register', label: 'Criar conta' },
            ] as const).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className="rounded-md px-3 py-1.5 transition"
                style={{
                  backgroundColor: tab === t.id ? 'var(--background)' : 'transparent',
                  color: tab === t.id ? 'var(--foreground)' : 'var(--muted-foreground-lovable)',
                  boxShadow: tab === t.id ? 'var(--shadow-card)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            {tab === 'register' && (
              <Field label="Nome" type="text" placeholder="Seu nome" icon={<User size={16} />} autoComplete="name" />
            )}
            <Field label="E-mail" type="email" placeholder="voce@email.com" icon={<Mail size={16} />} autoComplete="email" />
            <Field label="Senha" type="password" placeholder="••••••••" icon={<Lock size={16} />} autoComplete="current-password" />
            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[var(--primary-glow)]"
            >
              {tab === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground-lovable)]">
            {tab === 'login' ? 'Novo por aqui? ' : 'Já tem conta? '}
            <button
              type="button"
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              {tab === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>

          <Link
            href={lh('/intro')}
            className="mt-4 block text-center text-xs text-[var(--muted-foreground-lovable)] hover:text-[var(--foreground)]"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
}

