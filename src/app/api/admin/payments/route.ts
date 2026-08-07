import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// GET /api/admin/payments?page=1 — journal des paiements, plus récents d'abord.
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ('response' in guard) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const perPage = 50;
    const from = (page - 1) * perPage;

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('payments')
      .select('id, user_id, plan, billing_cycle, amount, currency, provider, status, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1);
    if (error) throw error;

    return NextResponse.json({ success: true, page, payments: data ?? [] });
  } catch (error) {
    logger.error('admin.payments_failed', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
