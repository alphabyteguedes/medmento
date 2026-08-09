// Rota chamada pelo Supabase depois que o usuário autoriza o acesso no Google.
// Troca o "code" recebido por uma sessão válida (grava os cookies) e então
// redireciona para dentro do app.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const proximo = searchParams.get("next") ?? "/modules";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${proximo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=nao_foi_possivel_autenticar`);
}
