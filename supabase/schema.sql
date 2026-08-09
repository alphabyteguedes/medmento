-- =============================================================================
-- MEDMENTO — Script de criação do banco de dados (Supabase / PostgreSQL)
-- Rode este script inteiro no SQL Editor do painel do Supabase.
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
-- gerenciar módulos/flashcards (usado nas policies abaixo).
-- -----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- Somente administradores (user_profiles.is_admin = true) podem criar/editar/excluir
-- módulos e flashcards — usado pelo importador em /admin/import.
create policy "modules: escrita apenas para admin"
  on public.modules for all
  to authenticated
  using (exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.is_admin = true))
  with check (exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.is_admin = true));

create policy "flashcards: escrita apenas para admin"
  on public.flashcards for all
  to authenticated
  using (exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.is_admin = true))
  with check (exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.is_admin = true));

-- Cada usuário só enxerga e altera o PRÓPRIO perfil (XP, streak etc.).
create policy "user_profiles: usuário vê o próprio perfil"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "user_profiles: usuário atualiza o próprio perfil"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Para promover o primeiro usuário admin (rode manualmente, trocando o e-mail):
--
-- update public.user_profiles set is_admin = true
-- where id = (select id from auth.users where email = 'seu-email@exemplo.com');
-- -----------------------------------------------------------------------------
