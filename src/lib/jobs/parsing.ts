/**
 * Fonctions pures d'analyse des offres : nettoyage HTML et détection des
 * dates limites. Extraites de la route pour être testables sans réseau ni DB.
 */

export function cleanHtml(rawHtml: string): string {
  const text = rawHtml
    .replace(/<[^>]+>/g, ' ')
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

const DEADLINE_KEYWORDS = [
  'limite',
  'delai',
  'délai',
  'expire',
  'cloture',
  'clôture',
  "jusqu'au",
  'rigueur',
  'avant le',
  'date de clôture',
];

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10,
  decembre: 11, décembre: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8,
  oct: 9, nov: 10, dec: 11,
};

/**
 * Extrait la date limite de candidature, si elle est détectable.
 * Ne considère que les dates situées sur une ligne contenant un mot-clé de
 * type « date limite » — sinon on confondrait avec une date de publication.
 *
 * `now` est injectable pour rendre la fonction testable de façon déterministe.
 */
export function findDeadline(description: string, title: string): Date | null {
  const text = `${title} ${description}`.toLowerCase();
  const dateRegex = /\b(\d{1,2})[-/. ](\d{1,2}|[a-zéûô]+)[-/. ](20\d\d)\b/gi;

  for (const line of text.split(/[.;\n]/)) {
    if (!DEADLINE_KEYWORDS.some((kw) => line.includes(kw))) continue;

    dateRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = dateRegex.exec(line)) !== null) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2].trim().toLowerCase();
      const year = parseInt(match[3], 10);

      let month = -1;
      if (/^\d+$/.test(monthStr)) {
        month = parseInt(monthStr, 10) - 1;
      } else {
        for (const [name, idx] of Object.entries(FRENCH_MONTHS)) {
          if (monthStr.startsWith(name) || name.startsWith(monthStr)) {
            month = idx;
            break;
          }
        }
      }

      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return new Date(year, month, day);
      }
    }
  }

  return null;
}

/** L'offre est-elle périmée ? (date limite strictement antérieure à aujourd'hui) */
export function isDeadlinePassed(
  description: string,
  title: string,
  now: Date = new Date()
): boolean {
  const deadline = findDeadline(description, title);
  if (!deadline) return false;
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return deadline < todayMidnight;
}

/** Déduit la ville à partir du texte de l'offre. */
export function inferLocation(description: string, title: string): string {
  const text = `${title} ${description}`;
  if (text.includes('Douala')) return 'Douala, Cameroun';
  if (text.includes('Yaoundé') || text.includes('Yaounde')) return 'Yaoundé, Cameroun';
  return 'Cameroun';
}
