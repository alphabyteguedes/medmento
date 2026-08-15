// Importador PESSOAL — qualquer usuário logado pode subir suas próprias
// questões aqui (mesmo formato FLASHCARD/FRENTE/VERSO do importador oficial).
// Viram um módulo visível só para quem subiu, sem se misturar com o
// conteúdo curado pelo admin em /admin/import.
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImportadorFlashcards from "@/components/ImportadorFlashcards";
import { criarModuloPessoal } from "../actions";

export default async function PaginaImportacaoPessoal() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: modulos } = await supabase
    .from("modules")
    .select("*")
    .eq("created_by", user.id)
    .order("title", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/modules" className="text-sm text-ink-faint hover:text-garnet-500">
        ← Módulos
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Minhas fichas</p>
        <h1 className="font-serif text-2xl italic text-ink">Importar minhas questões</h1>
        <p className="text-sm text-ink-muted">
          Cole o texto bruto no padrão FLASHCARD / FRENTE / VERSO abaixo, ou suba um arquivo .txt. Esse conteúdo fica
          visível só para você, num módulo pessoal separado do conteúdo oficial.
        </p>
      </header>

      <ImportadorFlashcards modulosIniciais={modulos ?? []} criarModulo={criarModuloPessoal} />
    </div>
  );
}
