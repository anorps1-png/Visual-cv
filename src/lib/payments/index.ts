import type { PSPProvider } from '@/lib/payments/provider';
import { MockProvider } from '@/lib/payments/mock';
import { KPayProvider } from '@/lib/payments/kpay';

let singleton: PSPProvider | null = null;

/**
 * Sélectionne l'adaptateur PSP selon PAYMENT_PROVIDER.
 * 'mock' (défaut) : confirme immédiatement -> testable sans compte marchand.
 * 'kpay' : paiement Mobile Money réel (nécessite les clés KPAY_*).
 */
export function getPaymentProvider(): PSPProvider {
  if (singleton) return singleton;
  const which = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
  singleton = which === 'kpay' ? new KPayProvider() : new MockProvider();
  return singleton;
}

export * from '@/lib/payments/provider';
