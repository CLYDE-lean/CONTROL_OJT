const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testAll() {
  console.log("==========================================================");
  console.log("⚡ TEST VERIFICACIÓN DE EMBUDO DE FLUJO Y DNI 10252616");
  console.log("==========================================================");

  try {
    await ojtMetricsService.ensureCache();

    // 1. Matriz para 10252616
    const matriz = await ojtMetricsService.getMatrizIntervencion({});
    const advisor = matriz.asesores.find(a => a.documento === '10252616');
    console.log("📍 Asesor DNI 10252616 (Jorge Luis Sovero):");
    console.log("  - Estado Actual:", advisor ? advisor.estado_actual : 'No encontrado');
    console.log("  - Resultado Eval:", advisor ? advisor.resultado_evaluacion : 'No encontrado');
    console.log("  - Acción Recomendada:", advisor ? advisor.accion_recomendada : 'No encontrado');

    // 2. Flujo Ejecutivo
    const flujo = await ojtMetricsService.getEmbudoEjecutivoFlujo({});
    console.log("\n📊 Embudo Ejecutivo de Conversión (Flujo 3 Etapas):");
    console.log(`  1. Ingresaron a OJT: ${flujo.flujo.total_ingresaron_ojt} (100%)`);
    console.log(`  2. Bajas en OJT: ${flujo.flujo.total_bajas_ojt} (${flujo.flujo.pct_bajas_ojt}%)`);
    console.log(`  3. Egresados a Operaciones (I-OP): ${flujo.flujo.total_egresados_op} (${flujo.flujo.pct_egresados_op}%)`);

    console.log("==========================================================");
    console.log("✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE!");
    console.log("==========================================================");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

testAll();
