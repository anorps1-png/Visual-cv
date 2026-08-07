import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminClient } from '@/lib/supabase/server';
import { getPlan } from '@/lib/billing/plans';
import { logger } from '@/lib/logger';

// GET /api/admin/users?page=1 — comptes + plan effectif + usage du mois.
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ('response' in guard) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const perPage = 50;

    const admin = getAdminClient();
    const period = new Date().toISOString().slice(0, 7);

    const { data: usersPage, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = usersPage?.users ?? [];

    // On charge abonnements + usage en masse plutôt qu'une requête par utilisateur.
    const ids = users.map((u) => u.id);
    const [{ data: subs }, { data: usage }] = await Promise.all([
      admin.from('subscriptions').select('user_id, plan, status, current_period_end').in('user_id', ids),
      admin.from('quota_usage').select('user_id, used').eq('period', period).in('user_id', ids),
    ]);

    const subByUser = new Map((subs || []).map((s) => [s.user_id, s]));
    const usageByUser = new Map((usage || []).map((u) => [u.user_id, u.used]));
    const now = Date.now();

    const rows = users.map((u) => {
      const sub = subByUser.get(u.id);
      const expired = sub?.current_period_end && new Date(sub.current_period_end).getTime() < now;
      const plan = sub && sub.status === 'active' && !expired ? sub.plan : 'Gratuit';
      const limit = getPlan(plan).monthlyQuota;
      return {
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        isAdmin: u.app_metadata?.role === 'admin',
        plan,
        usage: { used: usageByUser.get(u.id) ?? 0, limit },
      };
    });

    return NextResponse.json({ success: true, page, users: rows });
  } catch (error) {
    logger.error('admin.users_failed', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
