const db = require('./src/config/database');

async function inspectWiddup() {
  try {
    console.log("==========================================================");
    console.log("🔍 BUSCANDO ASESORES DEL FORMADOR WIDDUP EN CONTROL");
    console.log("==========================================================");

    const res = await db.query(`
      SELECT 
        "DNI", "ASESOR", "CAMPAÑA", "FORMADOR", "DIA_CONEXION", 
        "FECHA_ASISTENCIA", "FECHA_INICIO_CAPA", "FECHA_INICIO_OJT", "FECHA_INGRESO_OP",
        "ULT_ESTADO", "SIGLA", "MOTIVO_BAJA"
      FROM public."CONTROL"
      WHERE UPPER("FORMADOR") LIKE '%WIDDUP%'
      ORDER BY "DNI", COALESCE(CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT), 999), "FECHA_ASISTENCIA" ASC
    `);

    console.log(`Encontradas ${res.rows.length} filas para formador WIDDUP:`);
    console.table(res.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

inspectWiddup();
