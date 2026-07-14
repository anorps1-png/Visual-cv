// Définition centralisée des plans : source de vérité partagée serveur/front.
// Les prix sont en FCFA (XAF).

export type PlanName = 'Gratuit' | 'Étudiant' | 'Professionnel';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanDef {
  name: PlanName;
  /** Générations de CV autorisées par mois. -1 = illimité. */
  monthlyQuota: number;
  priceMonthly: number;
  priceAnnualPerMonth: number;
  premium: boolean;
}

export const PLANS: Record<PlanName, PlanDef> = {
  Gratuit: {
    name: 'Gratuit',
    monthlyQuota: 1,
    priceMonthly: 0,
    priceAnnualPerMonth: 0,
    premium: false,
  },
  Étudiant: {
    name: 'Étudiant',
    monthlyQuota: 5,
    priceMonthly: 2500,
    priceAnnualPerMonth: 2000,
    premium: true,
  },
  Professionnel: {
    name: 'Professionnel',
    monthlyQuota: -1, // illimité
    priceMonthly: 7500,
    priceAnnualPerMonth: 6000,
    premium: true,
  },
};

export function isValidPlan(value: unknown): value is PlanName {
  return value === 'Gratuit' || value === 'Étudiant' || value === 'Professionnel';
}

export function getPlan(name: string | null | undefined): PlanDef {
  return isValidPlan(name) ? PLANS[name] : PLANS.Gratuit;
}

/** Montant total facturé (FCFA) pour un plan + cycle donné. */
export function amountFor(plan: PlanName, cycle: BillingCycle): number {
  const def = PLANS[plan];
  return cycle === 'annual' ? def.priceAnnualPerMonth * 12 : def.priceMonthly;
}
