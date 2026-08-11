const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const connectionString = process.env.DATABASE_URL_SUPABASE || 
  'postgresql://postgres.ymshmjwgekuqwrfqforg:ismael3953036POM@aws-1-us-west-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const query = `
      WITH resumen_asesor AS (
        SELECT 
          CAST("DNI" AS VARCHAR) as dni,
          MAX(CAST("ASESOR" AS VARCHAR)) as nombre_asesor,
          MAX(CAST("CAMPAÑA" AS VARCHAR)) as campana,
          MAX(CAST("FORMADOR" AS VARCHAR)) as formador,
          MAX(CAST("COD_GRUPO" AS VARCHAR)) as cod_grupo,
          MAX(CAST("MODALIDAD" AS VARCHAR)) as modalidad,
          MAX(COALESCE(CAST("FECHA_INICIO_CAPA" AS VARCHAR), '')) as fecha_inicio_capa,
          MAX(COALESCE(CAST("FECHA_INICIO_OJT" AS VARCHAR), '')) as fecha_inicio_ojt,
          -- Contar el día máximo de conexión en OJT
          MAX(CASE WHEN NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') IS NOT NULL THEN CAST(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g') AS INT) ELSE 0 END) as max_dia_conex,
          -- Verificar si tiene al menos un registro con DIA_CONEXION válido (entró a OJT)
          MAX(CASE WHEN NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') IS NOT NULL THEN 1 ELSE 0 END) as genero_conexion_ojt,
          -- Detectar si tiene estado de BAJA o Motivo de Baja
          MAX(CASE WHEN UPPER(COALESCE(CAST("ESTADO" AS VARCHAR), '')) LIKE '%BAJA%' 
                     OR UPPER(COALESCE(CAST("ULT_ESTADO" AS VARCHAR), '')) LIKE '%BAJA%'
                     OR (CAST("MOTIVO_BAJA" AS VARCHAR) IS NOT NULL AND TRIM(CAST("MOTIVO_BAJA" AS VARCHAR)) != '' AND UPPER(TRIM(CAST("MOTIVO_BAJA" AS VARCHAR))) != 'NULL')
                THEN 1 ELSE 0 END) as tiene_baja,
          MAX(COALESCE(CAST("MOTIVO_BAJA" AS VARCHAR), '')) as motivo_baja,
          MAX(COALESCE(CAST("ESTADO" AS VARCHAR), '')) as estado_final
        FROM public."base_ojt"
        GROUP BY CAST("DNI" AS VARCHAR)
      )
      SELECT 
        dni,
        nombre_asesor,
        campana,
        formador,
        cod_grupo,
        modalidad,
        fecha_inicio_capa,
        fecha_inicio_ojt,
        estado_final,
        motivo_baja
      FROM resumen_asesor
      WHERE genero_conexion_ojt = 0 -- NUNCA tuvo DIA_CONEXION en OJT
        AND tiene_baja = 1           -- Fue marcado como BAJA durante la capacitación previa
      ORDER BY fecha_inicio_capa DESC;
    `;

    const res = await client.query(query);
    console.log(`Encontrados ${res.rows.length} postulantes que fueron BAJA ANTES de la etapa OJT.`);
    if (res.rows.length > 0) {
      console.log('Muestra de 5 registros:', res.rows.slice(0, 5));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
