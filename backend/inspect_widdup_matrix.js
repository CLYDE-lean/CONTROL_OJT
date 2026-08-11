const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testWiddupMatrix() {
  try {
    ojtMetricsService.cacheData = null;
    await ojtMetricsService.ensureCache(true);
    const matriz = await ojtMetricsService.getMatrizIntervencion({});

    const widdupAsesores = matriz.asesores.filter(a => (a.formador || '').toUpperCase().includes('WIDDUP'));
    console.log("📍 Asesores de WIDDUP devueltos por el BI Engine:");
    console.log(widdupAsesores);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testWiddupMatrix();
