-- =============================================================================
-- MEDMENTO — Script de criação do banco de dados (Supabase / PostgreSQL)
-- Rode este script inteiro no SQL Editor do painel do Supabase.
--
-- Se o seu projeto já existe e foi criado antes desta versão do script, não
-- rode este arquivo de novo — use as migrações incrementais em
-- supabase/migrations/ (ex: 002_admin_panel.sql, 004_identidade_e_bloqueio.sql)
-- para não recriar o que já existe.
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
  created_at timestamptz not null default now(),
  -- Evita importar a mesma pergunta duas vezes no mesmo módulo (o
  -- importador em /admin/import usa isso como alvo de ON CONFLICT DO NOTHING).
  constraint flashcards_module_question_key unique (module_id, question)
);

create index if not exists flashcards_module_id_idx on public.flashcards (module_id);

-- -----------------------------------------------------------------------------
-- TABELA: user_profiles
-- Estende auth.users com dados de gamificação e identidade. is_admin controla
-- quem gerencia módulos/flashcards e acessa o painel; is_blocked revoga o
-- acesso ao conteúdo sem precisar remover a conta. email/full_name/avatar_url
-- ficam duplicados aqui (fora de auth.users, que é schema protegido) para o
-- painel e a UI poderem exibi-los direto pelo Supabase client no frontend.
-- -----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  xp int not null default 0,
  streak_days int not null default 0,
  last_study_date date,
  is_admin boolean not null default false,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- TRIGGER: cria automaticamente uma linha em user_profiles sempre que um novo
-- usuário se cadastra via Supabase Auth. Evita ter que criar o perfil "na mão"
-- no frontend após o signup. Nome e foto vêm do Google.
-- -----------------------------------------------------------------------------
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- FUNÇÕES: is_admin() / is_blocked()
-- Helpers usados nas policies abaixo. Por serem SECURITY DEFINER, a consulta
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

create or replace function public.is_blocked()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_blocked from public.user_profiles where id = auth.uid()), false);
$$;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.modules enable row level security;
alter table public.flashcards enable row level security;
alter table public.user_profiles enable row level security;

-- Usuário autenticado e NÃO bloqueado pode LER módulos e flashcards (é o
-- conteúdo de estudo) — usuário bloqueado deixa de enxergar tudo, mesmo que
-- contorne o middleware (defesa em profundidade).
create policy "modules: leitura para autenticados"
  on public.modules for select
  to authenticated
  using (not public.is_blocked());

create policy "flashcards: leitura para autenticados"
  on public.flashcards for select
  to authenticated
  using (not public.is_blocked());

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
-- necessário para o painel em /admin listar, promover/remover admins e
-- bloquear/desbloquear acesso.
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
