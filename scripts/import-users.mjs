import { readFileSync } from 'fs';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import pkg from 'xlsx';
const { readFile, utils } = pkg;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

function isHashed(pw) {
  if (!pw || typeof pw !== 'string') return false;
  const parts = pw.split('.');
  if (parts.length !== 2) return false;
  const [hash, salt] = parts;
  // scrypt hash is 64 bytes = 128 hex chars, salt is 16 bytes = 32 hex chars
  // Also accept bcrypt ($2b$...) as already-hashed
  return /^[0-9a-f]{100,}$/i.test(hash) && /^[0-9a-f]{20,}$/i.test(salt);
}

const { Pool } = (await import('@neondatabase/serverless')).default || (await import('@neondatabase/serverless'));

// Use dynamic import to get Pool from the right place
import('@neondatabase/serverless').then(async (mod) => {
  const Pool = mod.Pool || mod.default?.Pool;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const wb = readFile('attached_assets/users_(4)_1778336581168.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = utils.sheet_to_json(sheet, { header: 1 });

  const headers = rows[0]; // ["id","username","password","user_type","birth_date","created_at","credits","email","mobile_number","soul_energy"]
  const dataRows = rows.slice(1).filter(r => r.length > 0 && r[0]);

  console.log(`Found ${dataRows.length} users to import`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const [id, username, rawPassword, userType, birthDate, , credits, email, mobileNumber, soulEnergy] = row;

    if (!username || !rawPassword) {
      console.log(`Skipping row with missing username or password: id=${id}`);
      skipped++;
      continue;
    }

    let finalPassword = rawPassword;
    if (!isHashed(String(rawPassword)) && !String(rawPassword).startsWith('$2')) {
      console.log(`  Hashing plain-text password for: ${username}`);
      finalPassword = await hashPassword(String(rawPassword));
    }

    try {
      const result = await pool.query(
        `INSERT INTO users (username, password, user_type, birth_date, credits, email, mobile_number, soul_energy, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         ON CONFLICT (username) DO UPDATE SET
           password = EXCLUDED.password,
           user_type = EXCLUDED.user_type,
           birth_date = COALESCE(EXCLUDED.birth_date, users.birth_date),
           credits = GREATEST(EXCLUDED.credits, users.credits),
           email = COALESCE(EXCLUDED.email, users.email),
           mobile_number = COALESCE(EXCLUDED.mobile_number, users.mobile_number),
           soul_energy = GREATEST(EXCLUDED.soul_energy, users.soul_energy),
           is_active = true
         RETURNING id, (xmax = 0) AS inserted`,
        [
          String(username),
          String(finalPassword),
          String(userType || 'client'),
          birthDate ? String(birthDate) : null,
          Number(credits) || 0,
          email ? String(email) : null,
          mobileNumber ? String(mobileNumber) : null,
          Number(soulEnergy) || 0
        ]
      );

      const wasInserted = result.rows[0]?.inserted;
      if (wasInserted) {
        inserted++;
        console.log(`  ✅ Inserted: ${username} (${userType})`);
      } else {
        updated++;
        console.log(`  🔄 Updated: ${username} (${userType})`);
      }
    } catch (err) {
      console.error(`  ❌ Error for ${username}: ${err.message}`);
      skipped++;
    }
  }

  await pool.end();
  console.log(`\n✅ Import complete: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
});
