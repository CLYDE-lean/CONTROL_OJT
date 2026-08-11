const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testFilterExecution() {
  try {
    console.log('⚡ Cargando caché...');
    const allData = await ojtMetricsService.ensureCache();
    console.log('Total registros en caché:', allData.length);

    console.log('\n--- Probando Filtros Disponibles ---');
    const f = await ojtMetricsService.getFiltrosDisponibles({});
    console.log('Campañas:', f.campanas.slice(0, 5));
    console.log('Formadores:', f.formadores.slice(0, 5));
    console.log('Grupos:', f.grupos.slice(0, 5));
    console.log('Semanas:', f.semanas.slice(0, 5));

    console.log('\n--- Probando Sin Filtros ---');
    const res0 = await ojtMetricsService.getEmbudo5Dias({});
    console.log('Total asesores únicos sin filtro:', res0.total_asesores_unicos);

    if (f.campanas.length > 0) {
      const camp = f.campanas[0];
      console.log(`\n--- Probando Filtro Campaña = "${camp}" ---`);
      const res1 = await ojtMetricsService.getEmbudo5Dias({ campana: camp });
      console.log(`Total asesores únicos con campaña ${camp}:`, res1.total_asesores_unicos);
    }

    if (f.formadores.length > 0) {
      const form = f.formadores[0];
      console.log(`\n--- Probando Filtro Formador = "${form}" ---`);
      const res2 = await ojtMetricsService.getEmbudo5Dias({ formador: form });
      console.log(`Total asesores únicos con formador ${form}:`, res2.total_asesores_unicos);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en testFilterExecution:', err);
    process.exit(1);
  }
}

testFilterExecution();
