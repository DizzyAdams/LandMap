import { Inter } from 'next/font/google';
import '@landmap/ui/styles.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#050505] text-neutral-50 antialiased">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900"
          >
            Pular para o conteúdo
          </a>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ':focus-visible{outline:2px solid rgba(52,211,153,0.7);outline-offset:2px;border-radius:6px;}',
            }}
          />
          <header
            aria-label="Cabeçalho"
            className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6"
          >
            <a
              href="/"
              aria-label="LandMap — página inicial"
              className="text-sm font-semibold tracking-tight"
            >
              LandMap
            </a>
            <nav
              aria-label="Navegação principal"
              className="flex gap-4 text-sm text-neutral-300"
            >
              <a href="/" className="transition hover:text-white">
                Início
              </a>
              <a href="/search" className="transition hover:text-white">
                Buscar
              </a>
              <a href="/map" className="transition hover:text-white">
                Mapa
              </a>
            </nav>
          </header>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <footer
            aria-label="Rodapé"
            className="mx-auto max-w-6xl px-6 py-10 text-xs text-neutral-500"
          >
            © {new Date().getFullYear()} LandMap. Open real estate intelligence.
          </footer>
        </div>
      </body>
    </html>
  );
}
