const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_SUPABASE,
  ssl: { rejectUnauthorized: false }
});

async function inspectColumnsAndFilterValues() {
  try {
    const client = await pool.connect();
    console.log('🔍 Inspeccionando nombres de columnas y valores de filtros en Supabase...\n');

    // Listar tablas y sus columnas en schema public
    const colRes = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    const tableCols = {};
    colRes.rows.forEach(r => {
      if (!tableCols[r.table_name]) tableCols[r.table_name] = [];
      tableCols[r.table_name].push(r.column_name);
    });

    console.log('📋 Estructura de Tablas y Columnas:');
    Object.keys(tableCols).forEach(t => {
      console.log(`\n• Tabla "${t}":`);
      console.log(`  Columnas: ${tableCols[t].join(', ')}`);
    });

    // Probar extracción de Campañas distintas en CONTROL
    try {
      const cRes = await client.query('SELECT DISTINCT "CAMPAÑA" FROM public."CONTROL" WHERE "CAMPAÑA" IS NOT NULL LIMIT 15');
      console.log('\n✅ Campañas encontradas en CONTROL:', cRes.rows.map(r => r.CAMPAÑA));
    } catch (e) {
      console.log('❌ Error al consultar CAMPAÑA en CONTROL:', e.message);
    }

    // Probar extracción de Formadores distintos en CONTROL
    try {
      const fRes = await client.query('SELECT DISTINCT "FORMADOR" FROM public."CONTROL" WHERE "FORMADOR" IS NOT NULL LIMIT 15');
      console.log('✅ Formadores encontrados en CONTROL:', fRes.rows.map(r => r.FORMADOR));
    } catch (e) {
      console.log('❌ Error al consultar FORMADOR en CONTROL:', e.message);
    }

    // Probar extracción de Modalidades distintas en CONTROL
    try {
      const mRes = await client.query('SELECT DISTINCT "MODALIDAD" FROM public."CONTROL" WHERE "MODALIDAD" IS NOT NULL LIMIT 15');
      console.log('✅ Modalidades encontradas en CONTROL:', mRes.rows.map(r => r.MODALIDAD));
    } catch (e) {
      console.log('❌ Error al consultar MODALIDAD en CONTROL:', e.message);
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

inspectColumnsAndFilterValues();
