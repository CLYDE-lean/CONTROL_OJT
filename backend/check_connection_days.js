const db = require('./src/config/database');

async function checkDays() {
  try {
    console.log("=========================================================");
    console.log("🔍 DIAGNÓSTICO DE DÍAS DE CONEXIÓN EN PUBLIC.CONTROL");
    console.log("=========================================================");

    // 1. Asesores únicos que registran cada DIA_CONEXION exactamente
    const directRes = await db.query(`
      SELECT 
        CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT) as dia_num,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos_en_este_dia,
        COUNT(*) as total_filas
      FROM public."CONTROL"
      WHERE "DIA_CONEXION" IS NOT NULL AND TRIM(CAST("DIA_CONEXION" AS VARCHAR)) != ''
      GROUP BY CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT)
      ORDER BY dia_num ASC
    `);

    console.log("\n📊 ASESORES ÚNICOS QUE TIENEN REGISTRO DIRECTO POR CADA DIA_CONEXION (TODA LA BASE):");
    console.table(directRes.rows);

    // 2. Para CLARO POSTPAGO específicamente
    const claroRes = await db.query(`
      SELECT 
        CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT) as dia_num,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos_en_este_dia
      FROM public."CONTROL"
      WHERE CAST("CAMPAÑA" AS VARCHAR) ILIKE '%CLARO POSTPAGO%'
        AND "DIA_CONEXION" IS NOT NULL AND TRIM(CAST("DIA_CONEXION" AS VARCHAR)) != ''
      GROUP BY CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT)
      ORDER BY dia_num ASC
    `);

    console.log("\n📊 ASESORES ÚNICOS CON REGISTRO DIRECTO POR DIA_CONEXION (EN CLARO POSTPAGO):");
    console.table(claroRes.rows);

    // 3. Ver qué SIGLAs hay en el Día 1, Día 2, etc., en CLARO POSTPAGO
    const siglaRes = await db.query(`
      SELECT 
        CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT) as dia_num,
        TRIM(CAST("SIGLA" AS VARCHAR)) as sigla,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos
      FROM public."CONTROL"
      WHERE CAST("CAMPAÑA" AS VARCHAR) ILIKE '%CLARO POSTPAGO%'
      GROUP BY CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT), TRIM(CAST("SIGLA" AS VARCHAR))
      ORDER BY dia_num ASC, unicos DESC
      LIMIT 25
    `);

    console.log("\n📊 DISTRIBUCIÓN DE SIGLA POR DIA_CONEXION (CLARO POSTPAGO):");
    console.table(siglaRes.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkDays();
