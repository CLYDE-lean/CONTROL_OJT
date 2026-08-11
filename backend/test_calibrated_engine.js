const db = require('./src/config/database');
const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testCalibration() {
  try {
    console.log("==========================================================");
    console.log("⚡ PROBANDO CALIBRACIÓN QUIRÚRGICA OJT DE DÍAS Y MÉTRICAS");
    console.log("==========================================================");

    await ojtMetricsService.ensureCache(true);
    const matriz = await ojtMetricsService.getMatrizIntervencion({});

    const yarly = matriz.asesores.find(a => a.documento === '74408974');
    console.log("📍 Asesor YARLY RAQUEL (DNI 74408974):");
    console.log("  - Días Conexión OJT Reales:", yarly ? yarly.dias_conexion_ojt : 'No encontrado');
    console.log("  - Día Ingreso Operación:", yarly ? yarly.dia_ingreso_operacion : 'No encontrado');
    console.log("  - Estado Actual:", yarly ? yarly.estado_actual : 'No encontrado');
    console.log("  - Resultado Eval:", yarly ? yarly.resultado_evaluacion : 'No encontrado');
    console.log("  - Llamadas OJT Acumuladas:", yarly ? yarly.llamadas_acumuladas : 'No encontrado');
    console.log("  - Calidad OJT %:", yarly ? yarly.calidad_pct : 'No encontrado');

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testCalibration();
