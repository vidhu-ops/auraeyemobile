import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

const { Pool } = pg;

function cleanUrl(url: string) {
  return url.replace(/^['"]|['"]$/g, '');
}

function getConnectionString(): string {
  const directUrl = process.env.DATABASE_URL;
  if (directUrl) {
    return cleanUrl(directUrl);
  }

  if (process.env.PGHOST && process.env.PGHOST !== '') {
    const user = process.env.PGUSER || 'postgres';
    const password = process.env.PGPASSWORD || '';
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || '5432';
    const database = process.env.PGDATABASE || 'heliumdb';
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

function getPoolConfig() {
  const connectionString = getConnectionString();
  const needsSsl = connectionString.includes("sslmode=require") || !!process.env.REPLIT_DEPLOYMENT || process.env.NODE_ENV === "production";
  return {
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  };
}

export const pool = new Pool(getPoolConfig());
export const db = drizzle({ client: pool, schema });
