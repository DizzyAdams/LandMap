'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, LandMapWordmark, Lock, Mail } from '../../../components/lovable/icons';
import { Briefcase, Building2, Gem, TrendingUp, User } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { useMockUser } from '../../../lib/mockAuth';
import { storeUserType, type UserType } from '../../../lib/mockAuth';

/** Segmentos do mercado imobiliário — escolha obrigatória no cadastro. */
const USER_TYPES: { id: UserType; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'corretor', label: 'Corretor', icon: <Briefcase size={18} />, hint: 'Comissão e carteira de clientes' },
  { id: 'investidor', label: 'Investidor', icon: <TrendingUp size={18} />, hint: 'Valorização e ROI de terrenos' },
  { id: 'fundo', label: 'Fundo de investimento', icon: <Gem size={18} />, hint: 'Gestão de portfólio institucional' },
  { id: 'incorporadora', label: 'Incorporadora', icon: <Building2 size={18} />, hint: 'Aquisição e desenvolvimento' },
  { id: 'comprador', label: 'Comprador', icon: <User size={18} />, hint: 'Busca direta de terreno' },
];

/** Ícone "G" oficial do Google (multicolor). */
function GoogleG({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden focusable="false" className={className}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}



const fieldClass =
  'w-full rounded-lg border bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]';

function Field({
  label,
  type = 'text',
  icon,
  ...rest
}: { label: string; type?: string; icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const hasIcon = Boolean(icon);
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </span>
      <div className="relative">
        {hasIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            {icon}
          </span>
        )}
        <input
          type={isPassword && show ? 'text' : type}
          className={`${fieldClass} ${hasIcon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`}
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
  const [showSignupPw, setShowSignupPw] = useState(false);

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

  const { signIn: signInGoogle, signInEmail, signInGuest } = useMockUser();

  /** Acesso gratuito: sessão guest free + entra no produto (mapa). */
  const guest = () => {
    signInGuest();
    router.push(lh('/map'));
  };
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const onGoogle = async (type?: UserType) => {
    setGoogleLoading(true);
    try {
      await signInGoogle(type);
      router.push(lh('/plans'));
    } finally {
      setGoogleLoading(false);
    }
  };


  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signInEmail({ email: loginEmail || undefined });
      // Após login: mapa de terrenos (produto) — planos só se ainda não escolheu
      const hasPlan =
        typeof window !== 'undefined' && localStorage.getItem('landmap:selected_plan');
      router.push(hasPlan ? lh('/map') : lh('/plans'));
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
    if (!fullName.trim()) return setError('Preencha seu nome completo.');
    if (phoneDigits.length < 10 || phoneDigits.length > 11)
      return setError('Informe um telefone válido (10 ou 11 dígitos).');
    if (!userType) return setError('Selecione seu tipo de usuário.');
    if (!email.trim()) return setError('Preencha seu e-mail.');
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
        // Pós-cadastro: produto = mapa de terrenos (pagamento demo no /plans)
        router.push(lh('/map'));
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
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">
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
            {([
              { id: 'login', label: 'Entrar' },
              { id: 'signup', label: 'Criar conta' },
            ] as const).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
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
            <form onSubmit={onLogin} className="mt-6 space-y-4">
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
                icon={<Mail size={16} />}
              />
              <Field
                label="Senha"
                type="password"
                autoComplete="current-password"
                required
                icon={<Lock size={16} />}
              />
              {/* Lovable ref não tem "Esqueceu a senha?" no login — omitido de propósito. */}
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)] text-sm font-semibold"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={onSignup} className="mt-6 space-y-4">
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
                icon={<User size={16} />}
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
              <div>
                <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                  Tipo de usuário
                </span>
                <div
                  role="radiogroup"
                  aria-label="Tipo de usuário"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {USER_TYPES.map((t) => {
                    const active = userType === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        role="radio"
                        aria-checked={active}
                        onClick={() => setUserType(t.id)}
                        className="flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition"
                        style={{
                          borderColor: active ? 'var(--primary)' : 'var(--border)',
                          background: active
                            ? 'color-mix(in_srgb,var(--primary)_12%,transparent)'
                            : 'var(--background)',
                        }}
                      >
                        <span
                          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md"
                          style={{
                            background: active
                              ? 'var(--primary)'
                              : 'var(--muted)',
                            color: active ? 'var(--primary-foreground)' : 'var(--foreground)',
                          }}
                        >
                          {t.icon}
                        </span>
                        <span className="min-w-0">
                          <span
                            className="block text-sm font-semibold"
                            style={{ color: active ? 'var(--foreground)' : 'var(--foreground)' }}
                          >
                            {t.label}
                          </span>
                          <span className="block truncate text-xs text-[var(--muted-foreground)]">
                            {t.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
              />

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                  Senha
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showSignupPw ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onFocus={() => setSignupPwFocused(true)}
                    onBlur={() => setSignupPwFocused(false)}
                    className={`${fieldClass} pl-10 pr-10`}
                    style={{ borderColor: 'var(--border)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPw((s) => !s)}
                    aria-label={showSignupPw ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  >
                    {showSignupPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {showPwHint && (
                  <div className="mt-2 flex flex-col gap-1 rounded-md border border-[color:color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-[var(--muted)] p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                          pwLenMet ? 'bg-[var(--success)]/15 text-[var(--success)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        }`}
                      />
                      <span className={pwLenMet ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'}>
                        Mínimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                          pwSpecialMet ? 'bg-[var(--success)]/15 text-[var(--success)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        }`}
                      />
                      <span
                        className={
                          pwSpecialMet ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'
                        }
                      >
                        Ao menos 1 caractere especial
                      </span>
                    </div>
                  </div>
                )}
              </label>
              {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                />
                <span className="text-xs text-[var(--muted-foreground)]">
                  Aceito os Termos de Uso e a Política de Privacidade.
                </span>
              </label>

              <button
                type="button"
                onClick={() => onGoogle(userType || undefined)}
                disabled={googleLoading}
                aria-label="Entrar com o Google (mock)"
                className="relative mt-2 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border bg-[var(--background)] text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)] disabled:opacity-60"
                style={{ borderColor: 'var(--border)' }}
              >
                {googleLoading ? (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]"
                    aria-hidden
                  />
                ) : (
                  <GoogleG className="h-4 w-4" />
                )}
                {googleLoading ? 'Conectando…' : 'Entrar com Google'}
              </button>

              <button
                type="submit"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)] text-sm font-semibold"
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

          <Link
            href={lh('/')}
            className="mt-8 block text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ← Voltar para o site
          </Link>
        </Reveal>
        </main>
    </div>
  );
}

