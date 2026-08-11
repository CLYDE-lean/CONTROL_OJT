const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testCoherence() {
  try {
    console.log('⚡ Cargando datos para auditar coherencia...');
    const allData = await ojtMetricsService.ensureCache();
    console.log(`Total registros en caché: ${allData.length}`);

    // Auditar Asesores únicos
    const rowsByDni = new Map();
    for (const r of allData) {
      if (!rowsByDni.has(r.dni)) rowsByDni.set(r.dni, []);
      rowsByDni.get(r.dni).push(r);
    }

    let countBajaFlash = 0;
    let countBajaFlujo = 0;
    let countIop = 0;
    let countEnCurso = 0;
    let countExtension = 0;

    const discrepancias = [];

    for (const [dni, rows] of rowsByDni.entries()) {
      let maxDia = 1;
      let esIop = false;
      let esBaja = false;
      let ultEstado = '';
      let ultSigla = '';

      for (const r of rows) {
        if (r.dia_conexion > maxDia) maxDia = r.dia_conexion;
        if (ojtMetricsService.isIop(r.sigla, r.estado)) esIop = true;
        if (ojtMetricsService.isBaja(r.estado, r.motivo_baja, r.sigla)) {
          esBaja = true;
        }
        ultEstado = r.estado;
        ultSigla = r.sigla;
      }

      // Regla Flash actual:
      const esBajaFlash = esBaja;

      // Regla Flujo actual:
      const esBajaFlujo = esBaja && !esIop;

      if (esBajaFlash !== esBajaFlujo) {
        discrepancias.push({
          dni,
          asesor: rows[0].asesor,
          maxDia,
          esIop,
          esBaja,
          ultEstado,
          ultSigla,
          totalFilas: rows.length
        });
      }
    }

    console.log(`\n📋 Asesores totales únicos: ${rowsByDni.size}`);
    console.log(`⚠️ Asesores con discrepancia entre Flash OJT y Embudo Flujo: ${discrepancias.length}`);
    console.log('Detalle de discrepancias:', JSON.stringify(discrepancias, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en test de coherencia:', err);
    process.exit(1);
  }
}

testCoherence();
