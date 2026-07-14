import type { PlanName, BillingCycle } from '@/lib/billing/plans';

export interface InitiatePaymentInput {
  paymentId: string; // id de notre ligne `payments` (réconcilié au webhook)
  userId: string;
  email?: string;
  plan: PlanName;
  cycle: BillingCycle;
  amount: number; // FCFA
  currency: string; // 'XAF'
}

export interface InitiatePaymentResult {
  /** Référence de transaction côté PSP (stockée dans payments.provider_ref). */
  providerRef: string;
  /** URL de redirection pour payer (si applicable). */
  checkoutUrl?: string;
  /** Statut immédiat si le PSP confirme de façon synchrone (mock). */
  immediateStatus?: 'paid' | 'pending' | 'failed';
}

export interface WebhookResult {
  providerRef: string;
  status: 'paid' | 'failed' | 'pending';
}

export interface PSPProvider {
  readonly name: string;
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  /**
   * Vérifie l'authenticité d'un webhook (signature) et en extrait le résultat.
   * Renvoie null si la signature est invalide.
   */
  verifyWebhook(request: Request, rawBody: string): Promise<WebhookResult | null>;
}
