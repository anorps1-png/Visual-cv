import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PLANS, getPlan, isValidPlan, amountFor } from '@/lib/billing/plans';

describe('plans — quotas et tarifs', () => {
  it('applique les quotas annoncés (Gratuit=1, Étudiant=5, Pro=illimité)', () => {
    expect(PLANS.Gratuit.monthlyQuota).toBe(1);
    expect(PLANS['Étudiant'].monthlyQuota).toBe(5);
    expect(PLANS.Professionnel.monthlyQuota).toBe(-1); // -1 = illimité
  });

  // Un plan inconnu (ou falsifié côté client) ne doit JAMAIS donner du premium.
  it('retombe sur Gratuit pour un plan inconnu, null ou falsifié', () => {
    expect(getPlan('Pirate').name).toBe('Gratuit');
    expect(getPlan(null).name).toBe('Gratuit');
    expect(getPlan(undefined).name).toBe('Gratuit');
    expect(getPlan('Professionnel ').name).toBe('Gratuit'); // espace en trop
  });

  it('valide correctement les noms de plans', () => {
    expect(isValidPlan('Étudiant')).toBe(true);
    expect(isValidPlan('etudiant')).toBe(false); // sensible à la casse/accent
    expect(isValidPlan(42)).toBe(false);
  });

  it("calcule le montant annuel sur 12 mois au tarif réduit", () => {
    expect(amountFor('Étudiant', 'monthly')).toBe(2500);
    expect(amountFor('Étudiant', 'annual')).toBe(2000 * 12);
    expect(amountFor('Professionnel', 'annual')).toBe(6000 * 12);
  });

  it('facture 0 pour le plan Gratuit', () => {
    expect(amountFor('Gratuit', 'monthly')).toBe(0);
  });
});

// getEffectiveSubscription dépend de Supabase : on mocke le client admin pour
// tester la logique d'expiration, qui est la partie critique (un abonnement
// périmé ne doit jamais rester premium).
const maybeSingle = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  getAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
    }),
  }),
}));

const { getEffectiveSubscription } = await import('@/lib/billing/subscription');

describe('getEffectiveSubscription — expiration', () => {
  beforeEach(() => maybeSingle.mockReset());

  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();

  it('honore un abonnement actif non expiré', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        plan: 'Professionnel',
        status: 'active',
        billing_cycle: 'monthly',
        current_period_end: future,
      },
      error: null,
    });
    const sub = await getEffectiveSubscription('u1');
    expect(sub.plan).toBe('Professionnel');
  });

  // Le cœur du sujet : sans ce garde-fou, un utilisateur garde le premium à vie.
  it('retombe sur Gratuit si la période est expirée', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        plan: 'Professionnel',
        status: 'active',
        billing_cycle: 'monthly',
        current_period_end: past,
      },
      error: null,
    });
    const sub = await getEffectiveSubscription('u1');
    expect(sub.plan).toBe('Gratuit');
    expect(sub.status).toBe('past_due');
  });

  it("retombe sur Gratuit si le statut n'est pas actif", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        plan: 'Étudiant',
        status: 'canceled',
        billing_cycle: 'monthly',
        current_period_end: future,
      },
      error: null,
    });
    expect((await getEffectiveSubscription('u1')).plan).toBe('Gratuit');
  });

  it('retombe sur Gratuit si aucun abonnement ou en cas d’erreur DB', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect((await getEffectiveSubscription('u1')).plan).toBe('Gratuit');

    maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect((await getEffectiveSubscription('u1')).plan).toBe('Gratuit');
  });
});
