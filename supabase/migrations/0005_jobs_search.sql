-- Migration 0005 : recherche d'offres en base (fin du scraping dans la requête).
--
-- Avant : chaque recherche scrapait des sites tiers en direct, chargeait TOUTES
-- les offres en mémoire, puis re-parsait la description de chacune pour deviner
-- si elle était périmée. Latence élevée, fragile, et non scalable.
-- Après : le cron alimente la table, la recherche est une requête SQL indexée.

-- Date limite de candidature, extraite au scraping (null si indétectable).
-- Filtrer en SQL évite de ré-analyser chaque description à chaque requête.
alter table public.jobs
  add column if not exists expires_at timestamptz;

-- Date du dernier passage du scraper sur cette offre.
alter table public.jobs
  add column if not exists last_seen_at timestamptz not null default now();

create index if not exists jobs_expires_at_idx
  on public.jobs (expires_at);

-- Colonne de recherche plein-texte (français), maintenue automatiquement par
-- Postgres. Remplace le ILIKE appliqué à toutes les lignes chargées en mémoire.
alter table public.jobs
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'french',
      coalesce(title, '') || ' ' ||
      coalesce(company, '') || ' ' ||
      coalesce(location, '') || ' ' ||
      coalesce(description, '')
    )
  ) stored;

create index if not exists jobs_search_idx
  on public.jobs
  using gin (search_vector);
