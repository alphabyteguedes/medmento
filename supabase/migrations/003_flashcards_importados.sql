-- =============================================================================
-- MEDMENTO — Import direto dos flashcards colados (parser tinha falhado na UI)
-- Rode no SQL Editor do Supabase.
-- =============================================================================

-- Cria os dois módulos (ou reaproveita se já existirem com esse título).
insert into public.modules (title)
select 'Processos Metabólicos'
where not exists (select 1 from public.modules where title = 'Processos Metabólicos');

insert into public.modules (title)
select 'Biologia Celular e Molecular'
where not exists (select 1 from public.modules where title = 'Biologia Celular e Molecular');

do $$
declare
  modulo_metabolismo uuid;
  modulo_biologia_celular uuid;
begin
  select id into modulo_metabolismo from public.modules where title = 'Processos Metabólicos' limit 1;
  select id into modulo_biologia_celular from public.modules where title = 'Biologia Celular e Molecular' limit 1;

  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Qual é a principal função das enzimas no metabolismo celular?',
    '{"A":"Produzir ATP diretamente","B":"Aumentar a energia de ativação","C":"Acelerar reações químicas, reduzindo a energia de ativação","D":"Ser consumidas durante a reação","E":"Alterar o produto final da reação"}'::jsonb,
    'C',
    'As enzimas são catalisadores biológicos. Elas diminuem a energia de ativação necessária para que uma reação aconteça, tornando a reação mais rápida.',
    'enzima não produz ATP e não é consumida durante a reação.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Em relação à interação entre enzima e substrato, qual alternativa está correta?',
    '{"A":"O substrato se liga permanentemente à enzima.","B":"O substrato se liga ao sítio ativo da enzima.","C":"Toda enzima consegue atuar sobre qualquer substrato.","D":"O sítio ativo é encontrado apenas em carboidratos.","E":"A enzima é destruída após a reação."}'::jsonb,
    'B',
    'O substrato é a molécula sobre a qual a enzima atua. Ele se liga temporariamente ao sítio ativo, formando o complexo enzima-substrato.',
    'Enzima = fechadura
  Substrato = chave
  Sítio ativo = local onde a chave encaixa.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Um paciente apresenta deficiência de determinada vitamina que participa da formação de uma molécula auxiliar para enzimas metabólicas. Essa molécula é chamada de:',
    '{"A":"Substrato","B":"Produto","C":"Coenzima","D":"Energia de ativação","E":"Sítio ativo"}'::jsonb,
    'C',
    'Coenzimas são moléculas orgânicas que auxiliam determinadas enzimas. Muitas são derivadas de vitaminas, especialmente vitaminas do complexo B.
  
  Exemplos:
  
  ● NAD⁺
  
  ● FAD
  
  ● Coenzima A',
    'Vitamina → coenzima → ajuda a enzima.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Durante uma reação metabólica, uma enzima sofre alteração extrema de temperatura e perde sua estrutura tridimensional. Qual é a consequência mais provável?',
    '{"A":"Aumento permanente da atividade enzimática","B":"Formação de mais ATP","C":"Desnaturação e perda da função","D":"Transformação da enzima em substrato","E":"Aumento da especificidade da enzima"}'::jsonb,
    'C',
    'A desnaturação ocorre quando uma proteína perde sua estrutura tridimensional adequada.
  
  Como a função da enzima depende de sua estrutura, especialmente do sítio ativo, a alteração estrutural pode impedir o encaixe correto do substrato.
  
  Pode ocorrer por:
  
  ● Temperatura elevada
  
  ● pH extremo
  
  ● Substâncias químicas',
    'Mudou a estrutura → mudou a função.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Um indivíduo permanece várias horas em jejum. Qual alteração metabólica é esperada nesse período?',
    '{"A":"Aumento da glicogênese pela ação predominante da insulina","B":"Aumento da síntese de gordura","C":"Aumento da glicogenólise e manutenção da glicemia","D":"Aumento da entrada de glicose por GLUT-4 devido à insulina","E":"Aumento da produção de glicogênio muscular"}'::jsonb,
    'C',
    'Durante o jejum, ocorre redução da insulina e aumento relativo do glucagon.
  
  O glucagon estimula principalmente:
  
  Glicogenólise → quebra do glicogênio → liberação de glicose
  
  Também estimula a gliconeogênese, especialmente conforme o jejum se prolonga.',
    'Jejum = liberar energia.
  Insulina = guardar.
  Glucagon = liberar.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Qual processo metabólico corresponde à formação de glicogênio a partir do excesso de glicose?',
    '{"A":"Glicogenólise","B":"Gliconeogênese","C":"Glicogênese","D":"Lipólise","E":"Beta oxidação"}'::jsonb,
    'C',
    'A glicogênese é a formação de glicogênio a partir da glicose.
  
  Ocorre principalmente no:
  
  ● Fígado
  
  ● Músculo
  
  É estimulada pela insulina, especialmente após as refeições.',
    'Glicogênese = GERA glicogênio.
  
  Não confundir:
  
  ● Glicogênese → forma glicogênio
  
  ● Glicogenólise → quebra glicogênio
  
  ● Gliconeogênese → produz glicose'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Durante exercício físico intenso e de curta duração, quando a oferta de oxigênio não acompanha adequadamente a demanda metabólica, qual processo pode aumentar a produção de lactato?',
    '{"A":"Ciclo de Krebs","B":"Beta oxidação","C":"Glicólise anaeróbia/fermentação láctica","D":"Fosforilação oxidativa","E":"Ciclo da ureia"}'::jsonb,
    'C',
    'Na atividade intensa, a célula pode depender mais da glicólise anaeróbia, levando à formação de lactato.
  
  A glicólise ocorre no citoplasma e não depende diretamente de oxigênio.
  
  A formação de lactato permite a regeneração de NAD⁺, possibilitando que a glicólise continue produzindo ATP rapidamente.
  
  ⚠️ Importante: lactato não é o principal responsável pela dor muscular tardia.',
    null
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Um paciente apresenta baixa disponibilidade de glicose durante um período prolongado de jejum. O organismo aumenta a utilização de ácidos graxos. Qual sequência está correta?',
    '{"A":"Triglicerídeos → glicogênese → glicose","B":"Ácidos graxos → beta oxidação → acetil-CoA","C":"Glicose → lipólise → aminoácidos","D":"Aminoácidos → beta oxidação → ureia","E":"Glicogênio → lipólise → lactato"}'::jsonb,
    'B',
    'Durante o jejum, a lipólise quebra triglicerídeos, liberando:
  
  ● Ácidos graxos
  
  ● Glicerol
  
  Os ácidos graxos entram na mitocôndria e sofrem beta oxidação, formando acetil-CoA.
  
  Depois:
  
  Ácido graxo → beta oxidação → acetil-CoA → Ciclo de Krebs → produção de energia',
    null
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Qual é a principal função do NADH e do FADH₂ na respiração celular?',
    '{"A":"Produzir glicose diretamente","B":"Transportar elétrons para a cadeia respiratória","C":"Quebrar proteínas no citoplasma","D":"Armazenar glicogênio","E":"Produzir oxigênio"}'::jsonb,
    'B',
    'NADH e FADH₂ são moléculas transportadoras de elétrons.
  
  Elas levam elétrons para a cadeia transportadora de elétrons, localizada na membrana interna da mitocôndria.
  
  Esses elétrons contribuem para a formação do gradiente de prótons utilizado pela ATP sintase para produzir ATP.
  
  🧠 Fluxo para memorizar:
  
  NADH/FADH₂ → elétrons → cadeia respiratória → gradiente de H⁺ → ATP sintase → ATP',
    null
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_metabolismo,
    'Qual é o papel do oxigênio na cadeia respiratória da respiração aeróbia?',
    '{"A":"É produzido pela ATP sintase","B":"Produz diretamente o piruvato","C":"Atua como receptor final de elétrons","D":"É convertido em glicose","E":"Atua como substrato da glicólise"}'::jsonb,
    'C',
    'Na cadeia respiratória, o O₂ recebe elétrons ao final do processo.
  
  Após receber elétrons e participar da reação com prótons, ocorre formação de H₂O.
  
  Por isso:
  
  O₂ = receptor final de elétrons
  
  Sem oxigênio suficiente, a cadeia respiratória não consegue funcionar normalmente.',
    'O₂ pega os elétrons no final → forma água.'
  );

  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'A respeito da membrana plasmática, assinale a alternativa correta:',
    '{"A":"As cabeças dos fosfolipídios são hidrofóbicas e ficam voltadas para o interior da membrana.","B":"As caudas dos fosfolipídios são hidrofílicas e ficam voltadas para os meios aquosos.","C":"As cabeças hidrofílicas ficam voltadas para os meios aquosos, enquanto as caudas hidrofóbicas ficam voltadas para o interior da bicamada.","D":"Os fosfolipídios possuem apenas uma região hidrofílica."}'::jsonb,
    'C',
    'A membrana plasmática é formada por uma bicamada de fosfolipídios.
  
  Cabeça hidrofílica → tem afinidade com água → fica voltada para o meio extracelular e intracelular.
  Cauda hidrofóbica → evita água → fica voltada para o interior da membrana, em contato com outras caudas.',
    '💧 Cabeça = gosta de água.
  🚫 Cauda = foge da água.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Uma célula especializada na síntese de lipídios apresenta desenvolvimento acentuado de qual organela?',
    '{"A":"Retículo Endoplasmático Rugoso","B":"Complexo de Golgi","C":"Retículo Endoplasmático Liso","D":"Lisossomo"}'::jsonb,
    'C',
    'O REL está relacionado principalmente à síntese de lipídios, incluindo fosfolipídios e esteroides.
  
  Já o RER possui ribossomos aderidos e está relacionado à síntese de proteínas destinadas à secreção, membrana ou determinadas organelas.',
    'REL → Lipídios
  RER → Proteínas'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Uma célula glandular produz grande quantidade de uma proteína que será secretada para o meio extracelular. Qual conjunto de organelas participa diretamente desse processo?',
    '{"A":"REL → lisossomo → mitocôndria","B":"RER → complexo de Golgi → vesículas secretoras","C":"Ribossomo livre → peroxissomo → lisossomo","D":"Mitocôndria → REL → centríolo"}'::jsonb,
    'B',
    'Proteínas destinadas à secreção são sintetizadas nos ribossomos associados ao RER.
  
  Depois:
  
  RER → vesículas → Complexo de Golgi → vesículas secretoras → membrana plasmática → meio extracelular
  
  O Golgi modifica, organiza, empacota e direciona essas proteínas.',
    null
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Uma proteína destinada à secreção celular é sintetizada e posteriormente modificada e direcionada para seu destino. Qual sequência representa corretamente esse processo?',
    '{"A":"RER → Complexo de Golgi → vesícula secretora → exocitose","B":"REL → lisossomo → RER → exocitose","C":"Complexo de Golgi → RER → REL → endocitose","D":"Ribossomo livre → lisossomo → Golgi → fagocitose"}'::jsonb,
    'A',
    'A proteína secretada segue uma rota organizada:
  
  RER
  ↓
  Complexo de Golgi
  ↓
  Vesícula secretora
  ↓
  Membrana plasmática
  ↓
  Exocitose
  
  O RER produz a proteína, enquanto o Golgi modifica, classifica e direciona.',
    null
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Qual é uma das principais funções do Complexo de Golgi?',
    '{"A":"Produzir ATP por fosforilação oxidativa.","B":"Realizar a glicólise.","C":"Modificar, empacotar e direcionar proteínas e outras moléculas.","D":"Produzir diretamente os ribossomos."}'::jsonb,
    'C',
    'O Complexo de Golgi funciona como uma espécie de central de processamento e distribuição da célula.
  
  Ele pode:
  
  modificar proteínas;
  modificar lipídios;
  empacotar moléculas em vesículas;
  direcionar moléculas para diferentes destinos;
  participar da formação de lisossomos.',
    'RER fabrica → Golgi modifica, empacota e envia.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Um paciente apresenta níveis elevados de HDL. Considerando a função das lipoproteínas, qual afirmação está correta?',
    '{"A":"O HDL transporta colesterol dos tecidos de volta ao fígado.","B":"O HDL transporta glicose para os músculos.","C":"O HDL realiza a síntese de triglicerídeos nos adipócitos.","D":"O HDL promove diretamente a formação de placas de ateroma."}'::jsonb,
    'A',
    'O HDL participa do chamado transporte reverso do colesterol, levando colesterol dos tecidos em direção ao fígado, onde ele pode ser processado e eliminado.',
    'HDL = Help/Remove → tira colesterol dos tecidos.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Um paciente apresenta níveis persistentemente elevados de LDL. Qual consequência está mais relacionada a essa alteração?',
    '{"A":"Aumento da remoção de colesterol dos tecidos.","B":"Redução da deposição de colesterol nas artérias.","C":"Maior risco de aterosclerose.","D":"Aumento da produção de ATP pela mitocôndria."}'::jsonb,
    'C',
    'O LDL transporta colesterol do fígado para os tecidos. Quando está elevado, pode favorecer o depósito de colesterol na parede arterial, contribuindo para a formação de placas ateroscleróticas.',
    'LDL → Leva colesterol para os tecidos.
  LDL elevado → ↑ risco de aterosclerose.'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'As proteínas são formadas por unidades menores que se ligam entre si por meio de ligações específicas. Qual é a unidade básica das proteínas?',
    '{"A":"Glicose","B":"Ácidos graxos","C":"Aminoácidos","D":"Nucleotídeos"}'::jsonb,
    'C',
    'As proteínas são polímeros de aminoácidos.
  
  Os aminoácidos se unem por meio de ligações peptídicas, formando cadeias que posteriormente assumem estruturas tridimensionais específicas.',
    'Aminoácidos → proteínas'
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Qual ligação química une dois aminoácidos durante a formação de uma proteína?',
    '{"A":"Ligação iônica","B":"Ligação peptídica","C":"Ligação fosfodiéster","D":"Ligação de hidrogênio"}'::jsonb,
    'B',
    'A ligação peptídica une aminoácidos para formar peptídeos e proteínas.
  
  De forma simplificada:
  
  Aminoácido + aminoácido → ligação peptídica → dipeptídeo
  
  Muitas ligações peptídicas formam uma cadeia polipeptídica.
  
  Não confundir:
  
  Peptídica → proteínas.
  Fosfodiéster → DNA e RNA.',
    null
  );
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_biologia_celular,
    'Durante a síntese proteica, qual molécula de RNA leva a informação genética do DNA até o ribossomo?',
    '{"A":"RNAt","B":"RNAr","C":"RNAm","D":"DNA"}'::jsonb,
    'C',
    'O RNAm carrega a informação genética transcrita do DNA até o ribossomo, onde será utilizada como molde para a produção da proteína.
  
  A sequência básica é:
  
  DNA → RNAm → Ribossomo → Proteína',
    'RNAm = Mensageiro → leva a mensagem.
  RNAt = Transportador → transporta aminoácidos.
  RNAr = Ribossômico → compõe o ribossomo.'
  );
end $$;
