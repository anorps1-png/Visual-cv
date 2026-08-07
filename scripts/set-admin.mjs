/**
 * Promeut (ou rétrograde) un utilisateur au rôle admin.
 *
 * Le rôle est stocké dans auth.users.raw_app_meta_data.role, qui correspond à
 * `app_metadata` côté API — modifiable uniquement avec un accès privilégié,
 * jamais par l'utilisateur lui-même.
 *
 * Usage :
 *   EMAIL="moi@example.com" PG_URL="postgresql://..." node scripts/set-admin.mjs
 *   EMAIL="moi@example.com" PG_URL="..." REVOKE=1 node scripts/set-admin.mjs   # retire l'accès
 */
import postgres from 'postgres';

const { EMAIL, PG_URL, REVOKE } = process.env;
if (!EMAIL || !PG_URL) {
  console.error('Erreur : EMAIL et PG_URL sont requis.\n');
  console.error('  EMAIL="moi@example.com" PG_URL="postgresql://..." node scripts/set-admin.mjs');
  process.exit(1);
}

const sql = postgres(PG_URL, { ssl: 'require', max: 1 });
const makeAdmin = !REVOKE;

try {
  const [user] = await sql`select id, email from auth.users where email = ${EMAIL}`;
  if (!user) {
    console.error(`❌ Aucun utilisateur avec l'email "${EMAIL}". Inscrivez-vous d'abord dans l'app.`);
    process.exit(1);
  }

  // On fusionne dans le JSON existant : role ajouté ou retiré, le reste préservé.
  if (makeAdmin) {
    await sql`
      update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
      where id = ${user.id}`;
  } else {
    await sql`
      update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
      where id = ${user.id}`;
  }

  const [check] = await sql`select raw_app_meta_data->>'role' as role from auth.users where id = ${user.id}`;
  const ok = makeAdmin ? check.role === 'admin' : check.role == null;
  console.log(
    ok
      ? `✅ ${EMAIL} est désormais ${makeAdmin ? 'ADMIN' : 'un utilisateur standard'}.`
      : `❌ Échec : rôle courant = ${check.role ?? 'aucun'}`
  );
  console.log('   (déconnectez-vous / reconnectez-vous pour rafraîchir le token.)');
  process.exit(ok ? 0 : 1);
} catch (e) {
  console.error('❌ Erreur :', e.message);
  process.exit(1);
} finally {
  await sql.end();
}
