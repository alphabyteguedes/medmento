import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#3866d6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
