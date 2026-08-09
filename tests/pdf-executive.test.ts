import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { extractText, getDocumentProxy } from 'unpdf';
import { ATSPdfDocument } from '@/components/preview/PDFDocument';

const data = {
  score: 90,
  keywords_matched: ['Controle de gestion', 'Consolidation IFRS'],
  keywords_missing: [],
  cv_summary: 'Profil de test resume professionnel.',
  personal_info: { name: 'Thomas Garcia', title: 'Commercial', email: 'a@b.co', phone: '123456', location: 'Yaounde' },
  cv_experiences: [{ title: 'Charge de com', company: 'Durance Media', dates: '12/12/2025', bullet_points: ['Lancement de marque'] }],
  education: [{ degree: 'Master', institution: 'Ecole Amede', dates: '2022' }],
  languages: ['Francais', 'Anglais'],
  hobbies: ['Football'],
  cover_letter: '',
  email_text: '',
};

async function pdfText(template: 'standard' | 'modern' | 'executive', compact = false) {
  const buf = await renderToBuffer(React.createElement(ATSPdfDocument, { data, template, compact }) as any);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return text as string;
}

describe('PDF templates route distinctly', () => {
  // Le letterSpacing des rubriques insère des espaces entre les lettres à
  // l'extraction ; on compare donc sur le texte sans espaces.
  it('executive renders the navy sidebar (photo placeholder)', async () => {
    const t = (await pdfText('executive')).replace(/\s+/g, '');
    expect(t).toContain('PHOTO');   // emplacement photo, propre au gabarit exécutif
  });

  it('standard is a different layout (no photo placeholder)', async () => {
    const t = (await pdfText('standard')).replace(/\s+/g, '');
    expect(t).not.toContain('PHOTO');
  });

  it('modern renders (centered header + À propos + compétences)', async () => {
    const t = (await pdfText('modern')).replace(/\s+/g, '');
    expect(t).toContain('PROPOS');   // « À PROPOS DE MOI » propre au gabarit modern
  });

  it('compact variant renders (fit-to-one-page path)', async () => {
    const t = (await pdfText('executive', true)).replace(/\s+/g, '');
    expect(t).toContain('PHOTO');    // le rendu compact (marges/polices reduites) ne casse pas
  });
}, 50000);
