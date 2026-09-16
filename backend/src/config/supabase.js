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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_ANON_KEY. Defínelas en backend/.env (local) o en las Environment Variables del proyecto (Vercel).'
  );
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
