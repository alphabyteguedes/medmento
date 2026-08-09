"use client";

// Cliente Supabase para uso em Client Components (browser).
// Usa a anon key pública — a segurança real é garantida pelas policies de RLS.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
