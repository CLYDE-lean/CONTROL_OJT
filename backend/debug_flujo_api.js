const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testFlujo() {
  try {
    ojtMetricsService.cacheData = null;
    await ojtMetricsService.ensureCache(true);

    const flujo = await ojtMetricsService.getEmbudoEjecutivoFlujo({});
    console.log("==========================================================");
    console.log("📊 RESPUESTA DE getEmbudoEjecutivoFlujo({}):");
    console.log(flujo);
    console.log("==========================================================");

    const embudo = await ojtMetricsService.getEmbudo5Dias({});
    console.log("📊 RESPUESTA DE getEmbudo5Dias({}):");
    console.log("  - total_unicos:", embudo.total_asesores_unicos);
    console.log("  - dias_principales:", embudo.dias_principales_1_8);

    process.exit(0);
  } catch (err) {
    console.error("Error en testFlujo:", err);
    process.exit(1);
  }
}

testFlujo();
