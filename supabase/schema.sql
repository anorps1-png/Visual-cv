-- =====================================================================
-- Visual-CV — schéma complet, pour un projet Supabase DÉDIÉ.
--
-- À exécuter UNE FOIS dans le SQL Editor d'un projet Supabase vierge.
-- Remplace les migrations 0001→0005, qui étaient conçues pour cohabiter
-- avec d'autres applications dans une base partagée. Ici, plus de collision
-- possible : les tables reprennent leurs noms naturels (plus de préfixe cv_).
--
-- Idempotent : ré-exécutable sans risque.
-- =====================================================================

-- =====================================================================
-- cvs — historique des candidatures, scopé par utilisateur
-- =====================================================================
create table if not exists public.cvs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  job_title     text,
  company_name  text,
  original_text text,
  generated_cv  jsonb,
  cover_letter  text,
  email_text    text,
  created_at    timestamptz not null default now()
);

create index if not exists cvs_user_id_created_at_idx
  on public.cvs (user_id, created_at desc);

alter table public.cvs enable row level security;

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
-- jobs — offres d'emploi (alimentées par le cron, pas par la requête)
-- =====================================================================
create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  company      text,
  location     text,
  description  text not null,
  source_url   text unique,          -- unique => upsert idempotent au scraping
  expires_at   timestamptz,          -- date limite de candidature (si détectée)
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  -- Recherche plein-texte française, maintenue automatiquement par Postgres.
  search_vector tsvector generated always as (
    to_tsvector(
      'french',
      coalesce(title, '') || ' ' ||
      coalesce(company, '') || ' ' ||
      coalesce(location, '') || ' ' ||
      coalesce(description, '')
    )
  ) stored
);

create index if not exists jobs_created_at_idx on public.jobs (created_at desc);
create index if not exists jobs_expires_at_idx on public.jobs (expires_at);
create index if not exists jobs_search_idx on public.jobs using gin (search_vector);

alter table public.jobs enable row level security;

-- Lecture publique ; écriture réservée au service-role (cron).
drop policy if exists "jobs_select_all" on public.jobs;
create policy "jobs_select_all" on public.jobs
  for select using (true);

-- =====================================================================
-- rate_limits — anti-abus des endpoints coûteux (fenêtre fixe)
-- =====================================================================
create table if not exists public.rate_limits (
  id           text primary key,     -- "action:identifiant", ex : "generate:<user_id>"
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

alter table public.rate_limits enable row level security;
-- Aucune policy : accès via service-role / RPC uniquement.

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.rate_limits%rowtype;
begin
  insert into public.rate_limits (id, window_start, count)
  values (p_key, v_now, 0)
  on conflict (id) do nothing;

  -- Verrou : empêche deux requêtes concurrentes de dépasser la limite.
  select * into v_row from public.rate_limits where id = p_key for update;

  if v_row.window_start + make_interval(secs => p_window_seconds) <= v_now then
    v_row.window_start := v_now;
    v_row.count := 0;
  end if;

  if v_row.count >= p_limit then
    update public.rate_limits set window_start = v_row.window_start where id = p_key;
    return query select
      false,
      0,
      ceil(extract(epoch from (v_row.window_start + make_interval(secs => p_window_seconds) - v_now)))::integer;
    return;
  end if;

  v_row.count := v_row.count + 1;
  update public.rate_limits
    set window_start = v_row.window_start, count = v_row.count
    where id = p_key;

  return query select true, (p_limit - v_row.count), 0;
end;
$$;

-- =====================================================================
-- subscriptions — plan courant par utilisateur
-- =====================================================================
create table if not exists public.subscriptions (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  plan               text not null default 'Gratuit',   -- 'Gratuit' | 'Étudiant' | 'Professionnel'
  status             text not null default 'active',    -- 'active' | 'past_due' | 'canceled'
  billing_cycle      text,                              -- 'monthly' | 'annual'
  current_period_end timestamptz,
  updated_at         timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Lecture par le propriétaire ; écriture réservée au webhook (service-role).
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- =====================================================================
-- payments — journal auditable des paiements
-- =====================================================================
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  plan          text not null,
  billing_cycle text not null default 'monthly',
  amount        integer not null,                -- FCFA
  currency      text not null default 'XAF',
  provider      text not null,                   -- 'mock' | 'kpay'
  provider_ref  text unique,                     -- référence PSP => idempotence webhook
  status        text not null default 'pending', -- 'pending' | 'paid' | 'failed'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- =====================================================================
-- quota_usage — compteur mensuel de générations
-- =====================================================================
create table if not exists public.quota_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period  text not null,                 -- 'YYYY-MM'
  used    integer not null default 0,
  primary key (user_id, period)
);

alter table public.quota_usage enable row level security;
-- Aucune policy : accès via service-role / RPC uniquement.

-- Consomme 1 génération sur le quota mensuel, de façon atomique.
-- p_limit = -1 => illimité (plan Professionnel).
create or replace function public.consume_generation_quota(
  p_user_id uuid,
  p_limit integer
)
returns table (allowed boolean, used integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period text := to_char(now(), 'YYYY-MM');
  v_used integer;
begin
  insert into public.quota_usage (user_id, period, used)
  values (p_user_id, v_period, 0)
  on conflict (user_id, period) do nothing;

  -- Verrou : empêche deux générations concurrentes de dépasser le quota.
  select qu.used into v_used
    from public.quota_usage qu
    where qu.user_id = p_user_id and qu.period = v_period
    for update;

  if p_limit >= 0 and v_used >= p_limit then
    return query select false, v_used, 0;
    return;
  end if;

  -- `used` est qualifié : sinon ambigu avec la colonne de sortie homonyme.
  update public.quota_usage qu
    set used = qu.used + 1
    where qu.user_id = p_user_id and qu.period = v_period
    returning qu.used into v_used;

  if p_limit < 0 then
    return query select true, v_used, -1;
  else
    return query select true, v_used, (p_limit - v_used);
  end if;
end;
$$;
