/**
 * One-shot: reset Rutima Gopala (and optional other healers) to password healer123.
 * Run on Replit from app root:
 *   npx tsx scripts/reset-rutima-password.ts
 */
import { db } from "../server/db";
import { users, healers } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { sql } from "drizzle-orm";

const TARGETS = ["Rutima Gopala", "rutima gopala", "RutimaGopala"];
const PASSWORD = "healer123";

async function main() {
  const hashed = await hashPassword(PASSWORD);
  let fixed = 0;

  // Prefer exact / case-insensitive match on known usernames
  for (const username of TARGETS) {
    const found = await db.execute(
      sql`SELECT id, username, user_type, is_active FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1`
    );
    if (!found.rows.length) continue;
    const row = found.rows[0] as any;
    await db.execute(sql`UPDATE users SET password = ${hashed}, is_active = true WHERE id = ${row.id}`);
    await db.execute(
      sql`UPDATE healers SET password = ${hashed} WHERE LOWER(username) = LOWER(${row.username})`
    );
    console.log(`✓ Reset password for user #${row.id} "${row.username}" → ${PASSWORD}`);
    fixed++;
  }

  // Fallback: fuzzy search if exact miss
  if (fixed === 0) {
    const fuzzy = await db.execute(
      sql`SELECT id, username FROM users WHERE LOWER(username) LIKE '%rutima%' OR LOWER(name) LIKE '%rutima%' LIMIT 10`
    );
    for (const row of fuzzy.rows as any[]) {
      await db.execute(sql`UPDATE users SET password = ${hashed}, is_active = true WHERE id = ${row.id}`);
      await db.execute(
        sql`UPDATE healers SET password = ${hashed} WHERE LOWER(username) = LOWER(${row.username})`
      );
      console.log(`✓ Fuzzy reset for user #${row.id} "${row.username}" → ${PASSWORD}`);
      fixed++;
    }
  }

  if (fixed === 0) {
    console.error("No Rutima account found. Check username spelling in the users table.");
    process.exit(1);
  }
  console.log(`Done. ${fixed} account(s) can log in with password: ${PASSWORD}`);
  console.log('Login username is usually exactly: "Rutima Gopala" (with the space).');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
