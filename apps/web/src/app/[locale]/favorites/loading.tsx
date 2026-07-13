export default function FavoritesLoading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--card)]" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[var(--card)]" />
        <ul role="list" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          ))}
        </ul>
      </div>
    </main>
  );
}
