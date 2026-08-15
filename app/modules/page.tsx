import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StreakBadge from "@/components/StreakBadge";
import XPBar from "@/components/XPBar";
import BotaoLogout from "@/components/BotaoLogout";
import Avatar from "@/components/Avatar";

export default async function PaginaModulos() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: modulos }, { data: perfil }, { count: totalFlashcards }] = await Promise.all([
    supabase.from("modules").select("*").order("title"),
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("flashcards").select("*", { count: "exact", head: true }),
  ]);

  const primeiroNome = (perfil?.full_name ?? perfil?.email ?? "").split(" ")[0] || null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-sand-200 bg-paper-raised">
        <div className="mx-auto flex max-w-xl flex-col gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar nome={perfil?.full_name ?? perfil?.email ?? null} avatarUrl={perfil?.avatar_url ?? null} />
            <p className="flex-1 truncate text-sm text-ink">
              {primeiroNome ? <>Olá, <span className="font-medium">{primeiroNome}</span></> : "Olá"}
            </p>
            <BotaoLogout />
          </div>
          <div className="flex items-center gap-3">
            <StreakBadge dias={perfil?.streak_days ?? 0} />
            <div className="flex-1">
              <XPBar xp={perfil?.xp ?? 0} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-6 p-6">
        {!!totalFlashcards && (
          <Link
            href="/modules/aleatorio"
            className="group flex items-center gap-4 rounded-lg bg-garnet-500 p-4 text-paper-raised shadow-[0_4px_14px_-6px_rgba(140,47,53,0.5)] transition-colors hover:bg-garnet-600"
          >
            <span className="text-2xl">🔀</span>
            <div className="flex-1">
              <p className="font-serif text-lg italic">Revisão aleatória</p>
              <p className="text-sm text-paper-raised/80">Mistura os {totalFlashcards} flashcards de todos os assuntos</p>
            </div>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        )}

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Seus módulos</p>
          <h1 className="font-serif text-3xl italic text-ink">Escolha um assunto</h1>
        </div>

        {modulos && modulos.length > 0 ? (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-lg border border-sand-200 bg-paper-raised">
            {modulos.map((modulo, indice) => (
              <li key={modulo.id}>
                <Link
                  href={`/modules/${modulo.id}`}
                  className="group flex items-center gap-4 p-4 transition-colors hover:bg-garnet-50"
                >
                  <span className="font-serif text-lg italic text-ink-faint group-hover:text-garnet-500">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium text-ink">
                    {modulo.title}
                    {modulo.created_by === user.id && (
                      <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-normal text-ink-muted">
                        pessoal
                      </span>
                    )}
                  </span>
                  <span className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-garnet-500">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-sand-300 p-6 text-center text-ink-muted">
            Nenhum módulo cadastrado ainda.
          </p>
        )}

        <Link
          href="/modules/importar"
          className="block text-center text-sm text-ink-muted underline decoration-sand-300 underline-offset-4 hover:text-garnet-500"
        >
          Importar minhas questões
        </Link>

        {perfil?.is_admin && (
          <Link
            href="/admin"
            className="block text-center text-sm text-ink-muted underline decoration-sand-300 underline-offset-4 hover:text-garnet-500"
          >
            Área do administrador
          </Link>
        )}
      </main>
    </div>
  );
}
