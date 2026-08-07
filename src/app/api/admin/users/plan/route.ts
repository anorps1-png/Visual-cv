import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { setUserPlan } from '@/lib/billing/subscription';
import { adminSetPlanSchema } from '@/lib/validation/cv';
import { logger } from '@/lib/logger';

// POST /api/admin/users/plan — change le plan d'un utilisateur { userId, plan }.
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if ('response' in guard) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const input = adminSetPlanSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? 'Requête invalide' },
        { status: 400 }
      );
    }

    await setUserPlan(input.data.userId, input.data.plan);
    logger.info('admin.plan_changed', {
      by: guard.user.id,
      userId: input.data.userId,
      plan: input.data.plan,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('admin.set_plan_route_failed', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
