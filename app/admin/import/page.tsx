"use client";

// =============================================================================
// PASSO 3 — Página de importação (/admin/import)
//
// Fluxo: o curador cola o texto bruto -> clica em "Analisar" (roda o parser
// localmente, sem tocar o banco, para revisão) -> escolhe o módulo de destino
// -> clica em "Salvar" (grava os flashcards no Supabase).
// =============================================================================

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modulo } from "@/lib/types";
import {
  parseFlashcardsBrutos,
  paraLinhasDoBanco,
  FlashcardExtraido,
  ErroDeParse,
} from "@/utils/parser";

const NOVO_MODULO_VALOR = "__novo__";

type StatusAcesso = "verificando" | "autorizado" | "negado";

export default function PaginaImportacao() {
  const supabase = createClient();

  const [statusAcesso, setStatusAcesso] = useState<StatusAcesso>("verificando");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloSelecionado, setModuloSelecionado] = useState<string>("");
  const [tituloNovoModulo, setTituloNovoModulo] = useState("");

  const [textoBruto, setTextoBruto] = useState("");
  const [flashcardsPreview, setFlashcardsPreview] = useState<FlashcardExtraido[]>([]);
  const [errosPreview, setErrosPreview] = useState<ErroDeParse[]>([]);
  const [analisado, setAnalisado] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Verifica se o usuário logado é admin e carrega os módulos existentes.
  useEffect(() => {
    async function inicializar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatusAcesso("negado");
        return;
      }

      const { data: perfil } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!perfil?.is_admin) {
        setStatusAcesso("negado");
        return;
      }

      setStatusAcesso("autorizado");

      const { data: modulosData } = await supabase
        .from("modules")
        .select("*")
        .order("title", { ascending: true });

      setModulos(modulosData ?? []);
    }

    inicializar();
  }, [supabase]);

  function handleAnalisar() {
    const resultado = parseFlashcardsBrutos(textoBruto);
    setFlashcardsPreview(resultado.flashcards);
    setErrosPreview(resultado.erros);
    setAnalisado(true);
    setMensagem(null);
  }

  async function handleSalvar() {
    setMensagem(null);

    if (flashcardsPreview.length === 0) {
      setMensagem({ tipo: "erro", texto: "Nenhum flashcard válido para salvar. Clique em “Analisar texto” primeiro." });
      return;
    }

    const criandoNovoModulo = moduloSelecionado === NOVO_MODULO_VALOR;
    if (criandoNovoModulo && !tituloNovoModulo.trim()) {
      setMensagem({ tipo: "erro", texto: "Informe o título do novo módulo." });
      return;
    }
    if (!moduloSelecionado) {
      setMensagem({ tipo: "erro", texto: "Selecione o módulo de destino." });
      return;
    }

    setSalvando(true);
    try {
      let moduleId = moduloSelecionado;

      if (criandoNovoModulo) {
        const { data: novoModulo, error: erroModulo } = await supabase
          .from("modules")
          .insert({ title: tituloNovoModulo.trim() })
          .select()
          .single();

        if (erroModulo) throw erroModulo;
        moduleId = novoModulo.id;
        setModulos((atual) => [...atual, novoModulo].sort((a, b) => a.title.localeCompare(b.title)));
      }

      const linhas = paraLinhasDoBanco(flashcardsPreview, moduleId);
      const { error: erroFlashcards } = await supabase.from("flashcards").insert(linhas);
      if (erroFlashcards) throw erroFlashcards;

      setMensagem({ tipo: "sucesso", texto: `${linhas.length} flashcard(s) importado(s) com sucesso!` });
      setTextoBruto("");
      setFlashcardsPreview([]);
      setErrosPreview([]);
      setAnalisado(false);
      setModuloSelecionado(moduleId);
      setTituloNovoModulo("");
    } catch (erro) {
      const texto = erro instanceof Error ? erro.message : "Erro desconhecido ao salvar no banco.";
      setMensagem({ tipo: "erro", texto });
    } finally {
      setSalvando(false);
    }
  }

  if (statusAcesso === "verificando") {
    return <div className="p-8 text-center text-slate-500">Verificando acesso...</div>;
  }

  if (statusAcesso === "negado") {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-800">Acesso restrito</h1>
        <p className="mt-2 text-slate-500">
          Esta área é exclusiva para administradores. Faça login com uma conta autorizada.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Importar flashcards</h1>
        <p className="text-slate-500">Cole o texto bruto no padrão FLASHCARD / FRENTE / VERSO abaixo.</p>
      </header>

      <textarea
        value={textoBruto}
        onChange={(e) => {
          setTextoBruto(e.target.value);
          setAnalisado(false);
        }}
        placeholder={"FLASHCARD 1\nFRENTE\n1. Texto da pergunta\nA) ...\nB) ...\nVERSO\nResposta: A — ...\nExplicação:\n...\nMacete: ..."}
        rows={16}
        className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <button
        onClick={handleAnalisar}
        disabled={!textoBruto.trim()}
        className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Analisar texto
      </button>

      {analisado && (
        <section className="space-y-4 rounded-lg border border-slate-200 p-4">
          <p className="font-medium text-slate-700">
            {flashcardsPreview.length} flashcard(s) reconhecido(s)
            {errosPreview.length > 0 && `, ${errosPreview.length} com erro`}.
          </p>

          {errosPreview.length > 0 && (
            <ul className="space-y-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {errosPreview.map((erro, i) => (
                <li key={i}>
                  <strong>{erro.numeroOriginal ? `FLASHCARD ${erro.numeroOriginal}` : "Texto"}:</strong> {erro.motivo}
                </li>
              ))}
            </ul>
          )}

          {flashcardsPreview.length > 0 && (
            <ol className="max-h-80 space-y-3 overflow-y-auto text-sm">
              {flashcardsPreview.map((card) => (
                <li key={card.numeroOriginal} className="rounded-md bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">
                    {card.numeroOriginal}. {card.question}
                  </p>
                  <p className="mt-1 text-correct">
                    Resposta: {card.correct_answer_letter} — {card.options[card.correct_answer_letter]}
                  </p>
                </li>
              ))}
            </ol>
          )}

          {flashcardsPreview.length > 0 && (
            <div className="flex flex-wrap items-end gap-3 border-t border-slate-200 pt-4">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-sm font-medium text-slate-700">Módulo de destino</label>
                <select
                  value={moduloSelecionado}
                  onChange={(e) => setModuloSelecionado(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="">Selecione...</option>
                  {modulos.map((modulo) => (
                    <option key={modulo.id} value={modulo.id}>
                      {modulo.title}
                    </option>
                  ))}
                  <option value={NOVO_MODULO_VALOR}>+ Criar novo módulo</option>
                </select>
              </div>

              {moduloSelecionado === NOVO_MODULO_VALOR && (
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Título do novo módulo</label>
                  <input
                    value={tituloNovoModulo}
                    onChange={(e) => setTituloNovoModulo(e.target.value)}
                    placeholder="Ex: Processos Metabólicos"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              )}

              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {salvando ? "Salvando..." : "Salvar no banco"}
              </button>
            </div>
          )}
        </section>
      )}

      {mensagem && (
        <p className={mensagem.tipo === "sucesso" ? "text-correct" : "text-wrong"}>{mensagem.texto}</p>
      )}
    </div>
  );
}
