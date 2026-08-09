import { createClient } from "@/lib/supabase/server";
import { alternarAdmin, alternarBloqueio, excluirModulo } from "./actions";
import FormularioComConfirmacao from "./FormularioComConfirmacao";
import Avatar from "@/components/Avatar";

const DIAS_JANELA_ATIVO = 7;

export default async function PainelAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: perfis }, { data: modulos }, { data: flashcardsModuleIds }] = await Promise.all([
    supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("modules").select("*").order("created_at", { ascending: false }),
    supabase.from("flashcards").select("module_id"),
  ]);

  const listaPerfis = perfis ?? [];
  const listaModulos = modulos ?? [];
  const totalUsuarios = listaPerfis.length;
  const totalFlashcards = flashcardsModuleIds?.length ?? 0;

  const contagemPorModulo = new Map<string, number>();
  (flashcardsModuleIds ?? []).forEach((f) => {
    contagemPorModulo.set(f.module_id, (contagemPorModulo.get(f.module_id) ?? 0) + 1);
  });

  const dataCorte = new Date(Date.now() - DIAS_JANELA_ATIVO * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const usuariosAtivos = listaPerfis.filter((p) => p.last_study_date && p.last_study_date >= dataCorte).length;
  const xpTotal = listaPerfis.reduce((soma, p) => soma + p.xp, 0);
  const streakMedio =
    totalUsuarios > 0 ? (listaPerfis.reduce((soma, p) => soma + p.streak_days, 0) / totalUsuarios).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Administração</p>
        <h1 className="font-serif text-2xl italic text-ink">Painel</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CartaoMetrica rotulo="Usuários" valor={totalUsuarios} />
        <CartaoMetrica rotulo={`Ativos (${DIAS_JANELA_ATIVO}d)`} valor={usuariosAtivos} />
        <CartaoMetrica rotulo="Módulos" valor={listaModulos.length} />
        <CartaoMetrica rotulo="Flashcards" valor={totalFlashcards} />
        <CartaoMetrica rotulo="XP distribuído" valor={xpTotal} />
        <CartaoMetrica rotulo="Streak médio" valor={streakMedio} />
      </div>

      <div>
        <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-faint">Módulos</h2>

        {listaModulos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-sand-300 p-6 text-center text-ink-muted">
            Nenhum módulo cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-lg border border-sand-300 bg-paper-raised">
            {listaModulos.map((modulo) => (
              <li key={modulo.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-ink">{modulo.title}</p>
                  <p className="text-xs text-ink-faint">
                    {contagemPorModulo.get(modulo.id) ?? 0} flashcard(s)
                  </p>
                </div>
                <FormularioComConfirmacao
                  action={excluirModulo}
                  mensagemConfirmacao={`Excluir "${modulo.title}" e todos os seus flashcards? Essa ação não pode ser desfeita.`}
                >
                  <input type="hidden" name="moduleId" value={modulo.id} />
                  <button
                    type="submit"
                    className="shrink-0 text-xs text-wrong underline decoration-garnet-100 underline-offset-4 hover:text-garnet-600"
                  >
                    excluir
                  </button>
                </FormularioComConfirmacao>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-faint">Usuários</h2>

        {totalUsuarios === 0 ? (
          <p className="rounded-lg border border-dashed border-sand-300 p-6 text-center text-ink-muted">
            Ninguém fez login ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sand-300 bg-paper-raised">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">XP</th>
                  <th className="px-4 py-3 font-medium">Streak</th>
                  <th className="px-4 py-3 font-medium">Último estudo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {listaPerfis.map((perfil) => (
                  <tr key={perfil.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar nome={perfil.full_name ?? perfil.email} avatarUrl={perfil.avatar_url} tamanho="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{perfil.full_name ?? "Sem nome"}</p>
                          <p className="truncate text-xs text-ink-faint">{perfil.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{perfil.xp}</td>
                    <td className="px-4 py-3 text-ink-muted">{perfil.streak_days}</td>
                    <td className="px-4 py-3 text-ink-muted">{perfil.last_study_date ?? "nunca"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {perfil.is_admin && (
                          <span className="rounded-full bg-garnet-50 px-2 py-0.5 text-xs font-medium text-garnet-500">
                            admin
                          </span>
                        )}
                        {perfil.is_blocked && (
                          <span className="rounded-full bg-sand-200 px-2 py-0.5 text-xs font-medium text-ink-muted">
                            bloqueado
                          </span>
                        )}
                        {!perfil.is_admin && !perfil.is_blocked && <span className="text-ink-faint">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {perfil.id === user?.id ? (
                        <span className="text-xs text-ink-faint">você</span>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <form action={alternarAdmin}>
                            <input type="hidden" name="userId" value={perfil.id} />
                            <input type="hidden" name="novoValor" value={(!perfil.is_admin).toString()} />
                            <button
                              type="submit"
                              className="text-xs text-ink-muted underline decoration-sand-300 underline-offset-4 hover:text-garnet-500"
                            >
                              {perfil.is_admin ? "remover admin" : "tornar admin"}
                            </button>
                          </form>
                          <FormularioComConfirmacao
                            action={alternarBloqueio}
                            mensagemConfirmacao={
                              perfil.is_blocked
                                ? `Desbloquear ${perfil.full_name ?? perfil.email}?`
                                : `Bloquear ${perfil.full_name ?? perfil.email}? A pessoa perde acesso ao conteúdo imediatamente.`
                            }
                          >
                            <input type="hidden" name="userId" value={perfil.id} />
                            <input type="hidden" name="novoValor" value={(!perfil.is_blocked).toString()} />
                            <button
                              type="submit"
                              className="text-xs text-wrong underline decoration-garnet-100 underline-offset-4 hover:text-garnet-600"
                            >
                              {perfil.is_blocked ? "desbloquear" : "bloquear"}
                            </button>
                          </FormularioComConfirmacao>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CartaoMetrica({ rotulo, valor }: { rotulo: string; valor: number | string }) {
  return (
    <div className="rounded-lg border border-sand-300 bg-paper-raised p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{rotulo}</p>
      <p className="mt-1 font-serif text-3xl italic text-ink">{valor}</p>
    </div>
  );
}
