import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import ws from "ws";
import * as schema from "@shared/schema";
import * as relations from "@shared/relations";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Determine which database to use based on environment
const isSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

let pool: any;
let db: any;

if (isSupabase) {
  // Use Supabase (PostgreSQL)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set for Supabase. Please provide your Supabase database URL.",
    );
  }
  
  const client = postgres(process.env.DATABASE_URL);
  db = drizzlePostgres(client, { schema: { ...schema, ...relations } });
  console.log('Using Supabase database');
} else {
  // Use Neon (fallback)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: { ...schema, ...relations } });
  console.log('Using Neon database');
}

export { pool, db };