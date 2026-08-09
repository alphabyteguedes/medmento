// PASSO 5: Configuração do PWA usando o pacote next-pwa.
// Ele gera automaticamente o service worker (public/sw.js) responsável por
// cachear os assets e permitir uso offline / instalação do app.
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Desativa o PWA em desenvolvimento para não cachear e atrapalhar o hot-reload.
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ajuste os domínios do Supabase Storage aqui caso passe a hospedar imagens.
    remotePatterns: [],
  },
};

module.exports = withPWA(nextConfig);
