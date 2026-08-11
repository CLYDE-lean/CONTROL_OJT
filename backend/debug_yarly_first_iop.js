const db = require('./src/config/database');

async function debugFirstIop() {
  try {
    console.log("==========================================================");
    console.log("🔍 PROBANDO DETECCION DE PRIMER I-OP PARA DNI 74408974");
    console.log("==========================================================");

    const res = await db.query(`
      SELECT 
        "DNI", "ASESOR", "DIA_CONEXION", "FECHA_ASISTENCIA", "SIGLA", "ULT_ESTADO"
      FROM public."CONTROL"
      WHERE TRIM(CAST("DNI" AS VARCHAR)) = '74408974'
      ORDER BY 
        "FECHA_ASISTENCIA" ASC
    `);

    let primerDiaIop = null;
    let fechaPrimerIop = null;

    res.rows.forEach(r => {
      const sigla = (r.SIGLA || '').toUpperCase();
      const estado = (r.ULT_ESTADO || '').toUpperCase();
      const isIop = sigla.includes('I-OP') || sigla.includes('I_OP') || sigla.includes('OPERAC') || estado.includes('OPERAC');
      
      const diaConex = r.DIA_CONEXION !== null && r.DIA_CONEXION !== undefined ? parseInt(r.DIA_CONEXION) : null;

      console.log(`Fecha: ${r.FECHA_ASISTENCIA} | DiaConexion: ${diaConex} | Sigla: ${sigla} | isIop: ${isIop}`);

      if (isIop && primerDiaIop === null) {
        primerDiaIop = diaConex;
        fechaPrimerIop = r.FECHA_ASISTENCIA;
      }
    });

    console.log("\n🎯 RESULTADO REGLA PRIMER I-OP:");
    console.log(`Día de Conexión en primer I-OP: Día ${primerDiaIop}`);
    console.log(`Fecha de primer I-OP: ${fechaPrimerIop}`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

debugFirstIop();
