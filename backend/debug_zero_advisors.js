const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testZero() {
  try {
    ojtMetricsService.cacheData = null;
    await ojtMetricsService.ensureCache(true);
    
    console.log("Total cache length:", ojtMetricsService.cacheData.length);
    
    const embudo = await ojtMetricsService.getEmbudo5Dias({});
    console.log("Embudo con {}:", embudo.total_asesores_unicos);

    const embudoConFilters = await ojtMetricsService.getEmbudo5Dias({ campana: '', semana: '', formador: '', grupo: '', modalidad: '', estado: '' });
    console.log("Embudo con filtros vacíos:", embudoConFilters.total_asesores_unicos);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testZero();
