"use client";

// Login exclusivamente via Google OAuth — não há campo de usuário/senha.
// A gestão de identidade (senha, recuperação de conta, 2FA) fica 100% a
// cargo do Google; o Supabase só recebe o resultado do login.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PaginaLogin() {
  const supabase = createClient();
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleLoginGoogle() {
    setEntrando(true);
    setErro(null);

    // Usa um domínio canônico fixo quando definido, em vez de window.location.origin:
    // a Vercel expõe o mesmo deploy em vários domínios (medmento.vercel.app,
    // medmento-<time>.vercel.app etc.) e o Supabase só aceita redirect para URLs
    // cadastradas — depender do domínio que a pessoa digitou causava fallback
    // silencioso para o Site URL (localhost) quando não batia com a lista.
    const origem = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origem}/auth/callback`,
      },
    });

    // Em caso de sucesso o navegador é redirecionado para o Google, então só
    // chegamos aqui se algo deu errado antes mesmo do redirecionamento.
    if (error) {
      setErro(error.message);
      setEntrando(false);
    }
  }

  return (
    <div className="textura-papel flex min-h-screen flex-col items-center justify-center gap-12 p-6">
      <div className="flex flex-col items-center gap-6">
        {/* Baralho de fichas ilustrado: três cartões desalinhados, remete ao
            objeto físico (flashcard) em vez de um ícone genérico de app. */}
        <div className="relative h-20 w-24">
          <div className="absolute inset-0 -rotate-6 rounded-md border border-sand-300 bg-paper-raised shadow-sm" />
          <div className="absolute inset-0 rotate-3 rounded-md border border-sand-300 bg-paper-raised shadow-sm" />
          <div className="absolute inset-0 flex items-center justify-center rounded-md border border-garnet-500 bg-paper-raised shadow-md">
            <span className="font-serif text-2xl italic text-garnet-500">Md</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-4xl italic text-ink">Medmento</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-ink-muted">
            Fichas de estudo para medicina
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          type="button"
          onClick={handleLoginGoogle}
          disabled={entrando}
          className="flex items-center justify-center gap-3 rounded-lg border border-ink/15 bg-paper-raised p-3.5 font-medium text-ink shadow-sm transition-colors hover:border-ink/30 hover:bg-sand-100/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconeGoogle />
          {entrando ? "Redirecionando..." : "Entrar com Google"}
        </button>

        <p className="text-center text-xs text-ink-faint">
          Sua conta Google é a sua identidade aqui — sem senhas para lembrar.
        </p>

        {erro && <p className="text-center text-sm text-wrong">{erro}</p>}
      </div>
    </div>
  );
}

function IconeGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
        c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
        c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
        l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
        c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
        c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}
