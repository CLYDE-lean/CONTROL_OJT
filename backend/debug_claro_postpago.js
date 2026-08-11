const db = require('./src/config/database');

async function debugClaroPostpago() {
  try {
    const table = 'CONTROL';

    // 1. Ver qué valores exactos hay en la columna "CAMPAÑA"
    const campRes = await db.query(`
      SELECT DISTINCT CAST("CAMPAÑA" AS VARCHAR) as c, COUNT(*) as cnt, COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as dnis
      FROM public."${table}"
      WHERE CAST("CAMPAÑA" AS VARCHAR) ILIKE '%POSTPAGO%'
      GROUP BY CAST("CAMPAÑA" AS VARCHAR)
    `);
    console.log("Valores de CAMPAÑA con POSTPAGO:", campRes.rows);

    // 2. Ver cuántos asesores únicos tienen registros por DIA_CONEXION en CLARO POSTPAGO
    const diaRes = await db.query(`
      SELECT 
        CAST("DIA_CONEXION" AS VARCHAR) as dia,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos
      FROM public."${table}"
      WHERE TRIM(CAST("CAMPAÑA" AS VARCHAR)) ILIKE '%CLARO POSTPAGO%'
      GROUP BY CAST("DIA_CONEXION" AS VARCHAR)
      ORDER BY dia ASC
    `);
    console.log("Asesores únicos por DIA_CONEXION (sin agrupar max):", diaRes.rows);

    // 3. Ver cuántos asesores únicos hay en TOTAL para CLARO POSTPAGO
    const totalRes = await db.query(`
      SELECT COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as total_unicos
      FROM public."${table}"
      WHERE TRIM(CAST("CAMPAÑA" AS VARCHAR)) ILIKE '%CLARO POSTPAGO%'
    `);
    console.log("Total asesores únicos en CLARO POSTPAGO:", totalRes.rows[0].total_unicos);

    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

debugClaroPostpago();
