import OpenAI from 'openai';
import { CV_GENERATION_PROMPT } from '@/lib/ai/prompts';
import { generatedCvSchema, type GeneratedCv } from '@/lib/validation/cv';
import { logger } from '@/lib/logger';

export type Provider = 'openai' | 'deepseek';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy_key',
});

function isConfigured(provider: Provider): boolean {
  if (provider === 'deepseek') {
    return !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here';
  }
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';
}

/** Résultat d'une tentative de génération sur UN fournisseur. */
type Attempt =
  | { ok: true; data: GeneratedCv }
  | { ok: false; reason: 'not_configured' | 'api_error' | 'bad_output' };

async function generateWith(provider: Provider, cvText: string, jobDescription: string): Promise<Attempt> {
  if (!isConfigured(provider)) return { ok: false, reason: 'not_configured' };

  const client = provider === 'deepseek' ? deepseek : openai;
  const model = provider === 'deepseek' ? 'deepseek-chat' : process.env.OPENAI_MODEL || 'gpt-4o';

  let content: string | null | undefined;
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: CV_GENERATION_PROMPT },
        {
          role: 'user',
          content: `=== CV MAÎTRE ===\n${cvText}\n\n=== OFFRE D'EMPLOI ===\n${jobDescription}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    content = response.choices[0]?.message?.content;
  } catch (error) {
    // Clé invalide (401), quota fournisseur, panne réseau… : on le note et on
    // laissera l'appelant tenter l'autre fournisseur.
    logger.error('cv.generate.provider_error', error, { provider });
    return { ok: false, reason: 'api_error' };
  }

  if (!content) {
    logger.error('cv.generate.empty_response', undefined, { provider });
    return { ok: false, reason: 'api_error' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // On ne logge pas le contenu brut : il contient le CV de l'utilisateur.
    logger.error('cv.generate.llm_invalid_json', undefined, { provider, contentLength: content.length });
    return { ok: false, reason: 'bad_output' };
  }

  const validated = generatedCvSchema.safeParse(parsed);
  if (!validated.success) {
    logger.error('cv.generate.llm_schema_mismatch', undefined, {
      provider,
      issues: validated.error.issues.slice(0, 5).map((i) => i.path.join('.')),
    });
    return { ok: false, reason: 'bad_output' };
  }

  return { ok: true, data: validated.data };
}

export interface GenerationResult {
  data: GeneratedCv;
  provider: Provider;
  /** true si on a dû basculer sur le fournisseur de secours. */
  fellBack: boolean;
}

/**
 * Génère le dossier en essayant le fournisseur demandé, puis l'autre en secours.
 * Ainsi une clé expirée (ex : Sublyx en 401) ne casse plus silencieusement le
 * produit : on bascule automatiquement.
 *
 * Renvoie null si AUCUN fournisseur n'a pu produire un dossier valide.
 */
export async function generateApplication(
  preferred: Provider,
  cvText: string,
  jobDescription: string
): Promise<GenerationResult | null> {
  const order: Provider[] = preferred === 'deepseek' ? ['deepseek', 'openai'] : ['openai', 'deepseek'];

  for (let i = 0; i < order.length; i++) {
    const provider = order[i];
    const attempt = await generateWith(provider, cvText, jobDescription);
    if (attempt.ok) {
      return { data: attempt.data, provider, fellBack: i > 0 };
    }
  }

  return null;
}
