const ojtMetricsService = require('./src/services/ojtMetricsService');

async function debugLogic() {
  try {
    const cache = await ojtMetricsService.ensureCache();
    const rows = cache.filter(r => r.dni === '10252616');
    console.log("Registros en Cache para 10252616:", rows);

    const matriz = await ojtMetricsService.getMatrizIntervencion({});
    const advisorInMatriz = matriz.asesores.find(a => a.documento === '10252616');
    console.log("\nObjeto en Matriz para 10252616:", advisorInMatriz);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

debugLogic();
