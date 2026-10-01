const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const rawConnectionString = process.env.DATABASE_URL_SUPABASE || process.env.DATABASE_URL || '';
const connectionString = rawConnectionString.trim();

if (!connectionString) {
  throw new Error(
    'Falta DATABASE_URL_SUPABASE o DATABASE_URL. Define la variable en backend/.env (local) o en las Environment Variables del proyecto (Vercel).'
  );
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de Supabase:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
