import { supabase } from '@/lib/supabase';

/**
 * fetch() côté client qui attache automatiquement le token Supabase courant
 * dans l'en-tête Authorization. À utiliser pour tous les appels aux routes
 * protégées (auth obligatoire).
 *
 * Renvoie un statut 401 côté serveur si l'utilisateur n'est pas connecté ;
 * l'appelant doit gérer ce cas (ex : ouvrir la modale de connexion).
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(input, { ...init, headers });
}
