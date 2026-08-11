const db = require('./src/config/database');

async function checkColumns() {
  try {
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'control'
      ORDER BY ordinal_position
    `);
    console.log("COLUMNAS DE PUBLIC.CONTROL:", res.rows.map(r => r.column_name));
    
    // Also let's search for columns containing GRUPO or COD or WAVE or COHORTE
    const groupCols = res.rows.filter(r => /grupo|cod|wave|cohorte|aula|grupo/i.test(r.column_name));
    console.log("COLUMNAS SOSPECHOSAS DE GRUPO:", groupCols.map(r => r.column_name));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkColumns();
