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
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <a href="/" className="text-sm font-semibold tracking-tight">
              LandMap
            </a>
            <nav className="flex gap-4 text-sm text-neutral-300">
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
          {children}
          <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-neutral-500">
            © {new Date().getFullYear()} LandMap. Open real estate intelligence.
          </footer>
        </div>
      </body>
    </html>
  );
}
