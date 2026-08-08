import { createClient } from '@supabase/supabase-js';

// Fallbacks syntaxiquement valides : sans eux, `createClient('', '')` lève
// « supabaseUrl is required » à l'import, ce qui fait planter le prerender au
// build (ex. Vercel sans variables d'env). Au runtime, les vraies valeurs
// NEXT_PUBLIC_* sont injectées au build si elles sont configurées ; sinon les
// appels échouent proprement au lieu de casser la compilation.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
