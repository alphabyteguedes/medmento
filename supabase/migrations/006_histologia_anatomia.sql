-- =============================================================================
-- MEDMENTO — Import direto: Histologia (20) + Anatomia (20)
-- Rode no SQL Editor do Supabase. Seguro rodar mais de uma vez (ON CONFLICT
-- DO NOTHING) — não duplica se já tiver sido importado antes.
-- =============================================================================

insert into public.modules (title)
select 'Histologia'
where not exists (select 1 from public.modules where title = 'Histologia');

insert into public.modules (title)
select 'Anatomia'
where not exists (select 1 from public.modules where title = 'Anatomia');

do $$
declare
  modulo_histologia uuid;
  modulo_anatomia uuid;
begin
  select id into modulo_histologia from public.modules where title = 'Histologia' limit 1;
  select id into modulo_anatomia from public.modules where title = 'Anatomia' limit 1;

  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um epitélio apresenta uma única camada de células, todas em contato com a membrana basal, mas algumas células não alcançam a superfície livre. Esse tecido é classificado como:',
    '{"A":"Epitélio estratificado pavimentoso.","B":"Epitélio simples prismático.","C":"Epitélio pseudoestratificado.","D":"Epitélio estratificado cúbico.","E":"Epitélio de transição."}'::jsonb,
    'C',
    'Ele parece ter várias camadas, mas possui apenas uma camada verdadeira.
  
  O principal detalhe é:
  
  → Todas as células tocam a membrana basal.
  → Nem todas chegam à superfície apical.',
    'pseudo = falso. Parece estratificado, mas não é.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Uma paciente apresenta uma doença que compromete a integridade da barreira entre células epiteliais intestinais. Como consequência, moléculas conseguem passar pelo espaço existente entre células adjacentes com maior facilidade.
  
  Qual estrutura está provavelmente comprometida?',
    '{"A":"Desmossomo.","B":"Hemidesmossomo.","C":"Gap junction.","D":"Tight junction.","E":"Junção de adesão."}'::jsonb,
    'D',
    'A tight junction funciona como uma vedação entre células. Ela dificulta a passagem de substâncias pelo espaço entre as células.
  
  Para memorizar:
  
  ● Tight junction → vedação.
  
  ● Gap junction → comunicação.
  
  ● Desmossomo → resistência mecânica.
  
  ● Hemidesmossomo → fixa a célula à membrana basal.
  
  ● Junção de adesão → une células.',
    'Tight = apertado → vedação.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Sobre a polaridade das células epiteliais, assinale a alternativa correta:',
    '{"A":"A face basal está voltada para a luz do órgão.","B":"A face apical está em contato com a membrana basal.","C":"A face lateral estabelece contato com células vizinhas.","D":"A face basal é responsável exclusivamente pela secreção.","E":"A face apical está sempre voltada para o tecido conjuntivo."}'::jsonb,
    'C',
    'A célula epitelial possui três regiões:
  
  ● Apical → voltada para a luz ou superfície externa.
  
  ● Lateral → contato com células vizinhas.
  
  ● Basal → voltada para a membrana basal.',
    'Apical = cima
  Lateral = lado
  Basal = base'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Em relação à membrana basal, assinale a alternativa correta:',
    '{"A":"A lâmina basal é produzida exclusivamente pelos fibroblastos.","B":"A lâmina reticular é produzida exclusivamente pelas células epiteliais.","C":"A lâmina basal está associada ao epitélio, enquanto a lâmina reticular está relacionada ao tecido conjuntivo.","D":"A membrana basal é encontrada apenas em epitélios estratificados.","E":"Sua única função é impedir a passagem de nutrientes para o epitélio."}'::jsonb,
    'C',
    'A membrana basal ajuda a fixar e sustentar o epitélio sobre o tecido conjuntivo.
  
  ● Lâmina basal → relacionada ao epitélio.
  
  ● Lâmina reticular → relacionada ao tecido conjuntivo.',
    'a membrana basal é o “chão” do epitélio.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um paciente apresenta uma doença que reduz significativamente a absorção intestinal de nutrientes. A análise histológica demonstra redução da superfície apical das células do intestino delgado, sem alteração significativa da movimentação do conteúdo intestinal.
  
  Qual especialização está principalmente comprometida?',
    '{"A":"Cílios.","B":"Estereocílios.","C":"Microvilosidades.","D":"Desmossomos.","E":"Hemidesmossomos."}'::jsonb,
    'C',
    'As microvilosidades aumentam muito a superfície disponível para absorção.
  
  São abundantes no intestino delgado.
  
  Não confundir:
  
  ● Microvilosidade → absorção.
  
  ● Cílio → movimentação.
  
  ● Desmossomo → resistência.
  
  ● Hemidesmossomo → fixação à membrana basal.',
    'microvilosidade = aumenta a superfície para absorver.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Uma característica que diferencia o tecido conjuntivo do tecido epitelial é:',
    '{"A":"O tecido conjuntivo apresenta células muito unidas e pouca matriz extracelular.","B":"O tecido conjuntivo apresenta grande quantidade de matriz extracelular.","C":"O tecido conjuntivo é sempre avascular.","D":"O tecido conjuntivo não possui fibras.","E":"O tecido conjuntivo possui exclusivamente função de revestimento."}'::jsonb,
    'B',
    'Essa é uma das principais diferenças entre os dois tecidos.
  
  Epitélio:
  → células muito próximas
  → pouca matriz extracelular
  → avascular.
  
  Conjuntivo:
  → células mais afastadas
  → muita matriz extracelular
  → geralmente vascularizado.',
    'conjuntivo = muita “cola” entre as células.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um pesquisador analisa uma célula com intensa produção de colágeno durante o processo de cicatrização. Qual combinação de célula e organela está mais diretamente relacionada a essa atividade?',
    '{"A":"Mastócito + lisossomo.","B":"Fibroblasto + retículo endoplasmático rugoso.","C":"Adipócito + complexo de Golgi.","D":"Macrófago + retículo endoplasmático liso.","E":"Fibrócito + lisossomo."}'::jsonb,
    'B',
    'O fibroblasto produz colágeno e outros componentes da matriz extracelular.
  
  O colágeno é uma proteína. Para produzir proteínas destinadas à secreção, a célula utiliza bastante:
  
  → Retículo Endoplasmático Rugoso (RER).
  
  Associação:
  
  Fibroblasto → colágeno → proteína → RER.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Após uma infecção bacteriana, células do sistema imune presentes no tecido realizam intensa fagocitose. Uma dessas células engloba bactérias e posteriormente utiliza enzimas intracelulares para degradá-las.
  
  Qual associação está correta?',
    '{"A":"Mastócito → fagocitose → RER.","B":"Plasmócito → fagocitose → lisossomo.","C":"Macrófago → fagocitose → lisossomo.","D":"Fibroblasto → fagocitose → mitocôndria.","E":"Adipócito → fagocitose → complexo de Golgi."}'::jsonb,
    'C',
    'O macrófago engloba partículas e microrganismos por fagocitose.
  
  Depois, os lisossomos participam da digestão desse material usando enzimas.
  
  Sequência:
  
  Macrófago → fagocita → lisossomo → digere.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um paciente apresenta uma resposta alérgica com liberação de histamina. A célula envolvida e o mediador estão corretamente relacionados em:',
    '{"A":"Plasmócito → histamina.","B":"Mastócito → histamina.","C":"Fibroblasto → histamina.","D":"Macrófago → histamina.","E":"Fibrócito → histamina."}'::jsonb,
    'B',
    'O mastócito participa das reações inflamatórias e alérgicas.
  
  Ele libera histamina, que participa dos sinais da reação alérgica.',
    'Mastócito → alergia → histamina.
  
  Já:
  
  Plasmócito → anticorpos.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Assinale a alternativa que apresenta corretamente a sequência de maturação celular:',
    '{"A":"Fibrócito → fibroblasto → produção de matriz.","B":"Condrócito → condroblasto → manutenção da cartilagem.","C":"Osteoblasto → osteócito → manutenção do tecido ósseo.","D":"Osteoclasto → osteoblasto → reabsorção óssea.","E":"Monócito → fibroblasto → macrófago."}'::jsonb,
    'C',
    'O osteoblasto é responsável pela formação de matriz óssea.
  
  Depois de amadurecer e ficar incorporado à matriz, torna-se osteócito.
  
  ● Osteoblasto → forma.
  
  ● Osteócito → mantém.
  
  ● Osteoclasto → reabsorve.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um paciente apresenta aumento da atividade de células responsáveis pela remoção de matriz óssea. Esse processo é importante na remodelação do tecido ósseo.
  
  Qual célula está aumentada?',
    '{"A":"Osteoblasto.","B":"Osteócito.","C":"Osteoclasto.","D":"Condroblasto.","E":"Fibroblasto."}'::jsonb,
    'C',
    'O osteoclasto realiza a reabsorção óssea.
  
  Ele remove tecido ósseo durante processos normais de remodelação.',
    'OsteoCLASTO → “quebra” / reabsorve.
  
  Enquanto:
  
  OsteoBLASTO → constrói.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um tendão apresenta grande resistência às forças de tração devido à abundância de determinada fibra da matriz extracelular.
  
  Essa fibra é:',
    '{"A":"Elástica.","B":"Reticular.","C":"Colágena.","D":"Muscular.","E":"Nervosa."}'::jsonb,
    'C',
    'O tendão precisa resistir a grandes forças de tração.
  
  Por isso é rico em fibras colágenas, principalmente colágeno tipo I.
  
  Não confunda:
  
  ● Colágeno → resistência.
  
  ● Elastina → elasticidade.
  
  ● Reticulares → sustentação delicada.',
    'colágeno = forte.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Considere as seguintes associações:
  
  I. Colágeno → resistência à tração.
  II. Elastina → elasticidade.
  III. Fibras reticulares → rede delicada de sustentação.
  
  Está correto o que se afirma em:',
    '{"A":"Apenas I.","B":"Apenas II.","C":"Apenas I e II.","D":"Apenas II e III.","E":"I, II e III."}'::jsonb,
    'E',
    'Todas estão corretas.
  
  ● Colágeno → resistência.
  
  ● Elastina → elasticidade.
  
  ● Reticulares → sustentação delicada.
  
  Macete definitivo:
  
  COLÁGENO = FORÇA
  ELASTINA = ESTICA
  RETICULAR = REDE',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um atleta sofre uma lesão em um músculo responsável por movimentar voluntariamente o membro superior. Histologicamente, o tecido apresenta sarcômeros organizados e interação entre actina e miosina.
  
  Esse tecido é:',
    '{"A":"Músculo liso.","B":"Músculo cardíaco.","C":"Músculo esquelético.","D":"Tecido conjuntivo denso.","E":"Tecido nervoso."}'::jsonb,
    'C',
    'Existem duas pistas importantes:
  
  1. O movimento é voluntário.
  
  2. Existem sarcômeros organizados.
  
  Isso indica músculo esquelético.
  
  Músculo esquelético:
  → voluntário
  → ligado aos ossos
  → estriado
  → sarcômeros organizados.
  
  Músculo liso:
  → involuntário
  → vísceras
  → não apresenta sarcômeros organizados como os músculos estriados.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Sobre o sarcômero, assinale a alternativa correta:',
    '{"A":"É a principal organela responsável pela produção de ATP.","B":"É a menor unidade contrátil do músculo.","C":"É constituído exclusivamente por miosina.","D":"Está presente somente no músculo liso.","E":"É responsável pela produção da bainha de mielina."}'::jsonb,
    'B',
    'O sarcômero é a unidade responsável pela contração dos músculos estriados.
  
  Dentro dele existem proteínas contráteis, principalmente:
  
  → Actina
  → Miosina
  
  A interação entre elas gera a contração.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um paciente apresenta uma doença que afeta especificamente a produção de mielina no Sistema Nervoso Periférico.
  
  Qual célula da glia está diretamente relacionada ao problema?',
    '{"A":"Oligodendrócito.","B":"Astrócito.","C":"Micróglia.","D":"Célula de Schwann.","E":"Célula ependimária."}'::jsonb,
    'D',
    'A regra mais importante:
  
  SNC → oligodendrócito.
  
  SNP → célula de Schwann.
  
  Como o caso fala em Sistema Nervoso Periférico, a resposta é Schwann.',
    'Schwann = SNP.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Um axônio apresenta regiões de interrupção da bainha de mielina. Essas regiões são importantes para a condução rápida do impulso nervoso.
  
  Essas estruturas são denominadas:',
    '{"A":"Sinapses.","B":"Dendritos.","C":"Nódulos de Ranvier.","D":"Corpos celulares.","E":"Neurotransmissores."}'::jsonb,
    'C',
    'Os nódulos de Ranvier são pequenas regiões do axônio onde a bainha de mielina é interrompida.
  
  O impulso nervoso pode “saltar” de um nódulo para o outro.
  
  Isso é chamado:
  
  → Condução saltatória.
  
  Resultado:
  
  → maior velocidade de condução.',
    'Ranvier = pontos onde o impulso “salta”.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Sobre as células da glia, assinale a alternativa correta:',
    '{"A":"Astrócitos produzem mielina no SNP.","B":"Oligodendrócitos produzem mielina no SNC.","C":"Micróglia produz mielina no SNC.","D":"Células de Schwann produzem mielina exclusivamente no SNC.","E":"Ependimárias realizam principalmente fagocitose."}'::jsonb,
    'B',
    'Memorize:
  
  Oligodendrócito → SNC → mielina
  
  Schwann → SNP → mielina
  
  Outras células:
  
  ● Astrócitos → sustentação e nutrição.
  
  ● Micróglia → defesa e fagocitose.
  
  ● Ependimárias → revestem os ventrículos.
  
  ● Satélites → suporte aos neurônios dos gânglios.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Durante uma aula prática, observa-se uma célula com grande quantidade de retículo endoplasmático rugoso e complexo de Golgi desenvolvido. A célula está especializada na produção e secreção de anticorpos.
  
  Qual é essa célula?',
    '{"A":"Mastócito.","B":"Macrófago.","C":"Plasmócito.","D":"Fibroblasto.","E":"Adipócito."}'::jsonb,
    'C',
    'O plasmócito é especializado na produção de anticorpos.
  
  Como anticorpos são proteínas, ele apresenta muito:
  
  → RER → produção de proteínas.
  
  E o complexo de Golgi participa do processamento e da secreção dessas proteínas.
  
  Não confundir:
  
  Plasmócito → anticorpos
  
  Fibroblasto → colágeno/matriz extracelular
  
  Mastócito → histamina
  
  Macrófago → fagocitose
  
  Adipócito → gordura',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_histologia,
    'Durante uma análise histológica, observa-se:
  
  ● Lâmina I: células muito unidas, pouca matriz extracelular e ausência de vasos no tecido.
  
  ● Lâmina II: abundante matriz extracelular com fibras e células dispersas.
  
  ● Lâmina III: células especializadas em contração contendo actina e miosina.
  
  ● Lâmina IV: células especializadas na recepção e transmissão de impulsos.
  
  A sequência correta dos tecidos é:',
    '{"A":"Conjuntivo → epitelial → muscular → nervoso.","B":"Epitelial → conjuntivo → muscular → nervoso.","C":"Epitelial → muscular → conjuntivo → nervoso.","D":"Nervoso → conjuntivo → epitelial → muscular.","E":"Muscular → epitelial → nervoso → conjuntivo."}'::jsonb,
    'B',
    'Identifique cada tecido pelas características:
  
  Lâmina I
  → células juntas + pouca matriz + avascular
  → Epitelial.
  
  Lâmina II
  → muita matriz + fibras
  → Conjuntivo.
  
  Lâmina III
  → actina + miosina + contração
  → Muscular.
  
  Lâmina IV
  → recebe e transmite impulsos
  → Nervoso.
  
  Portanto:
  
  Epitelial → Conjuntivo → Muscular → Nervoso.',
    null
  )
  on conflict (module_id, question) do nothing;

  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Durante o exame físico, um paciente apresenta dor na região distal do membro superior direito. O médico identifica a dor próxima à articulação radiocárpica. Considerando a posição anatômica, a descrição é compatível com uma região:',
    '{"A":"Proximal ao cotovelo","B":"Proximal ao ombro","C":"Distal ao cotovelo","D":"Medial ao ombro"}'::jsonb,
    'C',
    'No membro superior, usamos o ombro como referência da origem do membro:
  
  Ombro → cotovelo → punho → dedos
  
  Quanto mais distante do ombro, mais distal.
  
  Como a articulação radiocárpica é o punho, ela está distal ao cotovelo.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente apresenta uma fratura na extremidade proximal da tíbia. A localização mais provável da lesão é:',
    '{"A":"Próxima ao tornozelo","B":"Próxima ao joelho","C":"Próxima aos dedos do pé","D":"Próxima à cabeça do fêmur"}'::jsonb,
    'B',
    'A tíbia faz parte do membro inferior.
  
  A sequência é:
  
  Pelve → quadril → joelho → tornozelo → pé → dedos
  
  A extremidade proximal da tíbia fica próxima ao joelho.
  
  A extremidade distal fica próxima ao tornozelo.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Durante uma cirurgia abdominal, o cirurgião descreve determinada estrutura como posterior e profunda em relação à parede abdominal anterior. Isso significa que a estrutura está:',
    '{"A":"Mais próxima da pele e localizada anteriormente","B":"Mais interna e localizada posteriormente","C":"Mais distante da linha média e superficial","D":"Mais próxima da linha média e anterior"}'::jsonb,
    'B',
    'Profundo = mais interno, afastado da superfície.
  
  Posterior = localizado atrás.
  
  Portanto:
  
  Posterior + profundo = atrás + mais internamente.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Na posição anatômica, considere:
  
  I. Rádio
  II. Ulna
  III. Polegar
  IV. Dedo mínimo
  
  Qual alternativa apresenta corretamente as relações?',
    '{"A":"Rádio medial à ulna; polegar medial ao dedo mínimo","B":"Rádio lateral à ulna; polegar lateral ao dedo mínimo","C":"Rádio lateral à ulna; polegar medial ao dedo mínimo","D":"Rádio medial à ulna; polegar lateral ao dedo mínimo"}'::jsonb,
    'B',
    'Na posição anatômica, as palmas estão voltadas para frente.
  
  No antebraço:
  
  Rádio = lateral
  Ulna = medial
  
  Na mão:
  
  Polegar = lateral
  Dedo mínimo = medial
  
  ⚠️ Sempre use a posição anatômica como referência.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente apresenta uma lesão localizada no membro inferior esquerdo e outra no membro superior direito. Em relação ao lado do corpo, essas lesões são:',
    '{"A":"Ipsilaterais","B":"Bilaterais","C":"Contralaterais","D":"Unilaterais"}'::jsonb,
    'C',
    'Contra = contrário/oposto.
  
  Uma lesão está no lado esquerdo e outra no lado direito.
  
  Portanto, estão em lados opostos → contralaterais.
  
  Ipsilateral = mesmo lado.
  
  Contralateral = lado oposto.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Durante uma avaliação neurológica, o médico descreve uma estrutura localizada medial ao pulmão direito e lateral à traqueia. Qual estrutura poderia ocupar essa posição?',
    '{"A":"Coração","B":"Pulmão esquerdo","C":"Esterno","D":"Coluna vertebral"}'::jsonb,
    'B',
    'A questão está comparando estruturas em relação à linha média.
  
  A traqueia está na região mediana.
  
  O pulmão direito está à direita da traqueia e o pulmão esquerdo está à esquerda.
  
  Portanto, uma estrutura que está medial ao pulmão direito e lateral à traqueia é o pulmão esquerdo.
  
  ⚠️ Essa questão é uma pegadinha de orientação espacial: não basta decorar “pulmão = lateral”; é preciso analisar em relação a qual estrutura.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Uma tomografia demonstra uma imagem que divide o corpo em uma porção anterior e outra posterior. O plano anatômico utilizado é:',
    '{"A":"Sagital","B":"Mediano","C":"Frontal","D":"Transversal"}'::jsonb,
    'C',
    'O plano frontal/coronal divide o corpo em:
  
  Anterior + posterior',
    'Sagital → direita/esquerda
  
  Frontal → frente/trás
  
  Transversal → superior/inferior'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente sofreu uma lesão na extremidade distal do rádio. Considerando a posição anatômica, essa região está:',
    '{"A":"Próxima ao ombro","B":"Próxima ao cotovelo","C":"Próxima ao punho","D":"Próxima ao tronco"}'::jsonb,
    'C',
    'O rádio é um osso do antebraço.
  
  Sua extremidade:
  
  Proximal → cotovelo
  
  Distal → punho
  
  Portanto, rádio distal = região próxima ao punho.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Uma estrutura está lateral ao esterno e medial ao braço. Qual relação está sendo descrita?',
    '{"A":"A estrutura está entre a linha média e o membro superior","B":"A estrutura está na linha média","C":"A estrutura está mais lateral que o braço","D":"A estrutura está medial ao esterno"}'::jsonb,
    'A',
    'Imagine:
  
  Linha média → esterno → estrutura → braço
  
  O esterno está próximo da linha média.
  
  O braço está mais lateral.
  
  Portanto, a estrutura está entre o esterno e o braço.
  
  Ela é:
  
  ● lateral ao esterno;
  
  ● medial ao braço.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente apresenta dor bilateral nos joelhos. O termo “bilateral” indica que:',
    '{"A":"A dor está em dois pontos do mesmo lado do corpo","B":"A dor está em estruturas de lados opostos","C":"A dor está presente nos dois lados correspondentes do corpo","D":"A dor está localizada apenas no lado dominante"}'::jsonb,
    'C',
    'Bilateral = os dois lados.
  
  Exemplo:
  
  Dor no joelho direito + dor no joelho esquerdo = bilateral.
  
  Unilateral = apenas um lado.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Considere:
  
  Pelve → quadril → joelho → tornozelo → pé → dedos
  
  Qual alternativa está correta?',
    '{"A":"O tornozelo é proximal ao joelho","B":"O joelho é distal ao tornozelo","C":"O pé é distal ao joelho","D":"Os dedos são proximais ao pé"}'::jsonb,
    'C',
    'A referência do membro inferior é a pelve.
  
  Quanto mais distante da pelve, mais distal.
  
  Portanto:
  
  Pelve → quadril → joelho → tornozelo → pé → dedos
  
  O pé está mais distante da pelve que o joelho.
  
  Logo:
  
  Pé = distal ao joelho.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente apresenta uma lesão superficial na região posterior do braço. Qual alternativa melhor descreve essa localização?',
    '{"A":"Próxima à pele e na face posterior do braço","B":"Profunda e na face anterior do braço","C":"Próxima ao tronco e na face anterior","D":"Distal e medial ao antebraço"}'::jsonb,
    'A',
    'Superficial = próximo da pele.
  
  Posterior = atrás.
  
  Portanto:
  
  Superficial + posterior = perto da pele + parte de trás do braço.
  
  Na posição anatômica, as palmas das mãos estão voltadas para frente, mas isso não muda o fato de que o lado oposto à frente do braço é o posterior.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Durante uma avaliação de movimento, o paciente leva o braço lateralmente para longe do tronco até aproximadamente 90°. O movimento realizado é:',
    '{"A":"Adução","B":"Abdução","C":"Flexão","D":"Rotação medial"}'::jsonb,
    'B',
    'Abdução = afastar da linha média.',
    'AB = Afasta.
  
  Se o braço sai do lado do corpo e se afasta dele → abdução.
  
  O movimento contrário seria:
  
  Adução = aproximação.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente está deitado com o dorso apoiado sobre a maca e a face anterior do corpo voltada para cima. Essa posição é:',
    '{"A":"Decúbito ventral","B":"Decúbito lateral","C":"Decúbito dorsal","D":"Trendelenburg"}'::jsonb,
    'C',
    'Dorsal → dorso/costas apoiadas na maca.
  
  Logo, a barriga fica voltada para cima.
  
  Dorsal = barriga para cima.
  
  Ventral = barriga para baixo.',
    'Ventral → ventre na maca.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Durante uma cirurgia, o médico identifica uma estrutura que está medial ao rádio e lateral ao esterno. Qual alternativa melhor representa essa estrutura?',
    '{"A":"Ulna","B":"Traqueia","C":"Pulmão direito","D":"Coração"}'::jsonb,
    'A',
    'Na posição anatômica:
  
  Rádio = lateral
  
  Ulna = medial
  
  Portanto, a estrutura medial ao rádio é a ulna.
  
  O esterno aparece como referência adicional para reforçar que estamos falando de uma estrutura do membro superior, e não de uma estrutura localizada no centro do tórax.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente sofreu uma fratura no fêmur. O laudo informa que a fratura está localizada na extremidade distal do osso. É mais provável que a lesão esteja próxima:',
    '{"A":"Ao quadril","B":"À pelve","C":"Ao joelho","D":"À cabeça femoral"}'::jsonb,
    'C',
    'O fêmur vai:
  
  Quadril → joelho
  
  A extremidade:
  
  Proximal = quadril
  
  Distal = joelho
  
  Portanto, fêmur distal = próximo ao joelho.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Durante uma avaliação clínica, o médico compara o ombro e o punho. Qual afirmação está correta?',
    '{"A":"O punho é proximal ao ombro","B":"O ombro é distal ao punho","C":"O ombro é proximal ao punho","D":"Ambos são mediais entre si"}'::jsonb,
    'C',
    'No membro superior:
  
  Tronco → ombro → cotovelo → punho → dedos
  
  O ombro é mais próximo da origem do membro.
  
  Portanto:
  
  Ombro = proximal ao punho.
  
  Punho = distal ao ombro.
  
  ⚠️ Não pense simplesmente “cima = proximal”. Pense:
  
  > **Qual estrutura está mais próxima da origem do membro?**',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Uma lesão está localizada no quadrante inferior direito do abdome. Qual estrutura está classicamente associada a essa região?',
    '{"A":"Baço","B":"Apêndice vermiforme","C":"Estômago","D":"Coração"}'::jsonb,
    'B',
    'O apêndice vermiforme está classicamente associado ao:
  
  Quadrante inferior direito (QID)
  
  e à:
  
  Fossa ilíaca direita.
  
  Esse conhecimento é importante clinicamente porque a dor nessa região pode ocorrer na apendicite, embora existam outras causas possíveis.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um médico solicita que o paciente gire o antebraço de modo que a palma da mão fique voltada para cima, considerando a posição anatômica como referência. Esse movimento é:',
    '{"A":"Pronação","B":"Supinação","C":"Rotação medial","D":"Extensão"}'::jsonb,
    'B',
    'Supinação = palma para cima.',
    '🥣 Supinação = segurar uma sopa.
  
  Pronação = palma para baixo.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_anatomia,
    'Um paciente apresenta uma lesão localizada profundamente ao músculo peitoral e anteriormente ao coração. Qual alternativa melhor descreve a relação da lesão?',
    '{"A":"A lesão está superficial ao músculo e posterior ao coração","B":"A lesão está profunda ao músculo e anterior ao coração","C":"A lesão está lateral ao músculo e medial ao coração","D":"A lesão está distal ao músculo e proximal ao coração"}'::jsonb,
    'B',
    'A questão apresenta duas relações diferentes:
  
  Profundamente ao músculo
  → está mais interna que o músculo.
  
  Anteriormente ao coração
  → está à frente do coração.
  
  Portanto:
  
  Profunda ao músculo + anterior ao coração.
  
  ⚠️ Perceba que profundo/superficial e anterior/posterior são relações independentes. Uma estrutura pode ser profunda e, ao mesmo tempo, anterior.',
    null
  )
  on conflict (module_id, question) do nothing;
end $$;

-- Conferência: deve mostrar 20 flashcards em cada módulo novo.
select m.title, count(f.id) as total_flashcards
from public.modules m
left join public.flashcards f on f.module_id = m.id
where m.title in ('Histologia', 'Anatomia')
group by m.title;
