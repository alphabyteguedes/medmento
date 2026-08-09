import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EstudoDeck from "@/components/EstudoDeck";

interface PaginaModuloProps {
  params: Promise<{ moduleId: string }>;
}

export default async function PaginaModulo({ params }: PaginaModuloProps) {
  const { moduleId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: modulo }, { data: flashcards }, { data: perfil }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("flashcards").select("*").eq("module_id", moduleId).order("created_at"),
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!modulo) notFound();
  if (!perfil) redirect("/login");

  return <EstudoDeck moduloTitulo={modulo.title} flashcards={flashcards ?? []} perfilInicial={perfil} />;
}
