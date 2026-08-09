"use client";

// =============================================================================
// PASSO 4 — Componente visual do Flashcard (Framer Motion)
//
// - Estado `letraSelecionada` controla se o card está "virado" (flipped).
// - Ao selecionar uma alternativa, o card gira em 3D (rotateY) revelando o verso.
// - Depois de virado, o card pode ser arrastado (drag="x") para os lados;
//   ao ultrapassar o limite de arraste, ele "voa" para fora da tela e o
//   componente pai é avisado via `onProximo` para mostrar a próxima pergunta.
// =============================================================================

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Flashcard as FlashcardType, Letra } from "@/lib/types";

const LIMITE_DISTANCIA_SWIPE = 120; // px arrastados para considerar um swipe
const LIMITE_VELOCIDADE_SWIPE = 500; // px/s — permite swipe rápido mesmo com pouco arraste

interface FlashcardProps {
  flashcard: FlashcardType;
  /** Chamado assim que o usuário escolhe uma alternativa. */
  onResponder: (correta: boolean) => void;
  /** Chamado quando o card termina de sair da tela (arraste concluído). */
  onProximo: () => void;
}

export default function Flashcard({ flashcard, onResponder, onProximo }: FlashcardProps) {
  const [letraSelecionada, setLetraSelecionada] = useState<Letra | null>(null);
  const [direcaoSaida, setDirecaoSaida] = useState<"esquerda" | "direita" | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const carimboEsquerda = useTransform(x, [-150, -40], [1, 0]);
  const carimboDireita = useTransform(x, [40, 150], [0, 1]);

  const virado = letraSelecionada !== null;

  // Sempre que o flashcard mudar (próxima pergunta), reseta o estado visual.
  useEffect(() => {
    setLetraSelecionada(null);
    setDirecaoSaida(null);
    x.set(0);
  }, [flashcard.id, x]);

  function selecionarAlternativa(letra: Letra) {
    if (virado) return; // já respondida, ignora novos cliques
    setLetraSelecionada(letra);
    onResponder(letra === flashcard.correct_answer_letter);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const passouDoLimite =
      Math.abs(info.offset.x) > LIMITE_DISTANCIA_SWIPE || Math.abs(info.velocity.x) > LIMITE_VELOCIDADE_SWIPE;

    if (passouDoLimite) {
      setDirecaoSaida(info.offset.x > 0 ? "direita" : "esquerda");
    }
  }

  const alternativas = Object.entries(flashcard.options).filter(
    ([, texto]) => typeof texto === "string" && texto.length > 0
  ) as [Letra, string][];

  return (
    <div style={{ perspective: 1200 }} className="mx-auto w-full max-w-md select-none">
      <motion.div
        style={{ x, rotate }}
        drag={virado ? "x" : false}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={
          direcaoSaida
            ? { x: direcaoSaida === "direita" ? 700 : -700, opacity: 0 }
            : { x: 0, opacity: 1 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onAnimationComplete={() => {
          if (direcaoSaida) onProximo();
        }}
        className={`relative ${virado ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        {/* Carimbos estilo Tinder, só fazem sentido depois que o card foi virado */}
        {virado && (
          <>
            <motion.span
              style={{ opacity: carimboEsquerda }}
              className="pointer-events-none absolute left-4 top-4 z-10 -rotate-12 rounded border-2 border-wrong px-2 py-1 text-sm font-bold text-wrong"
            >
              ANTERIOR
            </motion.span>
            <motion.span
              style={{ opacity: carimboDireita }}
              className="pointer-events-none absolute right-4 top-4 z-10 rotate-12 rounded border-2 border-correct px-2 py-1 text-sm font-bold text-correct"
            >
              PRÓXIMA
            </motion.span>
          </>
        )}

        <motion.div
          animate={{ rotateY: virado ? 180 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative min-h-[440px]"
        >
          {/* ---------- FRENTE ---------- */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-xl"
          >
            <p className="flex-1 text-lg font-semibold text-slate-800">{flashcard.question}</p>
            <div className="flex flex-col gap-2">
              {alternativas.map(([letra, texto]) => (
                <button
                  key={letra}
                  type="button"
                  onClick={() => selecionarAlternativa(letra)}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 text-left text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="mr-2 font-semibold">{letra})</span>
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- VERSO ---------- */}
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 flex flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex flex-col gap-2">
              {alternativas.map(([letra, texto]) => {
                const ehCorreta = letra === flashcard.correct_answer_letter;
                const ehSelecionada = letra === letraSelecionada;
                const estilo = ehCorreta
                  ? "border-correct bg-green-50 text-correct"
                  : ehSelecionada
                    ? "border-wrong bg-red-50 text-wrong"
                    : "border-slate-200 text-slate-400 opacity-60";
                return (
                  <div key={letra} className={`rounded-xl border-2 p-2 text-sm ${estilo}`}>
                    <span className="mr-2 font-semibold">{letra})</span>
                    {texto}
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Explicação</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{flashcard.explanation}</p>
            </div>

            {flashcard.tip && (
              <div className="rounded-xl bg-amber-50 p-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-amber-500">Macete</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-amber-800">{flashcard.tip}</p>
              </div>
            )}

            <p className="mt-auto text-center text-xs text-slate-400">← arraste o card para continuar →</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
