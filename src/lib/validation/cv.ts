import { z } from 'zod';

/**
 * Schéma de la sortie de l'IA.
 *
 * Objectif : garantir que ce qui arrive au rendu PDF (DocumentPreview /
 * PDFDocument) a bien la forme attendue. Un LLM peut omettre un champ, renvoyer
 * une string au lieu d'un tableau, ou halluciner une structure : sans validation
 * ça se termine en crash au rendu, côté client.
 *
 * Principe : TOLÉRANT sur les champs optionnels/accessoires (on comble avec des
 * valeurs par défaut plutôt que de jeter une génération payée), STRICT sur ce
 * dont le rendu a réellement besoin (cover_letter, email_text, expériences).
 */

// Le LLM renvoie parfois une chaîne au lieu d'un tableau de chaînes.
const stringArray = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (typeof v === 'string' ? [v] : v))
  .catch([]);

const personalInfoSchema = z
  .object({
    name: z.string().catch(''),
    title: z.string().catch(''),
    email: z.string().catch(''),
    phone: z.string().catch(''),
    location: z.string().catch(''),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  })
  .catch({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
  });

const experienceSchema = z.object({
  title: z.string().catch(''),
  company: z.string().catch(''),
  dates: z.string().catch(''),
  bullet_points: stringArray,
});

const educationSchema = z.object({
  degree: z.string().catch(''),
  institution: z.string().catch(''),
  dates: z.string().catch(''),
  description: z.string().optional(),
});

const letterMetadataSchema = z
  .object({
    date: z.string().catch(''),
    recipient: z.string().catch(''),
    company: z.string().catch(''),
    subject: z.string().catch(''),
  })
  .optional();

export const generatedCvSchema = z.object({
  personal_info: personalInfoSchema,
  // Le score doit rester affichable : on le RAMÈNE dans 0-100 (clamp) plutôt que
  // de l'écraser à 0 — un 150 renvoyé par l'IA vaut 100, pas 0.
  score: z.coerce
    .number()
    .catch(0)
    .transform((n) => (Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0)),
  keywords_matched: stringArray,
  keywords_missing: stringArray,
  cv_summary: z.string().catch(''),
  cv_experiences: z.array(experienceSchema).catch([]),
  education: z.array(educationSchema).catch([]),
  languages: stringArray,
  hobbies: stringArray,
  // Ce sont les livrables : s'ils manquent, la génération n'a pas de valeur.
  cover_letter: z.string().min(1, "La lettre de motivation est vide"),
  email_text: z.string().min(1, "Le mail d'accompagnement est vide"),
  letter_metadata: letterMetadataSchema,
});

export type GeneratedCv = z.infer<typeof generatedCvSchema>;

// ---------------------------------------------------------------------
// Corps de requêtes API
// ---------------------------------------------------------------------

// Bornes hautes : évitent d'envoyer un prompt géant (coût + timeout) à l'IA.
const MAX_CV_TEXT = 50_000;
const MAX_JD_TEXT = 50_000;

export const generateRequestSchema = z.object({
  cvText: z.string().trim().min(1, 'CV Text requis').max(MAX_CV_TEXT, 'CV trop long'),
  jobDescription: z
    .string()
    .trim()
    .min(1, "Description de l'offre requise")
    .max(MAX_JD_TEXT, "Offre trop longue"),
  provider: z.enum(['openai', 'deepseek']).default('openai'),
});

export const historyPostSchema = z.object({
  jobTitle: z.string().max(300).nullish(),
  companyName: z.string().max(300).nullish(),
  originalText: z.string().max(MAX_CV_TEXT).nullish(),
  // Objet CV complet (ou chaîne JSON, normalisée dans la route).
  generatedCVUrl: z.unknown().nullish(),
  coverLetterUrl: z.string().max(20_000).nullish(),
  emailText: z.string().max(20_000).nullish(),
});

export const checkoutSchema = z.object({
  plan: z.enum(['Étudiant', 'Professionnel']),
  cycle: z.enum(['monthly', 'annual']).default('monthly'),
});
