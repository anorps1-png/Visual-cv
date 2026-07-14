import { getAdminClient } from '@/lib/supabase/server';
import { getPlan, type PlanName, type BillingCycle } from '@/lib/billing/plans';

export interface EffectiveSubscription {
  plan: PlanName;
  status: string;
  billingCycle: BillingCycle | null;
  currentPeriodEnd: string | null;
}

/**
 * Abonnement EFFECTIF : si la période payée est expirée, on retombe sur 'Gratuit'
 * (on n'honore jamais une ligne premium périmée). Lecture via service-role.
 */
export async function getEffectiveSubscription(userId: string): Promise<EffectiveSubscription> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from('subscriptions')
    .select('plan, status, billing_cycle, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return { plan: 'Gratuit', status: 'active', billingCycle: null, currentPeriodEnd: null };
  }

  const expired =
    data.current_period_end != null &&
    new Date(data.current_period_end).getTime() < Date.now();

  if (expired || data.status !== 'active' || data.plan === 'Gratuit') {
    return {
      plan: 'Gratuit',
      status: expired ? 'past_due' : data.status,
      billingCycle: null,
      currentPeriodEnd: data.current_period_end,
    };
  }

  return {
    plan: getPlan(data.plan).name,
    status: data.status,
    billingCycle: (data.billing_cycle as BillingCycle) ?? null,
    currentPeriodEnd: data.current_period_end,
  };
}

/**
 * Consomme 1 génération sur le quota mensuel (atomique, via RPC).
 * remaining = -1 => illimité.
 */
export async function consumeGenerationQuota(
  userId: string,
  monthlyQuota: number
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const admin = getAdminClient();
  const { data, error } = await admin.rpc('consume_generation_quota', {
    p_user_id: userId,
    p_limit: monthlyQuota,
  });

  if (error) {
    console.error('consume_generation_quota RPC error:', error);
    // Fail-closed : en cas de doute on refuse, pour ne pas offrir du premium gratuit.
    return { allowed: false, used: 0, remaining: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: !!row?.allowed,
    used: row?.used ?? 0,
    remaining: row?.remaining ?? 0,
  };
}

/** Usage mensuel courant (sans consommer). */
export async function getCurrentUsage(userId: string): Promise<number> {
  const admin = getAdminClient();
  const period = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { data } = await admin
    .from('quota_usage')
    .select('used')
    .eq('user_id', userId)
    .eq('period', period)
    .maybeSingle();
  return data?.used ?? 0;
}

/** Active/prolonge un abonnement après paiement confirmé. */
export async function activateSubscription(
  userId: string,
  plan: PlanName,
  cycle: BillingCycle
): Promise<void> {
  const admin = getAdminClient();
  const end = new Date();
  if (cycle === 'annual') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      plan,
      status: 'active',
      billing_cycle: cycle,
      current_period_end: end.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('activateSubscription error:', error);
    throw error;
  }
}
