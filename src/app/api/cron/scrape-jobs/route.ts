import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { scrapeJobs, CRON_QUERIES, type ScrapedJob } from '@/lib/jobs/scraper';
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

  const started = Date.now();
  try {
    const admin = getAdminClient();

    // Les requêtes sont traitées en série : on ne veut pas marteler les sites
    // sources ni dépasser la limite mémoire de la fonction.
    const collected = new Map<string, ScrapedJob>();
    for (const query of CRON_QUERIES) {
      const jobs = await scrapeJobs(query);
      for (const job of jobs) {
        // source_url est unique : on déduplique avant l'upsert.
        collected.set(job.source_url, job);
      }
    }

    const jobs = [...collected.values()];
    let upserted = 0;

    if (jobs.length > 0) {
      const { data, error } = await admin
        .from('jobs')
        .upsert(
          jobs.map((j) => ({ ...j, last_seen_at: new Date().toISOString() })),
          { onConflict: 'source_url' }
        )
        .select('id');
      if (error) throw error;
      upserted = data?.length ?? 0;
    }

    // Purge des offres périmées : la table ne gonfle pas indéfiniment.
    const { error: purgeErr } = await admin
      .from('jobs')
      .delete()
      .lt('expires_at', new Date().toISOString());
    if (purgeErr) logger.warn('cron.scrape.purge_failed', undefined, purgeErr);

    const durationMs = Date.now() - started;
    logger.info('cron.scrape.completed', {
      queries: CRON_QUERIES.length,
      scraped: jobs.length,
      upserted,
      durationMs,
    });

    return NextResponse.json({ success: true, scraped: jobs.length, upserted, durationMs });
  } catch (error) {
    logger.error('cron.scrape.failed', error, { durationMs: Date.now() - started });
    return NextResponse.json({ error: 'Échec du scraping' }, { status: 500 });
  }
}

// Vercel Cron émet des GET : on accepte les deux.
export const GET = POST;
