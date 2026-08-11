const db = require('./src/config/database');

async function benchmark() {
  console.log("==========================================================");
  console.log("⚡ PRUEBA DE RENDIMIENTO: MEMORIA EN NODE.JS VS SUPABASE CLOUD");
  console.log("==========================================================");

  try {
    // 1. Cargar toda la base de Supabase a memoria (una sola vez)
    const t0 = Date.now();
    const res = await db.query(`
      SELECT 
        CAST("PERIODO" AS VARCHAR) as periodo,
        CAST("SEMANA" AS VARCHAR) as semana,
        TRIM(CAST("SEGMENTO" AS VARCHAR)) as segmento,
        TRIM(CAST("COD_GRUPO" AS VARCHAR)) as cod_grupo,
        TRIM(CAST("MODALIDAD" AS VARCHAR)) as modalidad,
        TRIM(CAST("DNI" AS VARCHAR)) as dni,
        TRIM(CAST("ASESOR" AS VARCHAR)) as asesor,
        TRIM(CAST("CAMPAÑA" AS VARCHAR)) as campana,
        TRIM(CAST("FORMADOR" AS VARCHAR)) as formador,
        CAST("DIA_CONEXION" AS VARCHAR) as dia_conexion,
        TRIM(CAST("SIGLA" AS VARCHAR)) as sigla,
        TRIM(CAST("ESTADO" AS VARCHAR)) as estado,
        TRIM(CAST("ULT_ESTADO" AS VARCHAR)) as ult_estado,
        TRIM(CAST("MOTIVO_BAJA" AS VARCHAR)) as motivo_baja
      FROM public."CONTROL"
    `);
    const t1 = Date.now();
    console.log(`⏱️ Carga inicial completa de Supabase: ${res.rows.length} filas cargadas en ${t1 - t0} ms.`);

    // 2. Probar filtrado por 'CLARO POSTPAGO' directamente en JS en memoria
    const t2 = Date.now();
    const rowsPostpago = res.rows.filter(r => r.campana && r.campana.toUpperCase().includes('CLARO POSTPAGO'));
    const unicos = new Set(rowsPostpago.map(r => r.dni)).size;
    const t3 = Date.now();

    console.log(`⚡ Filtrado en Memoria Node.js para 'CLARO POSTPAGO': ${unicos} asesores únicos encontrados en **${t3 - t2} MILISEGUNDOS**!`);
    console.log("==========================================================");

    process.exit(0);
  } catch (err) {
    console.error("Error en benchmark:", err.message);
    process.exit(1);
  }
}

benchmark();
