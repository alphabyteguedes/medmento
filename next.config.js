// PASSO 5: PWA via configuração nativa do Next.js + service worker manual
// (public/sw.js). Antes usava o pacote next-pwa, mas ele cacheia .js com
// StaleWhileRevalidate por padrão — isso deixava usuários presos em versões
// antigas do app depois de um deploy, mesmo recarregando a página. Um
// service worker próprio, sem estratégia de cache nenhuma, elimina essa
// classe de bug: toda requisição vai direto pra rede.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ajuste os domínios do Supabase Storage aqui caso passe a hospedar imagens.
    remotePatterns: [],
  },
};

module.exports = nextConfig;
