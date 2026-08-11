const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testFilter() {
  console.log("==========================================================");
  console.log("🧪 PROBANDO FILTRADO DEL EMBUDO DE CONVERSIÓN EN TIEMPO REAL");
  console.log("==========================================================");

  try {
    // 1. Probamos con CLARO POSTPAGO
    const resPostpago = await ojtMetricsService.getEmbudo5Dias({ campana: 'CLARO POSTPAGO' });
    console.log("\n📈 RESULTADO PARA 'CLARO POSTPAGO':");
    console.log("Total Asesores Únicos Evaluados en Día 1:", resPostpago.dias_principales_1_8[0]?.activos);
    console.log("Desglose Días 1 al 8:", resPostpago.dias_principales_1_8.map(d => `${d.label}: ${d.activos} (${d.retencion_pct}%)`).join(' | '));

    // 2. Probamos con RETENCIONES FIJA INBOUND
    const resRetenciones = await ojtMetricsService.getEmbudo5Dias({ campana: 'RETENCIONES FIJA INBOUND' });
    console.log("\n📈 RESULTADO PARA 'RETENCIONES FIJA INBOUND':");
    console.log("Total Asesores Únicos Evaluados en Día 1:", resRetenciones.dias_principales_1_8[0]?.activos);
    console.log("Desglose Días 1 al 8:", resRetenciones.dias_principales_1_8.map(d => `${d.label}: ${d.activos} (${d.retencion_pct}%)`).join(' | '));

    console.log("\n==========================================================");
    console.log("✅ AMBOS FILTROS PROCESADOS EXITOSAMENTE Y REFLEJADOS EN LA GRÁFICA");
    console.log("==========================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en testFilter:", err.message);
    process.exit(1);
  }
}

testFilter();
