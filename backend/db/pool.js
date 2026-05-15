import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

// ─────────────────────────────────────────────────────────────────────────────
// Neon uses a single DATABASE_URL connection string.
// Local PostgreSQL uses individual PG_* variables.
// The pool automatically picks whichever is present.
// ─────────────────────────────────────────────────────────────────────────────

let poolConfig;

if (process.env.DATABASE_URL) {
  // ── Neon (or any Postgres URL) ────────────────────────────────────────────
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },   // Neon requires SSL
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
  console.log('🔗 Using DATABASE_URL (Neon / remote PostgreSQL)');
} else {
  // ── Local PostgreSQL ──────────────────────────────────────────────────────
  poolConfig = {
    host:     process.env.PG_HOST     || 'localhost',
    port:     parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'medithrex',
    user:     process.env.PG_USER     || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl:      false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
  console.log(`🔗 Using local PostgreSQL → ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);
}

let pool;

try {
  pool = new Pool(poolConfig);
} catch (err) {
  console.error('❌ Failed to create PostgreSQL pool:', err.message);
  pool = null;
}

if (pool) {
  pool.on('connect', () => console.log('✅ PostgreSQL connected'));
  pool.on('error',  (err) => console.error('❌ PostgreSQL pool error:', err.message));
}

export const query     = (text, params) => pool ? pool.query(text, params) : Promise.reject(new Error('PostgreSQL unavailable'));
export const getClient = () => pool ? pool.connect() : Promise.reject(new Error('PostgreSQL unavailable'));
export default pool;
