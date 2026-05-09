import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

const { Pool } = pg;

// Prefer Replit's managed database (PGHOST) over any external DATABASE_URL
function getConnectionString(): string {
  if (process.env.PGHOST && process.env.PGHOST !== '') {
    const user = process.env.PGUSER || 'postgres';
    const password = process.env.PGPASSWORD || '';
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || '5432';
    const database = process.env.PGDATABASE || 'heliumdb';
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  return url.replace(/^['"]|['"]$/g, '');
}

const connectionString = getConnectionString();

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
