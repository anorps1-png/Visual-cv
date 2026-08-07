import { describe, it, expect } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth/admin';
import { adminSetPlanSchema } from '@/lib/validation/cv';

const mkUser = (over: Partial<User>): User => ({
  id: 'u1',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '',
  ...over,
}) as User;

describe('isAdmin', () => {
  it('reconnaît un admin via app_metadata', () => {
    expect(isAdmin(mkUser({ app_metadata: { role: 'admin' } }))).toBe(true);
  });

  // Sécurité clé : user_metadata est modifiable par l'utilisateur lui-même.
  // Un rôle admin qui y serait posé ne doit JAMAIS conférer les droits.
  it("ignore un rôle placé dans user_metadata (anti auto-élévation)", () => {
    expect(isAdmin(mkUser({ user_metadata: { role: 'admin' }, app_metadata: {} }))).toBe(false);
  });

  it('refuse un utilisateur sans rôle', () => {
    expect(isAdmin(mkUser({ app_metadata: {} }))).toBe(false);
  });

  it('refuse une autre valeur de rôle', () => {
    expect(isAdmin(mkUser({ app_metadata: { role: 'moderator' } }))).toBe(false);
  });

  it('refuse null / undefined', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe('adminSetPlanSchema', () => {
  const uuid = '3f1c2e4a-9b8d-4c7e-a1f2-0123456789ab'; // v4 valide

  it('accepte un plan valide (y compris Gratuit en rétrogradation)', () => {
    expect(adminSetPlanSchema.safeParse({ userId: uuid, plan: 'Gratuit' }).success).toBe(true);
    expect(adminSetPlanSchema.safeParse({ userId: uuid, plan: 'Professionnel' }).success).toBe(true);
  });

  it('rejette un plan inconnu', () => {
    expect(adminSetPlanSchema.safeParse({ userId: uuid, plan: 'Pirate' }).success).toBe(false);
  });

  it('rejette un userId non-UUID ou manquant', () => {
    expect(adminSetPlanSchema.safeParse({ userId: 'abc', plan: 'Gratuit' }).success).toBe(false);
    expect(adminSetPlanSchema.safeParse({ plan: 'Gratuit' }).success).toBe(false);
  });
});
