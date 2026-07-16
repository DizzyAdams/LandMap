'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, LandMapWordmark } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { useMockUser, storeUserType, type UserType } from '../../../lib/mockAuth';

/** Labels 1:1 Lovable (values mapeados para UserType local). */
const USER_TYPE_OPTIONS: { id: UserType; label: string }[] = [
  { id: 'corretor', label: 'Corretor' },
  { id: 'incorporadora', label: 'Construtora' },
  { id: 'investidor', label: 'Investidor' },
  { id: 'fundo', label: 'Empresário' },
];

const fieldClass =
  'w-full rounded-lg border bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]';

function Field({
  label,
  type = 'text',
  ...rest
}: { label: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          className={`${fieldClass} ${isPassword ? 'pr-10' : ''}`}
          style={{ borderColor: 'var(--border)' }}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
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
  const params = useSearchParams();
  const lh = (p: string) => `/${locale}${p}`;
  const [tab, setTab] = useState<'login' | 'signup'>(
    params.get('mode') === 'request' ? 'signup' : 'login',
  );

  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserType | ''>('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPwFocused, setSignupPwFocused] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    const ddd = d.slice(0, 2);
    let local = d.slice(2);
    if (local.length > 5) local = `${local.slice(0, 5)}-${local.slice(5)}`;
    else if (local.length > 4) local = `${local.slice(0, 4)}-${local.slice(4)}`;
    return `(${ddd}) ${local}`;
  };

  const { signInEmail, signInGuest } = useMockUser();

  /** Lovable: guest_mode=1 → /dashboard (AppShell). */
  const guest = () => {
    try {
      window.localStorage.setItem('guest_mode', '1');
    } catch {
      /* ignore */
    }
    signInGuest();
    router.push(lh('/dashboard'));
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signInEmail({ email: loginEmail || undefined });
      router.push(lh('/dashboard'));
    } finally {
      setLoginLoading(false);
    }
  };

  const onSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const phoneDigits = phone.replace(/\D/g, '');
    const pwLenMet = signupPassword.length >= 8;
    const pwSpecialMet = /[^A-Za-z0-9]/.test(signupPassword);
    if (!fullName.trim()) return setError('Informe seu nome.');
    if (phoneDigits.length < 10 || phoneDigits.length > 11)
      return setError('Telefone deve ter DDD + 8 ou 9 dígitos.');
    if (!userType) return setError('Selecione seu perfil.');
    if (!email.trim()) return setError('E-mail inválido.');
    if (!pwLenMet || !pwSpecialMet)
      return setError('A senha precisa de ao menos 8 caracteres e 1 caractere especial.');
    setSignupLoading(true);
    storeUserType(userType as UserType);
    void signInEmail({
      email: email.trim(),
      name: fullName.trim(),
      userType: userType as UserType,
    })
      .then(() => {
        // Lovable: após cadastro volta para tab login
        setTab('login');
        setLoginEmail(email.trim());
        setError('');
      })
      .finally(() => setSignupLoading(false));
  };

  const pwLenMet = signupPassword.length >= 8;
  const pwSpecialMet = /[^A-Za-z0-9]/.test(signupPassword);
  const showPwHint = signupPwFocused || signupPassword.length > 0;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[var(--gradient-hero)] p-12 text-[var(--primary-foreground)] lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: 'var(--gradient-hero-glow)' }}
        />
        <LandMapWordmark />
        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight">
            Inteligência de terrenos, do mapa à decisão.
          </h2>
          <p className="mt-4 max-w-md text-[color:color-mix(in_srgb,var(--primary-foreground)_80%,transparent)]">
            Preços verificados, comparação de regiões e histórico — em uma única plataforma.
          </p>
        </div>
        <p className="relative text-sm text-[color:color-mix(in_srgb,var(--primary-foreground)_60%,transparent)]">
          © {new Date().getFullYear()} LandMap
        </p>
      </aside>

      <main className="flex items-center justify-center bg-[var(--background)] p-6 md:p-12">
        <Reveal className="w-full max-w-md" y={24}>
          <div className="mb-8 lg:hidden">
            <LandMapWordmark />
          </div>

          <div
            role="tablist"
            className="grid w-full grid-cols-2 rounded-lg bg-[var(--muted)] p-1 text-sm font-medium"
          >
            {(
              [
                { id: 'login', label: 'Entrar' },
                { id: 'signup', label: 'Criar conta' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setError('');
                }}
                className="rounded-md px-3 py-1.5 transition"
                style={{
                  backgroundColor: tab === t.id ? 'var(--background)' : 'transparent',
                  color: tab === t.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: tab === t.id ? 'var(--shadow-card)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'login' && (
            <form onSubmit={onLogin} className="mt-8 space-y-4">
              <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Acesse a plataforma com sua conta.
              </p>
              <Field
                label="E-mail"
                type="email"
                autoComplete="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <Field label="Senha" type="password" autoComplete="current-password" required />
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={onSignup} className="mt-8 space-y-4">
              <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Preencha seus dados para começar a usar o LandMap.
              </p>
              <Field
                label="Nome completo"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Field
                label="Telefone"
                type="tel"
                inputMode="numeric"
                maxLength={15}
                placeholder="(11) 98765-4321"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
              />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                  Tipo de usuário
                </span>
                <select
                  required
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as UserType | '')}
                  className={fieldClass}
                  style={{ borderColor: 'var(--border)' }}
                  aria-label="Tipo de usuário"
                >
                  <option value="">Selecione seu perfil</option>
                  {USER_TYPE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                  Senha
                </span>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onFocus={() => setSignupPwFocused(true)}
                    onBlur={() => setSignupPwFocused(false)}
                    className={`${fieldClass} pr-10`}
                    style={{ borderColor: 'var(--border)' }}
                    autoComplete="new-password"
                  />
                </div>
                {showPwHint && (
                  <div className="mt-2 flex flex-col gap-1 rounded-md border border-[color:color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-[var(--muted)] p-2 text-xs">
                    <span className={pwLenMet ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'}>
                      {pwLenMet ? '✓' : '·'} Mínimo 8 caracteres
                    </span>
                    <span
                      className={
                        pwSpecialMet ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'
                      }
                    >
                      {pwSpecialMet ? '✓' : '·'} Ao menos 1 caractere especial
                    </span>
                  </div>
                )}
              </label>
              {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
              >
                {signupLoading ? 'Enviando...' : 'Criar conta'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">ou</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <button
            type="button"
            onClick={guest}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border text-sm font-semibold transition hover:bg-[var(--muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Entrar sem cadastro
          </button>

          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            <Link href={lh('/')} className="hover:text-[var(--foreground)]">
              ← Voltar para o site
            </Link>
          </p>
        </Reveal>
      </main>
    </div>
  );
}
