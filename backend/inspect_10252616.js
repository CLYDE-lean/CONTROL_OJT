const db = require('./src/config/database');

async function inspectDni() {
  try {
    console.log("==========================================================");
    console.log("🔍 INSPECCIONANDO REGISTROS DE DNI 10252616 (JORGE LUIS SOVERO)");
    console.log("==========================================================");

    const res = await db.query(`
      SELECT *
      FROM public."CONTROL"
      WHERE TRIM(CAST("DNI" AS VARCHAR)) = '10252616' OR TRIM(CAST("DOCUMENTO" AS VARCHAR)) = '10252616'
    `);

    console.log(`Encontrados ${res.rows.length} registros para DNI 10252616:`);
    console.table(res.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

inspectDni();
