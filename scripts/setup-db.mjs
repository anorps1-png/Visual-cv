/**
 * Applique le schéma Visual-CV à un projet Supabase et vérifie qu'il est
 * opérationnel (tables, RPC, RLS, recherche plein-texte).
 *
 * Usage :
 *   PG_URL="postgresql://postgres.<ref>:<mdp>@<host>:5432/postgres" node scripts/setup-db.mjs
 *
 * La connection string se trouve dans : Supabase > Settings > Database >
 * Connection string > URI. Idempotent : ré-exécutable sans risque.
 */
import postgres from 'postgres';
import { readFileSync } from 'node:fs';

const PG_URL = process.env.PG_URL;
if (!PG_URL) {
  console.error('Erreur : variable PG_URL manquante.\n');
  console.error('  PG_URL="postgresql://..." node scripts/setup-db.mjs');
  process.exit(1);
}

const sql = postgres(PG_URL, { ssl: 'require', max: 1 });

const TABLES = ['cvs', 'jobs', 'rate_limits', 'subscriptions', 'payments', 'quota_usage'];
const FUNCTIONS = ['check_rate_limit', 'consume_generation_quota'];

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

try {
  console.log('\n1. Application du schéma…');
  await sql.unsafe(readFileSync('supabase/schema.sql', 'utf-8'));
  console.log('   schéma appliqué.');

  console.log('\n2. Vérification des tables');
  const tables = (
    await sql`select table_name from information_schema.tables where table_schema = 'public'`
  ).map((r) => r.table_name);
  for (const t of TABLES) check(t, tables.includes(t));

  console.log('\n3. Vérification des fonctions (RPC)');
  const fns = (
    await sql`select routine_name from information_schema.routines where routine_schema = 'public'`
  ).map((r) => r.routine_name);
  for (const f of FUNCTIONS) check(f, fns.includes(f));

  console.log('\n4. Vérification du RLS (doit être actif partout)');
  const rls = await sql`
    select tablename, rowsecurity from pg_tables
    where schemaname = 'public' and tablename = any(${TABLES})`;
  for (const r of rls) check(`RLS actif sur ${r.tablename}`, r.rowsecurity);

  console.log('\n5. Test fonctionnel du rate limiting');
  const key = `setup-check:${Date.now()}`;
  const [rl1] = await sql`select * from public.check_rate_limit(${key}, 1, 60)`;
  const [rl2] = await sql`select * from public.check_rate_limit(${key}, 1, 60)`;
  check('1er appel autorisé', rl1.allowed === true);
  check('2e appel bloqué (limite = 1)', rl2.allowed === false);
  await sql`delete from public.rate_limits where id = ${key}`;

  console.log('\n6. Test de la recherche plein-texte');
  await sql`
    insert into public.jobs (title, company, location, description, source_url)
    values ('Développeur Test', 'ACME', 'Douala', 'Poste de développeur web', 'setup-check://tmp')
    on conflict (source_url) do nothing`;
  const found = await sql`
    select id from public.jobs
    where search_vector @@ websearch_to_tsquery('french', 'développeur')`;
  check('index plein-texte opérationnel', found.length > 0);
  await sql`delete from public.jobs where source_url = 'setup-check://tmp'`;

  console.log(
    failures === 0
      ? '\n✅ Base prête. Renseignez les variables d’environnement, puis lancez le cron pour peupler les offres.\n'
      : `\n❌ ${failures} vérification(s) en échec.\n`
  );
} catch (e) {
  console.error('\n❌ Échec :', e.message, '\n');
  failures++;
} finally {
  await sql.end();
}

process.exit(failures === 0 ? 0 : 1);
