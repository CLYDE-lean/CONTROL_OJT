const db = require('./src/config/database');
const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testEmbudo() {
  try {
    console.log("=== INSPECCIONANDO DATOS REALES PARA CAMPAÑA 'CLARO POSTPAGO' ===");

    // 1. Ver exactamente cuántos asesores distintos y registros hay con CAMPAÑA = 'CLARO POSTPAGO'
    const resExact = await db.query(`
      SELECT 
        COUNT(*) as total_filas,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos_dni,
        COUNT(DISTINCT TRIM(CAST("CAMPAÑA" AS VARCHAR))) as campanas_distintas
      FROM public."CONTROL"
      WHERE TRIM(CAST("CAMPAÑA" AS VARCHAR)) = 'CLARO POSTPAGO'
    `);
    console.log("Consulta directa TRIM(CAMPAÑA) = 'CLARO POSTPAGO':", resExact.rows[0]);

    // 2. Ver si la campaña tiene espacios, mayúsculas/minúsculas o tildes variantes
    const resLike = await db.query(`
      SELECT 
        TRIM(CAST("CAMPAÑA" AS VARCHAR)) as nombre_campana,
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as unicos_dni,
        COUNT(*) as total_filas
      FROM public."CONTROL"
      WHERE CAST("CAMPAÑA" AS VARCHAR) ILIKE '%POSTPAGO%'
      GROUP BY TRIM(CAST("CAMPAÑA" AS VARCHAR))
    `);
    console.log("Campañas encontradas con ILIKE '%POSTPAGO%':", resLike.rows);

    // 3. Ejecutar getEmbudo5Dias con filtro { campana: 'CLARO POSTPAGO' }
    const resEmbudo = await ojtMetricsService.getEmbudo5Dias({ campana: 'CLARO POSTPAGO' });
    console.log("\nResultado de getEmbudo5Dias({ campana: 'CLARO POSTPAGO' }):");
    console.log("Total Asesores Únicos devueltos:", resEmbudo.total_asesores_unicos);
    console.log("Días oficiales (1 a 8):", resEmbudo.dias_principales_1_8);

    process.exit(0);
  } catch (err) {
    console.error("Error en testEmbudo:", err.message);
    process.exit(1);
  }
}

testEmbudo();
