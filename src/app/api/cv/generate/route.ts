import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { enforceRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import {
  getEffectiveSubscription,
  consumeGenerationQuota,
  getCurrentUsage,
} from '@/lib/billing/subscription';
import { getPlan } from '@/lib/billing/plans';
import { generateRequestSchema } from '@/lib/validation/cv';
import { generateApplication } from '@/lib/ai/generate';
import { logger } from '@/lib/logger';

// La génération IA est coûteuse : login obligatoire + rate limiting par utilisateur.
const GENERATE_LIMIT = 10; // requêtes
const GENERATE_WINDOW = 60 * 60; // par heure

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Connexion requise pour générer un dossier de candidature.' },
        { status: 401 }
      );
    }

    const rl = await enforceRateLimit(`generate:${auth.user.id}`, GENERATE_LIMIT, GENERATE_WINDOW);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter);
    }

    const body = await request.json().catch(() => null);
    const input = generateRequestSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? 'Requête invalide' },
        { status: 400 }
      );
    }
    const { cvText, jobDescription, provider: selectedProvider } = input.data;

    const subscription = await getEffectiveSubscription(auth.user.id);
    const planDef = getPlan(subscription.plan);

    // Pré-contrôle du quota AVANT l'appel IA : on refuse tout de suite si
    // l'utilisateur est déjà au plafond, sans déclencher de génération coûteuse.
    // (Le décompte réel, atomique, n'aura lieu qu'en cas de succès, plus bas.)
    if (planDef.monthlyQuota >= 0) {
      const used = await getCurrentUsage(auth.user.id);
      if (used >= planDef.monthlyQuota) {
        return NextResponse.json(
          {
            error:
              `Vous avez atteint la limite de votre plan ${subscription.plan} ` +
              `(${planDef.monthlyQuota} génération(s)/mois). Passez à un plan supérieur pour continuer.`,
            code: 'QUOTA_EXCEEDED',
            plan: subscription.plan,
          },
          { status: 402 }
        );
      }
    }

    // Génération avec bascule automatique vers l'autre fournisseur en cas d'échec
    // (une clé expirée ne doit pas casser le produit silencieusement).
    const result = await generateApplication(selectedProvider, cvText, jobDescription);
    if (!result) {
      return NextResponse.json(
        {
          error:
            "Le service de génération IA est momentanément indisponible. " +
            'Veuillez réessayer dans quelques instants.',
        },
        { status: 503 }
      );
    }

    // Succès : c'est maintenant seulement qu'on consomme une unité de quota.
    const quota = await consumeGenerationQuota(auth.user.id, planDef.monthlyQuota);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            `Vous avez atteint la limite de votre plan ${subscription.plan} ` +
            `(${planDef.monthlyQuota} génération(s)/mois). Passez à un plan supérieur pour continuer.`,
          code: 'QUOTA_EXCEEDED',
          plan: subscription.plan,
        },
        { status: 402 }
      );
    }

    if (result.fellBack) {
      logger.warn('cv.generate.fell_back', { from: selectedProvider, to: result.provider });
    }

    return NextResponse.json({ success: true, data: result.data, provider: result.provider });
  } catch (error) {
    logger.error('cv.generate.failed', error);
    return NextResponse.json({ error: 'Échec de la génération IA' }, { status: 500 });
  }
}
