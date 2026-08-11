const db = require('./src/config/database');

async function debugJeisson() {
  try {
    console.log("==========================================================");
    console.log("🔍 INSPECCIONANDO DNI 76487711 (JEISSON DANIEL)");
    console.log("==========================================================");

    const res = await db.query(`
      SELECT 
        "DNI", "ASESOR", "DIA_CONEXION", "FECHA_ASISTENCIA", "FECHA_INICIO_CAPA", "FECHA_INICIO_OJT", "FECHA_INGRESO_OP",
        "ULT_ESTADO", "SIGLA", "MOTIVO_BAJA"
      FROM public."CONTROL"
      WHERE TRIM(CAST("DNI" AS VARCHAR)) = '76487711'
      ORDER BY "FECHA_ASISTENCIA" ASC
    `);

    console.log("Filas ordenadas CRONOLÓGICAMENTE por FECHA_ASISTENCIA:");
    res.rows.forEach((r, idx) => {
      const dia = r.DIA_CONEXION;
      console.log(`[Fila ${idx+1}] Fecha: ${r.FECHA_ASISTENCIA} | DiaConexion: ${dia} | Sigla: ${r.SIGLA} | Estado: ${r.ULT_ESTADO}`);
    });

    let firstIopCronologico = null;
    res.rows.forEach(r => {
      const sigla = (r.SIGLA || '').toUpperCase();
      const estado = (r.ULT_ESTADO || '').toUpperCase();
      const isIop = sigla.includes('I-OP') || sigla.includes('I_OP') || sigla.includes('OPERAC') || estado.includes('OPERAC');
      const diaConex = r.DIA_CONEXION !== null && r.DIA_CONEXION !== undefined ? parseInt(r.DIA_CONEXION) : null;

      if (isIop && firstIopCronologico === null && diaConex !== null) {
        firstIopCronologico = { dia: diaConex, fecha: r.FECHA_ASISTENCIA };
      }
    });

    console.log("\n🎯 PRIMER I-OP CRONOLÓGICO REAL:");
    console.log(firstIopCronologico);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

debugJeisson();
