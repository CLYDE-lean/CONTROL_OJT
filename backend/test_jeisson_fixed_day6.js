const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testJeissonDay6() {
  try {
    ojtMetricsService.cacheData = null;
    await ojtMetricsService.ensureCache(true);
    const matriz = await ojtMetricsService.getMatrizIntervencion({});

    const jeisson = matriz.asesores.find(a => a.documento === '76487711');
    console.log("==========================================================");
    console.log("🎯 VERIFICACIÓN EXACTA JEISSON DANIEL (DNI 76487711):");
    console.log("==========================================================");
    console.log("  - Días OJT Reales:", jeisson.dias_ojt_reales);
    console.log("  - Día Actual / Ingreso OP:", jeisson.dia_actual);
    console.log("  - Día Ingreso Operación Texto:", jeisson.dia_ingreso_operacion);
    console.log("  - Resultado Evaluación:", jeisson.resultado_evaluacion);
    console.log("  - Hito Fecha Ingreso OP:", jeisson.fecha_ingreso_op);
    console.log("  - Permanencia Total Registrada:", jeisson.dias_totales_registrados);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testJeissonDay6();
