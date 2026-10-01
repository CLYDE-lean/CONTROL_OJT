const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_SUPABASE,
  ssl: { rejectUnauthorized: false }
});

async function inspectTable() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'control_ojt'
      ORDER BY ordinal_position;
    `);
    console.log('Columnas de control_ojt en Supabase:');
    res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
}

inspectTable();
