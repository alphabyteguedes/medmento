"use client";

// =============================================================================
// Componente compartilhado de importação de flashcards — usado tanto em
// /admin/import (módulos oficiais, curados pelo admin) quanto em
// /modules/importar (módulos pessoais, qualquer usuário autenticado).
//
// Quem usa este componente decide, via props, QUAIS módulos aparecem no
// seletor e COMO um novo módulo é criado (com created_by null = oficial, ou
// created_by = auth.uid() = pessoal) — a policy de RLS garante no banco que
// cada tipo de usuário só consegue de fato escrever onde tem permissão,
// então este componente não precisa saber se é admin ou usuário comum.
// =============================================================================

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modulo } from "@/lib/types";
import {
  parseFlashcardsBrutos,
  paraLinhasDoBanco,
  FlashcardExtraido,
  ErroDeParse,
} from "@/utils/parser";

const NOVO_MODULO_VALOR = "__novo__";

interface ImportadorFlashcardsProps {
  modulosIniciais: Modulo[];
  /** Cria um novo módulo com o dono correto (null = oficial, uid = pessoal) e devolve a linha criada. */
  criarModulo: (titulo: string) => Promise<Modulo>;
}

export default function ImportadorFlashcards({ modulosIniciais, criarModulo }: ImportadorFlashcardsProps) {
  const supabase = createClient();
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [modulos, setModulos] = useState<Modulo[]>(modulosIniciais);
  const [moduloSelecionado, setModuloSelecionado] = useState<string>("");
  const [tituloNovoModulo, setTituloNovoModulo] = useState("");

  const [textoBruto, setTextoBruto] = useState("");
  const [flashcardsPreview, setFlashcardsPreview] = useState<FlashcardExtraido[]>([]);
  const [errosPreview, setErrosPreview] = useState<ErroDeParse[]>([]);
  const [analisado, setAnalisado] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  function handleAnalisar() {
    const resultado = parseFlashcardsBrutos(textoBruto);
    setFlashcardsPreview(resultado.flashcards);
    setErrosPreview(resultado.erros);
    setAnalisado(true);
    setMensagem(null);
  }

  async function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.name.toLowerCase().endsWith(".txt")) {
      setMensagem({ tipo: "erro", texto: "Envie um arquivo .txt no padrão FLASHCARD/FRENTE/VERSO." });
      e.target.value = "";
      return;
    }

    const conteudo = await arquivo.text();
    setTextoBruto(conteudo);
    setAnalisado(false);
    setMensagem(null);
    e.target.value = ""; // permite selecionar o mesmo arquivo de novo depois
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
        const novoModulo = await criarModulo(tituloNovoModulo.trim());
        moduleId = novoModulo.id;
        setModulos((atual) => [...atual, novoModulo].sort((a, b) => a.title.localeCompare(b.title)));
      }

      // upsert + ignoreDuplicates: se a mesma pergunta já existe nesse módulo
      // (constraint única em module_id+question), a linha é ignorada em vez
      // de duplicada — e o .select() só retorna as que realmente entraram,
      // então dá pra contar quantas eram novas de fato.
      const linhas = paraLinhasDoBanco(flashcardsPreview, moduleId);
      const { data: inseridos, error: erroFlashcards } = await supabase
        .from("flashcards")
        .upsert(linhas, { onConflict: "module_id,question", ignoreDuplicates: true })
        .select("id");
      if (erroFlashcards) throw erroFlashcards;

      const totalNovos = inseridos?.length ?? 0;
      const totalDuplicados = linhas.length - totalNovos;
      setMensagem({
        tipo: "sucesso",
        texto:
          totalDuplicados > 0
            ? `${totalNovos} flashcard(s) novo(s) importado(s). ${totalDuplicados} já existiam nesse módulo e foram ignorados.`
            : `${totalNovos} flashcard(s) importado(s) com sucesso!`,
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputArquivoRef.current?.click()}
          className="rounded-lg border border-sand-300 bg-paper-raised px-3 py-1.5 text-sm font-medium text-ink hover:border-garnet-400"
        >
          Subir arquivo .txt
        </button>
        <input ref={inputArquivoRef} type="file" accept=".txt" onChange={handleArquivoSelecionado} className="hidden" />
      </div>

      <textarea
        value={textoBruto}
        onChange={(e) => {
          setTextoBruto(e.target.value);
          setAnalisado(false);
        }}
        placeholder={"FLASHCARD 1\nFRENTE\n1. Texto da pergunta\nA) ...\nB) ...\nVERSO\nResposta: A — ...\nExplicação:\n...\nMacete: ..."}
        rows={16}
        className="w-full rounded-lg border border-sand-300 bg-paper-raised p-4 font-mono text-sm text-ink shadow-sm focus:border-garnet-400 focus:outline-none focus:ring-1 focus:ring-garnet-400"
      />

      <button
        onClick={handleAnalisar}
        disabled={!textoBruto.trim()}
        className="rounded-lg bg-ink px-4 py-2 font-medium text-paper-raised hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Analisar texto
      </button>

      {analisado && (
        <section className="space-y-4 rounded-lg border border-sand-300 bg-paper-raised p-4">
          <p className="font-medium text-ink">
            {flashcardsPreview.length} flashcard(s) reconhecido(s)
            {errosPreview.length > 0 && `, ${errosPreview.length} com erro`}.
          </p>

          {errosPreview.length > 0 && (
            <ul className="space-y-2 rounded-md bg-garnet-50 p-3 text-sm text-wrong">
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
                <li key={card.numeroOriginal} className="rounded-md bg-sand-100 p-3">
                  <p className="font-medium text-ink">
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
            <div className="flex flex-wrap items-end gap-3 border-t border-sand-200 pt-4">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-sm font-medium text-ink">Módulo de destino</label>
                <select
                  value={moduloSelecionado}
                  onChange={(e) => setModuloSelecionado(e.target.value)}
                  className="w-full rounded-lg border border-sand-300 bg-paper-raised p-2 text-ink"
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
                  <label className="mb-1 block text-sm font-medium text-ink">Título do novo módulo</label>
                  <input
                    value={tituloNovoModulo}
                    onChange={(e) => setTituloNovoModulo(e.target.value)}
                    placeholder="Ex: Processos Metabólicos"
                    className="w-full rounded-lg border border-sand-300 bg-paper-raised p-2 text-ink"
                  />
                </div>
              )}

              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="rounded-lg bg-garnet-500 px-4 py-2 font-medium text-paper-raised hover:bg-garnet-600 disabled:cursor-not-allowed disabled:opacity-40"
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
