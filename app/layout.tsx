import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Serifada editorial para títulos + sans humanista para UI — combinação
// deliberadamente diferente do "Inter em tudo" padrão de produtos gerados por IA.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});

// PASSO 5 — Metadados de PWA. O <link rel="manifest"> é injetado automaticamente
// pelo Next.js por causa do arquivo app/manifest.ts.
export const metadata: Metadata = {
  title: "Medmento — Flashcards para Medicina",
  description: "Flashcards gamificados para estudantes de medicina.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Medmento",
  },
  icons: {
    icon: "/icons/icon.svg",
    // iOS exige PNG para o ícone de tela inicial — adicione um arquivo real em
    // public/apple-touch-icon.png (180x180) antes de publicar em produção.
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8C2F35",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${plexSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
