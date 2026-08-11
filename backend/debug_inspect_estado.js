const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_SUPABASE || 'postgresql://postgres.ymshmjwgekuqwrfqforg:ismael3953036POM@aws-1-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectEstadoValues() {
  try {
    const client = await pool.connect();
    console.log('🔍 Inspeccionando valores de ESTADO y columnas en public."CONTROL"...\n');

    // 1. DISTINCT de ESTADO
    try {
      const estadoRes = await client.query(`
        SELECT TRIM(CAST("ESTADO" AS VARCHAR)) as estado, COUNT(*) as cantidad
        FROM public."CONTROL"
        GROUP BY TRIM(CAST("ESTADO" AS VARCHAR))
        ORDER BY cantidad DESC;
      `);
      console.log('📊 Valores encontrados en la columna "ESTADO":');
      console.table(estadoRes.rows);
    } catch (e) {
      console.error('❌ Error consultando ESTADO:', e.message);
    }

    // 2. Muestra de 5 filas completas de public."CONTROL"
    try {
      const sampleRes = await client.query('SELECT * FROM public."CONTROL" LIMIT 3;');
      console.log('\n📋 Muestra de 3 registros completos de public."CONTROL":');
      console.log(JSON.stringify(sampleRes.rows, null, 2));
    } catch (e) {
      console.error('❌ Error consultando registros:', e.message);
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

inspectEstadoValues();
