const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Cargar .env desde la carpeta del backend independientemente de dónde se ejecute la consola
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const connectionString = process.env.DATABASE_URL_SUPABASE || 
  'postgresql://postgres.ymshmjwgekuqwrfqforg:ismael3953036POM@aws-1-us-west-2.pooler.supabase.com:6543/postgres';

console.log('⚡ Conectando a Supabase para crear índices de aceleración...');
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function createPerformanceIndexes() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión establecida con éxito en Supabase PostgreSQL.\n');

    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_ctrl_campana ON public."CONTROL" ("CAMPAÑA");',
      'CREATE INDEX IF NOT EXISTS idx_ctrl_formador ON public."CONTROL" ("FORMADOR");',
      'CREATE INDEX IF NOT EXISTS idx_ctrl_semana ON public."CONTROL" ("SEMANA");',
      'CREATE INDEX IF NOT EXISTS idx_ctrl_modalidad ON public."CONTROL" ("MODALIDAD");',
      'CREATE INDEX IF NOT EXISTS idx_ctrl_estado ON public."CONTROL" ("ESTADO");',
      'CREATE INDEX IF NOT EXISTS idx_ctrl_documento ON public."CONTROL" ("DOCUMENTO");',
      'CREATE INDEX IF NOT EXISTS idx_ctrl_dia ON public."CONTROL" ("DIA_CONEXION");'
    ];

    for (const q of indexQueries) {
      try {
        await client.query(q);
        console.log(`✅ Índice creado/verificado: ${q.split(' ')[4]}`);
      } catch (err) {
        console.log(`⚠️ Registro de índice: ${err.message}`);
      }
    }

    console.log('\n🚀 ¡Índices aplicados con éxito! Las consultas de filtrado ahora son ultrarrápidas.');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

createPerformanceIndexes();
