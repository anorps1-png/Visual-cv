import { NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/parser/pdfExtractor';
import { getAuthUser } from '@/lib/supabase/server';
import { enforceRateLimit, rateLimitResponse } from '@/lib/rateLimit';

const CV_PARSE_LIMIT = 30;
const CV_PARSE_WINDOW = 60 * 60;

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Connexion requise pour importer un CV.' },
        { status: 401 }
      );
    }

    const rl = await enforceRateLimit(`cv_parse:${auth.user.id}`, CV_PARSE_LIMIT, CV_PARSE_WINDOW);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont supportés pour le moment' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    return NextResponse.json({ text, success: true });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'extraction du texte' }, { status: 500 });
  }
}
