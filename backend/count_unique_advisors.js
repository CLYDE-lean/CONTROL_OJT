const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
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
  connectionTimeoutMillis: 10000
});

async function countUniqueAdvisors() {
  try {
    const client = await pool.connect();
    console.log('🔍 Consultando base de datos Supabase...\n');

    try {
      const colRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'CONTROL'`);
      console.log('📌 Columnas en CONTROL:', colRes.rows.map(r => r.column_name).join(', '));

      const formRes = await client.query(`SELECT DISTINCT "FORMADOR" FROM public."CONTROL" LIMIT 10`);
      console.log('📌 Formadores muestra:', formRes.rows.map(r => r.FORMADOR));

      const countFormadores = await client.query(`SELECT COUNT(DISTINCT "FORMADOR") as count FROM public."CONTROL" WHERE "FORMADOR" IS NOT NULL AND TRIM(CAST("FORMADOR" AS VARCHAR)) != '' AND UPPER(TRIM(CAST("FORMADOR" AS VARCHAR))) != 'NULL'`);
      console.log('📌 Total Formadores Válidos:', countFormadores.rows[0].count);
    } catch (e) {
      console.log('Error en CONTROL:', e.message);
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

countUniqueAdvisors();
