"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Modulo } from "@/lib/types";

// Cria um módulo PESSOAL (created_by = o próprio usuário) — usado pelo
// importador em /modules/importar. A policy "modules: usuário gerencia seus
// próprios módulos pessoais" garante no banco que ninguém consegue criar um
// módulo pessoal em nome de outra pessoa.
export async function criarModuloPessoal(titulo: string): Promise<Modulo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada — faça login de novo.");

  const { data, error } = await supabase
    .from("modules")
    .insert({ title: titulo, created_by: user.id })
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/modules/importar");
  revalidatePath("/modules");
  return data;
}
