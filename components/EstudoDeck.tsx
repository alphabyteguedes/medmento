"use client";

// Orquestra a sessão de estudo de um módulo: mantém o índice do card atual,
// aplica as regras de gamificação (XP + streak) e mostra a tela de conclusão.
//
// A tela inteira é de altura fixa (h-dvh + overflow-hidden) — sem isso, em
// celulares o navegador fica em dúvida entre rolar a página ou obedecer o
// arraste horizontal do card, e o swipe fica travado/lento. Sem scroll de
// página, o gesto de arrastar pertence 100% ao card.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registrarAcerto, atualizarStreak } from "@/lib/gamification";
import { Flashcard as FlashcardType, PerfilUsuario } from "@/lib/types";
import Flashcard from "@/components/Flashcard";
import XPBar from "@/components/XPBar";
import StreakBadge from "@/components/StreakBadge";

interface EstudoDeckProps {
  moduloTitulo: string;
  flashcards: FlashcardType[];
  perfilInicial: PerfilUsuario;
}

export default function EstudoDeck({ moduloTitulo, flashcards, perfilInicial }: EstudoDeckProps) {
  const supabase = useMemo(() => createClient(), []);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [xp, setXp] = useState(perfilInicial.xp);
  const [streakDays, setStreakDays] = useState(perfilInicial.streak_days);
  const [pulsoXp, setPulsoXp] = useState(false);

  const cardAtual = flashcards[indiceAtual];
  const proximoCard = flashcards[indiceAtual + 1];
  const concluido = indiceAtual >= flashcards.length;

  // Registra a "presença" de hoje assim que o usuário começa a estudar.
  useEffect(() => {
    atualizarStreak(supabase, perfilInicial.id, perfilInicial.last_study_date, perfilInicial.streak_days)
      .then((resultado) => setStreakDays(resultado.streak_days))
      .catch((erro) => console.error("Falha ao atualizar streak", erro));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResponder(correta: boolean) {
    if (!correta) return;
    try {
      const novoXp = await registrarAcerto(supabase, perfilInicial.id, xp);
      setXp(novoXp);
      setPulsoXp(true);
      setTimeout(() => setPulsoXp(false), 400);
    } catch (erro) {
      console.error("Falha ao registrar XP", erro);
    }
  }

  function handleProximo() {
    setIndiceAtual((atual) => atual + 1);
  }

  return (
    <div className="textura-papel flex h-dvh flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4">
      <header className="mx-auto flex w-full max-w-md shrink-0 items-center gap-3">
        <Link href="/modules" className="text-sm text-ink-faint hover:text-garnet-500">
          ← Módulos
        </Link>
        <StreakBadge dias={streakDays} />
        <div className={`flex-1 ${pulsoXp ? "animate-pulse-xp" : ""}`}>
          <XPBar xp={xp} />
        </div>
      </header>

      <p className="shrink-0 text-center font-serif text-base italic text-ink sm:text-lg">{moduloTitulo}</p>

      <div className="relative min-h-0 flex-1">
        {!concluido ? (
          <div className="relative mx-auto h-full w-full max-w-md">
            {/* Peek do próximo card, estilo Tinder — puramente decorativo, sem interação. */}
            {proximoCard && (
              <div
                aria-hidden
                className="absolute inset-x-3 inset-y-2 rounded-lg border border-sand-300 bg-paper-raised opacity-60 shadow-[0_6px_20px_-10px_rgba(33,28,24,0.25)]"
                style={{ transform: "scale(0.95) translateY(10px)" }}
              />
            )}
            <Flashcard key={cardAtual.id} flashcard={cardAtual} onResponder={handleResponder} onProximo={handleProximo} />
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-3 rounded-lg border border-sand-300 bg-paper-raised p-8 text-center shadow-[0_10px_30px_-12px_rgba(33,28,24,0.25)]">
            <span className="text-3xl">🔖</span>
            <h2 className="font-serif text-2xl italic text-ink">Módulo concluído</h2>
            <p className="text-sm text-ink-muted">
              Você revisou {flashcards.length} ficha{flashcards.length === 1 ? "" : "s"} de {moduloTitulo}.
            </p>
            <Link
              href="/modules"
              className="mt-2 rounded-md bg-garnet-500 px-4 py-2 text-sm font-medium text-paper-raised hover:bg-garnet-600"
            >
              Voltar aos módulos
            </Link>
          </div>
        )}
      </div>

      {!concluido && (
        <p className="shrink-0 text-center text-xs uppercase tracking-[0.15em] text-ink-faint">
          {indiceAtual + 1} de {flashcards.length}
        </p>
      )}
    </div>
  );
}
