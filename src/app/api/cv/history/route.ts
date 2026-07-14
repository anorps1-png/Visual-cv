import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser, getUserClient } from '@/lib/supabase/server';
import { historyPostSchema } from '@/lib/validation/cv';
import { logger } from '@/lib/logger';

interface CvRow {
  id: string;
  user_id: string;
  job_title: string | null;
  company_name: string | null;
  original_text: string | null;
  generated_cv: unknown;
  cover_letter: string | null;
  email_text: string | null;
  created_at: string;
}

// Ligne DB -> forme attendue par le front (History.tsx / page.tsx).
// On conserve la compatibilité : generatedCVUrl est une chaîne JSON.
function toClientShape(row: CvRow) {
  return {
    id: row.id,
    userId: row.user_id,
    jobTitle: row.job_title,
    companyName: row.company_name,
    originalText: row.original_text,
    generatedCVUrl:
      row.generated_cv != null ? JSON.stringify(row.generated_cv) : null,
    coverLetterUrl: row.cover_letter,
    emailText: row.email_text,
    createdAt: row.created_at,
  };
}

// GET: historique de l'utilisateur connecté
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = getUserClient(auth.token);
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, cvs: (data || []).map(toClientShape) });
  } catch (error) {
    logger.error('cv.history.fetch_failed', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer l\'historique' },
      { status: 500 }
    );
  }
}

// POST: enregistre une nouvelle candidature
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const input = historyPostSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? 'Requête invalide' },
        { status: 400 }
      );
    }
    const { jobTitle, companyName, originalText, generatedCVUrl, coverLetterUrl, emailText } =
      input.data;

    // generatedCVUrl peut arriver en objet (front) ou en chaîne JSON : on normalise en jsonb.
    let generatedCv: unknown = null;
    if (generatedCVUrl != null) {
      if (typeof generatedCVUrl === 'string') {
        try {
          generatedCv = JSON.parse(generatedCVUrl);
        } catch {
          generatedCv = { raw: generatedCVUrl };
        }
      } else {
        generatedCv = generatedCVUrl;
      }
    }

    const supabase = getUserClient(auth.token);
    const { data, error } = await supabase
      .from('cvs')
      .insert({
        user_id: auth.user.id,
        job_title: jobTitle ?? null,
        company_name: companyName ?? null,
        original_text: originalText ?? null,
        generated_cv: generatedCv,
        cover_letter: coverLetterUrl ?? null,
        email_text: emailText ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, cv: toClientShape(data) });
  } catch (error) {
    logger.error('cv.history.save_failed', error);
    return NextResponse.json(
      { error: 'Impossible d\'enregistrer dans l\'historique' },
      { status: 500 }
    );
  }
}

// DELETE: supprime une candidature (RLS garantit que c'est bien la sienne)
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get('id');
    // Un id non-UUID ferait échouer la requête Postgres (erreur 500) : on le
    // rejette proprement en 400.
    if (!cvId || !z.uuid().safeParse(cvId).success) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const supabase = getUserClient(auth.token);
    // RLS (cvs_delete_own) empêche de supprimer le CV d'un autre utilisateur.
    const { data, error } = await supabase
      .from('cvs')
      .delete()
      .eq('id', cvId)
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) {
      // Soit inexistant, soit non possédé (RLS l'a filtré).
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('cv.history.delete_failed', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer de l\'historique' },
      { status: 500 }
    );
  }
}
