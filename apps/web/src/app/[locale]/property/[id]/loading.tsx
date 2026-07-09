export default function PropertyLoading() {
  return (
    <main className="min-h-screen grid-bg text-neutral-50">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="h-6 w-40 animate-pulse rounded-full bg-neutral-800" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-neutral-800" />
        </div>
        <div className="h-8 w-72 max-w-full animate-pulse rounded bg-neutral-800" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-neutral-800/60" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="h-32 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/40 sm:col-span-2" />
          <div className="h-32 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/40" />
        </div>
      </section>
    </main>
  );
}
