// =============================================================================
// PASSO 2 — Parser do formato "texto bruto" para o formato de flashcards.
//
// Formato esperado (repetido N vezes no texto colado):
//
//   FLASHCARD 1
//   FRENTE
//   1. Texto da pergunta
//   A) Alternativa A
//   B) Alternativa B
//   C) Alternativa C
//   D) Alternativa D
//   E) Alternativa E   (opcional)
//   VERSO
//   Resposta: B — Texto da resposta correta
//   Explicação:
//   Texto da explicação, pode ter várias linhas e bullets.
//   Macete: Texto do macete   (ou "Pegadinha:")
//
// O parser é tolerante a falhas: se um bloco individual estiver malformado,
// ele é reportado em `erros` e os demais blocos continuam sendo processados
// normalmente (o import não é interrompido por um único card com problema).
// =============================================================================

export type Letra = "A" | "B" | "C" | "D" | "E";

export interface AlternativasFlashcard {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

/** Um flashcard já extraído do texto bruto, antes de virar linha do banco. */
export interface FlashcardExtraido {
  numeroOriginal: number;
  question: string;
  options: AlternativasFlashcard;
  correct_answer_letter: Letra;
  explanation: string;
  tip: string | null;
}

/** Linha pronta para `insert` na tabela `flashcards` do Supabase. */
export interface FlashcardParaBanco {
  module_id: string;
  question: string;
  options: AlternativasFlashcard;
  correct_answer_letter: Letra;
  explanation: string;
  tip: string | null;
}

export interface ErroDeParse {
  numeroOriginal: number | null;
  motivo: string;
  /** Trecho do texto bruto que causou o erro, para o usuário localizar e corrigir. */
  trecho: string;
}

export interface ResultadoParse {
  flashcards: FlashcardExtraido[];
  erros: ErroDeParse[];
}

// ---- Regex principais -------------------------------------------------------

// Divide o texto em blocos, um por ocorrência de "FLASHCARD [numero]".
const REGEX_BLOCO_FLASHCARD = /FLASHCARD\s+(\d+)\s*\n([\s\S]*?)(?=\nFLASHCARD\s+\d+|$)/g;

// Separa cada bloco em conteúdo da FRENTE e do VERSO.
const REGEX_FRENTE_VERSO = /FRENTE\s*\n([\s\S]*?)\nVERSO\s*\n([\s\S]*)/;

// Captura o texto da pergunta (tudo entre "N." e a linha "A)").
const REGEX_PERGUNTA = /^\s*\d+\.\s*([\s\S]*?)\n\s*A\)/;

// Captura cada alternativa "A) texto" até "E) texto".
const REGEX_ALTERNATIVA = /^([A-E])\)\s*(.+)$/gm;

// Captura a letra da resposta correta em "Resposta: B — texto...".
const REGEX_RESPOSTA = /Resposta:\s*([A-E])\b/i;

// Captura o texto de "Explicação:" até encontrar "Macete:" ou "Pegadinha:".
const REGEX_EXPLICACAO = /Explica[cç][aã]o:\s*\n([\s\S]*?)(?=\n\s*(?:Macete|Pegadinha):)/i;

// Captura o texto após "Macete:" ou "Pegadinha:" até o fim do bloco.
const REGEX_MACETE = /(?:Macete|Pegadinha):\s*([\s\S]*)$/i;

/**
 * Recebe o texto bruto colado pelo curador e retorna os flashcards extraídos
 * mais a lista de erros encontrados (blocos que não seguiram o padrão).
 */
export function parseFlashcardsBrutos(textoBruto: string): ResultadoParse {
  const flashcards: FlashcardExtraido[] = [];
  const erros: ErroDeParse[] = [];

  const texto = textoBruto.replace(/\r\n/g, "\n").trim();

  if (!texto) {
    return { flashcards, erros: [{ numeroOriginal: null, motivo: "O texto colado está vazio.", trecho: "" }] };
  }

  const blocos = [...texto.matchAll(REGEX_BLOCO_FLASHCARD)];

  if (blocos.length === 0) {
    erros.push({
      numeroOriginal: null,
      motivo: 'Nenhum bloco "FLASHCARD [numero]" foi encontrado. Confira se o texto colado segue o padrão esperado.',
      trecho: texto.slice(0, 200),
    });
    return { flashcards, erros };
  }

  for (const bloco of blocos) {
    const numeroOriginal = Number(bloco[1]);
    const corpo = bloco[2].trim();

    try {
      flashcards.push(parseUmBloco(corpo, numeroOriginal));
    } catch (erro) {
      erros.push({
        numeroOriginal,
        motivo: erro instanceof Error ? erro.message : "Erro desconhecido ao processar o bloco.",
        trecho: corpo.slice(0, 200),
      });
    }
  }

  return { flashcards, erros };
}

function parseUmBloco(corpo: string, numeroOriginal: number): FlashcardExtraido {
  const frenteVerso = corpo.match(REGEX_FRENTE_VERSO);
  if (!frenteVerso) {
    throw new Error('Seções "FRENTE" e "VERSO" não foram localizadas neste bloco.');
  }
  const frenteTexto = frenteVerso[1].trim();
  const versoTexto = frenteVerso[2].trim();

  // ---- FRENTE: pergunta + alternativas ----
  const perguntaMatch = frenteTexto.match(REGEX_PERGUNTA);
  if (!perguntaMatch) {
    throw new Error('Pergunta não encontrada (esperado o formato "N. Texto da pergunta" seguido de "A) ...").');
  }
  const question = perguntaMatch[1].trim();

  const options: Partial<AlternativasFlashcard> = {};
  for (const alternativa of frenteTexto.matchAll(REGEX_ALTERNATIVA)) {
    const letra = alternativa[1] as Letra;
    options[letra] = alternativa[2].trim();
  }
  if (!options.A || !options.B || !options.C || !options.D) {
    throw new Error("Alternativas incompletas — as opções A, B, C e D são obrigatórias.");
  }

  // ---- VERSO: resposta, explicação e macete ----
  const respostaMatch = versoTexto.match(REGEX_RESPOSTA);
  if (!respostaMatch) {
    throw new Error('Linha "Resposta: [Letra] — ..." não encontrada.');
  }
  const correct_answer_letter = respostaMatch[1].toUpperCase() as Letra;
  if (!options[correct_answer_letter]) {
    throw new Error(`A letra de resposta ("${correct_answer_letter}") não corresponde a nenhuma alternativa listada na FRENTE.`);
  }

  const explicacaoMatch = versoTexto.match(REGEX_EXPLICACAO);
  if (!explicacaoMatch) {
    throw new Error('Seção "Explicação:" não encontrada (ela deve vir antes de "Macete:" ou "Pegadinha:").');
  }
  const explanation = explicacaoMatch[1].trim();

  const maceteMatch = versoTexto.match(REGEX_MACETE);
  const tip = maceteMatch ? maceteMatch[1].trim() : null;

  return {
    numeroOriginal,
    question,
    options: options as AlternativasFlashcard,
    correct_answer_letter,
    explanation,
    tip: tip || null,
  };
}

/**
 * Converte os flashcards extraídos em linhas prontas para `insert` na tabela
 * `flashcards`, associando-os ao módulo escolhido pelo curador.
 */
export function paraLinhasDoBanco(flashcards: FlashcardExtraido[], moduleId: string): FlashcardParaBanco[] {
  return flashcards.map(({ numeroOriginal: _numeroOriginal, ...resto }) => ({
    ...resto,
    module_id: moduleId,
  }));
}
