import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "WorldExplorer", template: "%s · WorldExplorer" },
  description: "Portal de consulta de países com Next.js 14 e a CountriesNow API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <Link href="/" className="brand" aria-label="WorldExplorer — início">
              <svg viewBox="0 0 32 32" className="brand__mark" aria-hidden="true">
                <circle cx="16" cy="16" r="13" />
                <ellipse cx="16" cy="16" rx="5.5" ry="13" />
                <path d="M3 16h26M5.5 9.5h21M5.5 22.5h21" />
              </svg>
              <span>
                World<strong>Explorer</strong>
              </span>
            </Link>
            <nav className="nav" aria-label="Principal">
              <Link href="/">Explorar</Link>
              <Link href="/sobre">Sobre</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            Dados: <a href="https://countriesnow.space" target="_blank" rel="noreferrer">CountriesNow API</a>
            {" · "}Feito com Next.js 14
          </div>
        </footer>
      </body>
    </html>
  );
}
