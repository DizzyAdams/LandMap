export default function PropertyLoading() {
  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="h-6 w-40 animate-pulse rounded-full bg-[var(--card)]" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-[var(--card)]" />
        </div>
        <div className="h-8 w-72 max-w-full animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-[var(--card)]/60" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]/40 sm:col-span-2" />
          <div className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]/40" />
        </div>
      </section>
    </main>
  );
}
