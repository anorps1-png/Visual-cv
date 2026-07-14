/**
 * Logger structuré (JSON) avec expurgation automatique des secrets et des PII.
 *
 * Pourquoi : les `console.error(e)` dispersés ne sont ni cherchables ni
 * corrélables, et peuvent recracher une clé API ou le contenu d'un CV dans les
 * logs de l'hébergeur. Ici : un événement = une ligne JSON, avec un `event`
 * stable pour filtrer/alerter, et une expurgation appliquée avant écriture.
 *
 * Aucun tiers, aucun coût. Pour brancher Sentry/Axiom plus tard, il suffit
 * d'émettre depuis `write()` — les appelants n'ont pas à changer.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

/** Clés dont la valeur ne doit jamais apparaître en clair dans les logs. */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'apikey',
  'api_key',
  'secret',
  'service_role',
  'cvtext',
  'originaltext',
  'cover_letter',
  'email_text',
  'jobdescription',
];

/** Motifs de secrets reconnaissables même hors d'une clé nommée. */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/\bsk-[A-Za-z0-9_-]{10,}/g, 'sk-[REDACTED]'], // clés OpenAI / DeepSeek
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[JWT_REDACTED]'], // JWT
  [/postgresql:\/\/[^\s"']+/g, 'postgresql://[REDACTED]'], // connection strings
  [/\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL_REDACTED]'], // PII : emails
];

function redactString(s: string): string {
  let out = s;
  for (const [re, replacement] of SECRET_PATTERNS) {
    out = out.replace(re, replacement);
  }
  return out;
}

/**
 * Expurge récursivement une valeur : masque les clés sensibles, nettoie les
 * chaînes, tronque ce qui est trop long (un CV entier n'a rien à faire en log).
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[MAX_DEPTH]';

  if (typeof value === 'string') {
    const cleaned = redactString(value);
    return cleaned.length > 500 ? cleaned.slice(0, 500) + '…[TRUNCATED]' : cleaned;
  }

  if (value === null || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    // On ne logge pas des tableaux entiers : les 10 premiers éléments suffisent.
    return value.slice(0, 10).map((v) => redact(v, depth + 1));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = redact(v, depth + 1);
    }
  }
  return out;
}

/** Normalise une erreur en objet loggable (sans fuite de secrets). */
function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: redactString(err.message),
      // La stack est utile mais peut contenir des chemins/valeurs : on l'expurge.
      stack: process.env.NODE_ENV === 'production' ? undefined : redactString(err.stack ?? ''),
    };
  }
  return { message: String(redact(err)) };
}

function write(level: Level, event: string, context?: Record<string, unknown>, err?: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event, // identifiant stable, ex : 'cv.generate.llm_invalid_json'
    ...(context ? { ctx: redact(context) as Record<string, unknown> } : {}),
    ...(err !== undefined ? { err: serializeError(err) } : {}),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (event: string, ctx?: Record<string, unknown>) => write('debug', event, ctx),
  info: (event: string, ctx?: Record<string, unknown>) => write('info', event, ctx),
  warn: (event: string, ctx?: Record<string, unknown>, err?: unknown) =>
    write('warn', event, ctx, err),
  error: (event: string, err?: unknown, ctx?: Record<string, unknown>) =>
    write('error', event, ctx, err),
};
