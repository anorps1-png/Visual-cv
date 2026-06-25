import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CV_GENERATION_PROMPT } from '@/lib/ai/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { cvText, jobDescription } = await request.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV Text et Job Description requis' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      // Mock mode si pas de clé API (pour le test MVP rapide sans bloquer)
      return NextResponse.json({
        success: true,
        data: {
          score: 85,
          keywords_matched: ['Mock', 'Data'],
          keywords_missing: ['Real API Key'],
          cv_summary: 'Résumé Mock généré car aucune clé OpenAI détectée.',
          cv_experiences: [
            {
              title: "Développeur (Mock)",
              company: "Entreprise X",
              dates: "2020 - 2023",
              bullet_points: ["Point 1 mock", "Point 2 mock"]
            }
          ],
          cover_letter: "Lettre de motivation mock...\nCordialement.",
          email_text: "Bonjour,\nCeci est un mock.\nCordialement."
        }
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: CV_GENERATION_PROMPT },
        { role: 'user', content: `=== CV MAÎTRE ===\n${cvText}\n\n=== OFFRE D'EMPLOI ===\n${jobDescription}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Réponse OpenAI vide");

    const result = JSON.parse(content);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur génération IA:', error);
    return NextResponse.json({ error: 'Échec de la génération IA' }, { status: 500 });
  }
}
