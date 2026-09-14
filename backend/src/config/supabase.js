/**
 * Cliente Supabase para el Backend (Node.js)
 * Proyecto: CONTROL OJT - BI Dashboard
 * Organización: CLYDE-lean's Org
 * Proyecto Supabase: ymshmjwgekuqwrfqforg
 */

const path = require('path');
const fs = require('fs');

// Cargar variables de entorno si existe .env
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ymshmjwgekuqwrfqforg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2htandnZWt1cXdyZnFmb3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ5NzAsImV4cCI6MjA5OTY1MDk3MH0.5DmW7GVhf9bOrq3CBlb7wFI--vGQyapjOXmBOf2Ihx4';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

// Cliente público (anon) — para lecturas de datos del dashboard
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Cliente de servicio (admin) — solo si hay SERVICE_KEY configurada
const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Verifica que la conexión a Supabase funcione correctamente
 * @returns {Promise<boolean>}
 */
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('CONTROL')
      .select('PERIODO', { count: 'exact', head: true });

    if (error) throw error;

    console.log('✅ Conexión Supabase verificada (tabla CONTROL accesible)');
    return true;
  } catch (err) {
    console.error('❌ Error de conexión Supabase:', err.message);
    return false;
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  testSupabaseConnection,
  SUPABASE_URL,
};
