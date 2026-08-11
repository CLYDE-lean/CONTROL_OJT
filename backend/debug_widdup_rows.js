const db = require('./src/config/database');

async function debugWiddupRows() {
  try {
    const res = await db.query(`
      SELECT 
        "DNI", "ASESOR", "FORMADOR", "DIA_CONEXION", "FECHA_ASISTENCIA", "SIGLA", "ULT_ESTADO"
      FROM public."CONTROL"
      WHERE UPPER("FORMADOR") LIKE '%WIDDUP%'
      ORDER BY "DNI", "FECHA_ASISTENCIA" ASC
    `);

    console.log("Filas de la base para WIDDUP:");
    res.rows.forEach(r => {
      console.log(`DNI: ${r.DNI} | Asesor: ${r.ASESOR} | DiaConexion: ${r.DIA_CONEXION} | Fecha: ${r.FECHA_ASISTENCIA} | Sigla: ${r.SIGLA}`);
    });

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

debugWiddupRows();
