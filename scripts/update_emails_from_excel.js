
import XLSX from 'xlsx';
import pkg from 'pg';
const { Pool } = pkg;

async function updateEmails() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const workbook = XLSX.readFile('attached_assets/users_(2)_1770111513737.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${data.length} rows from Excel...`);

    for (const row of data) {
      const username = row.username || row.Username;
      const email = row.email || row.Email;

      if (username && email) {
        const res = await pool.query(
          'UPDATE users SET email = $1 WHERE username = $2 RETURNING id',
          [email.trim(), username.trim()]
        );
        if (res.rowCount > 0) {
          console.log(`Updated email for user: ${username}`);
        } else {
          console.log(`User not found or no change: ${username}`);
        }
      }
    }
    console.log('Update complete.');
  } catch (err) {
    console.error('Error updating emails:', err);
  } finally {
    await pool.end();
  }
}

updateEmails();
