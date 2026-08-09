"use client";

// Orquestra a sessão de estudo de um módulo: mantém o índice do card atual,
// aplica as regras de gamificação (XP + streak) e mostra a tela de conclusão.
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
    <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4">
      <header className="mx-auto flex w-full max-w-md items-center gap-3">
        <StreakBadge dias={streakDays} />
        <div className={`flex-1 ${pulsoXp ? "animate-pulse-xp" : ""}`}>
          <XPBar xp={xp} />
        </div>
      </header>

      <p className="text-center text-sm font-medium text-slate-500">{moduloTitulo}</p>

      <div className="flex flex-1 items-center justify-center">
        {!concluido ? (
          <Flashcard flashcard={cardAtual} onResponder={handleResponder} onProximo={handleProximo} />
        ) : (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-xl">
            <span className="text-4xl">🎉</span>
            <h2 className="text-xl font-bold text-slate-800">Módulo concluído!</h2>
            <p className="text-slate-500">Você revisou {flashcards.length} flashcards de {moduloTitulo}.</p>
            <Link
              href="/modules"
              className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
            >
              Voltar aos módulos
            </Link>
          </div>
        )}
      </div>

      {!concluido && (
        <p className="text-center text-sm text-slate-400">
          {indiceAtual + 1} / {flashcards.length}
        </p>
      )}
    </div>
  );
}
