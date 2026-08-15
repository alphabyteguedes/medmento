-- =============================================================================
-- MEDMENTO — Migração 008: módulos pessoais (qualquer usuário pode subir suas
-- próprias questões, sem misturar com o conteúdo oficial curado pelo admin).
-- Rode no SQL Editor do Supabase.
-- =============================================================================

-- 1) created_by = null → módulo oficial (criado pelo admin, visível a todos).
--    created_by = <uuid> → módulo pessoal daquele usuário, visível só a ele
--    (e a admins, para moderação).
alter table public.modules add column if not exists created_by uuid references auth.users(id) on delete cascade;

-- 2) Substitui a policy de leitura de módulos: agora considera visibilidade.
drop policy if exists "modules: leitura para autenticados" on public.modules;
create policy "modules: leitura de módulos públicos ou próprios"
  on public.modules for select
  to authenticated
  using (
    not public.is_blocked()
    and (created_by is null or created_by = auth.uid() or public.is_admin())
  );

-- 3) Usuário comum pode criar/editar/excluir os PRÓPRIOS módulos pessoais
--    (a policy de admin, que já existe, continua cobrindo os módulos oficiais).
drop policy if exists "modules: usuário gerencia seus próprios módulos pessoais" on public.modules;
create policy "modules: usuário gerencia seus próprios módulos pessoais"
  on public.modules for all
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid() and not public.is_blocked());

-- 4) Flashcards: a visibilidade segue a do módulo (oficial, próprio, ou admin vê tudo).
drop policy if exists "flashcards: leitura para autenticados" on public.flashcards;
create policy "flashcards: leitura conforme visibilidade do módulo"
  on public.flashcards for select
  to authenticated
  using (
    not public.is_blocked()
    and exists (
      select 1 from public.modules m
      where m.id = flashcards.module_id
        and (m.created_by is null or m.created_by = auth.uid() or public.is_admin())
    )
  );

-- 5) Usuário comum pode gerenciar flashcards SÓ dentro dos próprios módulos
--    pessoais (não consegue tocar em módulos oficiais nem de outros usuários).
drop policy if exists "flashcards: usuário gerencia flashcards dos próprios módulos" on public.flashcards;
create policy "flashcards: usuário gerencia flashcards dos próprios módulos"
  on public.flashcards for all
  to authenticated
  using (exists (select 1 from public.modules m where m.id = flashcards.module_id and m.created_by = auth.uid()))
  with check (
    not public.is_blocked()
    and exists (select 1 from public.modules m where m.id = flashcards.module_id and m.created_by = auth.uid())
  );
