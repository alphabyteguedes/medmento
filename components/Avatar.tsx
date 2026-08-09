// Avatar do usuário: foto do Google quando disponível, senão um círculo com
// a inicial do nome (ou do e-mail) no estilo do resto do app.
interface AvatarProps {
  nome: string | null;
  avatarUrl: string | null;
  tamanho?: "sm" | "md";
}

export default function Avatar({ nome, avatarUrl, tamanho = "md" }: AvatarProps) {
  const classeTamanho = tamanho === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  const inicial = (nome ?? "?").trim().charAt(0).toUpperCase();

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- avatar externo (Google), não vale configurar next/image só pra isso
    return (
      <img
        src={avatarUrl}
        alt={nome ?? "Usuário"}
        className={`${classeTamanho} shrink-0 rounded-full border border-sand-300 object-cover`}
      />
    );
  }

  return (
    <span
      className={`${classeTamanho} flex shrink-0 items-center justify-center rounded-full border border-sand-300 bg-garnet-50 font-serif italic text-garnet-500`}
    >
      {inicial}
    </span>
  );
}
