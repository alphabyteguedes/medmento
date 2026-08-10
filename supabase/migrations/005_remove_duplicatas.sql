-- =============================================================================
-- MEDMENTO — Migração 005: remove flashcards duplicados + trava contra
-- duplicação futura.
-- Rode no SQL Editor do Supabase.
-- =============================================================================

-- 1) Remove duplicatas: mantém só a linha mais antiga de cada combinação
--    (module_id, question) e apaga o resto. Depois desta migração, cada
--    módulo deve voltar a ter 10 flashcards (20 no total).
delete from public.flashcards f
using (
  select
    id,
    row_number() over (
      partition by module_id, question
      order by created_at asc, id asc
    ) as posicao
  from public.flashcards
) dedup
where f.id = dedup.id
  and dedup.posicao > 1;

-- 2) Trava: a mesma pergunta não pode existir duas vezes no mesmo módulo.
--    A partir de agora, tentar inserir uma pergunta repetida falha (ou,
--    no importador em /admin/import, é ignorada silenciosamente e
--    reportada como "já existia" — ver ON CONFLICT no código).
alter table public.flashcards
  add constraint flashcards_module_question_key unique (module_id, question);

-- 3) Conferência: deve mostrar 10 flashcards em cada módulo (20 no total).
select m.title, count(f.id) as total_flashcards
from public.modules m
left join public.flashcards f on f.module_id = m.id
group by m.title;
