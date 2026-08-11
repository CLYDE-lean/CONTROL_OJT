const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testYarlyDay5() {
  try {
    ojtMetricsService.cacheData = null;
    await ojtMetricsService.ensureCache(true);
    const matriz = await ojtMetricsService.getMatrizIntervencion({});

    const yarly = matriz.asesores.find(a => a.documento === '74408974');
    console.log("==========================================================");
    console.log("🎯 VERIFICACIÓN EXACTA DEL PRIMER DÍA DE I-OP:");
    console.log("==========================================================");
    console.log("📍 YARLY RAQUEL (DNI 74408974):");
    console.log("  - Días OJT Reales:", yarly.dias_ojt_reales);
    console.log("  - Día Actual / Ingreso OP:", yarly.dia_actual);
    console.log("  - Día Ingreso Operación Texto:", yarly.dia_ingreso_operacion);
    console.log("  - Resultado Evaluacion:", yarly.resultado_evaluacion);
    console.log("  - Accion Recomendada:", yarly.accion_recomendada);
    console.log("  - Permanencia Total Registrada:", yarly.dias_totales_registrados);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testYarlyDay5();
