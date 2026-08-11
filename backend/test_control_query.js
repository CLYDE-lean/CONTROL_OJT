const db = require('./src/config/database');

async function testControlQuery() {
  try {
    const res = await db.query(`
      WITH evaluacion_postulante AS (
          SELECT 
              CAST("DNI" AS VARCHAR) AS dni,
              MAX(CAST("ASESOR" AS VARCHAR)) AS nombre_asesor,
              MAX(CAST("CAMPAÑA" AS VARCHAR)) AS campana,
              MAX(CAST("FORMADOR" AS VARCHAR)) AS formador,
              MAX(CAST("COD_GRUPO" AS VARCHAR)) AS cod_grupo,
              MAX(CAST("MODALIDAD" AS VARCHAR)) AS modalidad,
              MAX(CAST("FECHA_INICIO_CAPA" AS VARCHAR)) AS fecha_inicio_capa,
              MAX(CAST("FECHA_INICIO_OJT" AS VARCHAR)) AS fecha_inicio_ojt_programada,
              
              MAX(
                  CASE 
                      WHEN NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') IS NOT NULL 
                      THEN 1 ELSE 0 
                  END
              ) AS llego_a_ojt,
              
              MAX(
                  CASE 
                      WHEN UPPER(COALESCE(CAST("ESTADO" AS VARCHAR), '')) LIKE '%BAJA%' 
                        OR UPPER(COALESCE(CAST("ULT_ESTADO" AS VARCHAR), '')) LIKE '%BAJA%'
                        OR UPPER(COALESCE(CAST("ULT_ESTADO" AS VARCHAR), '')) LIKE '%CESADO%'
                        OR (CAST("MOTIVO_BAJA" AS VARCHAR) IS NOT NULL 
                            AND TRIM(CAST("MOTIVO_BAJA" AS VARCHAR)) != '' 
                            AND UPPER(TRIM(CAST("MOTIVO_BAJA" AS VARCHAR))) != 'NULL')
                      THEN 1 ELSE 0 
                  END
              ) AS es_baja,
              
              MAX(COALESCE(CAST("MOTIVO_BAJA" AS VARCHAR), '')) AS motivo_baja,
              MAX(COALESCE(CAST("ESTADO" AS VARCHAR), '')) AS estado_final,
              MAX(COALESCE(CAST("ULT_ESTADO" AS VARCHAR), '')) AS ult_estado
          FROM public."CONTROL"
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
          fecha_inicio_ojt_programada,
          estado_final,
          ult_estado,
          motivo_baja
      FROM evaluacion_postulante
      WHERE llego_a_ojt = 0
        AND es_baja = 1
      ORDER BY fecha_inicio_capa DESC
      LIMIT 10;
    `);

    console.log("✅ Exito! Registros devueltos:", res.rows.length);
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en consulta:", err.message);
    process.exit(1);
  }
}

testControlQuery();
