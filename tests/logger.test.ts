import { describe, it, expect } from 'vitest';
import { redact } from '@/lib/logger';

const str = (v: unknown) => JSON.stringify(redact(v));

describe('redact — secrets', () => {
  it('masque la valeur des clés sensibles', () => {
    const out = redact({ password: 'hunter2', access_token: 'abc', apiKey: 'xyz' }) as Record<
      string,
      unknown
    >;
    expect(out.password).toBe('[REDACTED]');
    expect(out.access_token).toBe('[REDACTED]');
    expect(out.apiKey).toBe('[REDACTED]');
  });

  it('masque une clé API même hors champ nommé', () => {
    const out = str({ note: 'ma clé est sk-e60a40dbf8aad4563df794e6017c3437' });
    expect(out).not.toContain('sk-e60a40');
    expect(out).toContain('[REDACTED]');
  });

  it('masque un JWT (clé service_role Supabase)', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.abc123';
    const out = str({ msg: `token: ${jwt}` });
    expect(out).not.toContain('eyJhbGci');
    expect(out).toContain('[JWT_REDACTED]');
  });

  it('masque une connection string Postgres', () => {
    const out = str({ msg: 'postgresql://postgres:MonMotDePasse@db.host:5432/postgres' });
    expect(out).not.toContain('MonMotDePasse');
    expect(out).toContain('[REDACTED]');
  });
});

describe('redact — données personnelles', () => {
  // Un CV entier dans les logs de l'hébergeur = fuite de données personnelles.
  it("masque le contenu des CV et des livrables", () => {
    const out = redact({
      cvText: 'Jean Dupont, 10 ans expérience...',
      originalText: 'contenu du CV',
      cover_letter: 'Madame, Monsieur...',
      email_text: 'Bonjour...',
      jobDescription: 'Nous recherchons...',
    }) as Record<string, unknown>;
    expect(Object.values(out).every((v) => v === '[REDACTED]')).toBe(true);
  });

  it('masque les adresses email', () => {
    const out = str({ msg: 'contact: jean.dupont@example.cm' });
    expect(out).not.toContain('jean.dupont@example.cm');
    expect(out).toContain('[EMAIL_REDACTED]');
  });

  it('tronque les chaînes très longues', () => {
    const out = redact({ blob: 'x'.repeat(2000) }) as Record<string, string>;
    expect(out.blob.length).toBeLessThan(600);
    expect(out.blob).toContain('[TRUNCATED]');
  });
});

describe('redact — robustesse', () => {
  it('traverse les objets imbriqués', () => {
    const out = str({ a: { b: { c: { password: 'secret' } } } });
    expect(out).not.toContain('secret');
    expect(out).toContain('[REDACTED]');
  });

  it('borne les tableaux longs et la profondeur', () => {
    const arr = redact(Array.from({ length: 50 }, (_, i) => i)) as unknown[];
    expect(arr.length).toBe(10);

    // Une structure très profonde ne doit pas provoquer de récursion infinie.
    let deep: Record<string, unknown> = { v: 1 };
    for (let i = 0; i < 20; i++) deep = { nested: deep };
    expect(() => redact(deep)).not.toThrow();
  });

  it('laisse passer les valeurs anodines', () => {
    expect(redact({ userId: 'u1', count: 3, ok: true })).toEqual({
      userId: 'u1',
      count: 3,
      ok: true,
    });
  });
});
