export default function ChatLoading() {
  return (
    <main className='mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl flex-col px-6 py-8'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-7 w-44 animate-pulse rounded bg-neutral-800' />
          <div className='h-4 w-64 max-w-full animate-pulse rounded bg-neutral-800/60' />
        </div>
        <div className='h-9 w-36 animate-pulse rounded-xl bg-neutral-800' />
      </div>
      <div className='mb-3 h-8 w-56 animate-pulse rounded-lg bg-neutral-800/60' />
      <div className='flex-1 space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/30 p-5'>
        <div className='flex justify-start'>
          <div className='h-16 w-2/3 animate-pulse rounded-2xl bg-neutral-800/60' />
        </div>
        <div className='flex justify-end'>
          <div className='h-12 w-1/3 animate-pulse rounded-2xl bg-neutral-800' />
        </div>
        <div className='flex justify-start'>
          <div className='h-20 w-3/4 animate-pulse rounded-2xl bg-neutral-800/60' />
        </div>
      </div>
      <div className='mt-4 h-12 w-full animate-pulse rounded-xl bg-neutral-800' />
    </main>
  );
}
