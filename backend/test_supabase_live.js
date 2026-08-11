const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL_SUPABASE;

console.log('Testing connection to Supabase PG...');
console.log('URL target:', connectionString.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ CONECTADO EXITOSAMENTE A SUPABASE');

    // 1. Probar tablas public
    const resTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\nTablas encontradas en Supabase:');
    resTables.rows.forEach(r => console.log(' - ' + r.table_name));

    // 2. Conteo de filas en Hechos_Calidad_OJT
    try {
      const countRes = await client.query('SELECT COUNT(*) FROM public."Hechos_Calidad_OJT"');
      console.log('\nFilas en Hechos_Calidad_OJT:', countRes.rows[0].count);
    } catch (e) {
      console.log('\nConsultando hechos:', e.message);
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

testConnection();
