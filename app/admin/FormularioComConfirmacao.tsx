"use client";

// Server Actions não têm como abrir um confirm() do navegador sozinhas —
// este wrapper client-side intercepta o submit pra perguntar antes de agir.
export default function FormularioComConfirmacao({
  action,
  mensagemConfirmacao,
  children,
}: {
  action: (formData: FormData) => void;
  mensagemConfirmacao: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(mensagemConfirmacao)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
