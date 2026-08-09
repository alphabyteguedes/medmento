"use client";

// =============================================================================
// PASSO 4 — Componente visual do Flashcard (Framer Motion)
//
// - Estado `letraSelecionada` controla se o card está "virado" (flipped).
// - Ao selecionar uma alternativa, o verso substitui a frente com um "flip"
//   2D (scaleX) — DELIBERADAMENTE não usamos perspective/rotateY 3D: em
//   celular médio, transform 3D + drag simultâneos pesam na GPU e o gesto
//   fica travado. scaleX é uma única transform 2D, muito mais barata.
// - Depois de virado, o card pode ser arrastado (drag="x") para os lados;
//   ao ultrapassar o limite de arraste, ele "voa" para fora da tela e o
//   componente pai é avisado via `onProximo` para mostrar a próxima pergunta.
//
// O componente ocupa 100% da altura/largura do container do pai (que define
// o tamanho real do card) — isso é o que permite ao EstudoDeck empilhar um
// "peek" do próximo card por baixo, estilo Tinder.
// =============================================================================

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Flashcard as FlashcardType, Letra } from "@/lib/types";

const LIMITE_DISTANCIA_SWIPE = 100; // px arrastados para considerar um swipe
const LIMITE_VELOCIDADE_SWIPE = 400; // px/s — permite swipe rápido mesmo com pouco arraste

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

  // Não precisa de efeito para resetar ao trocar de card: o componente pai
  // (EstudoDeck) monta uma instância nova a cada flashcard via `key`, então
  // todo o estado (incluindo `x`) já nasce zerado.

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
    <motion.div
      style={{ x, rotate, touchAction: "pan-y", willChange: "transform" }}
      drag={virado ? "x" : false}
      dragElastic={0.6}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      animate={
        direcaoSaida ? { x: direcaoSaida === "direita" ? 700 : -700, opacity: 0 } : { x: 0, opacity: 1 }
      }
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
      onAnimationComplete={() => {
        if (direcaoSaida) onProximo();
      }}
      className={`relative h-full w-full select-none ${virado ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* Carimbos estilo ficheiro, só fazem sentido depois que o card foi virado */}
      {virado && (
        <>
          <motion.span
            style={{ opacity: carimboEsquerda }}
            className="pointer-events-none absolute left-5 top-5 z-10 -rotate-12 rounded border-2 border-ink-faint px-2 py-0.5 font-serif text-sm italic text-ink-faint"
          >
            anterior
          </motion.span>
          <motion.span
            style={{ opacity: carimboDireita }}
            className="pointer-events-none absolute right-5 top-5 z-10 rotate-12 rounded border-2 border-garnet-500 px-2 py-0.5 font-serif text-sm italic text-garnet-500"
          >
            próxima
          </motion.span>
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {!virado ? (
          <motion.div
            key="frente"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.22, ease: "easeIn" }}
            style={{ willChange: "transform" }}
            className="flex h-full w-full flex-col gap-3 rounded-lg border border-sand-300 bg-paper-raised p-5 pt-8 shadow-[0_10px_30px_-12px_rgba(33,28,24,0.25)] sm:p-6"
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
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ willChange: "transform" }}
            className="flex h-full w-full flex-col gap-3 overflow-y-auto rounded-lg border border-sand-300 bg-paper-raised p-5 pt-8 shadow-[0_10px_30px_-12px_rgba(33,28,24,0.25)] sm:gap-4 sm:p-6"
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

            <p className="mt-auto pt-1 text-center text-xs text-ink-faint">← arraste o card para continuar →</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
