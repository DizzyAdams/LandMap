import Link from 'next/link';
import { Logo } from '../components/Logo';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 cadastre-grid opacity-[0.04]" />

      </div>
      <Logo className="h-10 w-10" />
      <span className="mt-8 text-8xl font-bold tracking-tight text-gradient">404</span>
      <h1 className="mt-2 text-xl font-medium text-[var(--foreground)]">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--muted-foreground-lovable)]">
        O conteúdo que você procura não existe ou foi movido para outro endereço.
      </p>
      <Link
        href="/"
        className="glow-primary mt-8 inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-lovable)]"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

