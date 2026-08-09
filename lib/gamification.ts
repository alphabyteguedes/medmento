// Regras de gamificação leve: XP por acerto e streak (ofensiva) de dias seguidos.
import { SupabaseClient } from "@supabase/supabase-js";

export const XP_POR_ACERTO = 10;

/** Soma XP ao perfil do usuário e retorna o novo total. */
export async function registrarAcerto(
  supabase: SupabaseClient,
  userId: string,
  xpAtual: number
): Promise<number> {
  const novoXp = xpAtual + XP_POR_ACERTO;
  const { error } = await supabase.from("user_profiles").update({ xp: novoXp }).eq("id", userId);
  if (error) throw error;
  return novoXp;
}

/**
 * Atualiza o streak de dias seguidos estudando.
 * - Se já estudou hoje, mantém o streak como está.
 * - Se estudou ontem, incrementa o streak.
 * - Caso contrário (quebrou a sequência), reinicia o streak em 1.
 */
export async function atualizarStreak(
  supabase: SupabaseClient,
  userId: string,
  ultimaDataEstudo: string | null,
  streakAtual: number
): Promise<{ streak_days: number; last_study_date: string }> {
  const hoje = new Date().toISOString().slice(0, 10);
  if (ultimaDataEstudo === hoje) {
    return { streak_days: streakAtual, last_study_date: hoje };
  }

  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const novoStreak = ultimaDataEstudo === ontem ? streakAtual + 1 : 1;

  const { error } = await supabase
    .from("user_profiles")
    .update({ streak_days: novoStreak, last_study_date: hoje })
    .eq("id", userId);
  if (error) throw error;

  return { streak_days: novoStreak, last_study_date: hoje };
}
