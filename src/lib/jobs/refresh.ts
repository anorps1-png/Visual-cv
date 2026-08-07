import { getAdminClient } from '@/lib/supabase/server';
import { scrapeJobs, CRON_QUERIES, type ScrapedJob } from '@/lib/jobs/scraper';
import { logger } from '@/lib/logger';

export interface RefreshResult {
  scraped: number;
  upserted: number;
  durationMs: number;
}

/**
 * Scrape toutes les requêtes de veille, upsert les offres et purge les périmées.
 * Logique partagée entre le cron ([cron/scrape-jobs]) et le déclenchement manuel
 * admin ([admin/scrape]) — une seule source de vérité.
 */
export async function refreshJobs(): Promise<RefreshResult> {
  const started = Date.now();
  const admin = getAdminClient();

  // En série : on ne martèle pas les sites sources et on borne la mémoire.
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
  if (purgeErr) logger.warn('jobs.refresh.purge_failed', undefined, purgeErr);

  return { scraped: jobs.length, upserted, durationMs: Date.now() - started };
}
