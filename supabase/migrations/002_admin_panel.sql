-- =============================================================================
-- MEDMENTO — Migração 002: suporte ao painel de administração
-- Rode este script no SQL Editor do Supabase (projeto já existente).
-- =============================================================================

-- 1) Guarda o e-mail junto do perfil, para o painel listar usuários sem
--    precisar tocar em auth.users (schema protegido) a partir do frontend.
alter table public.user_profiles add column if not exists email text;

-- Preenche o e-mail de quem já tinha perfil criado antes desta coluna existir.
update public.user_profiles up
set email = au.email
from auth.users au
where au.id = up.id and up.email is null;

-- Atualiza o trigger de novo usuário para gravar o e-mail também.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- 2) Função auxiliar para checar admin sem recursão de RLS: como ela é
--    SECURITY DEFINER, a consulta interna a user_profiles ignora as próprias
--    policies da tabela, evitando o erro "infinite recursion detected in
--    policy for relation user_profiles" que aconteceria com uma subquery
--    inline dentro da própria policy de user_profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.user_profiles where id = auth.uid()), false);
$$;

-- 3) Substitui as policies de escrita de modules/flashcards para usar a
--    função acima (mesmo efeito de antes, só que centralizado).
drop policy if exists "modules: escrita apenas para admin" on public.modules;
create policy "modules: escrita apenas para admin"
  on public.modules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "flashcards: escrita apenas para admin" on public.flashcards;
create policy "flashcards: escrita apenas para admin"
  on public.flashcards for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Novas policies: admin enxerga e edita o perfil de qualquer usuário
--    (necessário para o painel mostrar a lista e promover/remover admins).
drop policy if exists "user_profiles: admin vê todos os perfis" on public.user_profiles;
create policy "user_profiles: admin vê todos os perfis"
  on public.user_profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "user_profiles: admin atualiza todos os perfis" on public.user_profiles;
create policy "user_profiles: admin atualiza todos os perfis"
  on public.user_profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5) Promove o admin principal do Medmento.
-- Pré-requisito: esse e-mail precisa ter feito login pelo menos uma vez
-- (é o login que cria a linha em user_profiles via trigger).
update public.user_profiles set is_admin = true
where email = 'lucassantosguedessouza@gmail.com';
