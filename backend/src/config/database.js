const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const connectionString = process.env.DATABASE_URL_SUPABASE || 
  'postgresql://postgres.ymshmjwgekuqwrfqforg:ismael3953036POM@aws-1-us-west-2.pooler.supabase.com:6543/postgres';

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
