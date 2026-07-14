-- Migration 0003 : rate limiting côté serveur (fenêtre fixe), stocké en Postgres.
-- Atomique : la RPC incrémente et décide en une seule requête -> pas de race
-- condition entre instances serverless.

create table if not exists public.rate_limits (
  id           text primary key,          -- clé "action:identifiant" (ex : "generate:<user_id>")
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

alter table public.rate_limits enable row level security;
-- Aucune policy : accès uniquement via service-role (RPC ci-dessous / client admin).

-- Incrémente le compteur pour `p_key` dans une fenêtre de `p_window_seconds`.
-- Renvoie une ligne : allowed (bool), remaining (int), retry_after (secondes).
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
  -- Verrouille (ou crée) la ligne pour éviter les incréments concurrents.
  insert into public.rate_limits (id, window_start, count)
  values (p_key, v_now, 0)
  on conflict (id) do nothing;

  select * into v_row from public.rate_limits where id = p_key for update;

  -- Fenêtre expirée -> on la réinitialise.
  if v_row.window_start + make_interval(secs => p_window_seconds) <= v_now then
    v_row.window_start := v_now;
    v_row.count := 0;
  end if;

  if v_row.count >= p_limit then
    -- Limite atteinte : on refuse sans incrémenter.
    update public.rate_limits
      set window_start = v_row.window_start
      where id = p_key;
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
