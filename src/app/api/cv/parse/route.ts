import { NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/parser/pdfExtractor';
import { getAuthUser } from '@/lib/supabase/server';
import { enforceRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { validateUpload, PDF_MIME } from '@/lib/validation/upload';

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

    // Valide type + taille AVANT de charger le fichier en mémoire.
    const check = validateUpload(formData.get('file'), [PDF_MIME]);
    if ('error' in check) {
      return NextResponse.json({ error: check.error.error }, { status: check.error.status });
    }

    const buffer = Buffer.from(await check.file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Aucun texte lisible dans ce PDF (il est peut-être scanné en image).' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, success: true });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'extraction du texte' }, { status: 500 });
  }
}
