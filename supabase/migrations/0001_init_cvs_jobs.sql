-- Migration 0001 : persistance des CV et des offres d'emploi
-- Remplace le stockage par fichiers JSON (src/lib/data/*.json) par des tables Postgres.
-- À exécuter dans le SQL Editor de Supabase (ou via `supabase db push`).

-- =====================================================================
-- Table : cvs  (historique de candidatures, scopé par utilisateur)
-- =====================================================================
create table if not exists public.cvs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  job_title     text,
  company_name  text,
  original_text text,
  generated_cv  jsonb,          -- objet CV complet généré par l'IA
  cover_letter  text,
  email_text    text,
  created_at    timestamptz not null default now()
);

create index if not exists cvs_user_id_created_at_idx
  on public.cvs (user_id, created_at desc);

alter table public.cvs enable row level security;

-- Chaque utilisateur ne voit / n'écrit / ne supprime que ses propres CV.
drop policy if exists "cvs_select_own" on public.cvs;
create policy "cvs_select_own" on public.cvs
  for select using (auth.uid() = user_id);

drop policy if exists "cvs_insert_own" on public.cvs;
create policy "cvs_insert_own" on public.cvs
  for insert with check (auth.uid() = user_id);

drop policy if exists "cvs_delete_own" on public.cvs;
create policy "cvs_delete_own" on public.cvs
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- Table : jobs  (offres d'emploi, lecture publique, écriture serveur)
-- =====================================================================
create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  company     text,
  location    text,
  description text not null,
  source_url  text unique,      -- unique => upsert idempotent lors du scraping
  created_at  timestamptz not null default now()
);

create index if not exists jobs_created_at_idx
  on public.jobs (created_at desc);

alter table public.jobs enable row level security;

-- Lecture publique des offres (anon + authentifié).
drop policy if exists "jobs_select_all" on public.jobs;
create policy "jobs_select_all" on public.jobs
  for select using (true);

-- Aucune policy d'écriture : les insertions se font uniquement via la
-- clé service-role (SUPABASE_SERVICE_ROLE_KEY) côté serveur, qui contourne RLS.
