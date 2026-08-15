"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Modulo } from "@/lib/types";

// A própria policy "user_profiles: admin atualiza todos os perfis" garante
// no banco que só admins conseguem executar este update — aqui é só a UI.
export async function alternarAdmin(formData: FormData) {
  const userId = formData.get("userId");
  const novoValor = formData.get("novoValor") === "true";

  if (typeof userId !== "string" || !userId) {
    throw new Error("userId inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_profiles").update({ is_admin: novoValor }).eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin");
}

// A policy "modules: escrita apenas para admin" garante no banco que só
// admins conseguem excluir — e o ON DELETE CASCADE em flashcards.module_id
// já apaga as fichas do módulo junto, sem precisar de um segundo passo aqui.
export async function excluirModulo(formData: FormData) {
  const moduleId = formData.get("moduleId");

  if (typeof moduleId !== "string" || !moduleId) {
    throw new Error("moduleId inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/modules");
}

// Bloqueia/desbloqueia o acesso de um usuário ao conteúdo do app (não afeta
// o login em si — ele continua entrando, mas o middleware e a RLS de
// modules/flashcards passam a barrar o acesso). A página impede bloquear a
// si mesmo (ver app/admin/page.tsx), então não precisa validar isso aqui.
export async function alternarBloqueio(formData: FormData) {
  const userId = formData.get("userId");
  const novoValor = formData.get("novoValor") === "true";

  if (typeof userId !== "string" || !userId) {
    throw new Error("userId inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_profiles").update({ is_blocked: novoValor }).eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin");
}

// Cria um módulo OFICIAL (created_by null) — usado pelo importador em
// /admin/import. A policy "modules: escrita apenas para admin" garante no
// banco que só admins conseguem inserir com created_by null.
export async function criarModuloOficial(titulo: string): Promise<Modulo> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("modules").insert({ title: titulo, created_by: null }).select().single();
  if (error) throw error;

  revalidatePath("/admin/import");
  revalidatePath("/modules");
  return data;
}
