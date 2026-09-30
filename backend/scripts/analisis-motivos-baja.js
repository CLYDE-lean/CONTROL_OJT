/**
 * Motivos de baja contando SOLO las bajas ocurridas a partir de la fecha de inicio de OJT.
 *
 * Estructura de CONTROL: cada fila es un día del calendario del aula.
 *   - SIGLA = 'B' marca los días en que la persona ya está cesada,
 *     por lo tanto la fecha de cese es la PRIMERA fila con SIGLA 'B' (o ESTADO 'CESADO').
 *   - DIA_CONEXION no nulo marca los días de OJT efectivamente conectados.
 *
 * Regla aplicada: cuenta la baja solo si fecha_cese >= FECHA_INICIO_OJT.
 * Las bajas de capacitación (cese anterior al inicio de OJT) quedan fuera.
 *
 * Uso: node scripts/analisis-motivos-baja.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { pool } = require('../src/config/database');

const BASE_CTE = `
WITH base AS (
  SELECT
    TRIM(CAST("DNI" AS VARCHAR)) || '|' ||
      UPPER(TRIM(COALESCE(CAST("SEMANA" AS VARCHAR), ''))) || '|' ||
      UPPER(TRIM(COALESCE(CAST("COD_GRUPO" AS VARCHAR), ''))) AS cohorte,
    UPPER(TRIM(COALESCE(CAST("SEMANA" AS VARCHAR), '')))  AS semana,
    UPPER(TRIM(COALESCE(CAST("CAMPAÑA" AS VARCHAR),''))) AS campana,
    UPPER(TRIM(COALESCE(CAST("SIGLA" AS VARCHAR), '')))   AS sigla,
    UPPER(TRIM(COALESCE(CAST("ESTADO" AS VARCHAR), '')))  AS estado,
    NULLIF(LEFT(TRIM(CAST("FECHA_ASISTENCIA" AS VARCHAR)), 10), '') AS fecha_dia,
    NULLIF(LEFT(TRIM(CAST("FECHA_INICIO_OJT" AS VARCHAR)), 10), '') AS fecha_ojt,
    CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT) AS dia,
    CASE
      WHEN UPPER(TRIM(COALESCE(CAST("MOTIVO_BAJA" AS VARCHAR), ''))) IN ('', 'NULL', 'UNDEFINED') THEN ''
      ELSE UPPER(TRIM(CAST("MOTIVO_BAJA" AS VARCHAR)))
    END AS motivo
  FROM "CONTROL"
  WHERE COALESCE(NULLIF(TRIM(CAST("DNI" AS VARCHAR)), ''), TRIM(CAST("ASESOR" AS VARCHAR))) <> ''
),
persona AS (
  SELECT
    cohorte, semana,
    MAX(campana)   AS campana,
    MAX(fecha_ojt) AS fecha_inicio_ojt,
    MIN(fecha_dia) FILTER (WHERE sigla = 'B' OR estado LIKE '%CESADO%') AS fecha_cese,
    MAX(NULLIF(motivo, '')) AS motivo_registrado,
    COALESCE(MAX(dia), 0)   AS ultimo_dia_ojt,
    COUNT(*) FILTER (WHERE dia IS NOT NULL) AS dias_conectados_ojt
  FROM base
  GROUP BY cohorte, semana
),
baja_ojt AS (
  SELECT *
  FROM persona
  WHERE fecha_cese IS NOT NULL
    AND fecha_inicio_ojt IS NOT NULL
    AND fecha_cese >= fecha_inicio_ojt
)
`;

const CONSULTAS = [
  {
    titulo: '1) Universo: bajas en capacitación (no cuentan) vs bajas desde el inicio de OJT',
    sql: `${BASE_CTE}
      SELECT
        CASE
          WHEN fecha_cese IS NULL THEN 'Sin cese (activo / I-OP)'
          WHEN fecha_inicio_ojt IS NULL THEN 'Cesado sin fecha de OJT'
          WHEN fecha_cese < fecha_inicio_ojt THEN 'Baja en CAPACITACIÓN (se excluye)'
          ELSE 'Baja desde el inicio de OJT (cuenta)'
        END AS caso,
        COUNT(*) AS personas
      FROM persona
      GROUP BY 1
      ORDER BY personas DESC;`
  },
  {
    titulo: '2) Bajas de OJT: motivo declarado vs sin registrar',
    sql: `${BASE_CTE}
      SELECT
        COUNT(*)                                                     AS bajas_ojt,
        COUNT(*) FILTER (WHERE motivo_registrado IS NOT NULL)        AS con_motivo,
        COUNT(*) FILTER (WHERE motivo_registrado IS NULL)            AS sin_motivo,
        ROUND(100.0 * COUNT(*) FILTER (WHERE motivo_registrado IS NULL) / NULLIF(COUNT(*), 0), 1) AS pct_sin_motivo
      FROM baja_ojt;`
  },
  {
    titulo: '3) Pareto de motivos de baja EN OJT',
    sql: `${BASE_CTE}
      SELECT
        COALESCE(motivo_registrado, 'SIN MOTIVO REGISTRADO') AS motivo,
        COUNT(*) AS personas,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)   AS pct
      FROM baja_ojt
      GROUP BY 1
      ORDER BY personas DESC;`
  },
  {
    titulo: '4) Bajas de OJT: ¿llegaron a conectarse algún día?',
    sql: `${BASE_CTE}
      SELECT
        CASE WHEN dias_conectados_ojt = 0 THEN 'Nunca se conectó (no-show en OJT)'
             ELSE 'Se conectó al menos un día' END AS caso,
        COUNT(*) AS bajas,
        COUNT(*) FILTER (WHERE motivo_registrado IS NOT NULL) AS con_motivo
      FROM baja_ojt
      GROUP BY 1
      ORDER BY bajas DESC;`
  },
  {
    titulo: '5) Bajas de OJT por último día conectado',
    sql: `${BASE_CTE}
      SELECT ultimo_dia_ojt, COUNT(*) AS bajas
      FROM baja_ojt
      GROUP BY 1
      ORDER BY ultimo_dia_ojt;`
  },
  {
    titulo: '6) Bajas de OJT por campaña y cobertura del motivo',
    sql: `${BASE_CTE}
      SELECT campana,
        COUNT(*) AS bajas_ojt,
        COUNT(*) FILTER (WHERE motivo_registrado IS NOT NULL) AS con_motivo,
        ROUND(100.0 * COUNT(*) FILTER (WHERE motivo_registrado IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS pct_documentado
      FROM baja_ojt
      GROUP BY campana
      ORDER BY bajas_ojt DESC;`
  }
];

(async () => {
  try {
    for (const { titulo, sql } of CONSULTAS) {
      const { rows } = await pool.query(sql);
      console.log(`\n=== ${titulo} ===`);
      console.table(rows);
    }
  } catch (err) {
    console.error('Error en el análisis:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
