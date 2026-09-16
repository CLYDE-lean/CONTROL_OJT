const db = require('./src/config/database');

async function check() {
  try {
    const res = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    
    console.log('--- TABLES & COLUMNS ---');
    const tables = {};
    res.rows.forEach(r => {
      if (!tables[r.table_name]) tables[r.table_name] = [];
      tables[r.table_name].push({ col: r.column_name, type: r.data_type });
    });
    
    for (const [tbl, cols] of Object.entries(tables)) {
      console.log(`\nTable: ${tbl}`);
      cols.forEach(c => console.log(`  - ${c.col} (${c.type})`));
    }
    
    process.exit(0);
  } catch(e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}

check();
