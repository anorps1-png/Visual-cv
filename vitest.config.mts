import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Résolution native des alias `@/*` du tsconfig (pas besoin de plugin).
  resolve: { tsconfigPaths: true },
  test: {
    // La logique testée est du code serveur (schémas, quotas, logger) :
    // pas besoin de jsdom.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
