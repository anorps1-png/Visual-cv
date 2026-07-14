import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';

interface JobRow {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  source_url: string | null;
  created_at: string;
}

interface ClientJob {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  sourceUrl: string | null;
  createdAt: string;
}

/** Offre fraîchement scrapée, avant insertion (id/created_at générés par Postgres). */
interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  source_url: string;
}

// Forme DB (snake_case) -> forme client (camelCase attendue par SearchJD.tsx)
function toClientJob(row: JobRow): ClientJob {
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

function cleanHtml(rawHtml: string): string {
  let text = rawHtml.replace(/<[^>]+>/g, ' ');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&icirc;/g, 'î')
    .replace(/&euml;/g, 'ë')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'");
  return text.replace(/\s+/g, ' ').trim();
}

function isDeadlinePassed(description: string, title: string): boolean {
  const text = (title + " " + description).toLowerCase();
  const deadlineKeywords = [
    "limite", "delai", "délai", "expire", "cloture", "clôture", 
    "jusqu'au", "rigueur", "avant le", "date de clôture"
  ];
  
  const today = new Date();
  const dateRegex = /\b(\d{1,2})[-/. ](\d{1,2}|[a-zéûô]+)[-/. ](202\d)\b/gi;
  
  const frenchMonths: { [key: string]: number } = {
    'janvier': 0, 'fevrier': 1, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'aout': 7, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'decembre': 11, 'décembre': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  const lines = text.split(/[.;\n]/);
  for (const line of lines) {
    const hasKeyword = deadlineKeywords.some(kw => line.includes(kw));
    if (!hasKeyword) continue;
    
    let match;
    dateRegex.lastIndex = 0;
    while ((match = dateRegex.exec(line)) !== null) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2].trim().toLowerCase();
      const year = parseInt(match[3], 10);
      
      let month = -1;
      if (/^\d+$/.test(monthStr)) {
        month = parseInt(monthStr, 10) - 1;
      } else {
        for (const [mName, mIdx] of Object.entries(frenchMonths)) {
          if (monthStr.startsWith(mName) || mName.startsWith(monthStr)) {
            month = mIdx;
            break;
          }
        }
      }
      
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const deadlineDate = new Date(year, month, day);
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (deadlineDate < todayMidnight) {
          return true; // The deadline has passed
        }
      }
    }
  }
  
  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    const admin = getAdminClient();

    // Lecture des offres existantes depuis Supabase.
    const { data: existingRows, error: readErr } = await admin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (readErr) throw readErr;

    let existingJobs: ClientJob[] = ((existingRows || []) as JobRow[]).map(toClientJob);

    if (query.length > 2) {
      try {
        console.log(`Live scraping both MinaJobs and Emploi.cm for: "${query}"`);
        
        // 1. Search MinaJobs
        let minajobsLinks: string[] = [];
        try {
          const res = await fetch(`http://cameroun.minajobs.net/offres-emplois-stages?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          const html = await res.text();
          const matches = html.match(/\/emplois-stage-recrutement\/\d+\/[a-zA-Z0-9-%]+/g) || [];
          minajobsLinks = Array.from(new Set(matches)).map(link => 
            link.startsWith('http') ? link : `http://cameroun.minajobs.net${link}`
          );
        } catch (e) {
          console.error('Error fetching MinaJobs list:', e);
        }

        // 2. Search Emploi.cm
        let emploiLinks: string[] = [];
        try {
          const res = await fetch(`https://www.emploi.cm/recherche-jobs-cameroun?key=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
          });
          const html = await res.text();
          const matches = html.match(/\/offre-emploi-cameroun\/[a-zA-Z0-9-%]+/g) || [];
          emploiLinks = Array.from(new Set(matches)).map(link => 
            link.startsWith('http') ? link : `https://www.emploi.cm${link}`
          );
        } catch (e) {
          console.error('Error fetching Emploi.cm list:', e);
        }

        // Pick top 4 links from each to keep total request time down
        const selectedMina = minajobsLinks.slice(0, 4);
        const selectedEmploi = emploiLinks.slice(0, 4);
        const allTargetLinks = [...selectedMina, ...selectedEmploi];

        // Fetch details of all matching links in parallel to be fast
        const scrapePromises = allTargetLinks.map(async (detailUrl) => {
          const alreadyExists = existingJobs.some(j => j.sourceUrl === detailUrl);
          if (alreadyExists) return null;

          try {
            const isEmploi = detailUrl.includes('emploi.cm');
            const userAgent = isEmploi 
              ? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' 
              : 'Mozilla/5.0';

            console.log(`Live scraping detail page: ${detailUrl}`);
            const detailRes = await fetch(detailUrl, {
              headers: { 'User-Agent': userAgent }
            });
            const detailHtml = await detailRes.text();

            if (isEmploi) {
              const titleMatch = detailHtml.match(/<h3 class="job-title">\s*Poste propos[ée]\s*:\s*(.*?)\s*<\/h3>/i) || 
                                 detailHtml.match(/<h1>(.*?)<\/h1>/i) ||
                                 detailHtml.match(/<title>(.*?)<\/title>/i);
              
              let title = titleMatch ? cleanHtml(titleMatch[1]) : "Offre d'emploi";
              if (title.startsWith("Poste proposé :")) {
                title = title.replace("Poste proposé :", "").trim();
              }
              if (title.endsWith(" - Douala") || title.endsWith(" - Yaounde") || title.endsWith(" - Yaoundé")) {
                title = title.split(" - ").slice(0, -1).join(" - ").trim();
              }

              const companyMatch = detailHtml.match(/href="\/recruteur\/\d+"[^>]*>(.*?)<\/a>/i);
              const company = companyMatch ? cleanHtml(companyMatch[1]) : "Entreprise anonyme";

              const descMatch = detailHtml.match(/<div class="job-description"[^>]*>(.*?)<\/div>/s);
              const qualMatch = detailHtml.match(/<div class="job-qualifications"[^>]*>(.*?)<\/div>/s);
              const criteriaMatch = detailHtml.match(/<ul class="arrow-list"[^>]*>(.*?)<\/ul>/s);
              
              let description = "";
              if (descMatch) description += cleanHtml(descMatch[1]) + "\n\n";
              if (qualMatch) description += "Profil recherché:\n" + cleanHtml(qualMatch[1]) + "\n\n";
              if (criteriaMatch) description += "Critères:\n" + cleanHtml(criteriaMatch[1]);
              description = description.trim();

              if (!description) return null;

              if (isDeadlinePassed(description, title)) {
                console.log(`Skipping expired Emploi.cm job: "${title}"`);
                return null;
              }

              let location = "Cameroun";
              if (description.includes("Douala") || title.includes("Douala")) {
                location = "Douala, Cameroun";
              } else if (description.includes("Yaoundé") || title.includes("Yaoundé") || description.includes("Yaounde")) {
                location = "Yaoundé, Cameroun";
              }

              return { title, company, location, description, source_url: detailUrl };
            } else {
              const detailMatch = detailHtml.match(/<div class="detail-font"\s*>(.*?)<\/div>/s) || 
                                  detailHtml.match(/<div class="detail-font"[^>]*>(.*?)<\/div>/s);
              
              if (detailMatch) {
                const detailContent = detailMatch[1];
                const titleMatch = detailContent.match(/<h1>(.*?)<\/h1>/s);
                const rawTitle = titleMatch ? cleanHtml(titleMatch[1]) : "Offre d'emploi";

                let title = rawTitle;
                let company = "Entreprise anonyme";
                if (rawTitle.includes(" at ")) {
                  const parts = rawTitle.split(" at ");
                  title = parts[0].trim();
                  company = parts[1].trim();
                } else if (rawTitle.includes(" chez ")) {
                  const parts = rawTitle.split(" chez ");
                  title = parts[0].trim();
                  company = parts[1].trim();
                }

                const description = cleanHtml(detailContent).replace(rawTitle, '').trim();

                if (isDeadlinePassed(description, title)) {
                  console.log(`Skipping expired MinaJobs job: "${title}"`);
                  return null;
                }

                let location = "Cameroun";
                if (description.includes("Douala") || title.includes("Douala")) {
                  location = "Douala, Cameroun";
                } else if (description.includes("Yaoundé") || title.includes("Yaoundé") || description.includes("Yaounde")) {
                  location = "Yaoundé, Cameroun";
                }

                return { title, company, location, description, source_url: detailUrl };
              }
            }
          } catch (e) {
            console.error(`Error scraping detail page ${detailUrl}:`, e);
          }
          return null;
        });

        const newJobs = (await Promise.all(scrapePromises)).filter(Boolean) as ScrapedJob[];

        if (newJobs.length > 0) {
          // Upsert idempotent : source_url est unique, on ignore les doublons.
          const { data: inserted, error: upsertErr } = await admin
            .from('jobs')
            .upsert(newJobs, { onConflict: 'source_url', ignoreDuplicates: true })
            .select();
          if (upsertErr) {
            console.error('Error upserting scraped jobs:', upsertErr);
          } else if (inserted) {
            existingJobs = [...inserted.map(toClientJob), ...existingJobs];
          }
        }
      } catch (err) {
        console.error('Error during live scraping process:', err);
      }
    }

    if (!query) {
      existingJobs = existingJobs.filter(job => !isDeadlinePassed(job.description, job.title));
      return NextResponse.json({ success: true, jobs: existingJobs });
    }

    const lowercaseQuery = query.toLowerCase();
    const filteredJobs = existingJobs.filter((job) => {
      const matchesSearch =
        (job.title || '').toLowerCase().includes(lowercaseQuery) ||
        (job.company || '').toLowerCase().includes(lowercaseQuery) ||
        (job.location || '').toLowerCase().includes(lowercaseQuery) ||
        (job.description || '').toLowerCase().includes(lowercaseQuery);

      return matchesSearch && !isDeadlinePassed(job.description || '', job.title || '');
    });

    return NextResponse.json({ success: true, jobs: filteredJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des offres d\'emploi' }, { status: 500 });
  }
}


