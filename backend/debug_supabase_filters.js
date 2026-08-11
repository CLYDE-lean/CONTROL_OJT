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

async function debugFilters() {
  const log = [];
  log.push('=====================================================');
  log.push('DEBUG EN VIVO DE FILTROS SUPABASE');
  log.push('=====================================================\n');

  try {
    const client = await pool.connect();
    log.push('✅ Conexión exitosa a PostgreSQL Supabase.');

    // 1. Ver exactamente qué campañas existen y cuántos registros/documentos únicos tienen
    const campRes = await client.query(`
      SELECT 
        CAST("CAMPAÑA" AS VARCHAR) as nombre_raw,
        TRIM(CAST("CAMPAÑA" AS VARCHAR)) as nombre_clean,
        COUNT(*) as total_filas,
        COUNT(DISTINCT CAST("DOCUMENTO" AS VARCHAR)) as unicos
      FROM public."CONTROL"
      WHERE "CAMPAÑA" IS NOT NULL
      GROUP BY CAST("CAMPAÑA" AS VARCHAR)
      ORDER BY total_filas DESC
      LIMIT 15;
    `);

    log.push('\n📊 CAMPAÑAS REALES EN SUPABASE:');
    campRes.rows.forEach((r, idx) => {
      log.push(`${idx + 1}. Raw: "${r.nombre_raw}" | Clean: "${r.nombre_clean}" | Filas: ${r.total_filas} | Únicos: ${r.unicos}`);
    });

    // 2. Probar filtrado directo en SQL por la primera campaña real
    if (campRes.rows.length > 0) {
      const campPrueba = campRes.rows[0].nombre_clean;
      log.push(`\n🧪 PROBANDO FILTRO SQL POR: "${campPrueba}"`);

      const queryFunnel = await client.query(`
        SELECT 
          COALESCE(CAST("DIA_CONEXION" AS INT), 1) as dia,
          COUNT(DISTINCT CAST("DOCUMENTO" AS VARCHAR)) as total_activos
        FROM public."CONTROL"
        WHERE TRIM(UPPER(CAST("CAMPAÑA" AS VARCHAR))) = TRIM(UPPER($1))
        GROUP BY COALESCE(CAST("DIA_CONEXION" AS INT), 1)
        ORDER BY dia ASC;
      `, [campPrueba]);

      log.push(`Resultados de días para la campaña "${campPrueba}":`);
      queryFunnel.rows.forEach(r => {
        log.push(`  - Día ${r.dia}: ${r.total_activos} asesores activos`);
      });
    }

    client.release();
  } catch (err) {
    log.push(`❌ Error de conexión: ${err.message}`);
  }

  const logFile = path.join(__dirname, 'debug_filtros_result.txt');
  fs.writeFileSync(logFile, log.join('\n'), 'utf8');
  console.log(log.join('\n'));
  process.exit(0);
}

debugFilters();
