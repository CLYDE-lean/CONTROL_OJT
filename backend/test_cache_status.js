const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testStatus() {
  try {
    ojtMetricsService.cacheData = null;
    const data = await ojtMetricsService.ensureCache(true);
    console.log("==========================================================");
    console.log("📊 ESTADO DEL ENGINE IN-MEMORY CACHE:");
    console.log("  - Total Filas en Memoria:", data.length);

    const embudo = await ojtMetricsService.getEmbudo5Dias({});
    console.log("  - Asesores Únicos en Embudo:", embudo.total_asesores_unicos);

    const matriz = await ojtMetricsService.getMatrizIntervencion({});
    console.log("  - Asesores Únicos en Matriz:", matriz.asesores ? matriz.asesores.length : 0);

    const flujo = await ojtMetricsService.getEmbudoEjecutivoFlujo({});
    console.log("  - Egresados OP en Flujo:", flujo.ingresaron_iop);

    const flash = await ojtMetricsService.getExcelFlashOjtMetrics({});
    console.log("  - Flash OJT Asesores:", flash.asesores ? flash.asesores.length : 0);

    process.exit(0);
  } catch (err) {
    console.error("Error en testStatus:", err);
    process.exit(1);
  }
}

testStatus();
