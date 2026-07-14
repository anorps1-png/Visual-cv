import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CV_GENERATION_PROMPT } from '@/lib/ai/prompts';
import { getAuthUser } from '@/lib/supabase/server';
import { enforceRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { getEffectiveSubscription, consumeGenerationQuota } from '@/lib/billing/subscription';
import { getPlan } from '@/lib/billing/plans';
import { generateRequestSchema, generatedCvSchema } from '@/lib/validation/cv';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy_key',
});

// La génération IA est coûteuse : login obligatoire + rate limiting par utilisateur.
const GENERATE_LIMIT = 10; // requêtes
const GENERATE_WINDOW = 60 * 60; // par heure

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Connexion requise pour générer un dossier de candidature.' },
        { status: 401 }
      );
    }

    const rl = await enforceRateLimit(`generate:${auth.user.id}`, GENERATE_LIMIT, GENERATE_WINDOW);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter);
    }

    const body = await request.json().catch(() => null);
    const input = generateRequestSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? 'Requête invalide' },
        { status: 400 }
      );
    }
    const { cvText, jobDescription, provider: selectedProvider } = input.data;

    // Quota mensuel selon le plan (Gratuit=1, Étudiant=5, Pro=illimité).
    // Consommé APRÈS validation d'entrée : une requête invalide ne décompte pas.
    const subscription = await getEffectiveSubscription(auth.user.id);
    const planDef = getPlan(subscription.plan);
    const quota = await consumeGenerationQuota(auth.user.id, planDef.monthlyQuota);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            `Vous avez atteint la limite de votre plan ${subscription.plan} ` +
            `(${planDef.monthlyQuota} génération(s)/mois). Passez à un plan supérieur pour continuer.`,
          code: 'QUOTA_EXCEEDED',
          plan: subscription.plan,
        },
        { status: 402 }
      );
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

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide de l'IA");

    // La sortie d'un LLM n'est jamais une donnée de confiance : elle peut être
    // du JSON invalide, ou du JSON valide à la mauvaise forme. Sans validation,
    // l'erreur ne surgit qu'au rendu PDF, côté client.
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Sortie IA non parsable en JSON:', content.slice(0, 500));
      return NextResponse.json(
        { error: "L'IA a renvoyé une réponse illisible. Veuillez réessayer." },
        { status: 502 }
      );
    }

    const validated = generatedCvSchema.safeParse(parsed);
    if (!validated.success) {
      console.error(
        'Sortie IA non conforme au schéma:',
        JSON.stringify(validated.error.issues.slice(0, 5))
      );
      return NextResponse.json(
        { error: "L'IA a renvoyé un dossier incomplet. Veuillez réessayer." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: validated.data });
  } catch (error) {
    console.error('Erreur génération IA:', error);
    return NextResponse.json({ error: 'Échec de la génération IA' }, { status: 500 });
  }
}

