"use client";

// =============================================================================
// PASSO 4 — Componente visual do Flashcard
//
// Só cuida do conteúdo de UM card: pergunta/alternativas na frente, gabarito/
// explicação no verso. Estado `letraSelecionada` controla se está "virado".
//
// DELIBERADAMENTE não tem nenhuma lógica de arrastar/trocar de card — isso
// agora é rolagem horizontal nativa do navegador, controlada pelo
// EstudoDeck (ver comentário lá para o motivo). O único movimento próprio
// daqui é o "flip" 2D (scaleX) ao responder, disparado por toque único
// (não por gesto contínuo), então o custo é mínimo em qualquer aparelho.
// =============================================================================

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flashcard as FlashcardType, Letra } from "@/lib/types";

interface FlashcardProps {
  flashcard: FlashcardType;
  /** Chamado assim que o usuário escolhe uma alternativa. */
  onResponder: (correta: boolean) => void;
}

export default function Flashcard({ flashcard, onResponder }: FlashcardProps) {
  const [letraSelecionada, setLetraSelecionada] = useState<Letra | null>(null);
  const virado = letraSelecionada !== null;

  function selecionarAlternativa(letra: Letra) {
    if (virado) return; // já respondida, ignora novos cliques
    setLetraSelecionada(letra);
    onResponder(letra === flashcard.correct_answer_letter);
  }

  const alternativas = Object.entries(flashcard.options).filter(
    ([, texto]) => typeof texto === "string" && texto.length > 0
  ) as [Letra, string][];

  return (
    <div className="relative h-full w-full select-none">
      <AnimatePresence mode="wait" initial={false}>
        {!virado ? (
          <motion.div
            key="frente"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            style={{ willChange: "transform" }}
            className="flex h-full w-full flex-col gap-3 rounded-lg border border-sand-300 bg-paper-raised p-5 pt-8 shadow-[0_4px_14px_-6px_rgba(33,28,24,0.18)] sm:p-6"
          >
            <FuroDeArgola />
            <div className="flex flex-1 flex-col justify-center gap-5 overflow-y-auto">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-garnet-500">Pergunta</p>
                <p className="mt-2 font-serif text-lg leading-snug text-ink sm:text-xl">{flashcard.question}</p>
              </div>
              <div className="flex flex-col gap-2">
                {alternativas.map(([letra, texto]) => (
                  <button
                    key={letra}
                    type="button"
                    onClick={() => selecionarAlternativa(letra)}
                    className="w-full rounded-md border border-sand-300 p-2.5 text-left text-sm text-ink transition-colors hover:border-garnet-400 hover:bg-garnet-50 sm:p-3 sm:text-base"
                  >
                    <span className="mr-2 font-serif italic text-ink-muted">{letra}</span>
                    {texto}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verso"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ willChange: "transform" }}
            className="flex h-full w-full flex-col gap-3 overflow-y-auto rounded-lg border border-sand-300 bg-paper-raised p-5 pt-8 shadow-[0_4px_14px_-6px_rgba(33,28,24,0.18)] sm:gap-4 sm:p-6"
          >
            <FuroDeArgola />
            <p className="text-xs uppercase tracking-[0.2em] text-garnet-500">Gabarito</p>

            <div className="flex flex-col gap-2">
              {alternativas.map(([letra, texto]) => {
                const ehCorreta = letra === flashcard.correct_answer_letter;
                const ehSelecionada = letra === letraSelecionada;
                const estilo = ehCorreta
                  ? "border-sage-500 bg-sage-50 text-sage-600"
                  : ehSelecionada
                    ? "border-wrong bg-garnet-50 text-wrong"
                    : "border-sand-200 text-ink-faint opacity-70";
                return (
                  <div key={letra} className={`rounded-md border p-2 text-sm ${estilo}`}>
                    <span className="mr-2 font-serif italic">{letra}</span>
                    {texto}
                  </div>
                );
              })}
            </div>

            <div className="rounded-md bg-sand-100 p-3">
              <h3 className="text-xs uppercase tracking-[0.15em] text-ink-muted">Explicação</h3>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink">{flashcard.explanation}</p>
            </div>

            {flashcard.tip && (
              <div className="rounded-md border border-gold-500/30 bg-gold-50 p-3">
                <h3 className="text-xs uppercase tracking-[0.15em] text-gold-600">Macete</h3>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink">{flashcard.tip}</p>
              </div>
            )}

            <p className="mt-auto pt-1 text-center text-xs text-ink-faint">← deslize para continuar →</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Dois furos de argola no topo do card — reforça a metáfora de ficha física. */
function FuroDeArgola() {
  return (
    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-10">
      <span className="h-2 w-2 rounded-full bg-paper shadow-[inset_0_1px_2px_rgba(33,28,24,0.25)]" />
      <span className="h-2 w-2 rounded-full bg-paper shadow-[inset_0_1px_2px_rgba(33,28,24,0.25)]" />
    </div>
  );
}
