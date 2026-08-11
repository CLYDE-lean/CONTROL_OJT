const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testAll() {
  try {
    ojtMetricsService.cacheData = null;
    await ojtMetricsService.ensureCache(true);

    console.log("==========================================================");
    console.log("⚡ VERIFICACIÓN GLOBAL CON REGULACIÓN DE IS_DUMMY:");
    console.log("==========================================================");

    const testFilters = {
      semana: 'Todas las Cohortes',
      campana: 'Todas las Campañas',
      formador: 'Todos los Formadores'
    };

    const embudo = await ojtMetricsService.getEmbudo5Dias(testFilters);
    console.log("✅ getEmbudo5Dias con 'Todas las Cohortes':");
    console.log("  - Total Asesores Únicos:", embudo.total_asesores_unicos);

    const flujo = await ojtMetricsService.getEmbudoEjecutivoFlujo(testFilters);
    console.log("\n✅ getEmbudoEjecutivoFlujo:");
    console.log(flujo.flujo);

    const flash = await ojtMetricsService.getExcelFlashOjtMetrics(testFilters);
    console.log("\n✅ getExcelFlashOjtMetrics:");
    console.log("  - Total Evaluados:", flash.resumen_condicion.total_evaluados);
    console.log("  - Promedio Calidad Emitida:", flash.indicadores[0].promedio_actual, "%");
    console.log("  - Aprobados %:", flash.resumen_condicion.pct_aprobados, "%");

    const matriz = await ojtMetricsService.getMatrizIntervencion(testFilters);
    console.log("\n✅ getMatrizIntervencion:");
    console.log("  - Asesores en Matriz:", matriz.asesores.length);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testAll();
