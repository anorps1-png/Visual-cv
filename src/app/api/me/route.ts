import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { getEffectiveSubscription, getCurrentUsage } from '@/lib/billing/subscription';
import { getPlan } from '@/lib/billing/plans';
import { logger } from '@/lib/logger';

// Renvoie le plan RÉEL + l'usage courant pour l'utilisateur connecté.
// Appelé par le front à la connexion : le plan ne vit plus dans un état local.
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const subscription = await getEffectiveSubscription(auth.user.id);
    const planDef = getPlan(subscription.plan);
    const used = await getCurrentUsage(auth.user.id);

    return NextResponse.json({
      success: true,
      email: auth.user.email,
      plan: subscription.plan,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      currentPeriodEnd: subscription.currentPeriodEnd,
      usage: {
        used,
        limit: planDef.monthlyQuota, // -1 = illimité
        remaining: planDef.monthlyQuota < 0 ? -1 : Math.max(0, planDef.monthlyQuota - used),
      },
    });
  } catch (error) {
    logger.error('me.fetch_failed', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
