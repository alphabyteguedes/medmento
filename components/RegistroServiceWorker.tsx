"use client";

import { useEffect } from "react";

// Registra o service worker manual (public/sw.js) — sem cache, só pra
// instalabilidade. Substitui o register.js automático do next-pwa.
export default function RegistroServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalação como PWA é um extra, não algo crítico — falha aqui não deve quebrar o app.
    });
  }, []);

  return null;
}
