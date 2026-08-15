// Revisão aleatória: mistura flashcards de TODOS os módulos que o usuário
// enxerga (oficiais + pessoais próprios — a RLS de "flashcards" já filtra
// isso sozinha) num baralho só, embaralhado a cada visita. Reaproveita o
// mesmo EstudoDeck usado por módulo — ele não faz ideia de que os cards
// vêm de módulos diferentes, só recebe a lista já pronta.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EstudoDeck from "@/components/EstudoDeck";
import { Flashcard } from "@/lib/types";

function embaralhar<T>(itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default async function PaginaRevisaoAleatoria() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: flashcards }, { data: perfil }] = await Promise.all([
    supabase.from("flashcards").select("*"),
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!perfil) redirect("/login");

  const embaralhados = embaralhar((flashcards ?? []) as Flashcard[]);

  return <EstudoDeck moduloTitulo="Revisão Aleatória" flashcards={embaralhados} perfilInicial={perfil} />;
}
