"use client";

// Orquestra a sessão de estudo de um módulo: mantém o índice do card visível,
// aplica as regras de gamificação (XP + streak) e mostra a tela de conclusão.
//
// ARQUITETURA DA TROCA DE CARD: em vez de simular o gesto de arrastar com
// JavaScript (Framer Motion drag), os flashcards ficam lado a lado numa
// trilha com rolagem horizontal NATIVA (scroll-snap) — a mesma tecnologia
// de um carrossel de fotos. O navegador cuida do gesto inteiro (toque,
// física, "encaixe" no card seguinte) direto no compositor gráfico, sem
// JavaScript no meio do caminho. Isso garante fluidez em qualquer aparelho.
//
// Toque e trackpad já geram rolagem horizontal sozinhos. Mouse comum não —
// por isso os botões de seta, a conversão de scroll vertical do mouse em
// horizontal, e as setas do teclado, todos chamando a mesma função `irPara`.
//
// Um IntersectionObserver descobre qual card está centralizado na tela pra
// atualizar o contador "3 de 12" — não controla a rolagem em si, só observa.
import { useEffect, useMemo, useRef, useState } from "react";
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
  const trilhaRef = useRef<HTMLDivElement>(null);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [xp, setXp] = useState(perfilInicial.xp);
  const [streakDays, setStreakDays] = useState(perfilInicial.streak_days);
  const [pulsoXp, setPulsoXp] = useState(false);

  const totalSlides = flashcards.length + 1; // +1 = tela de conclusão
  const concluido = indiceAtual >= flashcards.length;

  // Registra a "presença" de hoje assim que o usuário começa a estudar.
  useEffect(() => {
    atualizarStreak(supabase, perfilInicial.id, perfilInicial.last_study_date, perfilInicial.streak_days)
      .then((resultado) => setStreakDays(resultado.streak_days))
      .catch((erro) => console.error("Falha ao atualizar streak", erro));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observa qual "slide" da trilha está centralizado, pra saber em que card
  // o usuário está (incluindo o último slide, que é a tela de conclusão).
  useEffect(() => {
    const trilha = trilhaRef.current;
    if (!trilha) return;

    const slides = Array.from(trilha.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            const indice = slides.indexOf(entrada.target as HTMLElement);
            if (indice !== -1) setIndiceAtual(indice);
          }
        }
      },
      { root: trilha, threshold: 0.6 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [flashcards.length]);

  // Mouse com scroll vertical comum não gera rolagem horizontal sozinho
  // (diferente de touch/trackpad) — converte o eixo aqui.
  useEffect(() => {
    const trilha = trilhaRef.current;
    if (!trilha) return;

    function aoRolarComMouse(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // já é rolagem horizontal (trackpad)
      e.preventDefault();
      trilha!.scrollBy({ left: e.deltaY });
    }

    trilha.addEventListener("wheel", aoRolarComMouse, { passive: false });
    return () => trilha.removeEventListener("wheel", aoRolarComMouse);
  }, []);

  function irPara(indiceAlvo: number) {
    const trilha = trilhaRef.current;
    if (!trilha) return;
    const alvo = Math.max(0, Math.min(indiceAlvo, totalSlides - 1));
    trilha.scrollTo({ left: alvo * trilha.clientWidth, behavior: "smooth" });
  }

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

      {/* Largura travada em max-w-md — sem isso o card estica pra tela toda em monitor grande. */}
      <div className="relative mx-auto min-h-0 w-full max-w-md flex-1">
        <button
          type="button"
          onClick={() => irPara(indiceAtual - 1)}
          disabled={indiceAtual === 0}
          aria-label="Ficha anterior"
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-sand-300 bg-paper-raised text-lg text-ink-muted shadow-sm transition-colors hover:border-garnet-400 hover:text-garnet-500 disabled:pointer-events-none disabled:opacity-0"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => irPara(indiceAtual + 1)}
          disabled={indiceAtual >= totalSlides - 1}
          aria-label="Próxima ficha"
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-sand-300 bg-paper-raised text-lg text-ink-muted shadow-sm transition-colors hover:border-garnet-400 hover:text-garnet-500 disabled:pointer-events-none disabled:opacity-0"
        >
          ›
        </button>

        <div
          ref={trilhaRef}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") irPara(indiceAtual + 1);
            if (e.key === "ArrowLeft") irPara(indiceAtual - 1);
          }}
          className="sem-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden outline-none"
          style={{ overscrollBehaviorX: "contain" }}
        >
          {flashcards.map((flashcard) => (
            <div key={flashcard.id} className="w-full shrink-0 snap-center px-1.5">
              <Flashcard flashcard={flashcard} onResponder={handleResponder} />
            </div>
          ))}

          <div className="flex w-full shrink-0 snap-center items-center justify-center px-1.5">
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg border border-sand-300 bg-paper-raised p-8 text-center shadow-[0_4px_14px_-6px_rgba(33,28,24,0.18)]">
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
          </div>
        </div>
      </div>

      <p className="shrink-0 text-center text-xs uppercase tracking-[0.15em] text-ink-faint">
        {concluido ? "concluído" : `${indiceAtual + 1} de ${flashcards.length}`}
      </p>
    </div>
  );
}
