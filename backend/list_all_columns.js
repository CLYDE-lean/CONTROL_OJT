const db = require('./src/config/database');

async function listCols() {
  try {
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'control'
      ORDER BY ordinal_position
    `);

    console.log("Columnas en CONTROL:", res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

listCols();
