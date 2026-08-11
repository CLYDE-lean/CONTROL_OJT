const db = require('./src/config/database');

async function listTables() {
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("==================================================");
    console.log("TABLAS ENCONTRADAS EN EL SCHEMA PUBLIC:");
    res.rows.forEach((r, idx) => console.log(`${idx + 1}. "${r.table_name}"`));
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("Error al listar tablas:", err.message);
    process.exit(1);
  }
}

listTables();
