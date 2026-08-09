-- =============================================================================
-- MEDMENTO — Migração 004: nome/avatar do usuário + bloqueio de acesso
-- Rode no SQL Editor do Supabase.
-- =============================================================================

-- 1) Nome e foto vêm do Google — gravados junto do perfil pra exibir na UI
--    sem precisar tocar em auth.users (schema protegido) a partir do frontend.
alter table public.user_profiles add column if not exists full_name text;
alter table public.user_profiles add column if not exists avatar_url text;

-- 2) Flag de bloqueio: usuário bloqueado continua "logado" no Google, mas
--    perde acesso ao conteúdo do app (reforçado tanto no middleware quanto
--    na RLS de modules/flashcards abaixo — defesa em duas camadas).
alter table public.user_profiles add column if not exists is_blocked boolean not null default false;

-- Preenche nome/foto de quem já tinha perfil criado antes destas colunas existirem.
update public.user_profiles up
set
  full_name = coalesce(up.full_name, au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
  avatar_url = coalesce(up.avatar_url, au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture')
from auth.users au
where au.id = up.id;

-- Atualiza o trigger de novo usuário para gravar nome e foto também.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.user_profiles.avatar_url);
  return new;
end;
$$;

-- 3) Helper is_blocked(), no mesmo padrão de is_admin() (SECURITY DEFINER
--    evita recursão de RLS ao consultar a própria user_profiles).
create or replace function public.is_blocked()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_blocked from public.user_profiles where id = auth.uid()), false);
$$;

-- 4) Usuário bloqueado deixa de enxergar módulos e flashcards mesmo que
--    tente contornar o middleware (defesa em profundidade via RLS).
drop policy if exists "modules: leitura para autenticados" on public.modules;
create policy "modules: leitura para autenticados"
  on public.modules for select
  to authenticated
  using (not public.is_blocked());

drop policy if exists "flashcards: leitura para autenticados" on public.flashcards;
create policy "flashcards: leitura para autenticados"
  on public.flashcards for select
  to authenticated
  using (not public.is_blocked());
