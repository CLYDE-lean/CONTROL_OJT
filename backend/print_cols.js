const db = require('./src/config/database');

async function printCols() {
  try {
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'control'
      ORDER BY ordinal_position
    `);
    console.log("Columnas en CONTROL:");
    res.rows.forEach((r, idx) => console.log(`${idx + 1}. "${r.column_name}"`));
    
    // Traer una fila completa
    const sample = await db.query(`SELECT * FROM public."CONTROL" LIMIT 1`);
    console.log("\nFila de ejemplo en CONTROL:", sample.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

printCols();
