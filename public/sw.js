// Service worker mínimo do Medmento.
//
// Existe só para o navegador considerar o app "instalável" como PWA
// (Chrome/Android exige um service worker com handler de fetch pra mostrar
// o prompt de instalação). Ele DELIBERADAMENTE não cacheia nada: toda
// requisição vai direto pra rede. Já tivemos usuários presos em versões
// antigas do app por causa de cache agressivo de uma lib anterior — um
// service worker "burro" como este elimina essa classe inteira de bug.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Limpa qualquer cache órfão deixado pelo service worker antigo (next-pwa/workbox).
      caches.keys().then((chaves) => Promise.all(chaves.map((chave) => caches.delete(chave)))),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", () => {
  // Não chama event.respondWith — deixa o navegador buscar normalmente.
});
