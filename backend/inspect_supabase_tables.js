const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_SUPABASE,
  ssl: { rejectUnauthorized: false }
});

async function checkSupabase() {
  try {
    const client = await pool.connect();
    console.log('✅ CONECTADO A SUPABASE');

    // Listar todas las tablas
    const resTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n--- TABLAS EN SUPABASE ---');
    for (const r of resTables.rows) {
      const name = r.table_name;
      try {
        const countRes = await client.query(`SELECT COUNT(*) as total FROM public."${name}"`);
        console.log(`• Tabla "${name}": ${countRes.rows[0].total} registros`);
      } catch (err) {
        console.log(`• Tabla "${name}": Error al contar (${err.message})`);
      }
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

checkSupabase();
