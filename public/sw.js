// Service worker mínimo: habilita instalação (PWA) e serve de base pra push futuro.
// Sem cache offline agressivo — passthrough na rede pra não servir conteúdo velho.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passthrough: deixa o browser lidar com a requisição normalmente.
});
