const db = require('./src/config/database');

async function inspectYarly() {
  try {
    console.log("==========================================================");
    console.log("🔍 INSPECCIONANDO DNI 74408974 (YARLY RAQUEL)");
    console.log("==========================================================");

    const res = await db.query(`
      SELECT 
        "DNI", "ASESOR", "CAMPAÑA", "FORMADOR", "DIA_CONEXION", 
        "FECHA_ASISTENCIA", "FECHA_INICIO_CAPA", "FECHA_INICIO_OJT", "FECHA_INGRESO_OP",
        "Q_ATENDIDAS", "KPI_1_Num", "KPI_1_Denom", "KPI_2_Num", "KPI_2_Denom", "KPI_3_Num", "KPI_3_Denom",
        "ULT_ESTADO", "SIGLA", "MOTIVO_BAJA"
      FROM public."CONTROL"
      WHERE TRIM(CAST("DNI" AS VARCHAR)) = '74408974'
      ORDER BY 
        COALESCE(CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT), 999),
        "FECHA_ASISTENCIA" ASC
    `);

    console.log(`Encontradas ${res.rows.length} filas para YARLY RAQUEL:`);
    console.table(res.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

inspectYarly();
