// Tipos compartilhados entre frontend e as tabelas do Supabase.
// Mantidos em sincronia manual com supabase/schema.sql.

export type Letra = "A" | "B" | "C" | "D" | "E";

export interface Modulo {
  id: string;
  title: string;
  created_at: string;
  /** null = módulo oficial; <uuid> = módulo pessoal daquele usuário. */
  created_by: string | null;
}

export interface AlternativasFlashcard {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface Flashcard {
  id: string;
  module_id: string;
  question: string;
  options: AlternativasFlashcard;
  correct_answer_letter: Letra;
  explanation: string;
  tip: string | null;
  created_at: string;
}

export interface PerfilUsuario {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  streak_days: number;
  last_study_date: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}
