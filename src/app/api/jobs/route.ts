import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface JobRow {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  source_url: string | null;
  created_at: string;
}

// Forme DB (snake_case) -> forme client (camelCase attendue par SearchJD.tsx)
function toClientJob(row: JobRow) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    description: row.description,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
  };
}

const PAGE_SIZE = 50;

/**
 * Recherche d'offres — servie UNIQUEMENT depuis la base.
 *
 * Le scraping a été déplacé dans un cron (/api/cron/scrape-jobs) : il ne se
 * produit plus pendant la requête utilisateur. Cette route est donc rapide,
 * prévisible, et ne dépend plus de la disponibilité de sites tiers.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q')?.trim() || '').slice(0, 200);

    const admin = getAdminClient();

    let dbQuery = admin
      .from('jobs')
      .select('id, title, company, location, description, source_url, created_at')
      // Les offres périmées sont exclues en SQL (expires_at rempli au scraping).
      .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (query.length > 0) {
      // Recherche plein-texte indexée (index GIN, migration 0005).
      dbQuery = dbQuery.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'french',
      });
    }

    const { data, error } = await dbQuery;
    if (error) throw error;

    return NextResponse.json({ success: true, jobs: (data as JobRow[]).map(toClientJob) });
  } catch (error) {
    logger.error('jobs.search_failed', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres d'emploi" },
      { status: 500 }
    );
  }
}
