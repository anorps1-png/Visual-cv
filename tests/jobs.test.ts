import { describe, it, expect } from 'vitest';
import { cleanHtml, findDeadline, isDeadlinePassed, inferLocation } from '@/lib/jobs/parsing';

describe('cleanHtml', () => {
  it('retire les balises et décode les entités', () => {
    expect(cleanHtml('<p>Ing&eacute;nieur &amp; chef</p>')).toBe('Ingénieur & chef');
  });

  it('normalise les espaces', () => {
    expect(cleanHtml('<div>a\n\n   b</div>')).toBe('a b');
  });
});

describe('findDeadline', () => {
  const NOW = new Date(2026, 6, 15); // 15 juillet 2026

  it('trouve une date au format numérique', () => {
    const d = findDeadline('Date limite : 20/08/2026', '');
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(7); // août
    expect(d?.getDate()).toBe(20);
  });

  it('trouve une date avec un mois en toutes lettres', () => {
    const d = findDeadline("Dossiers reçus jusqu'au 3 septembre 2026", '');
    expect(d?.getMonth()).toBe(8);
    expect(d?.getDate()).toBe(3);
  });

  // Le point délicat : une date SANS mot-clé de deadline (ex. date de
  // publication) ne doit pas être prise pour une date limite.
  it('ignore une date sans mot-clé de date limite', () => {
    expect(findDeadline('Publiée le 10/01/2026, poste à pourvoir', '')).toBeNull();
  });

  it('renvoie null si aucune date', () => {
    expect(findDeadline('Candidatures ouvertes', '')).toBeNull();
  });

  it('détecte une offre périmée', () => {
    expect(isDeadlinePassed('Date limite : 01/01/2026', '', NOW)).toBe(true);
  });

  it("n'écarte pas une offre encore valide", () => {
    expect(isDeadlinePassed('Date limite : 31/12/2026', '', NOW)).toBe(false);
  });

  it("n'écarte pas une offre sans date limite", () => {
    expect(isDeadlinePassed('Poste ouvert', '', NOW)).toBe(false);
  });

  // Une offre dont la limite est aujourd'hui est encore ouverte.
  it("garde une offre dont la limite est aujourd'hui", () => {
    expect(isDeadlinePassed('Date limite : 15/07/2026', '', NOW)).toBe(false);
  });
});

describe('inferLocation', () => {
  it('reconnaît Douala et Yaoundé (avec ou sans accent)', () => {
    expect(inferLocation('Poste basé à Douala', '')).toBe('Douala, Cameroun');
    expect(inferLocation('', 'Comptable Yaounde')).toBe('Yaoundé, Cameroun');
  });

  it('retombe sur Cameroun par défaut', () => {
    expect(inferLocation('Télétravail', '')).toBe('Cameroun');
  });
});
