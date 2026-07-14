import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/lib/payments';
import { activateSubscription } from '@/lib/billing/subscription';
import { isValidPlan, type BillingCycle } from '@/lib/billing/plans';
import { logger } from '@/lib/logger';

// Webhook PSP : confirme (ou rejette) un paiement. Idempotent.
// Pas d'auth utilisateur : l'authenticité vient de la signature du PSP.
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const provider = getPaymentProvider();

    const result = await provider.verifyWebhook(request, rawBody);
    if (!result) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const admin = getAdminClient();

    const { data: payment, error } = await admin
      .from('payments')
      .select('*')
      .eq('provider_ref', result.providerRef)
      .maybeSingle();

    if (error || !payment) {
      logger.error('billing.webhook.payment_not_found', undefined, { providerRef: result.providerRef });
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    // Idempotence : déjà traité -> on acquitte sans rejouer l'activation.
    if (payment.status === 'paid') {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    if (result.status === 'paid') {
      await admin
        .from('payments')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', payment.id);

      if (isValidPlan(payment.plan) && payment.plan !== 'Gratuit') {
        const cycle: BillingCycle = payment.billing_cycle === 'annual' ? 'annual' : 'monthly';
        await activateSubscription(payment.user_id, payment.plan, cycle);
      }
    } else if (result.status === 'failed') {
      await admin
        .from('payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', payment.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('billing.webhook.failed', error);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 });
  }
}
