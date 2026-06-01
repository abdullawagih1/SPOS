-- SPOS Supabase schema
-- Run this in Supabase SQL editor to initialize the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users (handled by Supabase Auth) ────────────────────────────────────────
-- Extend auth.users with app-specific fields
create table public.user_profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  plan        text not null default 'free' check (plan in ('free','pro','startup','agency','enterprise')),
  credits_remaining integer not null default 100,
  stripe_customer_id text unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Projects ─────────────────────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  status      text not null default 'active' check (status in ('active','archived')),
  startup_dna jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);
create index projects_updated_at_idx on public.projects(updated_at desc);

-- ─── Ideas ────────────────────────────────────────────────────────────────────
create table public.ideas (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  raw_text    text not null,
  parsed_dna  jsonb,
  created_at  timestamptz not null default now()
);

create index ideas_project_id_idx on public.ideas(project_id);

-- ─── Prompt Templates ─────────────────────────────────────────────────────────
create table public.prompt_templates (
  id                 text primary key,
  industry           text not null,
  stage              text not null,
  deliverable_type   text not null,
  role_layer         text not null,
  context_layer      text not null,
  constraint_layer   text not null,
  format_layer       text not null,
  model              text not null default 'claude-sonnet-4-20250514',
  version            integer not null default 1,
  avg_quality_score  float not null default 7.5,
  use_count          integer not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ─── Generated Assets ─────────────────────────────────────────────────────────
create table public.generated_assets (
  id                  uuid primary key default uuid_generate_v4(),
  project_id          uuid not null references public.projects(id) on delete cascade,
  template_id         text not null,
  deliverable_type    text not null,
  content             text not null,
  quality_score       float,
  model_used          text not null,
  tokens_used         integer not null default 0,
  generation_time_ms  integer not null default 0,
  created_at          timestamptz not null default now()
);

create index generated_assets_project_id_idx on public.generated_assets(project_id);

-- ─── Generation Jobs ──────────────────────────────────────────────────────────
create table public.generation_jobs (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  asset_type      text not null,
  status          text not null default 'pending' check (status in ('pending','running','complete','failed')),
  asset_id        uuid references public.generated_assets(id),
  error_message   text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index generation_jobs_project_id_idx on public.generation_jobs(project_id);
create index generation_jobs_status_idx on public.generation_jobs(status);

-- ─── Feedback ─────────────────────────────────────────────────────────────────
create table public.feedback (
  id          uuid primary key default uuid_generate_v4(),
  asset_id    uuid not null references public.generated_assets(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  rating      smallint check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.user_profiles    enable row level security;
alter table public.projects         enable row level security;
alter table public.ideas            enable row level security;
alter table public.generated_assets enable row level security;
alter table public.generation_jobs  enable row level security;
alter table public.feedback         enable row level security;
alter table public.prompt_templates enable row level security;

-- user_profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on public.user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.user_profiles for update using (auth.uid() = id);

-- projects: users can only CRUD their own projects
create policy "Users can CRUD own projects"
  on public.projects for all using (auth.uid() = user_id);

-- ideas: users access via project ownership
create policy "Users can access their project ideas"
  on public.ideas for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- generated_assets: same pattern
create policy "Users can access their project assets"
  on public.generated_assets for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- generation_jobs: same pattern
create policy "Users can access their project jobs"
  on public.generation_jobs for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- feedback: users can insert/view their own
create policy "Users can insert feedback"
  on public.feedback for insert with check (auth.uid() = user_id);
create policy "Users can view own feedback"
  on public.feedback for select using (auth.uid() = user_id);

-- prompt_templates: readable by all authenticated users
create policy "Authenticated users can read templates"
  on public.prompt_templates for select using (auth.role() = 'authenticated');

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime for generation_jobs so frontend can subscribe to job completion
alter publication supabase_realtime add table public.generation_jobs;
alter publication supabase_realtime add table public.generated_assets;
