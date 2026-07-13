export default function MapLoading() {
  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="h-9 w-56 animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-[var(--card)]/60" />
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-[360px] w-full animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]/40 sm:h-[480px] lg:h-[520px]" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]/40" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
