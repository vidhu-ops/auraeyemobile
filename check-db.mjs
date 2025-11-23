import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();
  
  // Check if payment_plans table exists and has data
  const result = await client.query('SELECT * FROM payment_plans');
  console.log('Payment plans found:', result.rows.length);
  if (result.rows.length > 0) {
    console.log('First plan:', result.rows[0]);
  }
  
  await client.end();
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
