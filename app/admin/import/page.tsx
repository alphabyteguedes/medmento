// =============================================================================
// PASSO 3 — Página de importação de módulos OFICIAIS (/admin/import)
//
// Curados pelo admin, visíveis a todos os usuários (created_by = null). Para
// módulos pessoais, cada usuário tem sua própria página em /modules/importar.
//
// O controle de acesso (só admin) é feito em app/admin/layout.tsx, então esta
// página assume que quem chegou aqui já foi autorizado.
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import ImportadorFlashcards from "@/components/ImportadorFlashcards";
import { criarModuloOficial } from "../actions";

export default async function PaginaImportacao() {
  const supabase = await createClient();
  const { data: modulos } = await supabase
    .from("modules")
    .select("*")
    .is("created_by", null)
    .order("title", { ascending: true });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Curadoria</p>
        <h1 className="font-serif text-2xl italic text-ink">Importar flashcards oficiais</h1>
        <p className="text-sm text-ink-muted">
          Cole o texto bruto no padrão FLASHCARD / FRENTE / VERSO abaixo, ou suba um arquivo .txt. Esses módulos
          ficam visíveis para todos os usuários.
        </p>
      </header>

      <ImportadorFlashcards modulosIniciais={modulos ?? []} criarModulo={criarModuloOficial} />
    </div>
  );
}
