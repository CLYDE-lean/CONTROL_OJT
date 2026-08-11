const db = require('./src/config/database');

async function auditSupervivencia() {
  try {
    console.log('==========================================================');
    console.log('📊 AUDITORÍA DE SUPERVIVENCIA EN SUPABASE (SQL REAL)');
    console.log('==========================================================\n');

    // 1. Obtener la tabla activa (ej. CONTROL)
    const tblRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND LOWER(table_name) IN ('control', 'control_ojt', 'bd_ojt')
      LIMIT 1
    `);

    const tableName = tblRes.rows[0]?.table_name || 'CONTROL';
    console.log(`📌 Tabla en uso: "${tableName}"\n`);

    // 2. Consulta SQL directa de auditoría de supervivencia
    const sqlQuery = `
      SELECT 
        COUNT(DISTINCT CAST("DNI" AS VARCHAR)) as total_asistieron,
        
        COUNT(DISTINCT CASE 
          WHEN "FECHA_INICIO_CAPA" IS NOT NULL AND TRIM(CAST("FECHA_INICIO_CAPA" AS VARCHAR)) NOT IN ('', 'null', 'NULL') 
            OR "FECHA_ASISTENCIA" IS NOT NULL AND TRIM(CAST("FECHA_ASISTENCIA" AS VARCHAR)) NOT IN ('', 'null', 'NULL')
          THEN CAST("DNI" AS VARCHAR) 
        END) as iniciaron_capa,

        COUNT(DISTINCT CASE 
          WHEN CAST(NULLIF(REGEXP_REPLACE(CAST("DIA_CONEXION" AS VARCHAR), '[^0-9]', '', 'g'), '') AS INT) > 0
            OR "FECHA_INICIO_OJT" IS NOT NULL AND TRIM(CAST("FECHA_INICIO_OJT" AS VARCHAR)) NOT IN ('', 'null', 'NULL')
          THEN CAST("DNI" AS VARCHAR) 
        END) as llegaron_ojt,

        COUNT(DISTINCT CASE 
          WHEN UPPER(CAST("SIGLA" AS VARCHAR)) LIKE '%I%OP%' 
            OR UPPER(CAST("SIGLA" AS VARCHAR)) LIKE '%OPERACI%'
            OR UPPER(CAST("ESTADO" AS VARCHAR)) LIKE '%OPERAT%'
            OR "FECHA_INGRESO_OP" IS NOT NULL AND TRIM(CAST("FECHA_INGRESO_OP" AS VARCHAR)) NOT IN ('', 'null', 'NULL')
          THEN CAST("DNI" AS VARCHAR) 
        END) as llegaron_op
      FROM public."${tableName}"
      WHERE "DNI" IS NOT NULL AND TRIM(CAST("DNI" AS VARCHAR)) != '';
    `;

    console.log('🔍 Consulta SQL enviada a PostgreSQL/Supabase:\n');
    console.log(sqlQuery);

    const res = await db.query(sqlQuery);
    const row = res.rows[0];

    console.log('\n✅ RESULTADOS REALES EXTRAÍDOS DE LA BASE DE DATOS:');
    console.table([
      { Etapa: '1. Asistieron', Cantidad: parseInt(row.total_asistieron), Porcentaje: '100%' },
      { 
        Etapa: '2. Iniciaron Capa', 
        Cantidad: parseInt(row.iniciaron_capa), 
        Porcentaje: `${Math.round((row.iniciaron_capa / row.total_asistieron) * 100)}%` 
      },
      { 
        Etapa: '3. Llegaron a OJT', 
        Cantidad: parseInt(row.llegaron_ojt), 
        Porcentaje: `${Math.round((row.llegaron_ojt / row.total_asistieron) * 100)}%` 
      },
      { 
        Etapa: '4. Llegaron a OP', 
        Cantidad: parseInt(row.llegaron_op), 
        Porcentaje: `${Math.round((row.llegaron_op / row.total_asistieron) * 100)}%` 
      }
    ]);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error ejecutando auditoría:', err.message);
    process.exit(1);
  }
}

auditSupervivencia();
