-- =============================================================================
-- MEDMENTO — Import direto: Sistema Esquelético e Tecidos Básicos (20)
-- Rode no SQL Editor do Supabase. Seguro rodar mais de uma vez (ON CONFLICT
-- DO NOTHING) — não duplica se já tiver sido importado antes.
-- =============================================================================

insert into public.modules (title)
select 'Sistema Esquelético e Tecidos Básicos'
where not exists (select 1 from public.modules where title = 'Sistema Esquelético e Tecidos Básicos');

do $$
declare
  modulo_id uuid;
begin
  select id into modulo_id from public.modules where title = 'Sistema Esquelético e Tecidos Básicos' limit 1;

  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual é o tipo de osso caracterizado por ter o comprimento maior que a largura e a espessura?',
    '{"A":"Curto","B":"Plano","C":"Longo","D":"Irregular"}'::jsonb,
    'C',
    'Ossos longos apresentam o comprimento maior que a largura e a espessura. Exemplos: fêmur, úmero, rádio e tíbia.
  
  🧠 Para memorizar: LONGO = comprimento predominante.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'A hematopoese é:',
    '{"A":"A formação do tecido ósseo","B":"A formação das células sanguíneas","C":"A destruição das hemácias","D":"A formação da cartilagem"}'::jsonb,
    'B',
    'Hematopoese é o processo de produção das células do sangue, incluindo hemácias, leucócitos e plaquetas.',
    'HEMATO = sangue + POESE = produção.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'No adulto, a principal região responsável pela hematopoese é:',
    '{"A":"Medula óssea amarela","B":"Medula óssea vermelha","C":"Periósteo","D":"Cartilagem"}'::jsonb,
    'B',
    'A medula óssea vermelha contém células-tronco hematopoéticas responsáveis pela produção das células sanguíneas.
  
  🧠 Atenção: medula vermelha → sangue; medula amarela → predominância de gordura.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Com o envelhecimento, a medula óssea vermelha:',
    '{"A":"É completamente substituída por cartilagem","B":"Torna-se progressivamente mais rica em tecido adiposo","C":"Aumenta sua produção de células sanguíneas","D":"Transforma-se em tecido ósseo compacto"}'::jsonb,
    'B',
    'Com o envelhecimento, parte da medula vermelha é progressivamente substituída por tecido adiposo, adquirindo características de medula amarela.
  
  🧠 Memorize: idade ↑ → gordura na medula ↑.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'As conchas nasais superior e média pertencem ao:',
    '{"A":"Vômer","B":"Maxilar","C":"Etmoide","D":"Esfenoide"}'::jsonb,
    'C',
    'As conchas nasais superior e média fazem parte do osso etmoide. A concha nasal inferior é um osso independente.',
    'Superior + média = etmoide.
  Inferior = osso próprio.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual é o tecido responsável principalmente pelo revestimento e proteção das superfícies?',
    '{"A":"Nervoso","B":"Muscular","C":"Epitelial","D":"Conjuntivo"}'::jsonb,
    'C',
    'O tecido epitelial reveste superfícies externas e internas, além de participar de proteção, absorção, secreção e outras funções.',
    'EPITÉLIO = revestimento.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual dos seguintes é considerado um tecido conjuntivo especializado?',
    '{"A":"Epitelial","B":"Ósseo","C":"Nervoso","D":"Muscular"}'::jsonb,
    'B',
    'O tecido ósseo é um tipo de tecido conjuntivo especializado. Também são exemplos de conjuntivos especializados a cartilagem, o sangue e o tecido adiposo.
  
  🧠 Ideia-chave: tecido conjuntivo pode ser especializado para funções específicas.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'A matriz extracelular é constituída principalmente por:',
    '{"A":"Núcleo e ribossomos","B":"Fibras e substância fundamental","C":"Mitocôndrias e lisossomos","D":"DNA e RNA"}'::jsonb,
    'B',
    'A matriz extracelular (MEC) é formada por fibras — como colágenas, reticulares e elásticas — e pela substância fundamental.
  
  🧠 MEC = fibras + substância fundamental.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual é o tipo de colágeno mais abundante no organismo?',
    '{"A":"Tipo I","B":"Tipo II","C":"Tipo III","D":"Tipo IV"}'::jsonb,
    'A',
    'O colágeno tipo I é o mais abundante do organismo. Está presente principalmente em ossos, tendões, ligamentos, pele e dentina.',
    'Tipo I = o mais comum.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'As fibras reticulares são constituídas principalmente por:',
    '{"A":"Colágeno tipo I","B":"Colágeno tipo II","C":"Colágeno tipo III","D":"Colágeno tipo IV"}'::jsonb,
    'C',
    'As fibras reticulares são formadas principalmente por colágeno tipo III e formam uma rede delicada de sustentação.',
    'Reticular = III.'
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'O colágeno tipo IV está especialmente associado à:',
    '{"A":"Cartilagem","B":"Lâmina basal","C":"Fibras reticulares","D":"Tendões"}'::jsonb,
    'B',
    'O colágeno tipo IV é um componente importante da lâmina basal, formando uma rede estrutural.
  
  🧠 Decore a associação:
  I → resistência
  II → cartilagem
  III → reticular
  IV → lâmina basal',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual alternativa apresenta componentes da substância fundamental amorfa?',
    '{"A":"GAGs, proteoglicanos e glicoproteínas","B":"DNA, RNA e ribossomos","C":"Actina, miosina e troponina","D":"Colágeno I, II e III exclusivamente"}'::jsonb,
    'A',
    'A substância fundamental contém principalmente GAGs, proteoglicanos e glicoproteínas, formando uma parte importante da matriz extracelular.
  
  🧠 MEC = fibras + substância fundamental.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'O polo apical de uma célula epitelial está voltado principalmente:',
    '{"A":"Para a lâmina basal","B":"Para as células vizinhas","C":"Para a superfície ou luz","D":"Para o núcleo"}'::jsonb,
    'C',
    'O domínio apical está voltado para a superfície livre ou para a luz de um órgão. Pode apresentar especializações como cílios ou microvilosidades.
  
  🧠 APICAL = aponta para fora/luz.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'O domínio lateral da célula epitelial é especialmente importante para:',
    '{"A":"Produção de ATP","B":"Contato e união com células vizinhas","C":"Formação do núcleo","D":"Síntese de DNA"}'::jsonb,
    'B',
    'O domínio lateral estabelece contato com as células epiteliais adjacentes por meio de junções celulares.
  
  🧠 Lateral = lado a lado com outras células.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'O domínio basal está relacionado principalmente:',
    '{"A":"À superfície livre da célula","B":"À luz do órgão","C":"À lâmina basal e à matriz extracelular","D":"Aos cílios"}'::jsonb,
    'C',
    'O domínio basal está voltado para a lâmina basal, que conecta o epitélio ao tecido conjuntivo subjacente.
  
  🧠 APICAL → luz
  LATERAL → células vizinhas
  BASAL → lâmina basal',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual equipamento é utilizado para realizar cortes muito finos dos tecidos antes da preparação das lâminas?',
    '{"A":"Microscópio","B":"Micrótomo","C":"Centrífuga","D":"Espectrofotômetro"}'::jsonb,
    'B',
    'O micrótomo é utilizado para produzir cortes extremamente finos de tecidos, permitindo sua posterior colocação em lâminas para observação microscópica.
  
  🧠 MICRÓTOMO = corta tecido.
  MICROSCÓPIO = observa.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Na coloração HE, a hematoxilina geralmente evidencia o núcleo em:',
    '{"A":"Amarelo","B":"Verde","C":"Rosa","D":"Azul-arroxeado"}'::jsonb,
    'D',
    'A hematoxilina apresenta afinidade por estruturas basófilas, especialmente os ácidos nucleicos do núcleo, deixando-o azul-arroxeado.
  
  🧠 Hematoxilina → núcleo → roxo/azul.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'A eosina apresenta maior afinidade por estruturas ricas em:',
    '{"A":"Proteínas","B":"DNA exclusivamente","C":"RNA exclusivamente","D":"Lipídios exclusivamente"}'::jsonb,
    'A',
    'A eosina é um corante ácido que apresenta afinidade por componentes celulares ricos em proteínas, como muitas proteínas citoplasmáticas e fibras de colágeno.
  
  Na HE, essas estruturas ficam geralmente rosadas.
  
  🧠 Eosina → proteínas → rosa.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'No epitélio estratificado pavimentoso, a classificação “pavimentoso” é determinada principalmente:',
    '{"A":"Pelo formato das células da camada basal","B":"Pelo formato das células da camada superficial","C":"Pela quantidade de núcleos","D":"Pela quantidade de tecido conjuntivo"}'::jsonb,
    'B',
    'Em epitélios estratificados, a classificação pelo formato celular é determinada pelas células da camada mais superficial, e não pelas células basais.
  
  Assim, se as células superficiais são achatadas → pavimentoso.
  
  🧠 REGRA DE OURO:
  Estratificado → olhe a camada superficial para dar o nome.',
    null
  )
  on conflict (module_id, question) do nothing;
  
  insert into public.flashcards (module_id, question, options, correct_answer_letter, explanation, tip)
  values (
    modulo_id,
    'Qual alternativa diferencia corretamente o epitélio estratificado pavimentoso queratinizado do não queratinizado?',
    '{"A":"O queratinizado possui uma superfície com células mortas ricas em queratina; o não queratinizado mantém células superficiais vivas e nucleadas.","B":"O queratinizado possui apenas uma camada; o não queratinizado possui várias.","C":"O queratinizado ocorre exclusivamente no intestino; o não queratinizado exclusivamente na pele.","D":"O queratinizado não possui células epiteliais; o não queratinizado possui."}'::jsonb,
    'A',
    'No estratificado pavimentoso queratinizado, as células superficiais perdem o núcleo e ficam repletas de queratina, formando uma camada de proteção.',
    null
  )
  on conflict (module_id, question) do nothing;
end $$;

-- Conferência: deve mostrar 20 flashcards no módulo.
select m.title, count(f.id) as total_flashcards
from public.modules m
left join public.flashcards f on f.module_id = m.id
where m.title = 'Sistema Esquelético e Tecidos Básicos'
group by m.title;
