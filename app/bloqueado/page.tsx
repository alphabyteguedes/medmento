import BotaoLogout from "@/components/BotaoLogout";

export default function PaginaBloqueado() {
  return (
    <div className="textura-papel flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-3xl">🔒</span>
      <h1 className="font-serif text-2xl italic text-ink">Acesso bloqueado</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Seu acesso ao Medmento foi bloqueado por um administrador. Se acha que isso é um engano, entre em contato
        com quem gerencia o app.
      </p>
      <BotaoLogout />
    </div>
  );
}
