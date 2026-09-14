const ojtMetricsService = require('./src/services/ojtMetricsService');

async function main() {
  console.log('🔍 Auditando exactamente el embudo D1 vs D2...');
  await ojtMetricsService.ensureCache(true);
  
  // Vamos a obtener el embudo global sin filtros o con filtros
  const res = await ojtMetricsService.getEmbudo5Dias({});
  console.log('Total asesores únicos:', res.total_asesores_unicos);
  console.log('Días principales:', res.dias_principales_1_8);

  // Vamos a auditar los asesores que tienen max_dia_ojt / max_dia_total
  const allData = ojtMetricsService.cacheData;
  const ojtMap = new Map();

  for (const r of allData) {
    if (!ojtMap.has(r.dni)) {
      ojtMap.set(r.dni, {
        dni: r.dni,
        nombre: r.asesor,
        formador: r.formador,
        grupo: r.grupo,
        estado: r.estado,
        sigla: r.sigla,
        motivo_baja: r.motivo_baja,
        dia_conexion_raw: r.dia_conexion_raw,
        max_dia_ojt: 0,
        max_dia_total: 0,
        es_iop: 0,
        es_baja: 0
      });
    }
    const a = ojtMap.get(r.dni);
    if (ojtMetricsService.isIop(r.sigla, r.estado)) a.es_iop = 1;
    if (ojtMetricsService.isBaja(r.estado, r.motivo_baja)) a.es_baja = 1;
    if (r.dia_conexion > a.max_dia_total) a.max_dia_total = r.dia_conexion;
    if (r.es_ojt_row && r.raw_dia_conexion > a.max_dia_ojt) a.max_dia_ojt = r.raw_dia_conexion;
  }

  const d1List = [];
  const d2List = [];
  const d1OnlyActivosNoD2 = [];

  for (const [dni, a] of ojtMap.entries()) {
    const diaEfectivo = (a.es_iop === 1 && a.max_dia_ojt === 1) ? a.max_dia_total : a.max_dia_ojt;
    if (diaEfectivo >= 1) d1List.push({...a, diaEfectivo});
    if (diaEfectivo >= 2) d2List.push({...a, diaEfectivo});
    
    if (diaEfectivo === 1 && a.es_iop === 0 && a.es_baja === 0) {
      d1OnlyActivosNoD2.push(a);
    }
  }

  console.log(`\n📊 Resumen de Conteos:`);
  console.log(`Día 1 Total (diaEfectivo >= 1): ${d1List.length}`);
  console.log(`Día 2 Total (diaEfectivo >= 2): ${d2List.length}`);
  console.log(`Asesores activos en D1 cuya máxima conexión registrada fue DÍA 1 (sin registros en Día 2): ${d1OnlyActivosNoD2.length}`);

  if (d1OnlyActivosNoD2.length > 0) {
    console.log(`\n📋 Muestra de asesores en D1 (sin baja ni I-OP) pero con max_dia = 1:`);
    console.dir(d1OnlyActivosNoD2.slice(0, 10), { depth: null });
  }

  process.exit(0);
}

main();
