import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// A lógica fica toda neste arquivo (sem importar módulos locais) porque o
// bundler de Edge Middleware da Vercel não resolve imports de arquivos do
// projeto aqui — só pacotes de node_modules.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Renova o token de sessão a cada requisição; sem isso, sessões de login
  // via Google podem expirar silenciosamente em Server Components.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const rotaLivre = pathname === "/bloqueado" || pathname === "/login" || pathname.startsWith("/auth/");

  if (user && !rotaLivre) {
    const { data: perfil } = await supabase.from("user_profiles").select("is_blocked").eq("id", user.id).single();
    if (perfil?.is_blocked) {
      return NextResponse.redirect(new URL("/bloqueado", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|apple-touch-icon.png|sw.js|workbox-).*)",
  ],
};
