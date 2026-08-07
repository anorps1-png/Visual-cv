import { NextResponse } from 'next/server';
import { refreshJobs } from '@/lib/jobs/refresh';
import { CRON_QUERIES } from '@/lib/jobs/scraper';
import { logger } from '@/lib/logger';

// Le scraping est lent : on laisse de la marge (Vercel coupe au-delà).
export const maxDuration = 300;

/**
 * Alimente la table `jobs` en arrière-plan.
 *
 * Déclenché par Vercel Cron (voir vercel.json), qui envoie automatiquement
 * `Authorization: Bearer $CRON_SECRET`. Sans ce secret, la route est publique
 * et n'importe qui pourrait déclencher des dizaines de scrapings.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    logger.error('cron.scrape.missing_secret');
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 });
  }

  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${secret}`) {
    logger.warn('cron.scrape.unauthorized');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const result = await refreshJobs();
    logger.info('cron.scrape.completed', { queries: CRON_QUERIES.length, ...result });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error('cron.scrape.failed', error);
    return NextResponse.json({ error: 'Échec du scraping' }, { status: 500 });
  }
}

// Vercel Cron émet des GET : on accepte les deux.
export const GET = POST;
