export default function SearchLoading() {
  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="h-9 w-64 animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-[var(--card)]/60" />
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--card)]/70" />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-[var(--card)]/60" />
        <ul role="list" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]/40" />
          ))}
        </ul>
      </section>
    </main>
  );
}
