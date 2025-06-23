// src/utils/db.ts
import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Konfigurace Neon DB
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL není definovaná v proměnných prostředí');
}

// Pro serverless prostředí (API routes, Server Components)
export const sql = neon(connectionString);

// Pro připojení k databázi přes pool (více připojení)
let pool: Pool | null = null;

export function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString,
        });
    }
    return pool;
}