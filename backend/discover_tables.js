const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function discoverTables() {
  try {
    const res = await db.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `);

    console.log("=== TODAS LAS TABLAS EN LA BASE DE DATOS SUPABASE ===");
    const lines = [];
    for (const r of res.rows) {
      let rowCount = 0;
      try {
        const cRes = await db.query(`SELECT COUNT(*) as c FROM "${r.table_schema}"."${r.table_name}"`);
        rowCount = cRes.rows[0].c;
      } catch (e) {
        rowCount = `Error: ${e.message}`;
      }
      const line = `Schema: "${r.table_schema}" | Tabla: "${r.table_name}" | Registros: ${rowCount}`;
      console.log(line);
      lines.push(line);
    }
    
    fs.writeFileSync(path.join(__dirname, 'all_tables.txt'), lines.join('\n'), 'utf8');
    process.exit(0);
  } catch (err) {
    console.error("Error al descubrir tablas:", err.message);
    process.exit(1);
  }
}

discoverTables();
