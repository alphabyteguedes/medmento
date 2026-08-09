// PASSO 5 — Configuração nativa de PWA do Next.js (App Router).
// Este arquivo é automaticamente servido em /manifest.webmanifest e o Next.js
// injeta a tag <link rel="manifest"> no <head> sozinho — nenhuma configuração
// manual é necessária no layout.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medmento — Flashcards para Medicina",
    short_name: "Medmento",
    description: "Flashcards gamificados para estudantes de medicina.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF6EF",
    theme_color: "#8C2F35",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
