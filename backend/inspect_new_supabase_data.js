const db = require('./src/config/database');

async function inspectNewData() {
  console.log("==========================================================");
  console.log("🔍 INSPECCIONANDO LA NUEVA DATA CARGADA EN SUPABASE");
  console.log("==========================================================");

  try {
    // 1. Total Filas y Asesores Únicos
    const countRes = await db.query(`
      SELECT 
        COUNT(*) as total_filas,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos_dni,
        MIN(CAST("FECHA_ASISTENCIA" AS VARCHAR)) as min_fecha,
        MAX(CAST("FECHA_ASISTENCIA" AS VARCHAR)) as max_fecha
      FROM public."CONTROL"
    `);
    const { total_filas, unicos_dni, min_fecha, max_fecha } = countRes.rows[0];
    console.log(`\n📊 MÉTICÁS GENERALES:`);
    console.log(`   • Total Filas: ${total_filas}`);
    console.log(`   • Asesores Únicos (DNI): ${unicos_dni}`);
    console.log(`   • Rango Fechas: ${min_fecha} a ${max_fecha}`);

    // 2. Semanas Disponibles
    const semanasRes = await db.query(`
      SELECT DISTINCT TRIM(CAST("SEMANA" AS VARCHAR)) as s 
      FROM public."CONTROL" 
      WHERE "SEMANA" IS NOT NULL AND TRIM(CAST("SEMANA" AS VARCHAR)) != ''
      ORDER BY s ASC
    `);
    console.log(`\n📅 SEMANAS DETECTADAS (${semanasRes.rows.length}):`);
    console.log(`   ${semanasRes.rows.map(r => r.s).join(', ')}`);

    // 3. Campañas Disponibles
    const campanasRes = await db.query(`
      SELECT TRIM(CAST("CAMPAÑA" AS VARCHAR)) as c, COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos
      FROM public."CONTROL" 
      WHERE "CAMPAÑA" IS NOT NULL AND TRIM(CAST("CAMPAÑA" AS VARCHAR)) != ''
      GROUP BY TRIM(CAST("CAMPAÑA" AS VARCHAR))
      ORDER BY unicos DESC
    `);
    console.log(`\n🎯 CAMPAÑAS DETECTADAS (${campanasRes.rows.length}):`);
    campanasRes.rows.forEach(r => console.log(`   • "${r.c}" → ${r.unicos} asesores únicos`));

    // 4. Formadores Muestra
    const formadoresRes = await db.query(`
      SELECT TRIM(CAST("FORMADOR" AS VARCHAR)) as f, COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos
      FROM public."CONTROL" 
      WHERE "FORMADOR" IS NOT NULL AND TRIM(CAST("FORMADOR" AS VARCHAR)) != '' AND UPPER(TRIM(CAST("FORMADOR" AS VARCHAR))) != 'NULL'
      GROUP BY TRIM(CAST("FORMADOR" AS VARCHAR))
      ORDER BY unicos DESC
      LIMIT 10
    `);
    console.log(`\n👨‍🏫 TOP FORMADORES DETECTADOS (${formadoresRes.rows.length} de muestra):`);
    formadoresRes.rows.forEach(r => console.log(`   • "${r.f}" → ${r.unicos} asesores únicos`));

    // 5. Modalidades
    const modRes = await db.query(`
      SELECT DISTINCT TRIM(CAST("MODALIDAD" AS VARCHAR)) as m 
      FROM public."CONTROL" 
      WHERE "MODALIDAD" IS NOT NULL AND TRIM(CAST("MODALIDAD" AS VARCHAR)) != ''
    `);
    console.log(`\n🏢 MODALIDADES DETECTADAS:`);
    console.log(`   ${modRes.rows.map(r => r.m).join(', ')}`);

    console.log("\n==========================================================");
    console.log("✅ INSPECCIÓN COMPLETADA EXITOSAMENTE");
    console.log("==========================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inspeccionando Supabase:", err.message);
    process.exit(1);
  }
}

inspectNewData();
