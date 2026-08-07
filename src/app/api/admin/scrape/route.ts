import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { refreshJobs } from '@/lib/jobs/refresh';
import { logger } from '@/lib/logger';

// Le scraping est lent : on laisse de la marge.
export const maxDuration = 300;

// POST /api/admin/scrape — relance le scraping à la demande (même logique que le cron).
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if ('response' in guard) return guard.response;

  try {
    const result = await refreshJobs();
    logger.info('admin.scrape_triggered', { by: guard.user.id, ...result });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error('admin.scrape_failed', error);
    return NextResponse.json({ error: 'Échec du scraping' }, { status: 500 });
  }
}
