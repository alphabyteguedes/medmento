import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Portão único para toda a área /admin/*: checa autenticação + is_admin no
// servidor antes de renderizar qualquer página filha, então as páginas em
// app/admin/**/page.tsx não precisam repetir essa verificação.
export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single();
  if (!perfil?.is_admin) redirect("/modules");

  return (
    <div className="min-h-screen">
      <header className="border-b border-sand-200 bg-paper-raised">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4">
          <Link href="/modules" className="text-sm text-ink-faint hover:text-garnet-500">
            ← Módulos
          </Link>
          <nav className="flex gap-5 text-sm font-medium text-ink">
            <Link href="/admin" className="hover:text-garnet-500">
              Painel
            </Link>
            <Link href="/admin/import" className="hover:text-garnet-500">
              Importar
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
