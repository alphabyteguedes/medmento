-- =============================================================================
-- MEDMENTO — Script de criação do banco de dados (Supabase / PostgreSQL)
-- Rode este script inteiro no SQL Editor do painel do Supabase.
--
-- Se o seu projeto já existe e foi criado antes desta versão do script, não
-- rode este arquivo de novo — use as migrações incrementais em
-- supabase/migrations/ (ex: 002_admin_panel.sql) para não recriar o que já existe.
-- =============================================================================

-- Extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- TABELA: modules
-- Representa um módulo/assunto de estudo (ex: "Processos Metabólicos")
-- -----------------------------------------------------------------------------
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- TABELA: flashcards
-- Cada flashcard pertence a um módulo. As alternativas ficam em JSONB no
-- formato { "A": "texto", "B": "texto", "C": "texto", "D": "texto", "E": "texto" }
-- (a chave "E" é opcional).
-- -----------------------------------------------------------------------------
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer_letter text not null check (correct_answer_letter in ('A', 'B', 'C', 'D', 'E')),
  explanation text not null default '',
  tip text,
  created_at timestamptz not null default now()
);

create index if not exists flashcards_module_id_idx on public.flashcards (module_id);

-- -----------------------------------------------------------------------------
-- TABELA: user_profiles
-- Estende auth.users com dados de gamificação. is_admin controla quem pode
-- gerenciar módulos/flashcards e acessar o painel de administração.
-- email fica duplicado aqui (fora de auth.users, que é schema protegido) para
-- o painel poder listar usuários direto pelo Supabase client no frontend.
-- -----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  xp int not null default 0,
  streak_days int not null default 0,
  last_study_date date,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- TRIGGER: cria automaticamente uma linha em user_profiles sempre que um novo
-- usuário se cadastra via Supabase Auth. Evita ter que criar o perfil "na mão"
-- no frontend após o signup.
-- -----------------------------------------------------------------------------
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- FUNÇÃO: is_admin()
-- Helper usado nas policies abaixo. Por ser SECURITY DEFINER, a consulta
-- interna a user_profiles ignora as próprias policies da tabela — isso evita
-- "infinite recursion detected in policy for relation user_profiles", que
-- aconteceria se uma policy de user_profiles fizesse subquery direto na
-- própria tabela sob RLS.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.user_profiles where id = auth.uid()), false);
$$;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.modules enable row level security;
alter table public.flashcards enable row level security;
alter table public.user_profiles enable row level security;

-- Qualquer usuário autenticado pode LER módulos e flashcards (é o conteúdo de estudo).
create policy "modules: leitura para autenticados"
  on public.modules for select
  to authenticated
  using (true);

create policy "flashcards: leitura para autenticados"
  on public.flashcards for select
  to authenticated
  using (true);

-- Somente administradores podem criar/editar/excluir módulos e flashcards
-- — usado pelo importador em /admin/import.
create policy "modules: escrita apenas para admin"
  on public.modules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "flashcards: escrita apenas para admin"
  on public.flashcards for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cada usuário enxerga e altera o PRÓPRIO perfil (XP, streak etc.)...
create policy "user_profiles: usuário vê o próprio perfil"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "user_profiles: usuário atualiza o próprio perfil"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ...e administradores enxergam e alteram o perfil de QUALQUER usuário —
-- necessário para o painel em /admin listar e promover/remover admins.
create policy "user_profiles: admin vê todos os perfis"
  on public.user_profiles for select
  to authenticated
  using (public.is_admin());

create policy "user_profiles: admin atualiza todos os perfis"
  on public.user_profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Para promover o primeiro usuário admin (rode manualmente, trocando o e-mail;
-- a pessoa precisa ter feito login pelo menos uma vez antes, para o trigger
-- acima já ter criado a linha em user_profiles):
--
-- update public.user_profiles set is_admin = true where email = 'seu-email@exemplo.com';
-- -----------------------------------------------------------------------------
