-- Ideacloud · áreas (criativo, faculdade, ...) e prazos
-- Rode DEPOIS da 0001, no SQL Editor do Supabase (uma vez).
-- Não apaga nem altera nenhum dado existente.

-- ---------------------------------------------------------------------------
-- Áreas: lista editável para organizar ideias e projetos
-- ---------------------------------------------------------------------------
create table public.areas (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) > 0),
  emoji      text not null default '',
  color      text not null default 'sage'
               check (color in ('sage', 'peach', 'lilac', 'sun')),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

-- nomes únicos, sem diferenciar maiúsculas/minúsculas
create unique index areas_name_unique on public.areas (lower(btrim(name)));

alter table public.areas enable row level security;  -- sem políticas: só o servidor acessa

insert into public.areas (name, emoji, color, position) values
  ('Criativo',  '🎨', 'peach', 0),
  ('Faculdade', '🎓', 'lilac', 1),
  ('Pessoal',   '🌱', 'sage',  2);

-- ---------------------------------------------------------------------------
-- Ideias e projetos passam a ter área (opcional: capturar rápido = só título)
-- Se a área for apagada, a ideia/projeto continua existindo, só sem área.
-- ---------------------------------------------------------------------------
alter table public.ideas
  add column area_id uuid references public.areas (id) on delete set null;

alter table public.projects
  add column area_id uuid references public.areas (id) on delete set null,
  add column due_date date;                 -- prazo do projeto (opcional)

alter table public.steps
  add column due_date date;                 -- prazo da etapa (opcional)

create index ideas_area_idx    on public.ideas (area_id);
create index projects_area_idx on public.projects (area_id);
