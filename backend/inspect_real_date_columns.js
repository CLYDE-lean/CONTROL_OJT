const db = require('./src/config/database');

async function inspectRealDates() {
  try {
    console.log("==========================================================");
    console.log("🔍 BUSCANDO COLUMNAS Y VALORES DE FECHA REALES EN CONTROL");
    console.log("==========================================================");

    const colsRes = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'control'
      ORDER BY ordinal_position
    `);

    const cols = colsRes.rows.map(r => r.column_name);
    console.log("Todas las columnas encontradas en CONTROL:");
    console.log(cols);

    // Filtrar columnas que contengan FECHA o DIA o FEC
    const dateCols = cols.filter(c => c.toUpperCase().includes('FECHA') || c.toUpperCase().includes('FEC') || c.toUpperCase().includes('DATE'));
    console.log("\nColumnas de tipo FECHA encontradas:", dateCols);

    if (dateCols.length > 0) {
      const selectCols = dateCols.map(c => `"${c}"`).join(', ');
      const sample = await db.query(`SELECT DISTINCT "DNI", "ASESOR", ${selectCols} FROM public."CONTROL" WHERE "DNI" IS NOT NULL LIMIT 10`);
      console.log("\nMuestra de fechas reales:");
      console.table(sample.rows);
    } else {
      console.log("\n⚠️ No se encontraron columnas que contengan 'FECHA' en su nombre.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

inspectRealDates();
