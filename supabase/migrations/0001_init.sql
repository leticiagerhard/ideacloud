-- Ideacloud · esquema inicial
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez).
--
-- Segurança: RLS ligada em todas as tabelas e NENHUMA política criada.
-- Isso bloqueia qualquer acesso com a chave pública (anon). Só o servidor do
-- app, usando a chave secreta (service_role), consegue ler e gravar.

-- ---------------------------------------------------------------------------
-- Função utilitária: atualiza updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Ideias (o "baú")
-- ---------------------------------------------------------------------------
create table public.ideas (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(btrim(title)) > 0),
  description      text not null default '',
  tags             text[] not null default '{}',
  status           text not null default 'bau'
                     check (status in ('bau', 'projeto', 'descartada')),
  last_surfaced_at timestamptz,          -- última vez em "lembra dessa?"
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search_vector    tsvector generated always as (
    setweight(to_tsvector('portuguese'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese'::regconfig, coalesce(description, '')), 'B')
  ) stored
);

create index ideas_status_created_idx on public.ideas (status, created_at desc);
create index ideas_tags_idx          on public.ideas using gin (tags);
create index ideas_search_idx        on public.ideas using gin (search_vector);

create trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Imagens das ideias (arquivos ficam no Storage; aqui só o caminho)
-- ---------------------------------------------------------------------------
create table public.idea_images (
  id           uuid primary key default gen_random_uuid(),
  idea_id      uuid not null references public.ideas (id) on delete cascade,
  storage_path text not null unique,
  created_at   timestamptz not null default now()
);

create index idea_images_idea_idx on public.idea_images (idea_id);

-- ---------------------------------------------------------------------------
-- Projetos
-- ---------------------------------------------------------------------------
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  idea_id      uuid references public.ideas (id) on delete set null,
  title        text not null check (char_length(btrim(title)) > 0),
  status       text not null default 'pausado'
                 check (status in ('ativo', 'pausado', 'concluido')),
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index projects_status_idx on public.projects (status, updated_at desc);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Preenche/limpa completed_at conforme o status.
create or replace function public.projects_track_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'concluido' then
    if tg_op = 'INSERT' or old.status is distinct from 'concluido' then
      new.completed_at = coalesce(new.completed_at, now());
    end if;
  else
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger projects_completion
  before insert or update of status on public.projects
  for each row execute function public.projects_track_completion();

-- Limite de foco: no máximo 3 projetos ativos.
-- O lock evita que dois pedidos simultâneos furem o limite.
create or replace function public.projects_enforce_focus_limit()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  if new.status = 'ativo'
     and (tg_op = 'INSERT' or old.status is distinct from 'ativo') then
    perform pg_advisory_xact_lock(hashtext('ideacloud_focus_limit'));
    select count(*) into active_count
      from public.projects
     where status = 'ativo' and id <> new.id;
    if active_count >= 3 then
      raise exception 'FOCUS_LIMIT: no maximo 3 projetos ativos'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger projects_focus_limit
  before insert or update of status on public.projects
  for each row execute function public.projects_enforce_focus_limit();

-- ---------------------------------------------------------------------------
-- Etapas (checklist) de cada projeto
-- ---------------------------------------------------------------------------
create table public.steps (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null check (char_length(btrim(title)) > 0),
  done       boolean not null default false,
  position   integer not null default 0,
  is_next    boolean not null default false,   -- a "próxima ação" em destaque
  created_at timestamptz not null default now(),
  -- uma etapa concluída não pode continuar sendo a próxima
  check (not (done and is_next))
);

create index steps_project_pos_idx on public.steps (project_id, position);

-- No máximo uma "próxima ação" por projeto.
create unique index steps_one_next_per_project
  on public.steps (project_id) where is_next;

-- ---------------------------------------------------------------------------
-- Segurança: RLS ligada, sem políticas = acesso público totalmente bloqueado
-- ---------------------------------------------------------------------------
alter table public.ideas       enable row level security;
alter table public.idea_images enable row level security;
alter table public.projects    enable row level security;
alter table public.steps       enable row level security;

-- ---------------------------------------------------------------------------
-- "Lembra dessa?": sorteia uma ideia antiga do baú.
--   min_age:        só ideias criadas há pelo menos esse tempo
--   resurface_after: não repete uma ideia mostrada há menos que isso
-- ---------------------------------------------------------------------------
create or replace function public.random_old_idea(
  min_age          interval default interval '7 days',
  resurface_after  interval default interval '3 days'
)
returns setof public.ideas
language sql
stable
as $$
  select *
    from public.ideas
   where status = 'bau'
     and created_at <= now() - min_age
     and (last_surfaced_at is null or last_surfaced_at <= now() - resurface_after)
   order by random()
   limit 1;
$$;

-- A função só pode ser chamada pelo servidor (service_role).
revoke execute on function public.random_old_idea(interval, interval) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para as imagens
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('idea-images', 'idea-images', false)
on conflict (id) do nothing;
