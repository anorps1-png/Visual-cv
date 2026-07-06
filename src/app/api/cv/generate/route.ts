import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CV_GENERATION_PROMPT } from '@/lib/ai/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  baseURL: process.env.OPENAI_BASE_URL || undefined,
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
            hobbies: ["Arts Martiaux", "Musique", "Lecture"],
            cover_letter: "Madame, Monsieur,\n\nActuellement à la recherche d'une opportunité stimulante dans le domaine du génie logiciel au Cameroun, c'est avec un grand intérêt que je vous soumets ma candidature. Fort de mon expérience de Master en Informatique à l'Université de Yaoundé I, je souhaite apporter mes compétences en développement React et Node.js au service de vos projets innovants.\n\nRigoureux et motivé, je reste disponible pour toute entrevue afin de vous détailler mon parcours.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
            email_text: "Bonjour,\nCeci est un mock.\nCordialement.",
            letter_metadata: {
              date: "Yaoundé, le 29 juin 2026",
              recipient: "Responsable des Ressources Humaines",
              company: "ECOBANK CAMEROUN SA",
              subject: "Objet : Candidature au poste de Développeur Fullstack React"
            }
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
        model: process.env.OPENAI_MODEL || 'gpt-4o',
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

