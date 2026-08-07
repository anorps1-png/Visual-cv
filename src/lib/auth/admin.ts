import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase/server';

/**
 * Vrai si l'utilisateur est administrateur.
 *
 * Le rôle vit dans `app_metadata`, qui n'est modifiable QUE par la clé
 * service-role (jamais par l'utilisateur lui-même, contrairement à
 * `user_metadata`). Impossible donc de s'auto-promouvoir en éditant son profil.
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

type AdminGuardResult = { user: User; token: string } | { response: NextResponse };

/**
 * Garde à appeler en tête de CHAQUE route admin.
 * - 401 si non connecté
 * - 403 si connecté mais non-admin
 * Sinon renvoie l'utilisateur (admin confirmé) et son token.
 */
export async function requireAdmin(request: Request): Promise<AdminGuardResult> {
  const auth = await getAuthUser(request);
  if (!auth) {
    return { response: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) };
  }
  if (!isAdmin(auth.user)) {
    return { response: NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 }) };
  }
  return auth;
}
