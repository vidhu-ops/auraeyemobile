const xlsx = require('xlsx');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { Pool } = require('@neondatabase/serverless');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

function isAlreadyHashed(pw) {
  if (!pw || typeof pw !== 'string') return false;
  // bcrypt format
  if (pw.startsWith('$2')) return true;
  // scrypt format: hex.hex (our app's format)
  const parts = pw.split('.');
  if (parts.length === 2) {
    const [hash, salt] = parts;
    if (/^[0-9a-f]{100,}$/i.test(hash) && /^[0-9a-f]{20,}$/i.test(salt)) return true;
  }
  return false;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Reading users spreadsheet...');
  const wb = xlsx.readFile('attached_assets/users_(4)_1778336581168.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const dataRows = rows.slice(1).filter(r => r.length > 0 && r[0]);
  console.log(`Found ${dataRows.length} user rows to process\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const [id, username, rawPassword, userType, birthDate, , credits, email, mobileNumber, soulEnergy] = row;

    if (!username || !rawPassword) {
      console.log(`  ⚠️  Skipping row id=${id} — missing username or password`);
      skipped++;
      continue;
    }

    let finalPassword = String(rawPassword);
    if (!isAlreadyHashed(finalPassword)) {
      process.stdout.write(`  🔑 Hashing plain password for: ${username} ... `);
      finalPassword = await hashPassword(finalPassword);
      process.stdout.write('done\n');
    }

    try {
      const result = await pool.query(
        `INSERT INTO users (username, password, user_type, birth_date, credits, email, mobile_number, soul_energy, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         ON CONFLICT (username) DO UPDATE SET
           password       = EXCLUDED.password,
           user_type      = EXCLUDED.user_type,
           birth_date     = COALESCE(EXCLUDED.birth_date, users.birth_date),
           credits        = GREATEST(EXCLUDED.credits, users.credits),
           email          = COALESCE(EXCLUDED.email, users.email),
           mobile_number  = COALESCE(EXCLUDED.mobile_number, users.mobile_number),
           soul_energy    = GREATEST(EXCLUDED.soul_energy, users.soul_energy),
           is_active      = true
         RETURNING id, xmax`,
        [
          String(username).trim(),
          finalPassword,
          String(userType || 'client'),
          birthDate ? String(birthDate).trim() : null,
          Number(credits) || 0,
          email ? String(email).trim() : null,
          mobileNumber ? String(mobileNumber).trim() : null,
          Number(soulEnergy) || 0
        ]
      );

      // xmax = 0 means the row was freshly inserted; non-zero means it was updated
      const wasInserted = result.rows[0]?.xmax === '0' || result.rows[0]?.xmax === 0;
      if (wasInserted) {
        inserted++;
        console.log(`  ✅ Inserted: ${username} (${userType})`);
      } else {
        updated++;
        console.log(`  🔄 Updated:  ${username} (${userType})`);
      }
    } catch (err) {
      console.error(`  ❌ Error for ${username}: ${err.message}`);
      skipped++;
    }
  }

  await pool.end();
  console.log(`\n========================================`);
  console.log(`Import complete:`);
  console.log(`  Inserted : ${inserted}`);
  console.log(`  Updated  : ${updated}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Total    : ${dataRows.length}`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
