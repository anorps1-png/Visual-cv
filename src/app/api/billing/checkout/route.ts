import { NextResponse } from 'next/server';
import { getAuthUser, getAdminClient } from '@/lib/supabase/server';
import { isValidPlan, amountFor, type BillingCycle } from '@/lib/billing/plans';
import { activateSubscription } from '@/lib/billing/subscription';
import { getPaymentProvider } from '@/lib/payments';

// Initie un paiement d'abonnement. Auth requise.
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
    }

    const { plan, cycle } = await request.json();
    const billingCycle: BillingCycle = cycle === 'annual' ? 'annual' : 'monthly';

    if (!isValidPlan(plan) || plan === 'Gratuit') {
      return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 });
    }

    // Le montant est calculé SERVEUR (jamais reçu du client).
    const amount = amountFor(plan, billingCycle);
    const admin = getAdminClient();
    const provider = getPaymentProvider();

    // 1. Journalise la tentative (pending).
    const { data: payment, error: insErr } = await admin
      .from('payments')
      .insert({
        user_id: auth.user.id,
        plan,
        billing_cycle: billingCycle,
        amount,
        currency: 'XAF',
        provider: provider.name,
        status: 'pending',
      })
      .select()
      .single();

    if (insErr || !payment) throw insErr ?? new Error('Insertion paiement échouée');

    // 2. Initie côté PSP.
    const result = await provider.initiatePayment({
      paymentId: payment.id,
      userId: auth.user.id,
      email: auth.user.email,
      plan,
      cycle: billingCycle,
      amount,
      currency: 'XAF',
    });

    // 3. Stocke la référence PSP (clé d'idempotence du webhook).
    await admin
      .from('payments')
      .update({ provider_ref: result.providerRef, updated_at: new Date().toISOString() })
      .eq('id', payment.id);

    // 4. Confirmation synchrone (mock) : on active immédiatement.
    if (result.immediateStatus === 'paid') {
      await admin
        .from('payments')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', payment.id);
      await activateSubscription(auth.user.id, plan, billingCycle);

      return NextResponse.json({ success: true, status: 'paid', plan });
    }

    // 5. Sinon : redirection vers le paiement Mobile Money.
    return NextResponse.json({
      success: true,
      status: 'pending',
      checkoutUrl: result.checkoutUrl ?? null,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: "Impossible d'initier le paiement." }, { status: 500 });
  }
}
