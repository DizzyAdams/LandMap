export default function ChatLoading() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 pb-32'>
      <div className='flex items-end justify-between border-b border-[var(--border)] pb-4'>
        <div>
          <div className='h-7 w-44 animate-pulse rounded bg-[var(--muted)]' />
          <div className='mt-2 h-4 w-64 max-w-full animate-pulse rounded bg-[var(--muted)]/60' />
        </div>
        <div className='h-9 w-36 animate-pulse rounded-xl bg-[var(--muted)]' />
      </div>
      
      <div className='flex-1 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]'>
        <div className='flex items-start gap-3'>
          <div className='h-8 w-8 animate-pulse rounded-full bg-[var(--primary)]/20' />
          <div className='h-16 w-2/3 animate-pulse rounded-2xl bg-[var(--muted)]' />
        </div>
        <div className='flex items-start gap-3 justify-end'>
          <div className='h-12 w-1/3 animate-pulse rounded-2xl bg-[var(--primary)]/10' />
        </div>
        <div className='flex items-start gap-3'>
          <div className='h-8 w-8 animate-pulse rounded-full bg-[var(--primary)]/20' />
          <div className='h-20 w-3/4 animate-pulse rounded-2xl bg-[var(--muted)]' />
        </div>
      </div>
    </div>
  );
}
