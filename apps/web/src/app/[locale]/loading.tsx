export default function LocaleLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      {/* Skeleton hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-32 pb-20">
        <div className="mb-4 h-5 w-44 animate-pulse rounded-full bg-neutral-800" />
        <div className="mb-2 h-12 w-3/4 animate-pulse rounded bg-neutral-800" />
        <div className="mb-2 h-12 w-1/2 animate-pulse rounded bg-neutral-800" />
        <div className="mt-4 h-4 w-full max-w-lg animate-pulse rounded bg-neutral-800" />
        <div className="mt-10 flex gap-4">
          <div className="h-11 w-36 animate-pulse rounded-lg bg-neutral-800" />
          <div className="h-11 w-40 animate-pulse rounded-lg bg-neutral-800" />
        </div>
      </section>

      {/* Skeleton stats */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#050505] p-6">
              <div className="mb-2 h-7 w-24 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-32 animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </section>

      {/* Skeleton featured */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-neutral-800" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5"
            >
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-neutral-800" />
              <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-neutral-800/60" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
