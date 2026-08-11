const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testFast() {
  try {
    console.log("==========================================================");
    console.log("⚡ PRUEBA DE VELOCIDAD MOTOR EN MEMORIA CACHE (SINGLETON PROMISE):");
    console.log("==========================================================");

    const t0 = Date.now();
    const data = await ojtMetricsService.ensureCache(true);
    const t1 = Date.now();

    console.log(`✅ Carga Inicial en ${t1 - t0} ms | ${data.length} filas.`);

    const t2 = Date.now();
    const p1 = ojtMetricsService.getEmbudo5Dias({});
    const p2 = ojtMetricsService.getEmbudoEjecutivoFlujo({});
    const p3 = ojtMetricsService.getExcelFlashOjtMetrics({});
    const p4 = ojtMetricsService.getMatrizIntervencion({});
    
    const [embudo, flujo, flash, matriz] = await Promise.all([p1, p2, p3, p4]);
    const t3 = Date.now();

    console.log(`✅ 4 consultas simultáneas resueltas en ${t3 - t2} ms!`);
    console.log("  - Asesores Únicos Embudo:", embudo.total_asesores_unicos);
    console.log("  - Flujo Ingresaron OJT:", flujo.flujo.total_ingresaron_ojt);
    console.log("  - Flash Total Evaluados:", flash.resumen_condicion.total_evaluados);
    console.log("  - Asesores en Matriz:", matriz.asesores.length);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testFast();
