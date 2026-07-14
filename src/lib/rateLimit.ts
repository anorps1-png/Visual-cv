import { getAdminClient } from '@/lib/supabase/server';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // secondes avant réinitialisation de la fenêtre
}

/**
 * Rate limiting atomique côté Postgres (fenêtre fixe).
 * `key` doit être stable et discriminant, ex : `generate:<userId>`.
 *
 * En cas d'erreur d'infra (RPC injoignable), on choisit de LAISSER PASSER
 * (fail-open) pour ne pas bloquer les utilisateurs légitimes ; l'auth reste
 * la première barrière contre l'abus.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error('Rate limit RPC error:', error);
      return { allowed: true, remaining: limit, retryAfter: 0 };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return { allowed: true, remaining: limit, retryAfter: 0 };
    }

    return {
      allowed: !!row.allowed,
      remaining: row.remaining ?? 0,
      retryAfter: row.retry_after ?? 0,
    };
  } catch (e) {
    console.error('Rate limit unexpected error:', e);
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }
}

/** Réponse 429 standardisée. */
export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: `Trop de requêtes. Réessayez dans ${retryAfter} seconde(s).`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}
