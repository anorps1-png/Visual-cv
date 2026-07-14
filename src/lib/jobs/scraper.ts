import { logger } from '@/lib/logger';
import { cleanHtml, isDeadlinePassed, inferLocation, findDeadline } from '@/lib/jobs/parsing';

/** Offre scrapée, prête à l'insertion (id/created_at générés par Postgres). */
export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  source_url: string;
  expires_at: string | null;
}

const FETCH_TIMEOUT_MS = 8_000;
const MAX_DETAIL_PAGES_PER_SOURCE = 8;

const UA_DEFAULT = 'Mozilla/5.0';
const UA_GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

/**
 * fetch avec timeout. Le code d'origine n'en avait aucun : un site tiers lent
 * bloquait la requête utilisateur indéfiniment.
 */
async function fetchWithTimeout(url: string, userAgent: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: controller.signal,
    });
    if (!res.ok) {
      logger.warn('jobs.scrape.http_error', { url, status: res.status });
      return null;
    }
    return await res.text();
  } catch (e) {
    logger.warn('jobs.scrape.fetch_failed', { url }, e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Liste les URLs de détail depuis la page de recherche MinaJobs. */
async function listMinaJobs(query: string): Promise<string[]> {
  const html = await fetchWithTimeout(
    `http://cameroun.minajobs.net/offres-emplois-stages?q=${encodeURIComponent(query)}`,
    UA_DEFAULT
  );
  if (!html) return [];
  const matches = html.match(/\/emplois-stage-recrutement\/\d+\/[a-zA-Z0-9-%]+/g) || [];
  return Array.from(new Set(matches)).map((l) =>
    l.startsWith('http') ? l : `http://cameroun.minajobs.net${l}`
  );
}

/** Liste les URLs de détail depuis la page de recherche Emploi.cm. */
async function listEmploiCm(query: string): Promise<string[]> {
  const html = await fetchWithTimeout(
    `https://www.emploi.cm/recherche-jobs-cameroun?key=${encodeURIComponent(query)}`,
    UA_GOOGLEBOT
  );
  if (!html) return [];
  const matches = html.match(/\/offre-emploi-cameroun\/[a-zA-Z0-9-%]+/g) || [];
  return Array.from(new Set(matches)).map((l) =>
    l.startsWith('http') ? l : `https://www.emploi.cm${l}`
  );
}

function parseEmploiCm(html: string, url: string): ScrapedJob | null {
  const titleMatch =
    html.match(/<h3 class="job-title">\s*Poste propos[ée]\s*:\s*(.*?)\s*<\/h3>/i) ||
    html.match(/<h1>(.*?)<\/h1>/i) ||
    html.match(/<title>(.*?)<\/title>/i);

  let title = titleMatch ? cleanHtml(titleMatch[1]) : "Offre d'emploi";
  if (title.startsWith('Poste proposé :')) {
    title = title.replace('Poste proposé :', '').trim();
  }
  if (/ - (Douala|Yaounde|Yaoundé)$/.test(title)) {
    title = title.split(' - ').slice(0, -1).join(' - ').trim();
  }

  const companyMatch = html.match(/href="\/recruteur\/\d+"[^>]*>(.*?)<\/a>/i);
  const company = companyMatch ? cleanHtml(companyMatch[1]) : 'Entreprise anonyme';

  const descMatch = html.match(/<div class="job-description"[^>]*>(.*?)<\/div>/s);
  const qualMatch = html.match(/<div class="job-qualifications"[^>]*>(.*?)<\/div>/s);
  const criteriaMatch = html.match(/<ul class="arrow-list"[^>]*>(.*?)<\/ul>/s);

  let description = '';
  if (descMatch) description += cleanHtml(descMatch[1]) + '\n\n';
  if (qualMatch) description += 'Profil recherché:\n' + cleanHtml(qualMatch[1]) + '\n\n';
  if (criteriaMatch) description += 'Critères:\n' + cleanHtml(criteriaMatch[1]);
  description = description.trim();

  if (!description) return null;

  const deadline = findDeadline(description, title);
  return {
    title,
    company,
    location: inferLocation(description, title),
    description,
    source_url: url,
    expires_at: deadline ? deadline.toISOString() : null,
  };
}

function parseMinaJobs(html: string, url: string): ScrapedJob | null {
  const detailMatch =
    html.match(/<div class="detail-font"\s*>(.*?)<\/div>/s) ||
    html.match(/<div class="detail-font"[^>]*>(.*?)<\/div>/s);
  if (!detailMatch) return null;

  const content = detailMatch[1];
  const titleMatch = content.match(/<h1>(.*?)<\/h1>/s);
  const rawTitle = titleMatch ? cleanHtml(titleMatch[1]) : "Offre d'emploi";

  let title = rawTitle;
  let company = 'Entreprise anonyme';
  for (const sep of [' at ', ' chez ']) {
    if (rawTitle.includes(sep)) {
      const parts = rawTitle.split(sep);
      title = parts[0].trim();
      company = parts[1].trim();
      break;
    }
  }

  const description = cleanHtml(content).replace(rawTitle, '').trim();
  if (!description) return null;

  const deadline = findDeadline(description, title);
  return {
    title,
    company,
    location: inferLocation(description, title),
    description,
    source_url: url,
    expires_at: deadline ? deadline.toISOString() : null,
  };
}

/**
 * Scrape les deux sources pour une requête donnée et renvoie les offres
 * encore valides. Tolérant aux pannes : une source en échec n'empêche pas
 * l'autre de produire des résultats.
 */
export async function scrapeJobs(query: string): Promise<ScrapedJob[]> {
  const [minaLinks, emploiLinks] = await Promise.all([listMinaJobs(query), listEmploiCm(query)]);

  const targets = [
    ...minaLinks.slice(0, MAX_DETAIL_PAGES_PER_SOURCE).map((url) => ({ url, source: 'mina' as const })),
    ...emploiLinks.slice(0, MAX_DETAIL_PAGES_PER_SOURCE).map((url) => ({ url, source: 'emploi' as const })),
  ];

  const results = await Promise.all(
    targets.map(async ({ url, source }) => {
      const isEmploi = source === 'emploi';
      const html = await fetchWithTimeout(url, isEmploi ? UA_GOOGLEBOT : UA_DEFAULT);
      if (!html) return null;

      try {
        const job = isEmploi ? parseEmploiCm(html, url) : parseMinaJobs(html, url);
        if (!job) return null;
        // On n'enregistre pas une offre déjà périmée.
        if (isDeadlinePassed(job.description, job.title)) return null;
        return job;
      } catch (e) {
        logger.warn('jobs.scrape.parse_failed', { url }, e);
        return null;
      }
    })
  );

  return results.filter((j): j is ScrapedJob => j !== null);
}

/** Requêtes de veille utilisées par le cron pour alimenter la base. */
export const CRON_QUERIES = [
  'developpeur',
  'informatique',
  'comptable',
  'commercial',
  'ingenieur',
  'assistant',
  'stage',
  'marketing',
];
