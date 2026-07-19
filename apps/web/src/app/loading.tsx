/**
 * Root loading state — minimal onboarding skeleton 1:1 com Lovable.
 * A página raiz redireciona para /[locale], então este loading é
 * transiente. Exibe apenas o fundo com grid cadastral e o logo.
 */
export default function RootLoading() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--background)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute inset-0 cadastre-grid opacity-[0.04]" />
      </div>
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-6 py-6">
        <div className="h-12 w-auto">
          <div className="h-12 w-36 animate-pulse rounded bg-[var(--card)]/60" />
        </div>
        <div className="h-4 w-10 animate-pulse rounded bg-[var(--card)]/60" />
      </header>
    </div>
  );
}
