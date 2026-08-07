import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET /api/admin/stats — chiffres clés du produit.
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ('response' in guard) return guard.response;

  try {
    const admin = getAdminClient();
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Nombre d'utilisateurs (API admin auth).
    const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    // total est exposé sur la réponse paginée.
    const userCount = (usersPage as unknown as { total?: number })?.total ?? 0;

    // CV générés (toutes lignes).
    const { count: cvCount } = await admin.from('cvs').select('*', { count: 'exact', head: true });

    // Répartition par plan.
    const { data: subs } = await admin.from('subscriptions').select('plan, status, current_period_end');
    const now = Date.now();
    const planBreakdown: Record<string, number> = { Gratuit: 0, Étudiant: 0, Professionnel: 0 };
    for (const s of subs || []) {
      const expired = s.current_period_end && new Date(s.current_period_end).getTime() < now;
      const plan = s.status === 'active' && !expired ? s.plan : 'Gratuit';
      if (plan in planBreakdown) planBreakdown[plan] += 1;
    }

    // Revenus du mois (paiements confirmés).
    const monthStart = `${period}-01T00:00:00.000Z`;
    const { data: pays } = await admin
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'paid')
      .gte('created_at', monthStart);
    const revenueThisMonth = (pays || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        userCount,
        cvCount: cvCount ?? 0,
        planBreakdown,
        revenueThisMonth, // en FCFA
      },
    });
  } catch (error) {
    logger.error('admin.stats_failed', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
