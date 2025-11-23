import { sql } from 'drizzle-orm';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();
  
  // Check if payment_plans table exists
  const result = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'payment%'
  `);
  
  console.log('Payment tables:', result.rows);
  
  // Try to select from payment_plans
  const plansResult = await client.query('SELECT * FROM payment_plans LIMIT 1');
  console.log('Plans query result:', plansResult.rows);
  
  await client.end();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
