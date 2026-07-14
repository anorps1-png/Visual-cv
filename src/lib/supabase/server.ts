import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Client scopé au token de l'utilisateur : toutes les requêtes passent par RLS
 * (les policies `auth.uid() = user_id` s'appliquent). À utiliser pour lire/écrire
 * les données appartenant à l'utilisateur authentifié.
 */
export function getUserClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Client admin (service-role) : contourne RLS. Réservé aux écritures côté serveur
 * qui n'appartiennent à aucun utilisateur (ex : offres d'emploi scrapées).
 * NE JAMAIS exposer ce client ni la clé au navigateur.
 */
let adminSingleton: SupabaseClient | null = null;
export function getAdminClient(): SupabaseClient {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY manquante : requise pour les écritures serveur (offres d\'emploi).'
    );
  }
  if (!adminSingleton) {
    adminSingleton = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminSingleton;
}

/**
 * Extrait et valide l'utilisateur depuis l'en-tête Authorization: Bearer <token>.
 * Renvoie { user, token } si valide, sinon null.
 */
export async function getAuthUser(
  request: Request
): Promise<{ user: User; token: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);
    if (error || !user) return null;
    return { user, token };
  } catch (e) {
    logger.warn('auth.verify_failed', undefined, e);
    return null;
  }
}
