"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotaoLogout() {
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={sair} className="text-sm text-ink-faint hover:text-garnet-500">
      Sair
    </button>
  );
}
