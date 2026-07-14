import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractTextFromPdf } from '@/lib/parser/pdfExtractor';
import { getAuthUser } from '@/lib/supabase/server';
import { enforceRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { validateUpload, PDF_MIME, IMAGE_MIMES } from '@/lib/validation/upload';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy_key',
});

async function extractJdInfoWithDeepSeek(rawText: string): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'dummy_key') {
    return rawText;
  }

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            "Tu es un assistant expert en recrutement. On te fournit du texte brut d'une offre d'emploi. " +
            "Ton but est de nettoyer, restructurer et formater ce texte pour obtenir une fiche de poste claire et exploitable. " +
            "Conserve toutes les informations d'origine (responsabilités, exigences, salaire, etc.), mais organise-les de façon professionnelle avec cette structure Markdown :\n" +
            "- **Intitulé du poste**\n" +
            "- **Entreprise** (si mentionnée)\n" +
            "- **Lieu** (si mentionné)\n" +
            "- **Missions principales**\n" +
            "- **Profil & Compétences requises**\n" +
            "Ne rajoute aucune phrase d'introduction ni de conclusion, donne directement le résultat formaté en Markdown."
        },
        {
          role: 'user',
          content: rawText
        }
      ],
      temperature: 0.2
    });

    return response.choices[0].message.content || rawText;
  } catch (error) {
    console.error('Erreur DeepSeek lors du formatage de la JD:', error);
    return rawText;
  }
}

// Parsing d'offre (PDF/OCR) : peut appeler l'IA -> login + rate limiting.
const JD_PARSE_LIMIT = 20;
const JD_PARSE_WINDOW = 60 * 60;

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Connexion requise pour analyser une offre.' },
        { status: 401 }
      );
    }

    const rl = await enforceRateLimit(`jd_parse:${auth.user.id}`, JD_PARSE_LIMIT, JD_PARSE_WINDOW);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter);
    }

    const formData = await request.formData();

    // Valide type + taille AVANT de charger le fichier en mémoire.
    const check = validateUpload(formData.get('file'), [PDF_MIME, ...IMAGE_MIMES]);
    if ('error' in check) {
      return NextResponse.json({ error: check.error.error }, { status: check.error.status });
    }
    const file = check.file;

    // PDF extraction
    if (file.type === 'application/pdf') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const rawText = await extractTextFromPdf(buffer);
      const structuredText = await extractJdInfoWithDeepSeek(rawText);
      return NextResponse.json({ text: structuredText, success: true });
    }

    // Image extraction (OCR)
    if (file.type.startsWith('image/')) {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
        // Mode mock si pas de clé API OpenAI
        return NextResponse.json({
          success: true,
          text: `[MODE DEMO - Contenu extrait de l'image "${file.name}"]\n\n` +
            "Offre d'emploi : Développeur React / Node.js Fullstack\n" +
            "Entreprise : Oyenga SmartEID (Douala, Cameroun)\n" +
            "Description du poste :\n" +
            "Nous recherchons un développeur passionné pour rejoindre notre équipe. Vous participerez à la conception et à la mise en œuvre de nos nouvelles interfaces utilisateur, ainsi qu'au développement de nos API backend.\n\n" +
            "Compétences recherchées :\n" +
            "- Expérience avérée avec React (Next.js est un plus)\n" +
            "- Bonne maîtrise de Node.js et Express\n" +
            "- Connaissance de PostgreSQL et de Supabase\n" +
            "- Esprit d'équipe, rigueur et autonomie."
        });
      }

      // Convert image to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');
      const mimeType = file.type;

      // Call OpenAI with GPT-4o vision
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: "Extrais l'intégralité du texte lisible et pertinent de cette offre d'emploi. Conserve bien la structure, les titres, les compétences requises, les missions et le profil recherché. Ne rajoute aucun commentaire introductif ou conclusif, donne uniquement le texte brut de l'offre."
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.2
      });

      const rawText = response.choices[0].message.content || '';
      const structuredText = await extractJdInfoWithDeepSeek(rawText);
      return NextResponse.json({ text: structuredText, success: true });
    }

    return NextResponse.json({ error: 'Format de fichier non supporté (seuls PDF et Images sont acceptés)' }, { status: 400 });
  } catch (error) {
    console.error('Error parsing JD:', error);
    return NextResponse.json({ error: "Erreur lors de l'extraction des données de l'offre" }, { status: 500 });
  }
}

