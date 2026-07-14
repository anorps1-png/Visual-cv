import type {
  PSPProvider,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookResult,
} from '@/lib/payments/provider';

/**
 * Adaptateur sandbox : confirme le paiement immédiatement, sans PSP réel.
 * Permet de tester tout le flux abonnement/quotas SANS compte marchand.
 * Activé via PAYMENT_PROVIDER=mock (défaut).
 */
export class MockProvider implements PSPProvider {
  readonly name = 'mock';

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    return {
      providerRef: `mock_${input.paymentId}`,
      immediateStatus: 'paid',
    };
  }

  async verifyWebhook(_request: Request, rawBody: string): Promise<WebhookResult | null> {
    try {
      const body = JSON.parse(rawBody);
      if (!body.providerRef) return null;
      return {
        providerRef: String(body.providerRef),
        status: body.status === 'failed' ? 'failed' : 'paid',
      };
    } catch {
      return null;
    }
  }
}
