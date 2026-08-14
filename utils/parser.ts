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
//   Macete: Texto do macete   (ou "Pegadinha:", e é opcional)
//
// O parser é DELIBERADAMENTE tolerante a variações comuns de quem cola o
// texto à mão: emoji/símbolos antes de "FLASHCARD"/"Macete"/"Pegadinha"
// ("🟦 FLASHCARD 2", "⚠️ Pegadinha:"), "flashcard" em minúsculo, cabeçalhos
// como "FRENTE — Pergunta" / "VERSO — Resposta", blocos numerados como
// "1. FRENTE" (sem a palavra "FLASHCARD"), pergunta sem o número na frente,
// "Resposta:" ou "Resposta correta:", explicação com ou sem o rótulo
// "Explicação:", e blocos sem seção de macete.
//
// É tolerante a falhas por bloco: se um bloco individual estiver malformado,
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

// Encontra o início de cada bloco. Dois formatos de cabeçalho são aceitos:
// "FLASHCARD 1" (com até 8 caracteres de "lixo" antes — emoji, símbolos —
// que ficam grudados no início do bloco seguinte, sem sobrar sujeira no
// anterior) e "1. FRENTE" (número + ponto direto na linha do "FRENTE",
// sem a palavra "FLASHCARD" em lugar nenhum).
const REGEX_CABECALHO_BLOCO = /[^\n]{0,8}FLASHCARD\s+\d+|^[ \t]*\d+\.\s*FRENTE\b/gim;

// Extrai o número de um bloco já identificado, no formato que ele usar.
const REGEX_NUMERO_BLOCO = /FLASHCARD\s+(\d+)|^[ \t]*(\d+)\.\s*FRENTE\b/im;

// Separa cada bloco em conteúdo da FRENTE e do VERSO. Tolera texto extra na
// mesma linha do cabeçalho ("FRENTE — Pergunta", "VERSO — Resposta").
const REGEX_FRENTE_VERSO = /FRENTE[^\n]*\n([\s\S]*?)\n\s*VERSO[^\n]*\n([\s\S]*)/i;

// Captura o texto da pergunta até a linha "A)". O número antes do ponto é opcional.
const REGEX_PERGUNTA = /^\s*(?:\d+[.)]\s*)?([\s\S]*?)\n\s*A\)/;

// Captura cada alternativa "A) texto" até "E) texto".
const REGEX_ALTERNATIVA = /^([A-E])\)\s*(.+)$/gm;

// Captura a letra da resposta correta em "Resposta: B — texto..." ou
// "Resposta correta: B) texto..." (variação também usada por alguns curadores).
const REGEX_RESPOSTA = /Resposta(?:\s+correta)?:\s*([A-E])\b/i;

// Localiza o início da seção de explicação (não captura o resto: isso é feito
// separadamente, para permitir que a seção de macete seja opcional).
const REGEX_INICIO_EXPLICACAO = /Explica[cç][aã]o:\s*\n?/i;

// Localiza o início da seção de macete/pegadinha, onde quer que apareça (não
// exige estar "sozinho" na linha, então o emoji antes dela não atrapalha).
// Tolera uma palavra extra entre o rótulo e os dois-pontos ("Pegadinha
// clássica:", "Macete rápido:").
const REGEX_INICIO_MACETE = /(?:Macete|Pegadinha)(?:\s+\p{L}+)?\s*:\s*/iu;

// Símbolos/emoji soltos (setas, dingbats, emoji, seletor de variação) que
// sobram no fim da explicação quando o macete é anunciado por algo como
// "⚠️ Pegadinha:" — o emoji não faz parte do rótulo que REGEX_INICIO_MACETE
// procura, então precisa ser limpo à parte.
const REGEX_SIMBOLOS_FINAIS = /[\s←-⯿\u{1f300}-\u{1faff}️]+$/u;

/**
 * Divide o texto bruto em blocos, um por ocorrência de "FLASHCARD [numero]".
 */
function dividirEmBlocos(texto: string): string[] {
  const posicoes = [...texto.matchAll(REGEX_CABECALHO_BLOCO)].map((m) => m.index ?? 0);
  if (posicoes.length === 0) return [];

  return posicoes.map((inicio, i) => {
    const fim = i + 1 < posicoes.length ? posicoes[i + 1] : texto.length;
    return texto.slice(inicio, fim).trim();
  });
}

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

  const blocos = dividirEmBlocos(texto);

  if (blocos.length === 0) {
    erros.push({
      numeroOriginal: null,
      motivo: 'Nenhum bloco "FLASHCARD [numero]" foi encontrado. Confira se o texto colado segue o padrão esperado.',
      trecho: texto.slice(0, 200),
    });
    return { flashcards, erros };
  }

  blocos.forEach((bloco, indice) => {
    const numeroMatch = bloco.match(REGEX_NUMERO_BLOCO);
    const numeroOriginal = numeroMatch ? Number(numeroMatch[1] ?? numeroMatch[2]) : indice + 1;

    try {
      flashcards.push(parseUmBloco(bloco, numeroOriginal));
    } catch (erro) {
      erros.push({
        numeroOriginal,
        motivo: erro instanceof Error ? erro.message : "Erro desconhecido ao processar o bloco.",
        trecho: bloco.slice(0, 200),
      });
    }
  });

  return { flashcards, erros };
}

function parseUmBloco(bloco: string, numeroOriginal: number): FlashcardExtraido {
  const frenteVerso = bloco.match(REGEX_FRENTE_VERSO);
  if (!frenteVerso) {
    throw new Error('Seções "FRENTE" e "VERSO" não foram localizadas neste bloco.');
  }
  const frenteTexto = frenteVerso[1].trim();
  const versoTexto = frenteVerso[2].trim();

  // ---- FRENTE: pergunta + alternativas ----
  const perguntaMatch = frenteTexto.match(REGEX_PERGUNTA);
  if (!perguntaMatch) {
    throw new Error('Pergunta não encontrada (texto deve vir antes da linha "A) ...").');
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

  // ---- VERSO: resposta ----
  const respostaMatch = versoTexto.match(REGEX_RESPOSTA);
  if (!respostaMatch) {
    throw new Error('Linha "Resposta: [Letra] — ..." não encontrada.');
  }
  const correct_answer_letter = respostaMatch[1].toUpperCase() as Letra;
  if (!options[correct_answer_letter]) {
    throw new Error(`A letra de resposta ("${correct_answer_letter}") não corresponde a nenhuma alternativa listada na FRENTE.`);
  }

  // ---- VERSO: explicação + macete (rótulo "Explicação:" e macete são opcionais) ----
  const fimLinhaResposta = versoTexto.indexOf("\n", respostaMatch.index ?? 0);
  const indiceAposResposta = fimLinhaResposta === -1 ? versoTexto.length : fimLinhaResposta + 1;
  const { explanation, tip } = extrairExplicacaoETip(versoTexto, indiceAposResposta);

  return {
    numeroOriginal,
    question,
    options: options as AlternativasFlashcard,
    correct_answer_letter,
    explanation,
    tip,
  };
}

/**
 * @param indiceAposResposta Posição logo após a linha "Resposta: ..." — usada
 * como início da explicação quando não existe o rótulo "Explicação:" (alguns
 * curadores vão direto da resposta para o texto explicativo).
 */
function extrairExplicacaoETip(
  versoTexto: string,
  indiceAposResposta: number
): { explanation: string; tip: string | null } {
  const inicioExplicacao = versoTexto.match(REGEX_INICIO_EXPLICACAO);
  const inicioConteudo =
    inicioExplicacao && inicioExplicacao.index !== undefined
      ? inicioExplicacao.index + inicioExplicacao[0].length
      : indiceAposResposta;

  const restante = versoTexto.slice(inicioConteudo);

  const inicioMacete = restante.match(REGEX_INICIO_MACETE);
  if (!inicioMacete || inicioMacete.index === undefined) {
    // Nem toda ficha tem macete/pegadinha — tudo que sobrou é a explicação.
    return { explanation: restante.trim(), tip: null };
  }

  // Remove símbolos/emoji soltos que ficam grudados no fim da explicação
  // quando o macete é anunciado por algo como "⚠️ Pegadinha:" (o emoji não
  // faz parte do rótulo que REGEX_INICIO_MACETE procura, então sobra aqui).
  const explanation = restante.slice(0, inicioMacete.index).replace(REGEX_SIMBOLOS_FINAIS, "").trim();
  const tip = restante.slice(inicioMacete.index + inicioMacete[0].length).trim();
  return { explanation, tip: tip || null };
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
