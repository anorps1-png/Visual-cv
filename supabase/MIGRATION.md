# Migration vers un projet Supabase dédié

## Pourquoi

Visual-CV partageait une base Supabase avec d'autres applications (ERP/factures,
réservations, paris — 38 tables au total). Conséquences :

- **Collisions de noms** : une table `payments` existait déjà (celle du module
  facturation, `payments.invoice_id → invoices`), ce qui a forcé un préfixe `cv_`
  artificiel sur les tables de facturation de Visual-CV.
- **Rayon d'impact** : le mot de passe de cette base donne un accès total en
  écriture et suppression sur **toutes** les applications, pas seulement Visual-CV.
- **Sauvegardes et restaurations** impossibles à cibler par application.

Dans un projet dédié, les tables reprennent leurs noms naturels (`payments`,
`subscriptions`, `quota_usage` — plus de préfixe) : voir `schema.sql`.

## Ce qui est migré

Rien de critique : la base ne contient **aucune donnée métier**.

| Donnée | Volume | Action |
|---|---|---|
| CV générés | 0 | rien à migrer |
| Abonnements / paiements | 0 | rien à migrer |
| Offres d'emploi | 31 | régénérées par le cron en une exécution |
| Comptes utilisateurs | 2 (comptes de test) | à recréer via l'inscription |

## Étapes

### 1. Créer le projet Supabase

Sur [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
Choisir une région proche des utilisateurs (ex. `eu-central-1`) et **noter le mot
de passe de la base** — il n'est affiché qu'une fois.

### 2. Appliquer le schéma

Récupérer la connection string dans **Settings → Database → Connection string → URI**,
puis :

```bash
PG_URL="postgresql://postgres.<ref>:<mot-de-passe>@<host>:5432/postgres" npm run db:setup
```

Le script applique `schema.sql` puis **vérifie** que tout est opérationnel :
tables, fonctions RPC, RLS actif partout, rate limiting et recherche plein-texte.
Il est idempotent (ré-exécutable sans risque).

Alternative sans terminal : copier-coller `supabase/schema.sql` dans le
**SQL Editor** du dashboard.

### 3. Mettre à jour les variables d'environnement

Dans `.env.local` (et dans les variables d'environnement Vercel), remplacer par
les valeurs du **nouveau** projet (Settings → API) :

```
NEXT_PUBLIC_SUPABASE_URL=https://<nouveau-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<nouvelle clé anon>
SUPABASE_SERVICE_ROLE_KEY=<nouvelle clé service_role>
```

Les autres variables (`OPENAI_*`, `PAYMENT_PROVIDER`, `CRON_SECRET`…) restent
inchangées.

### 4. Peupler les offres d'emploi

```bash
npm run dev
curl -X POST http://localhost:3000/api/cron/scrape-jobs \
  -H "Authorization: Bearer $CRON_SECRET"
```

Compter ~1 minute. En production, le cron Vercel s'en charge chaque jour à 05:00.

### 5. Recréer votre compte

S'inscrire via la modale de connexion de l'application. Les mots de passe étant
hachés, les comptes ne sont pas transférables — sans conséquence ici, aucune
donnée n'y étant rattachée.

### 6. Vérifier

- [ ] Inscription / connexion
- [ ] Recherche d'offres (résultats affichés)
- [ ] Génération d'un CV
- [ ] 2ᵉ génération sur un compte gratuit → bloquée (402, redirection vers Tarifs)
- [ ] Historique : le CV généré apparaît

## Ancienne base

Les tables Visual-CV (`cvs`, `jobs`, `cv_subscriptions`, `cv_payments`,
`cv_quota_usage`, `rate_limits`) y sont **laissées en place** : elles servent de
retour arrière tant que le nouveau projet n'est pas validé. Une fois la bascule
confirmée, elles peuvent être supprimées — sans jamais toucher aux tables des
autres applications (`payments`, `invoices`, etc.).

> ⚠️ Le mot de passe de l'ancienne base a été exposé : le régénérer
> (**Settings → Database → Reset database password**), ainsi que les clés
> API OpenAI/Sublyx et DeepSeek.
