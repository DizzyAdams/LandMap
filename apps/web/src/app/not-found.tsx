import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6">
      <span className="text-7xl font-bold tracking-tight text-neutral-800">404</span>
      <h1 className="mt-4 text-xl font-medium text-neutral-100">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-center text-sm text-neutral-500">
        O conteúdo que você procura não existe ou foi movido para outro endereço.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center rounded-lg border border-neutral-800 px-5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
