import { describe, it, expect } from 'vitest';
import {
  generatedCvSchema,
  generateRequestSchema,
  checkoutSchema,
} from '@/lib/validation/cv';
import { validateUpload, PDF_MIME, IMAGE_MIMES, MAX_UPLOAD_BYTES } from '@/lib/validation/upload';

const validCv = {
  personal_info: {
    name: 'Jean Dupont',
    title: 'Développeur',
    email: 'jean@example.cm',
    phone: '+237600000000',
    location: 'Douala',
  },
  score: 85,
  keywords_matched: ['React'],
  keywords_missing: ['Docker'],
  cv_summary: 'Résumé',
  cv_experiences: [{ title: 'Dev', company: 'X', dates: '2020', bullet_points: ['a'] }],
  education: [{ degree: 'Master', institution: 'UY1', dates: '2021' }],
  languages: ['Français'],
  hobbies: ['Musique'],
  cover_letter: 'Madame, Monsieur, ...',
  email_text: 'Bonjour, ...',
  letter_metadata: { date: 'Yaoundé', recipient: 'RH', company: 'Ecobank', subject: 'Candidature' },
};

describe('generatedCvSchema — sortie du LLM', () => {
  it('accepte une sortie conforme', () => {
    expect(generatedCvSchema.safeParse(validCv).success).toBe(true);
  });

  // Le LLM dévie régulièrement sur ces points : on doit récupérer, pas jeter
  // une génération déjà facturée.
  it('normalise une string en tableau', () => {
    const r = generatedCvSchema.safeParse({ ...validCv, keywords_matched: 'React' });
    expect(r.success && r.data.keywords_matched).toEqual(['React']);
  });

  it('coerce un score renvoyé en string', () => {
    const r = generatedCvSchema.safeParse({ ...validCv, score: '92' });
    expect(r.success && r.data.score).toBe(92);
  });

  it('ramène un score hors bornes dans 0-100', () => {
    expect(generatedCvSchema.parse({ ...validCv, score: 150 }).score).toBe(100);
    expect(generatedCvSchema.parse({ ...validCv, score: -20 }).score).toBe(0);
  });

  it('comble les champs optionnels absents', () => {
    const { education: _e, hobbies: _h, ...partial } = validCv;
    const r = generatedCvSchema.safeParse(partial);
    expect(r.success && Array.isArray(r.data.education)).toBe(true);
  });

  it('retombe sur un tableau vide si cv_experiences est invalide', () => {
    const r = generatedCvSchema.safeParse({ ...validCv, cv_experiences: 'oops' });
    expect(r.success && r.data.cv_experiences).toEqual([]);
  });

  // En revanche, sans livrable la génération n'a aucune valeur : il faut
  // échouer explicitement (502) plutôt que crasher au rendu PDF côté client.
  it('rejette une lettre de motivation vide', () => {
    expect(generatedCvSchema.safeParse({ ...validCv, cover_letter: '' }).success).toBe(false);
  });

  it('rejette un email_text absent', () => {
    expect(generatedCvSchema.safeParse({ ...validCv, email_text: undefined }).success).toBe(false);
  });

  it('rejette un objet vide ou null', () => {
    expect(generatedCvSchema.safeParse({}).success).toBe(false);
    expect(generatedCvSchema.safeParse(null).success).toBe(false);
  });
});

describe('generateRequestSchema — corps de requête', () => {
  it("applique 'openai' par défaut", () => {
    const r = generateRequestSchema.safeParse({ cvText: 'a', jobDescription: 'b' });
    expect(r.success && r.data.provider).toBe('openai');
  });

  it('rejette un cvText vide', () => {
    expect(generateRequestSchema.safeParse({ cvText: '   ', jobDescription: 'b' }).success).toBe(
      false
    );
  });

  it('rejette un provider inconnu', () => {
    expect(
      generateRequestSchema.safeParse({ cvText: 'a', jobDescription: 'b', provider: 'evil' }).success
    ).toBe(false);
  });

  it('rejette un texte démesuré (coût + timeout IA)', () => {
    expect(
      generateRequestSchema.safeParse({ cvText: 'x'.repeat(60_000), jobDescription: 'b' }).success
    ).toBe(false);
  });
});

describe('checkoutSchema — abonnement', () => {
  it('accepte un plan payant', () => {
    expect(checkoutSchema.safeParse({ plan: 'Étudiant', cycle: 'annual' }).success).toBe(true);
  });

  // Souscrire au plan "Gratuit" n'a pas de sens et créerait un paiement à 0.
  it('rejette le plan Gratuit et les plans inconnus', () => {
    expect(checkoutSchema.safeParse({ plan: 'Gratuit' }).success).toBe(false);
    expect(checkoutSchema.safeParse({ plan: 'Pirate' }).success).toBe(false);
  });
});

describe('validateUpload — bornes des fichiers', () => {
  const mk = (type: string, size: number) => ({ type, size, name: 'f' }) as unknown as File;

  it('accepte un PDF valide', () => {
    expect('file' in validateUpload(mk(PDF_MIME, 1000), [PDF_MIME])).toBe(true);
  });

  it('accepte les images sur la route JD', () => {
    expect('file' in validateUpload(mk('image/png', 1000), [PDF_MIME, ...IMAGE_MIMES])).toBe(true);
  });

  it('rejette un fichier absent', () => {
    expect('error' in validateUpload(null, [PDF_MIME])).toBe(true);
  });

  // Sans cette borne, arrayBuffer() charge tout en mémoire et tue le worker.
  it('rejette un fichier trop volumineux (413)', () => {
    const r = validateUpload(mk(PDF_MIME, MAX_UPLOAD_BYTES + 1), [PDF_MIME]);
    expect('error' in r && r.error.status).toBe(413);
  });

  it('rejette un type non autorisé (415)', () => {
    const r = validateUpload(mk('application/x-msdownload', 100), [PDF_MIME]);
    expect('error' in r && r.error.status).toBe(415);
  });

  it('rejette un fichier vide', () => {
    expect('error' in validateUpload(mk(PDF_MIME, 0), [PDF_MIME])).toBe(true);
  });
});
