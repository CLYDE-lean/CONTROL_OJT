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
  ssl: { rejectUnauthorized: false }
});

async function testFilters() {
  try {
    const client = await pool.connect();
    console.log('🔍 Probando consultas de filtrado en Supabase...\n');

    // 1. Obtener valores distintos de CAMPAÑA con conteo
    const campRes = await client.query(`
      SELECT DISTINCT TRIM(CAST("CAMPAÑA" AS VARCHAR)) as campana, COUNT(*) as cantidad
      FROM public."CONTROL"
      WHERE "CAMPAÑA" IS NOT NULL AND TRIM(CAST("CAMPAÑA" AS VARCHAR)) != ''
      GROUP BY TRIM(CAST("CAMPAÑA" AS VARCHAR))
      ORDER BY cantidad DESC
      LIMIT 10;
    `);

    console.log('📌 Campañas Reales en Supabase (con conteo de filas):');
    campRes.rows.forEach(r => console.log(`   • "${r.campana}": ${r.cantidad} filas`));

    if (campRes.rows.length > 0) {
      const primeraCampana = campRes.rows[0].campana;
      console.log(`\n🧪 Probando filtro por campaña: "${primeraCampana}"`);

      // Consulta ILIKE / TRIM
      const testFilter = await client.query(`
        SELECT COALESCE(CAST("DIA_CONEXION" AS INT), 1) as dia, COUNT(DISTINCT CAST("DOCUMENTO" AS VARCHAR)) as activos
        FROM public."CONTROL"
        WHERE TRIM(UPPER(CAST("CAMPAÑA" AS VARCHAR))) = TRIM(UPPER($1))
        GROUP BY COALESCE(CAST("DIA_CONEXION" AS INT), 1)
        ORDER BY dia ASC;
      `, [primeraCampana]);

      console.log(`✅ Filas devueltas por el filtro de campaña "${primeraCampana}":`, testFilter.rows.length);
      testFilter.rows.forEach(r => console.log(`   - Día ${r.dia}: ${r.activos} asesores activos`));
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de prueba:', err.message);
    process.exit(1);
  }
}

testFilters();
