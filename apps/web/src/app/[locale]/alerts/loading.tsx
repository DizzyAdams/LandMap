export default function AlertsLoading() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="h-9 w-48 animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-8 h-72 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          ))}
        </div>
      </div>
    </main>
  );
}
