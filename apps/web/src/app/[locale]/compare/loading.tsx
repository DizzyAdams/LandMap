export default function CompareLoading() {
  return (
    <main className="min-h-screen grid-bg px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[640px] space-y-3 rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-[var(--card)]" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
