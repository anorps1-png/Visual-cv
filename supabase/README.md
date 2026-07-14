# Supabase — persistance

La persistance est désormais dans Postgres (Supabase), plus dans des fichiers JSON.

## Mise en place (à faire une fois)

1. **Variables d'environnement** (`.env.local`, voir `.env.example`) :
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → `service_role`).
     ⚠️ Serveur uniquement, jamais préfixée `NEXT_PUBLIC_`.

2. **Exécuter les migrations** dans Supabase → SQL Editor, dans l'ordre :
   - `migrations/0001_init_cvs_jobs.sql` — tables `cvs` et `jobs` + RLS
   - `migrations/0002_seed_jobs.sql` — import des offres existantes (optionnel)
   - `migrations/0003_rate_limits.sql` — rate limiting atomique (anti-abus API)
   - `migrations/0004_billing.sql` — abonnements, paiements et quotas mensuels

## Modèle

- `cvs` — historique par utilisateur. RLS : chacun ne voit/écrit/supprime que ses lignes (`auth.uid() = user_id`).
- `jobs` — offres d'emploi. Lecture publique ; écriture réservée au service-role côté serveur.
- `rate_limits` — compteurs anti-abus (fenêtre glissante). RPC `check_rate_limit`, service-role uniquement.
- `subscriptions` — plan courant par utilisateur. Lecture par le propriétaire ; écriture via webhook (service-role).
- `payments` — journal auditable des paiements. Lecture par le propriétaire.
- `quota_usage` — compteur mensuel de générations. RPC `consume_generation_quota` (atomique).

## Paiement

L'adaptateur PSP est sélectionné par `PAYMENT_PROVIDER` :

- `mock` (défaut) — confirme le paiement immédiatement. Permet de tester tout le
  flux d'abonnement et de quotas **sans compte marchand**.
- `kpay` — Mobile Money réel. Nécessite `KPAY_BASE_URL`, `KPAY_API_KEY`,
  `KPAY_WEBHOOK_SECRET`, et la confirmation des `// TODO KPAY:` dans
  `src/lib/payments/kpay.ts` (endpoints + format du webhook).
