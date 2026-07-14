-- Migration 0004 : facturation & quotas (Visual-CV).
--
-- ⚠️ Cette base Supabase est PARTAGÉE avec d'autres applications (ERP/factures,
-- réservations, etc.). Une table `payments` y existe déjà et appartient au module
-- facturation (payments.invoice_id -> invoices). Pour éviter toute collision, les
-- tables de Visual-CV sont préfixées `cv_`.

-- =====================================================================
-- cv_subscriptions : une ligne par utilisateur
-- =====================================================================
create table if not exists public.cv_subscriptions (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  plan               text not null default 'Gratuit',   -- 'Gratuit' | 'Étudiant' | 'Professionnel'
  status             text not null default 'active',    -- 'active' | 'past_due' | 'canceled'
  billing_cycle      text,                              -- 'monthly' | 'annual'
  current_period_end timestamptz,                       -- null pour le plan gratuit
  updated_at         timestamptz not null default now()
);

alter table public.cv_subscriptions enable row level security;

-- Lecture par le propriétaire ; écriture réservée au service-role (webhook).
drop policy if exists "cv_subscriptions_select_own" on public.cv_subscriptions;
create policy "cv_subscriptions_select_own" on public.cv_subscriptions
  for select using (auth.uid() = user_id);

-- =====================================================================
-- cv_payments : journal auditable des tentatives de paiement
-- =====================================================================
create table if not exists public.cv_payments (
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

create index if not exists cv_payments_user_id_idx
  on public.cv_payments (user_id, created_at desc);

alter table public.cv_payments enable row level security;

drop policy if exists "cv_payments_select_own" on public.cv_payments;
create policy "cv_payments_select_own" on public.cv_payments
  for select using (auth.uid() = user_id);
-- Écriture : service-role uniquement.

-- =====================================================================
-- cv_quota_usage : compteur mensuel de générations
-- =====================================================================
create table if not exists public.cv_quota_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period  text not null,                 -- 'YYYY-MM'
  used    integer not null default 0,
  primary key (user_id, period)
);

alter table public.cv_quota_usage enable row level security;
-- Aucune policy : accès via service-role / RPC uniquement.

-- Consomme 1 unité de quota mensuel, de façon atomique.
-- p_limit = -1 => illimité (plan Professionnel).
-- Renvoie : allowed (bool), used (int), remaining (int, -1 si illimité).
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
  insert into public.cv_quota_usage (user_id, period, used)
  values (p_user_id, v_period, 0)
  on conflict (user_id, period) do nothing;

  -- Verrouille la ligne : empêche deux générations concurrentes de dépasser le quota.
  select qu.used into v_used
    from public.cv_quota_usage qu
    where qu.user_id = p_user_id and qu.period = v_period
    for update;

  if p_limit >= 0 and v_used >= p_limit then
    return query select false, v_used, 0;
    return;
  end if;

  -- `used` est qualifié : sans cela il est ambigu avec la colonne de sortie
  -- homonyme déclarée dans le RETURNS TABLE.
  update public.cv_quota_usage qu
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
