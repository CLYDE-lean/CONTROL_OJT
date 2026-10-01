const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_SUPABASE,
  ssl: { rejectUnauthorized: false }
});

// Función para parsear números tolerando comas decimales ("0,58" -> 0.58) y valores vacíos/NULL
function parseNum(val) {
  if (val === null || val === undefined) return null;
  let s = String(val).trim();
  if (!s || /^null$/i.test(s) || s === '-' || /^undefined$/i.test(s)) return null;
  // Reemplazar coma por punto si es decimal
  if (/,\d+$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// Función para parsear enteros (Q_ATENDIDAS, DIA_CONEXION)
function parseIntVal(val) {
  if (val === null || val === undefined) return null;
  let s = String(val).trim();
  if (!s || /^null$/i.test(s) || s === '-' || /^undefined$/i.test(s)) return null;
  s = s.replace(/[^0-9]/g, '');
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

// Función para parsear fechas a formato ISO YYYY-MM-DD
function parseFecha(val) {
  if (!val) return null;
  let s = String(val).trim();
  if (!s || /^null$/i.test(s) || s === '-' || /^undefined$/i.test(s)) return null;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // DD/MM/YYYY o DD-MM-YYYY
  const dm = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dm) {
    const dia = dm[1].padStart(2, '0');
    const mes = dm[2].padStart(2, '0');
    const anio = dm[3];
    return `${anio}-${mes}-${dia}`;
  }
  return null;
}

// Limpiar cadenas de texto UTF-8
function parseStr(val, defaultVal = null) {
  if (val === null || val === undefined) return defaultVal;
  let s = String(val).trim();
  if (!s || /^null$/i.test(s) || s === '-' || /^undefined$/i.test(s)) return defaultVal;
  return s;
}

// Parser CSV robusto que respeta campos con comillas, tabulaciones o comas
function parseCSV(content) {
  // Detectar delimitador: tabulación o coma o punto y coma
  const firstLine = content.split(/\r?\n/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  console.log(`Detectado delimitador: [${delimiter === '\t' ? 'TABULADOR' : delimiter}]`);

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parsear encabezados normalizados
  const rawHeaders = splitLine(lines[0], delimiter);
  const headers = rawHeaders.map(h => normalizeHeader(h));
  console.log('Encabezados encontrados:', headers);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCols = splitLine(lines[i], delimiter);
    if (rawCols.length === 0 || (rawCols.length === 1 && !rawCols[0].trim())) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = rawCols[idx] !== undefined ? rawCols[idx].trim() : null;
    });
    rows.push(row);
  }
  return rows;
}

function splitLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.replace(/^["']|["']$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^["']|["']$/g, '').trim());
  return result;
}

// Normalizar nombres de columnas de SQL Server a las columnas estándar esperadas
function normalizeHeader(h) {
  const s = h.trim().toUpperCase()
    .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U')
    .replace(/Ñ/g, 'N');

  // Formador (evaluar antes que DNI/DOCUMENTO o NOMBRE)
  if (s.includes('DOC_FORMADOR') || s.includes('DOCUMENTO_FORMADOR')) return 'documento_formador';
  if (s.includes('FORMADOR') || s.includes('NOMBRE_FORMADOR')) return 'formador';

  // DNI / Documento del asesor
  if (s === 'DOCUMENTO' || s === 'DNI' || s.includes('DOC_ASESOR') || s.includes('NUMERO_DOCUMENTO')) return 'dni';

  // Nombres separados del asesor
  if (s.includes('AP_PATERNO') || s.includes('PATERNO')) return 'ap_paterno';
  if (s.includes('AP_MATERNO') || s.includes('MATERNO')) return 'ap_materno';
  if (s === 'NOMBRES' || s === 'NOMBRE') return 'nombres';
  if (s.includes('ASESOR')) return 'asesor';

  // Fechas (orden específico para evitar colisiones)
  if (s.includes('FECHA_ASISTENCIA') || s === 'ASISTENCIA') return 'fecha_asistencia';
  if (s.includes('INICIO_OJT')) return 'fecha_inicio_ojt';
  if (s.includes('INGRESO_OP')) return 'fecha_ingreso_op';
  if (s.includes('INICIO_CAPA') || s === 'FECHA_INICIO' || s.includes('FECHA_INICIO_CAPA')) return 'fecha_inicio_capa';

  // Grupo / Campaña / Segmento
  if (s === 'GPE' || s.includes('COD_GRUPO') || (s.includes('GRUPO') && !s.includes('ESTADO_GRUPO'))) return 'cod_grupo';
  if (s.includes('ESTADO_GRUPO')) return 'estado_grupo';
  if (s.includes('CAMPANA')) return 'campana';
  if (s.includes('SEGMENTO')) return 'segmento';
  if (s.includes('SEMANA')) return 'semana';
  if (s.includes('PERIODO')) return 'periodo';
  if (s.includes('MODALIDAD')) return 'modalidad';
  if (s.includes('TIPO_RECLUTADO') || s.includes('RECLUTADO')) return 'tipo_reclutado';
  if (s.includes('CONDICION') || s.includes('JORNADA')) return 'condicion_laboral';

  // Conexión y producción
  if (s.includes('DIA_CONEXION') || s.includes('DIA_CONEX')) return 'dia_conexion';
  if (s.includes('Q_ATENDIDAS') || s.includes('ATENDIDAS') || s.includes('LLAMADAS')) return 'q_atendidas';

  // KPIs
  if (s.includes('KPI_1_NUM') || s.includes('KPI1_NUM')) return 'kpi_1_num';
  if (s.includes('KPI_1_DEN') || s.includes('KPI1_DEN') || s.includes('KPI_1_DENOM')) return 'kpi_1_denom';
  if (s.includes('KPI_2_NUM') || s.includes('KPI2_NUM')) return 'kpi_2_num';
  if (s.includes('KPI_2_DEN') || s.includes('KPI2_DEN') || s.includes('KPI_2_DENOM')) return 'kpi_2_denom';
  if (s.includes('KPI_3_NUM') || s.includes('KPI3_NUM')) return 'kpi_3_num';
  if (s.includes('KPI_3_DEN') || s.includes('KPI3_DEN') || s.includes('KPI_3_DENOM')) return 'kpi_3_denom';

  // Estados y bajas
  if (s.includes('ULT_ESTADO')) return 'ult_estado';
  if (s.includes('SIGLA')) return 'sigla';
  if (s.includes('MOTIVO_BAJA') || s.includes('MOTIVO')) return 'motivo_baja';
  if (s === 'ESTADO' || s.includes('ESTADO_ASESOR')) return 'estado';

  return h.toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

async function cargarArchivo(filePath) {
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ El archivo no existe en la ruta: ${fullPath}`);
      process.exit(1);
    }

    console.log(`\n📂 Leyendo archivo: ${fullPath}`);
    // Leer con encoding UTF-8 garantizado
    const rawContent = fs.readFileSync(fullPath, 'utf8');
    const rows = parseCSV(rawContent);
    console.log(`📊 Filas detectadas para procesar: ${rows.length}`);

    if (rows.length === 0) {
      console.log('⚠️ No se encontraron filas con datos.');
      process.exit(0);
    }

    const client = await pool.connect();
    console.log('⚡ Conectado a Supabase. Iniciando carga en tabla control_ojt...');

    // Lotes de 500 para inserción ultrarrápida
    const BATCH_SIZE = 500;
    let insertados = 0;
    let omitidos = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];
      let pIdx = 1;

      for (const r of batch) {
        const dni = parseStr(r.dni);
        const cod_grupo = parseStr(r.cod_grupo);
        const fecha_asistencia = parseFecha(r.fecha_asistencia);

        // Si falta DNI o fecha, no puede insertarse
        if (!dni || !fecha_asistencia) {
          omitidos++;
          continue;
        }

        // Armar nombre del asesor si viene separado por partes
        let nombreAsesor = parseStr(r.asesor);
        if (!nombreAsesor && (r.ap_paterno || r.ap_materno || r.nombres)) {
          nombreAsesor = [r.ap_paterno, r.ap_materno, r.nombres]
            .map(s => parseStr(s))
            .filter(Boolean)
            .join(' ');
        }
        if (!nombreAsesor) nombreAsesor = 'SIN_NOMBRE';

        placeholders.push(`(
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
          $${pIdx++}, $${pIdx++}
        )`);

        values.push(
          parseStr(r.periodo, 'SIN_PERIODO'),
          parseStr(r.semana, 'SIN_SEMANA'),
          parseStr(r.segmento, 'GENERAL'),
          cod_grupo || 'SIN_GRUPO',
          parseStr(r.modalidad, 'PRESENCIAL'),
          parseStr(r.tipo_reclutado, 'APTO'),
          parseStr(r.condicion_laboral, null),
          dni,
          nombreAsesor,
          parseStr(r.campana || r.campaña, 'GENERAL'),
          parseStr(r.formador || r.nombre_formador, null),
          fecha_asistencia,
          parseFecha(r.fecha_inicio_capa || r.fecha_inicio),
          parseFecha(r.fecha_inicio_ojt),
          parseFecha(r.fecha_ingreso_op),
          parseIntVal(r.dia_conexion),
          parseIntVal(r.q_atendidas) || 0,
          parseNum(r.kpi_1_num),
          parseNum(r.kpi_1_denom),
          parseNum(r.kpi_2_num),
          parseNum(r.kpi_2_denom),
          parseNum(r.kpi_3_num),
          parseNum(r.kpi_3_denom),
          parseStr(r.sigla, null),
          parseStr(r.estado, null),
          parseStr(r.ult_estado, null),
          parseStr(r.motivo_baja, null)
        );
      }

      if (placeholders.length === 0) continue;

      const queryText = `
        INSERT INTO public.control_ojt (
          periodo, semana, segmento, cod_grupo, modalidad,
          tipo_reclutado, condicion_laboral, dni, asesor, campana,
          formador, fecha_asistencia, fecha_inicio_capa, fecha_inicio_ojt, fecha_ingreso_op,
          dia_conexion, q_atendidas, kpi_1_num, kpi_1_denom, kpi_2_num,
          kpi_2_denom, kpi_3_num, kpi_3_denom, sigla, estado,
          ult_estado, motivo_baja
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (dni, cod_grupo, fecha_asistencia) 
        DO UPDATE SET
          dia_conexion = EXCLUDED.dia_conexion,
          q_atendidas = EXCLUDED.q_atendidas,
          kpi_1_num = EXCLUDED.kpi_1_num,
          kpi_1_denom = EXCLUDED.kpi_1_denom,
          kpi_2_num = EXCLUDED.kpi_2_num,
          kpi_2_denom = EXCLUDED.kpi_2_denom,
          kpi_3_num = EXCLUDED.kpi_3_num,
          kpi_3_denom = EXCLUDED.kpi_3_denom,
          sigla = EXCLUDED.sigla,
          estado = EXCLUDED.estado,
          ult_estado = EXCLUDED.ult_estado,
          motivo_baja = EXCLUDED.motivo_baja,
          condicion_laboral = EXCLUDED.condicion_laboral;
      `;

      await client.query(queryText, values);
      insertados += placeholders.length;
      process.stdout.write(`\r⏳ Progreso: ${insertados} / ${rows.length} registros procesados...`);
    }

    client.release();
    console.log(`\n\n✅ CARGA COMPLETADA EXITOSAMENTE:`);
    console.log(`   • Registros insertados/actualizados: ${insertados}`);
    if (omitidos > 0) console.log(`   • Registros omitidos (sin DNI/Fecha): ${omitidos}`);

    // Comprobación de conteo final en base de datos
    const totalDb = await pool.query('SELECT count(*) as total, count(distinct dni) as unicos FROM public.control_ojt');
    console.log(`\n📊 Estado actual en Supabase:`);
    console.log(`   • Total filas en control_ojt: ${totalDb.rows[0].total}`);
    console.log(`   • Asesores únicos (DNI): ${totalDb.rows[0].unicos}`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error durante la carga:', err.message);
    await pool.end();
    process.exit(1);
  }
}

// Archivo por defecto o pasado por argumento
const archivoArg = process.argv[2] || 'data_ojt.csv';
cargarArchivo(archivoArg);
