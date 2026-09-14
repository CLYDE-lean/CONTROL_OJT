/**
 * Cliente Supabase para el Frontend (React/Vite)
 * Proyecto: CONTROL OJT - BI Dashboard
 * Organización: CLYDE-lean's Org
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ymshmjwgekuqwrfqforg.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2htandnZWt1cXdyZnFmb3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ5NzAsImV4cCI6MjA5OTY1MDk3MH0.5DmW7GVhf9bOrq3CBlb7wFI--vGQyapjOXmBOf2Ihx4';

/**
 * Cliente Supabase singleton para el frontend.
 * Usar para lecturas directas de tablas cuando el backend no esté disponible.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Tablas disponibles en Supabase
 * @type {{CONTROL: string, DIM_ASESORES: string, DIM_FORMADORES: string, DIM_CAMPANAS: string, HECHOS_CALIDAD: string, OJT_PREDICCIONES: string, OJT_ENTRENAMIENTO: string}}
 */
export const TABLES = {
  CONTROL: 'CONTROL',
  DIM_ASESORES: 'dim_asesores',
  DIM_FORMADORES: 'dim_formadores',
  DIM_CAMPANAS: 'dim_campanas',
  HECHOS_CALIDAD: 'hechos_calidad_ojt',
  OJT_PREDICCIONES: 'ojt_predicciones',
  OJT_ENTRENAMIENTO: 'OJT_Entrenamiento',
};

/**
 * Verifica la conexión al proyecto Supabase
 * @returns {Promise<{ok: boolean, message: string}>}
 */
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase
      .from(TABLES.CONTROL)
      .select('PERIODO', { count: 'exact', head: true });

    if (error) throw error;
    return { ok: true, message: '✅ Supabase conectado correctamente' };
  } catch (err) {
    return { ok: false, message: `❌ Error Supabase: ${err.message}` };
  }
}

export default supabase;
