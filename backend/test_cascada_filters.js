const ojtMetricsService = require('./src/services/ojtMetricsService');

async function testCascada() {
  try {
    console.log('⚡ Cargando In-Memory Cache...');
    const t0 = Date.now();
    await ojtMetricsService.ensureCache();
    console.log(`✅ Cache cargado en ${Date.now() - t0} ms`);

    console.log('\n--- 1. Filtros sin ningún filtro activo ---');
    const t1 = Date.now();
    const f0 = await ojtMetricsService.getFiltrosDisponibles({});
    console.log(`⏱️ getFiltrosDisponibles({}) tomo ${Date.now() - t1} ms`);
    console.log('Formadores disponibles:', f0.formadores.length);
    console.log('Campañas disponibles:', f0.campanas.length);
    console.log('Grupos disponibles:', f0.grupos.length);
    console.log('Periodos disponibles:', f0.periodos.length);
    console.log('Semanas disponibles:', f0.semanas.length);

    if (f0.formadores.length > 0) {
      const selectedFormador = f0.formadores[0];
      console.log(`\n--- 2. Seleccionando Formador: "${selectedFormador}" ---`);
      const t2 = Date.now();
      const f1 = await ojtMetricsService.getFiltrosDisponibles({ formador: selectedFormador });
      console.log(`⏱️ getFiltrosDisponibles({ formador }) tomo ${Date.now() - t2} ms`);
      console.log(`- Formadores disponibles (auto-excluidos): ${f1.formadores.length} (no colapsa a 1)`);
      console.log(`- Campañas para ${selectedFormador}:`, f1.campanas);
      console.log(`- Grupos para ${selectedFormador}:`, f1.grupos);
    }

    console.log('\n✅ Prueba de Cascada Auto-Excluyente In-Memory completada con éxito!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en prueba de cascada:', err);
    process.exit(1);
  }
}

testCascada();
