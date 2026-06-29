import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CV_GENERATION_PROMPT } from '@/lib/ai/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy_key',
});

export async function POST(request: Request) {
  try {
    const { cvText, jobDescription, provider } = await request.json();
    const selectedProvider = provider || 'openai';

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV Text et Job Description requis' }, { status: 400 });
    }

    if (selectedProvider === 'deepseek') {
      if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
        return NextResponse.json({ error: "La clé API DeepSeek n'est pas configurée dans le fichier .env.local" }, { status: 400 });
      }
    } else {
      if (!process.env.OPENAI_API_KEY) {
        // Mock mode si pas de clé API (pour le test MVP rapide sans bloquer)
        return NextResponse.json({
          success: true,
          data: {
            personal_info: {
              name: "Jean Dupont",
              title: "Développeur Fullstack React",
              email: "jean.dupont@email.com",
              phone: "+237 600 000 000",
              location: "Douala, Cameroun",
              linkedin: "linkedin.com/in/jeandupont",
              website: "jeandupont.dev"
            },
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
            education: [
              {
                degree: "Master en Informatique",
                institution: "Université de Yaoundé I",
                dates: "2018 - 2021",
                description: "Spécialisation Génie Logiciel"
              }
            ],
            languages: ["Français (Maternelle)", "Anglais (Professionnel)"],
            cover_letter: "Lettre de motivation mock...\nCordialement.",
            email_text: "Bonjour,\nCeci est un mock.\nCordialement."
          }
        });
      }
    }

    let response;
    if (selectedProvider === 'deepseek') {
      response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: CV_GENERATION_PROMPT },
          { role: 'user', content: `=== CV MAÎTRE ===\n${cvText}\n\n=== OFFRE D'EMPLOI ===\n${jobDescription}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
    } else {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: CV_GENERATION_PROMPT },
          { role: 'user', content: `=== CV MAÎTRE ===\n${cvText}\n\n=== OFFRE D'EMPLOI ===\n${jobDescription}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
    }

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Réponse vide de l'IA");

    const result = JSON.parse(content);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur génération IA:', error);
    return NextResponse.json({ error: 'Échec de la génération IA' }, { status: 500 });
  }
}

