const db = require('./src/config/database');

async function inspectDates() {
  try {
    console.log("==========================================================");
    console.log("🔍 INSPECCIONANDO COLUMNAS DE FECHA Y DÍAS EN CONTROL");
    console.log("==========================================================");

    const colsRes = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'control'
      ORDER BY ordinal_position
    `);

    console.log("Todas las columnas de la tabla CONTROL:");
    console.table(colsRes.rows);

    const sampleRes = await db.query(`
      SELECT *
      FROM public."CONTROL"
      LIMIT 5
    `);

    console.log("\nMuestra de las primeras 5 filas (primeras columnas y fechas):");
    console.log(sampleRes.rows[0]);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

inspectDates();
