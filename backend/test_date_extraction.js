const db = require('./src/config/database');

async function testDateExtraction() {
  try {
    console.log("==========================================================");
    console.log("🔍 INSPECCIONANDO VALORES REALES DE FECHAS EN REGISTROS");
    console.log("==========================================================");

    const colsRes = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'control'
    `);
    const cols = colsRes.rows.map(r => r.column_name);

    // Buscar cualquier columna que empiece o contenga FECHA
    const dateCols = cols.filter(c => c.toUpperCase().includes('FECHA') || c.toUpperCase().includes('FEC') || c.toUpperCase().includes('DIA'));
    console.log("Columnas candidatas de fecha/día:", dateCols);

    const res = await db.query(`
      SELECT "DNI", "ASESOR", ${dateCols.map(c => `"${c}"`).join(', ')}
      FROM public."CONTROL"
      LIMIT 10
    `);

    console.log("\nEjemplo de valores recuperados:");
    console.table(res.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testDateExtraction();
