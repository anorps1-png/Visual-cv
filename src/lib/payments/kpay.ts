import crypto from 'crypto';
import type {
  PSPProvider,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookResult,
} from '@/lib/payments/provider';

/**
 * Adaptateur KPay (Mobile Money Cameroun).
 *
 * ⚠️ À FINALISER avec la doc de TON tableau de bord marchand KPay : les noms
 * d'endpoints, le format du payload et le schéma de signature du webhook
 * varient d'un PSP à l'autre. Points à confirmer : `// TODO KPAY:`.
 * Tant que ce n'est pas confirmé, garde PAYMENT_PROVIDER=mock.
 *
 * Env attendues : KPAY_BASE_URL, KPAY_API_KEY, KPAY_WEBHOOK_SECRET
 */
export class KPayProvider implements PSPProvider {
  readonly name = 'kpay';

  private baseUrl = process.env.KPAY_BASE_URL || '';
  private apiKey = process.env.KPAY_API_KEY || '';
  private webhookSecret = process.env.KPAY_WEBHOOK_SECRET || '';

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('KPay non configuré (KPAY_BASE_URL / KPAY_API_KEY manquants).');
    }

    const appUrl = process.env.APP_URL || '';

    // TODO KPAY: adapter le chemin et le corps à la doc réelle de l'API KPay.
    const res = await fetch(`${this.baseUrl}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: input.currency,
        reference: input.paymentId, // notre id, renvoyé dans le webhook
        description: `Abonnement ${input.plan} (${input.cycle})`,
        customer_email: input.email,
        callback_url: `${appUrl}/api/billing/webhook`,
        return_url: `${appUrl}/?payment=done`,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`KPay initiate a échoué (${res.status}): ${text}`);
    }

    const data = await res.json();
    // TODO KPAY: ajuster les noms de champs selon la réponse réelle.
    return {
      providerRef: String(data.transaction_id ?? data.reference ?? input.paymentId),
      checkoutUrl: data.payment_url ?? data.checkout_url,
      immediateStatus: 'pending',
    };
  }

  async verifyWebhook(request: Request, rawBody: string): Promise<WebhookResult | null> {
    // TODO KPAY: adapter le nom de l'en-tête et l'algorithme de signature.
    const signature = request.headers.get('x-kpay-signature') || '';
    if (this.webhookSecret) {
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');
      // Comparaison à temps constant (anti timing attack).
      const ok =
        signature.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      if (!ok) {
        console.error('KPay webhook: signature invalide.');
        return null;
      }
    }

    try {
      const body = JSON.parse(rawBody);
      // TODO KPAY: ajuster les noms de champs (référence + statut).
      const providerRef = String(body.transaction_id ?? body.reference ?? '');
      if (!providerRef) return null;

      const rawStatus = String(body.status ?? '').toLowerCase();
      const status: WebhookResult['status'] =
        rawStatus === 'success' || rawStatus === 'paid' || rawStatus === 'completed'
          ? 'paid'
          : rawStatus === 'failed' || rawStatus === 'canceled'
            ? 'failed'
            : 'pending';

      return { providerRef, status };
    } catch {
      return null;
    }
  }
}
