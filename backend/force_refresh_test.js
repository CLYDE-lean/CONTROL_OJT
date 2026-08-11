const db = require('./src/config/database');
const ojtMetricsService = require('./src/services/ojtMetricsService');

async function forceRefreshTest() {
  try {
    console.log("==========================================================");
    console.log("⚡ PROBANDO FORZADO DE CACHE PARA YARLY (74408974)");
    console.log("==========================================================");

    // Forzar invalidación de caché
    ojtMetricsService.cacheData = null;
    ojtMetricsService.lastCacheTime = 0;

    await ojtMetricsService.ensureCache(true);
    const matriz = await ojtMetricsService.getMatrizIntervencion({});

    const yarly = matriz.asesores.find(a => a.documento === '74408974');
    console.log("📍 Asesor YARLY RAQUEL (DNI 74408974):");
    console.log(yarly);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

forceRefreshTest();
