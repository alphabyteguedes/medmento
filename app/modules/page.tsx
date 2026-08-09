import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StreakBadge from "@/components/StreakBadge";
import XPBar from "@/components/XPBar";
import BotaoLogout from "@/components/BotaoLogout";

export default async function PaginaModulos() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: modulos }, { data: perfil }] = await Promise.all([
    supabase.from("modules").select("*").order("title"),
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <header className="flex items-center gap-3">
        <StreakBadge dias={perfil?.streak_days ?? 0} />
        <div className="flex-1">
          <XPBar xp={perfil?.xp ?? 0} />
        </div>
        <BotaoLogout />
      </header>

      <h1 className="text-2xl font-bold text-slate-900">Módulos</h1>

      {modulos && modulos.length > 0 ? (
        <ul className="space-y-3">
          {modulos.map((modulo) => (
            <li key={modulo.id}>
              <Link
                href={`/modules/${modulo.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 font-medium text-slate-700 shadow-sm transition-colors hover:border-brand-400"
              >
                {modulo.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">Nenhum módulo cadastrado ainda.</p>
      )}

      {perfil?.is_admin && (
        <Link href="/admin/import" className="block text-center text-sm text-brand-500 hover:underline">
          Área do administrador
        </Link>
      )}
    </div>
  );
}
