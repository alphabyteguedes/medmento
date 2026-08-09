import { createClient } from "@/lib/supabase/server";
import { alternarAdmin } from "./actions";

const DIAS_JANELA_ATIVO = 7;

export default async function PainelAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: perfis }, { count: totalModulos }, { count: totalFlashcards }] = await Promise.all([
    supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("modules").select("*", { count: "exact", head: true }),
    supabase.from("flashcards").select("*", { count: "exact", head: true }),
  ]);

  const listaPerfis = perfis ?? [];
  const totalUsuarios = listaPerfis.length;

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
        <CartaoMetrica rotulo="Módulos" valor={totalModulos ?? 0} />
        <CartaoMetrica rotulo="Flashcards" valor={totalFlashcards ?? 0} />
        <CartaoMetrica rotulo="XP distribuído" valor={xpTotal} />
        <CartaoMetrica rotulo="Streak médio" valor={streakMedio} />
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
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">XP</th>
                  <th className="px-4 py-3 font-medium">Streak</th>
                  <th className="px-4 py-3 font-medium">Último estudo</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {listaPerfis.map((perfil) => (
                  <tr key={perfil.id} className="border-b border-sand-100 last:border-0">
                    <td className="px-4 py-3 text-ink">{perfil.email ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{perfil.xp}</td>
                    <td className="px-4 py-3 text-ink-muted">{perfil.streak_days}</td>
                    <td className="px-4 py-3 text-ink-muted">{perfil.last_study_date ?? "nunca"}</td>
                    <td className="px-4 py-3">
                      {perfil.is_admin ? (
                        <span className="rounded-full bg-garnet-50 px-2 py-0.5 text-xs font-medium text-garnet-500">
                          admin
                        </span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {perfil.id === user?.id ? (
                        <span className="text-xs text-ink-faint">você</span>
                      ) : (
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
