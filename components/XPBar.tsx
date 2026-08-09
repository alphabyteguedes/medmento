"use client";

// Barra de XP exibida no topo da tela durante o estudo.
// Cada "nível" custa 100 XP; a barra mostra o progresso dentro do nível atual.
const XP_POR_NIVEL = 100;

export default function XPBar({ xp }: { xp: number }) {
  const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
  const progresso = xp % XP_POR_NIVEL;

  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap font-serif text-sm italic text-garnet-500">Nível {nivel}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-200">
        <div
          className="h-full rounded-full bg-garnet-500 transition-all duration-500 ease-out"
          style={{ width: `${progresso}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs text-ink-muted">{xp} XP</span>
    </div>
  );
}
